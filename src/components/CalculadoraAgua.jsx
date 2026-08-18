import { useState, useMemo } from 'react';
import {
  PERFILES_AGUA,
  MODIFICADORES_AGUA,
  UMBRALES_AUTONOMIA,
  formatearNumero,
  equivalenciaFisica,
} from '../data/constantes.js';

/* --- piezas pequeñas ---------------------------------------------------- */

function Contador({ etiqueta, valor, alCambiar, min = 1, max = 99, sufijo }) {
  return (
    <div className="campo">
      <label className="campo__etiqueta">{etiqueta}</label>
      <div className="contador">
        <button
          type="button"
          onClick={() => alCambiar(Math.max(min, valor - 1))}
          aria-label={`Restar uno a ${etiqueta}`}
        >
          −
        </button>
        <span className="contador__valor">
          {valor}
          {sufijo && <em>{sufijo}</em>}
        </span>
        <button
          type="button"
          onClick={() => alCambiar(Math.min(max, valor + 1))}
          aria-label={`Sumar uno a ${etiqueta}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Columna graduada: el elemento distintivo del sitio.
 * Muestra los tres escenarios de autonomía en una sola lectura vertical,
 * como un recipiente con marcas de medición.
 */
function ColumnaGraduada({ escenarios, maximo }) {
  return (
    <div className="columna">
      {escenarios.map((e) => {
        const alto = Math.min(100, (e.dias / maximo) * 100);
        return (
          <div className="columna__via" key={e.id}>
            <div className="columna__tubo">
              <div
                className={`columna__nivel columna__nivel--${e.estado}`}
                style={{ height: `${alto}%` }}
              />
            </div>
            <div className="columna__lectura">
              <strong>{e.dias < 1 ? '<1' : formatearNumero(e.dias, 1)}</strong>
              <span>días</span>
            </div>
            <div className="columna__nombre">{e.nombre}</div>
          </div>
        );
      })}
    </div>
  );
}

/* --- componente principal ----------------------------------------------- */

export default function CalculadoraAgua() {
  const [modo, setModo] = useState('necesito');
  const [personas, setPersonas] = useState(4);
  const [dias, setDias] = useState(14);
  const [perfilId, setPerfilId] = useState('basico');
  const [activos, setActivos] = useState([]);
  const [litrosTexto, setLitrosTexto] = useState('200');

  const perfil = PERFILES_AGUA.find((p) => p.id === perfilId);

  const factor = useMemo(
    () =>
      MODIFICADORES_AGUA.filter((m) => activos.includes(m.id)).reduce(
        (acc, m) => acc * m.factor,
        1
      ),
    [activos]
  );

  const alternar = (id) =>
    setActivos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Modo A — cuánta agua hace falta
  const totalNecesario = personas * perfil.litros * dias * factor;

  // Modo B — cuánto dura lo que ya se tiene
  const litros = Math.max(0, parseFloat(litrosTexto.replace(',', '.')) || 0);
  const escenarios = PERFILES_AGUA.map((p) => {
    const consumoDiario = personas * p.litros * factor;
    const d = consumoDiario > 0 ? litros / consumoDiario : 0;
    let estado = 'bien';
    if (p.id === 'basico') {
      if (d < UMBRALES_AUTONOMIA.critico) estado = 'critico';
      else if (d < UMBRALES_AUTONOMIA.precaucion) estado = 'aviso';
    }
    return { id: p.id, nombre: p.nombre, dias: d, estado };
  });

  const diasBasico = escenarios.find((e) => e.id === 'basico').dias;
  const maximoColumna = Math.max(...escenarios.map((e) => e.dias), 1);

  const mensaje =
    diasBasico < UMBRALES_AUTONOMIA.critico
      ? 'Por debajo de tres días. Es el primer hueco que conviene cerrar.'
      : diasBasico < UMBRALES_AUTONOMIA.precaucion
        ? 'Cubres una emergencia corta. El objetivo razonable son 14 días.'
        : 'Cubres dos semanas de consumo básico. Revisa la rotación cada seis meses.';

  return (
    <section className="calc" id="calculadora-agua">
      <div className="calc__pestanas" role="tablist">
        <button
          role="tab"
          aria-selected={modo === 'necesito'}
          className={modo === 'necesito' ? 'activa' : ''}
          onClick={() => setModo('necesito')}
        >
          ¿Cuánta necesito?
        </button>
        <button
          role="tab"
          aria-selected={modo === 'tengo'}
          className={modo === 'tengo' ? 'activa' : ''}
          onClick={() => setModo('tengo')}
        >
          ¿Cuánto me dura?
        </button>
      </div>

      <div className="calc__cuerpo">
        <div className="calc__controles">
          <Contador etiqueta="Personas" valor={personas} alCambiar={setPersonas} />

          {modo === 'necesito' ? (
            <Contador
              etiqueta="Días a cubrir"
              valor={dias}
              alCambiar={setDias}
              max={365}
            />
          ) : (
            <div className="campo">
              <label className="campo__etiqueta" htmlFor="litros">
                Litros que ya tienes
              </label>
              <input
                id="litros"
                className="entrada"
                inputMode="decimal"
                value={litrosTexto}
                onChange={(e) => setLitrosTexto(e.target.value)}
              />
            </div>
          )}

          {modo === 'necesito' && (
            <fieldset className="grupo">
              <legend className="campo__etiqueta">Nivel de consumo</legend>
              {PERFILES_AGUA.map((p) => (
                <label
                  key={p.id}
                  className={`opcion ${perfilId === p.id ? 'opcion--activa' : ''}`}
                >
                  <input
                    type="radio"
                    name="perfil"
                    checked={perfilId === p.id}
                    onChange={() => setPerfilId(p.id)}
                  />
                  <span className="opcion__titulo">
                    {p.nombre} <em>{p.litros} L/día</em>
                  </span>
                  <span className="opcion__desc">{p.descripcion}</span>
                </label>
              ))}
            </fieldset>
          )}

          <fieldset className="grupo">
            <legend className="campo__etiqueta">Ajustes</legend>
            {MODIFICADORES_AGUA.map((m) => (
              <label key={m.id} className="casilla">
                <input
                  type="checkbox"
                  checked={activos.includes(m.id)}
                  onChange={() => alternar(m.id)}
                />
                <span>{m.etiqueta}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="calc__resultado">
          {modo === 'necesito' ? (
            <>
              <span className="rotulo">Necesitas almacenar</span>
              <p className="cifra">
                {formatearNumero(totalNecesario)}
                <span className="cifra__unidad">litros</span>
              </p>
              <p className="equivalencia">{equivalenciaFisica(totalNecesario)}</p>
              <p className="secundaria">
                {formatearNumero(totalNecesario / 3.785)} galones ·{' '}
                {formatearNumero(totalNecesario / dias)} L por día para todo el hogar
              </p>
              <div className="regla" />
              <p className="fuente">{perfil.fuente}</p>
            </>
          ) : (
            <>
              <span className="rotulo">Tu reserva dura</span>
              <ColumnaGraduada escenarios={escenarios} maximo={maximoColumna} />
              <p className="mensaje">{mensaje}</p>
              <div className="regla" />
              <p className="fuente">
                Referencia: Sphere Handbook, mínimo de 15 L por persona y día.
              </p>
            </>
          )}
        </div>
      </div>

      <style>{`
        .calc {
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel-alto);
          overflow: hidden;
        }
        .calc__pestanas {
          display: flex;
          border-bottom: 1px solid var(--linea);
        }
        .calc__pestanas button {
          flex: 1;
          padding: 0.85rem 1rem;
          border: 0;
          background: transparent;
          font-family: var(--display);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--apagado);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .calc__pestanas button.activa {
          color: var(--tinta);
          border-bottom-color: var(--verde);
        }
        .calc__cuerpo {
          display: grid;
          gap: 1.75rem;
          padding: 1.5rem;
        }
        @media (min-width: 48rem) {
          .calc__cuerpo {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }
        .campo { margin-bottom: 1.25rem; }
        .campo__etiqueta {
          display: block;
          font-family: var(--dato);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--apagado);
          margin-bottom: 0.5rem;
          padding: 0;
        }
        .contador {
          display: flex;
          align-items: center;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          overflow: hidden;
          max-width: 12rem;
        }
        .contador button {
          width: 3rem;
          height: 3rem;
          border: 0;
          background: transparent;
          color: var(--verde);
          font-size: 1.4rem;
          cursor: pointer;
        }
        .contador button:hover { background: var(--papel); }
        .contador__valor {
          flex: 1;
          text-align: center;
          font-family: var(--dato);
          font-size: 1.25rem;
          font-weight: 500;
        }
        .contador__valor em { font-style: normal; color: var(--apagado); font-size: .8rem; }
        .entrada {
          width: 100%;
          max-width: 12rem;
          height: 3rem;
          padding: 0 0.85rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel);
          color: var(--tinta);
          font-family: var(--dato);
          font-size: 1.25rem;
        }
        .grupo { border: 0; padding: 0; margin: 0 0 1.25rem; }
        .opcion {
          display: grid;
          gap: 0.15rem;
          padding: 0.7rem 0.85rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          margin-bottom: 0.5rem;
          cursor: pointer;
        }
        .opcion--activa {
          border-color: var(--verde);
          box-shadow: inset 3px 0 0 var(--verde);
        }
        .opcion input { position: absolute; opacity: 0; }
        .opcion__titulo { font-weight: 600; font-size: 0.95rem; }
        .opcion__titulo em {
          font-style: normal;
          font-family: var(--dato);
          font-size: 0.8rem;
          color: var(--apagado);
          margin-left: 0.4rem;
        }
        .opcion__desc { font-size: 0.85rem; color: var(--apagado); line-height: 1.45; }
        .casilla {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.92rem;
          padding: 0.35rem 0;
          cursor: pointer;
        }
        .calc__resultado {
          background: var(--papel);
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          padding: 1.5rem;
        }
        .cifra {
          font-family: var(--display);
          font-weight: 700;
          font-size: clamp(3rem, 11vw, 4.5rem);
          line-height: 1;
          letter-spacing: -0.04em;
          margin: 0;
        }
        .cifra__unidad {
          display: block;
          font-family: var(--dato);
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--apagado);
          margin-top: 0.4rem;
        }
        .equivalencia {
          font-family: var(--dato);
          font-size: 0.95rem;
          color: var(--verde);
          margin: 0.75rem 0 0;
        }
        .secundaria { font-size: 0.9rem; color: var(--apagado); margin: 0.35rem 0 0; }
        .mensaje { font-size: 0.95rem; margin: 1.25rem 0 0; }

        .columna { display: flex; gap: 0.85rem; align-items: flex-end; }
        .columna__via { flex: 1; text-align: center; }
        .columna__tubo {
          height: 150px;
          border: 1px solid var(--linea);
          border-radius: 2px;
          background-image: repeating-linear-gradient(
            to top, var(--linea) 0 1px, transparent 1px 15px
          );
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        .columna__nivel { width: 100%; background: var(--verde-claro); transition: height .3s ease; }
        .columna__nivel--aviso { background: var(--ambar); }
        .columna__nivel--critico { background: var(--alerta); }
        .columna__lectura { margin-top: 0.6rem; font-family: var(--dato); line-height: 1.2; }
        .columna__lectura strong { display: block; font-size: 1.5rem; font-weight: 500; }
        .columna__lectura span { font-size: 0.7rem; color: var(--apagado); }
        .columna__nombre { font-size: 0.78rem; color: var(--apagado); margin-top: 0.2rem; }
      `}</style>
    </section>
  );
}

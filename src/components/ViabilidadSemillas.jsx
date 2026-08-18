import { useState, useMemo } from 'react';
import {
  SEMILLAS_BASE,
  OPCIONES_TEMP_SEMILLAS,
  OPCIONES_HUMEDAD_SEMILLAS,
  HARRINGTON,
  PRUEBA_GERMINACION_ANIOS_ANTES,
  formatearNumero,
} from '../data/constantes.js';

const DIA_MS = 86400000;
const ANIO_DIAS = 365.25;
const ANIO_ACTUAL = new Date().getFullYear();

/* --- utilidades ----------------------------------------------------------- */

function formatoFecha(ms) {
  return new Date(ms).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* --- piezas pequeñas ------------------------------------------------------- */

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

function Opcion({ nombre, valor, actual, alElegir, titulo }) {
  return (
    <label className={`opcion ${actual === valor ? 'opcion--activa' : ''}`}>
      <input
        type="radio"
        name={nombre}
        checked={actual === valor}
        onChange={() => alElegir(valor)}
      />
      <span className="opcion__titulo">{titulo}</span>
    </label>
  );
}

/* --- componente principal --------------------------------------------------- */

export default function ViabilidadSemillas() {
  const [especieId, setEspecieId] = useState(SEMILLAS_BASE[0].id);
  const [tempId, setTempId] = useState('refrigerador');
  const [humedadId, setHumedadId] = useState('aire');
  const [anioCosecha, setAnioCosecha] = useState(ANIO_ACTUAL);

  const especie = SEMILLAS_BASE.find((s) => s.id === especieId);
  const tempOpt = OPCIONES_TEMP_SEMILLAS.find((t) => t.id === tempId);
  const humedadOpt = OPCIONES_HUMEDAD_SEMILLAS.find((h) => h.id === humedadId);

  const resultado = useMemo(() => {
    if (especie.tipo === 'recalcitrante') return null;

    const pasos =
      (HARRINGTON.refHumedad - humedadOpt.valor) / HARRINGTON.pasoHumedad +
      (HARRINGTON.refTempC - tempOpt.valor) / HARRINGTON.pasoTempC;
    const vidaUtilAnios = especie.anios * Math.pow(2, pasos);

    const msCosecha = new Date(anioCosecha, 0, 1).getTime();
    const msVencimiento = msCosecha + vidaUtilAnios * ANIO_DIAS * DIA_MS;
    const msProximaPrueba = msVencimiento - PRUEBA_GERMINACION_ANIOS_ANTES * ANIO_DIAS * DIA_MS;
    const diasHastaPrueba = Math.round((msProximaPrueba - Date.now()) / DIA_MS);

    return { vidaUtilAnios, msVencimiento, msProximaPrueba, diasHastaPrueba };
  }, [especie, tempOpt, humedadOpt, anioCosecha]);

  return (
    <section className="calc" id="calculadora-semillas">
      <div className="calc__cuerpo">
        <div className="calc__controles">
          <div className="campo">
            <label className="campo__etiqueta" htmlFor="semilla-especie">
              Especie
            </label>
            <select
              id="semilla-especie"
              className="select select--ancho"
              value={especieId}
              onChange={(e) => setEspecieId(e.target.value)}
            >
              {SEMILLAS_BASE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                  {s.tipo === 'recalcitrante' ? ' — no almacenable en seco' : ''}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="grupo">
            <legend className="campo__etiqueta">Temperatura de almacenamiento</legend>
            {OPCIONES_TEMP_SEMILLAS.map((t) => (
              <Opcion
                key={t.id}
                nombre="temperatura"
                valor={t.id}
                actual={tempId}
                alElegir={setTempId}
                titulo={`${t.nombre} (${t.valor} °C)`}
              />
            ))}
          </fieldset>

          <fieldset className="grupo">
            <legend className="campo__etiqueta">Humedad estimada de la semilla</legend>
            {OPCIONES_HUMEDAD_SEMILLAS.map((h) => (
              <Opcion
                key={h.id}
                nombre="humedad"
                valor={h.id}
                actual={humedadId}
                alElegir={setHumedadId}
                titulo={`${h.nombre} (${h.valor}%)`}
              />
            ))}
          </fieldset>

          <Contador
            etiqueta="Año de cosecha"
            valor={anioCosecha}
            alCambiar={setAnioCosecha}
            min={ANIO_ACTUAL - 30}
            max={ANIO_ACTUAL}
          />
        </div>

        <div className="calc__resultado">
          {resultado === null ? (
            <>
              <span className="rotulo">Especie recalcitrante</span>
              <div className="aviso aviso--critico">
                {especie.nombre} no se puede almacenar seca ni congelada: pierde la
                viabilidad si se deshidrata o se somete a frío. Solo se conserva como
                planta viva, por injerto o por esqueje.
              </div>
            </>
          ) : (
            <>
              <span className="rotulo">Vida útil estimada</span>
              <p className="cifra">
                {formatearNumero(resultado.vidaUtilAnios, resultado.vidaUtilAnios < 10 ? 1 : 0)}
                <span className="cifra__unidad">
                  {resultado.vidaUtilAnios < 2 ? 'año' : 'años'} desde la cosecha
                </span>
              </p>
              <p className="secundaria">
                Pérdida de viabilidad estimada: {formatoFecha(resultado.msVencimiento)}
              </p>
              <p className="secundaria">
                {resultado.diasHastaPrueba <= 0
                  ? 'Próxima prueba de germinación: ya deberías hacerla.'
                  : `Próxima prueba de germinación sugerida: ${formatoFecha(resultado.msProximaPrueba)}`}
              </p>
              <div className="regla" />
              <p className="fuente">{HARRINGTON.fuente}</p>
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
        .select {
          width: 100%;
          height: 3rem;
          padding: 0 0.6rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel);
          color: var(--tinta);
          font-family: var(--texto);
          font-size: 0.92rem;
        }
        .select--ancho { max-width: 100%; }
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
        .opcion__titulo { font-weight: 600; font-size: 0.92rem; }
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
        .secundaria { font-size: 0.9rem; color: var(--apagado); margin: 0.75rem 0 0; }
        .aviso {
          border-left: 3px solid var(--ambar);
          background: var(--ambar-suave);
          padding: 0.9rem 1.1rem;
          font-size: 0.92rem;
          line-height: 1.5;
          margin: 0;
        }
        .aviso--critico {
          border-left-color: var(--alerta);
          background: var(--alerta-suave);
        }
      `}</style>
    </section>
  );
}

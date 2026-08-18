import { useState } from 'react';
import {
  CONVERSION_PESO,
  CONVERSION_VOLUMEN,
  CONVERSION_PESO_VOLUMEN_FUENTE,
  CONVERSION_TEMP,
  formatearNumero,
} from '../data/constantes.js';

/* --- utilidades ----------------------------------------------------------- */

function decimalesPara(n) {
  if (n === 0) return 0;
  if (Math.abs(n) < 1) return 3;
  if (Math.abs(n) < 10) return 2;
  return 1;
}

function convertirTemp(valor, desdeId) {
  const { factorFC, offsetF, offsetK } = CONVERSION_TEMP;
  let c;
  if (desdeId === 'c') c = valor;
  else if (desdeId === 'f') c = (valor - offsetF) / factorFC;
  else c = valor - offsetK;

  return {
    c,
    f: c * factorFC + offsetF,
    k: c + offsetK,
  };
}

/* --- piezas pequeñas ------------------------------------------------------ */

function CampoUnidad({ etiqueta, valorTexto, alCambiarTexto, unidadId, alCambiarUnidad, unidades }) {
  return (
    <div className="campo">
      <label className="campo__etiqueta">{etiqueta}</label>
      <div className="fila-unidad">
        <input
          className="entrada"
          inputMode="decimal"
          value={valorTexto}
          onChange={(e) => alCambiarTexto(e.target.value)}
        />
        <select
          className="select"
          value={unidadId}
          onChange={(e) => alCambiarUnidad(e.target.value)}
        >
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ConversorPesoVolumen({ tabla, unidad }) {
  const [valorTexto, setValorTexto] = useState('1');
  const [deId, setDeId] = useState(tabla[0].id);
  const [aId, setAId] = useState(tabla[1].id);

  const valor = parseFloat(valorTexto.replace(',', '.')) || 0;
  const de = tabla.find((u) => u.id === deId);
  const a = tabla.find((u) => u.id === aId);
  const base = valor * de[unidad];
  const resultado = base / a[unidad];

  return (
    <div className="calc__cuerpo">
      <div className="calc__controles">
        <CampoUnidad
          etiqueta="De"
          valorTexto={valorTexto}
          alCambiarTexto={setValorTexto}
          unidadId={deId}
          alCambiarUnidad={setDeId}
          unidades={tabla}
        />
        <div className="campo">
          <label className="campo__etiqueta" htmlFor={`a-${unidad}`}>
            A
          </label>
          <select
            id={`a-${unidad}`}
            className="select select--solo"
            value={aId}
            onChange={(e) => setAId(e.target.value)}
          >
            {tabla.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calc__resultado">
        <span className="rotulo">Equivale a</span>
        <p className="cifra">
          {formatearNumero(resultado, decimalesPara(resultado))}
          <span className="cifra__unidad">{a.nombre}</span>
        </p>
        <p className="secundaria">
          {formatearNumero(valor, decimalesPara(valor))} {de.abrev} = {formatearNumero(resultado, decimalesPara(resultado))} {a.abrev}
        </p>
        <div className="regla" />
        <p className="fuente">{CONVERSION_PESO_VOLUMEN_FUENTE}</p>
      </div>
    </div>
  );
}

function ConversorTemperatura() {
  const [valorTexto, setValorTexto] = useState('20');
  const [desdeId, setDesdeId] = useState('c');

  const valor = parseFloat(valorTexto.replace(',', '.')) || 0;
  const { c, f, k } = convertirTemp(valor, desdeId);

  const escalas = [
    { id: 'c', nombre: 'Celsius', abrev: '°C', valor: c },
    { id: 'f', nombre: 'Fahrenheit', abrev: '°F', valor: f },
    { id: 'k', nombre: 'Kelvin', abrev: 'K', valor: k },
  ];

  return (
    <div className="calc__cuerpo">
      <div className="calc__controles">
        <div className="campo">
          <label className="campo__etiqueta" htmlFor="valor-temp">
            Valor
          </label>
          <input
            id="valor-temp"
            className="entrada"
            inputMode="text"
            pattern="-?[0-9]*[.,]?[0-9]*"
            value={valorTexto}
            onChange={(e) => setValorTexto(e.target.value)}
          />
        </div>
        <fieldset className="grupo">
          <legend className="campo__etiqueta">Escala de origen</legend>
          {escalas.map((e) => (
            <label
              key={e.id}
              className={`opcion opcion--linea ${desdeId === e.id ? 'opcion--activa' : ''}`}
            >
              <input
                type="radio"
                name="escala"
                checked={desdeId === e.id}
                onChange={() => setDesdeId(e.id)}
              />
              <span className="opcion__titulo">
                {e.nombre} <em>{e.abrev}</em>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className="calc__resultado">
        <span className="rotulo">Equivale a</span>
        <ul className="lista-categorias">
          {escalas.map((e) => (
            <li key={e.id}>
              <span>{e.nombre}</span>
              <strong>
                {formatearNumero(e.valor, 1)} {e.abrev}
              </strong>
            </li>
          ))}
        </ul>
        <div className="regla" />
        <p className="fuente">{CONVERSION_TEMP.fuente}</p>
      </div>
    </div>
  );
}

/* --- componente principal -------------------------------------------------- */

export default function Conversor() {
  const [pestana, setPestana] = useState('peso');

  return (
    <section className="calc" id="calculadora-conversor">
      <div className="calc__pestanas" role="tablist">
        <button
          role="tab"
          aria-selected={pestana === 'peso'}
          className={pestana === 'peso' ? 'activa' : ''}
          onClick={() => setPestana('peso')}
        >
          Peso
        </button>
        <button
          role="tab"
          aria-selected={pestana === 'volumen'}
          className={pestana === 'volumen' ? 'activa' : ''}
          onClick={() => setPestana('volumen')}
        >
          Volumen
        </button>
        <button
          role="tab"
          aria-selected={pestana === 'temperatura'}
          className={pestana === 'temperatura' ? 'activa' : ''}
          onClick={() => setPestana('temperatura')}
        >
          Temperatura
        </button>
      </div>

      {pestana === 'peso' && <ConversorPesoVolumen tabla={CONVERSION_PESO} unidad="enGramos" />}
      {pestana === 'volumen' && <ConversorPesoVolumen tabla={CONVERSION_VOLUMEN} unidad="enMl" />}
      {pestana === 'temperatura' && <ConversorTemperatura />}

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
        .fila-unidad {
          display: flex;
          gap: 0.6rem;
        }
        .entrada {
          width: 100%;
          max-width: 9rem;
          height: 3rem;
          padding: 0 0.85rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel);
          color: var(--tinta);
          font-family: var(--dato);
          font-size: 1.25rem;
        }
        .select {
          flex: 1;
          max-width: 11rem;
          height: 3rem;
          padding: 0 0.6rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel);
          color: var(--tinta);
          font-family: var(--texto);
          font-size: 0.92rem;
        }
        .select--solo { max-width: 16rem; }
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
        .calc__resultado {
          background: var(--papel);
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          padding: 1.5rem;
        }
        .cifra {
          font-family: var(--display);
          font-weight: 700;
          font-size: clamp(2.6rem, 9vw, 4rem);
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
        .lista-categorias {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .lista-categorias li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.55rem 0;
          border-bottom: 1px solid var(--linea);
          font-size: 0.92rem;
        }
        .lista-categorias li:last-child { border-bottom: 0; }
        .lista-categorias strong {
          font-family: var(--dato);
          font-weight: 500;
          white-space: nowrap;
        }
        .fuente { margin-top: 1rem; }
      `}</style>
    </section>
  );
}

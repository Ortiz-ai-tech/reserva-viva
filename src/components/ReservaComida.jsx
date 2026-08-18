import { useState, useMemo } from 'react';
import { RESERVA_ANUAL, RESERVA_ANUAL_FUENTE, formatearNumero } from '../data/constantes.js';

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

/* --- componente principal ----------------------------------------------- */

export default function ReservaComida() {
  const [personas, setPersonas] = useState(4);
  const [dias, setDias] = useState(90);

  const factor = dias / 365;

  const categorias = useMemo(
    () =>
      RESERVA_ANUAL.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        kilos: personas * r.kg * factor,
      })),
    [personas, factor]
  );

  const total = categorias.reduce((acc, c) => acc + c.kilos, 0);

  return (
    <section className="calc" id="calculadora-comida">
      <div className="calc__cuerpo">
        <div className="calc__controles">
          <Contador etiqueta="Personas" valor={personas} alCambiar={setPersonas} />
          <Contador
            etiqueta="Días a cubrir"
            valor={dias}
            alCambiar={setDias}
            max={1825}
          />
        </div>

        <div className="calc__resultado">
          <span className="rotulo">Necesitas guardar</span>
          <p className="cifra">
            {formatearNumero(total)}
            <span className="cifra__unidad">kilos en total</span>
          </p>
          <div className="regla" />
          <ul className="lista-categorias">
            {categorias.map((c) => (
              <li key={c.id}>
                <span>{c.nombre}</span>
                <strong>{formatearNumero(c.kilos, c.kilos < 10 ? 1 : 0)} kg</strong>
              </li>
            ))}
          </ul>
          <p className="fuente">{RESERVA_ANUAL_FUENTE}</p>
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

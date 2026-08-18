import { useState } from 'react';
import { CLORO, formatearNumero } from '../data/constantes.js';

/* --- piezas pequeñas ---------------------------------------------------- */

function Opcion({ nombre, valor, actual, alElegir, titulo, desc }) {
  return (
    <label className={`opcion ${actual === valor ? 'opcion--activa' : ''}`}>
      <input
        type="radio"
        name={nombre}
        checked={actual === valor}
        onChange={() => alElegir(valor)}
      />
      <span className="opcion__titulo">{titulo}</span>
      {desc && <span className="opcion__desc">{desc}</span>}
    </label>
  );
}

/* --- componente principal ----------------------------------------------- */

export default function DosisCloro() {
  const [litrosTexto, setLitrosTexto] = useState('20');
  const [concentracionId, setConcentracionId] = useState(CLORO.concentraciones[0].id);
  const [turbia, setTurbia] = useState(false);

  const litros = Math.max(0, parseFloat(litrosTexto.replace(',', '.')) || 0);
  const concentracion = CLORO.concentraciones.find((c) => c.id === concentracionId);

  const galones = litros / CLORO.litrosPorGalon;
  const gotas = galones * concentracion.gotasPorGalon * (turbia ? CLORO.factorTurbia : 1);
  const mililitros = gotas * CLORO.mlPorGota;
  const espera = turbia ? CLORO.esperaTurbia : CLORO.esperaClara;

  return (
    <section className="calc" id="calculadora-cloro">
      <div className="calc__cuerpo">
        <div className="calc__controles">
          <div className="campo">
            <label className="campo__etiqueta" htmlFor="litros-cloro">
              Litros a tratar
            </label>
            <input
              id="litros-cloro"
              className="entrada"
              inputMode="decimal"
              value={litrosTexto}
              onChange={(e) => setLitrosTexto(e.target.value)}
            />
          </div>

          <fieldset className="grupo">
            <legend className="campo__etiqueta">Concentración de la lejía</legend>
            {CLORO.concentraciones.map((c) => (
              <Opcion
                key={c.id}
                nombre="concentracion"
                valor={c.id}
                actual={concentracionId}
                alElegir={setConcentracionId}
                titulo={c.etiqueta}
              />
            ))}
          </fieldset>

          <fieldset className="grupo">
            <legend className="campo__etiqueta">Estado del agua</legend>
            <Opcion
              nombre="estado"
              valor={false}
              actual={turbia}
              alElegir={setTurbia}
              titulo="Clara"
              desc="Agua limpia, a temperatura normal."
            />
            <Opcion
              nombre="estado"
              valor={true}
              actual={turbia}
              alElegir={setTurbia}
              titulo="Turbia, con color o muy fría"
              desc="Duplica la dosis y el tiempo de espera."
            />
          </fieldset>
        </div>

        <div className="calc__resultado">
          <span className="rotulo">Dosis necesaria</span>
          <p className="cifra">
            {formatearNumero(gotas, 1)}
            <span className="cifra__unidad">gotas</span>
          </p>
          <p className="secundaria">
            ≈ {formatearNumero(mililitros, 2)} ml · espera {espera} minutos antes de beber
          </p>
          <div className="regla" />
          <p className="fuente">{CLORO.fuente}</p>
        </div>
      </div>

      <div className="aviso aviso--critico">{CLORO.advertencia}</div>

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
        .opcion__desc { font-size: 0.85rem; color: var(--apagado); line-height: 1.45; }
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
          font-size: 0.88rem;
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

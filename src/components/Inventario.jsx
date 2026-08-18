import { useState, useEffect, useMemo } from 'react';
import {
  VIDA_UTIL_BASE,
  METODOS_ENVASADO,
  TEMP_REFERENCIA_C,
  PASO_DUPLICACION_C,
  UMBRALES_INVENTARIO,
  INVENTARIO_NOTA,
  formatearNumero,
} from '../data/constantes.js';

const CLAVE_ALMACENAMIENTO = 'reserva-viva:inventario';
const DIA_MS = 86400000;
const ANIO_DIAS = 365.25;

/* --- utilidades ----------------------------------------------------------- */

function generarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function leerAlmacenado() {
  if (typeof window === 'undefined') return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return crudo ? JSON.parse(crudo) : [];
  } catch {
    return [];
  }
}

function formatoFecha(ms) {
  return new Date(ms).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function textoTiempo(dias) {
  const abs = Math.abs(dias);
  if (abs < 60) return `${abs} día${abs === 1 ? '' : 's'}`;
  if (abs < 730) return `${formatearNumero(abs / 30, 0)} meses`;
  return `${formatearNumero(abs / 365.25, 1)} años`;
}

function textoEstado(it) {
  return it.estado === 'vencido'
    ? `venció hace ${textoTiempo(it.diasRestantes)}`
    : `vence en ${textoTiempo(it.diasRestantes)}`;
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

function EstadoVacio() {
  return (
    <div className="vacio">
      <span className="rotulo">Tu inventario está vacío</span>
      <p>Agrega tu primer ítem con el formulario para empezar a ver alertas de rotación.</p>
    </div>
  );
}

function FilaItem({ item, alQuitar }) {
  return (
    <li className={`item item--${item.estado}`}>
      <div className="item__cuerpo">
        <div className="item__cabecera">
          <strong>{item.nombre}</strong>
          <button
            type="button"
            className="item__quitar"
            onClick={() => alQuitar(item.id)}
            aria-label={`Quitar ${item.nombre}`}
          >
            ×
          </button>
        </div>
        <p className="item__detalle">
          {item.categoria.nombre} · {item.cantidad} uds. · {item.metodoNombre}
        </p>
        <p className={`item__estado item__estado--${item.estado}`}>
          {item.estado === 'vencido' ? 'Vencido' : 'Vence'} el {formatoFecha(item.msVencimiento)} · {textoEstado(item)}
        </p>
      </div>
    </li>
  );
}

/* --- componente principal --------------------------------------------------- */

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [cargado, setCargado] = useState(false);

  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState(VIDA_UTIL_BASE[0].id);
  const [cantidad, setCantidad] = useState(1);
  const [fechaEnvasado, setFechaEnvasado] = useState('');
  const [metodoEnvasado, setMetodoEnvasado] = useState(METODOS_ENVASADO[0].id);
  const [temperaturaC, setTemperaturaC] = useState(TEMP_REFERENCIA_C);

  useEffect(() => {
    setItems(leerAlmacenado());
    setFechaEnvasado(new Date().toISOString().slice(0, 10));
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(items));
    } catch {
      // almacenamiento no disponible (modo privado, cuota llena): se pierde la persistencia, no la sesión
    }
  }, [items, cargado]);

  const itemsCalculados = useMemo(() => {
    return items
      .map((it) => {
        const categoria = VIDA_UTIL_BASE.find((v) => v.id === it.categoriaId) ?? VIDA_UTIL_BASE[0];
        const metodo = METODOS_ENVASADO.find((m) => m.id === it.metodoEnvasado) ?? METODOS_ENVASADO[0];
        const pasos = Math.max(0, (it.temperaturaC - TEMP_REFERENCIA_C) / PASO_DUPLICACION_C);
        const aniosAjustados = categoria.anios / Math.pow(2, pasos);
        const msEnvasado = new Date(it.fechaEnvasado).getTime();
        const msVencimiento = msEnvasado + aniosAjustados * ANIO_DIAS * DIA_MS;
        const diasRestantes = Math.round((msVencimiento - Date.now()) / DIA_MS);
        const estado =
          diasRestantes < 0 ? 'vencido' : diasRestantes <= UMBRALES_INVENTARIO.avisoDias ? 'aviso' : 'bien';
        return { ...it, categoria, metodoNombre: metodo.nombre, msVencimiento, diasRestantes, estado };
      })
      .sort((a, b) => a.msVencimiento - b.msVencimiento);
  }, [items]);

  const proximo = itemsCalculados[0];

  const agregar = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !fechaEnvasado) return;
    setItems((prev) => [
      ...prev,
      {
        id: generarId(),
        nombre: nombre.trim(),
        categoriaId,
        cantidad,
        fechaEnvasado,
        metodoEnvasado,
        temperaturaC,
      },
    ]);
    setNombre('');
    setCantidad(1);
  };

  const quitar = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const borrarTodo = () => {
    if (window.confirm('¿Borrar todos los ítems del inventario? Esta acción no se puede deshacer.')) {
      setItems([]);
    }
  };

  return (
    <section className="calc" id="inventario">
      <div className="inventario__resumen">
        <div>
          <span className="rotulo">Inventario</span>
          <p className="resumen__linea">
            <strong>{items.length}</strong> ítem{items.length === 1 ? '' : 's'} guardado
            {items.length === 1 ? '' : 's'}
          </p>
          {proximo && (
            <p className="resumen__linea">
              Vence primero: <strong>{proximo.nombre}</strong> — {formatoFecha(proximo.msVencimiento)} (
              {textoEstado(proximo)})
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button type="button" className="boton-borrar" onClick={borrarTodo}>
            Borrar todo
          </button>
        )}
      </div>

      <div className="calc__cuerpo">
        <form className="calc__controles" onSubmit={agregar}>
          <div className="campo">
            <label className="campo__etiqueta" htmlFor="inv-nombre">
              Nombre del ítem
            </label>
            <input
              id="inv-nombre"
              className="entrada entrada--ancha"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Cubeta de arroz #2"
            />
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="inv-categoria">
              Categoría
            </label>
            <select
              id="inv-categoria"
              className="select select--ancho"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              {VIDA_UTIL_BASE.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre} ({v.anios} {v.anios === 1 ? 'año' : 'años'})
                </option>
              ))}
            </select>
          </div>

          <Contador etiqueta="Cantidad" valor={cantidad} alCambiar={setCantidad} sufijo="uds." />

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="inv-fecha">
              Fecha de envasado
            </label>
            <input
              id="inv-fecha"
              type="date"
              required
              className="entrada"
              value={fechaEnvasado}
              onChange={(e) => setFechaEnvasado(e.target.value)}
            />
          </div>

          <div className="campo">
            <label className="campo__etiqueta" htmlFor="inv-metodo">
              Método de envasado
            </label>
            <select
              id="inv-metodo"
              className="select select--ancho"
              value={metodoEnvasado}
              onChange={(e) => setMetodoEnvasado(e.target.value)}
            >
              {METODOS_ENVASADO.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          <Contador
            etiqueta="Temperatura del lugar"
            valor={temperaturaC}
            alCambiar={setTemperaturaC}
            min={-10}
            max={45}
            sufijo="°C"
          />

          <button type="submit" className="boton-agregar" disabled={!nombre.trim()}>
            Agregar ítem
          </button>
        </form>

        <div className="calc__resultado">
          {itemsCalculados.length === 0 ? (
            <EstadoVacio />
          ) : (
            <ul className="inventario__lista">
              {itemsCalculados.map((it) => (
                <FilaItem key={it.id} item={it} alQuitar={quitar} />
              ))}
            </ul>
          )}
          <p className="fuente">{INVENTARIO_NOTA}</p>
        </div>
      </div>

      <style>{`
        .calc {
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel-alto);
          overflow: hidden;
        }
        .inventario__resumen {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--linea);
          flex-wrap: wrap;
        }
        .resumen__linea {
          font-size: 0.92rem;
          margin: 0.25rem 0 0;
        }
        .resumen__linea strong { color: var(--tinta); }
        .boton-borrar {
          border: 1px solid var(--alerta);
          color: var(--alerta);
          background: transparent;
          font-family: var(--display);
          font-weight: 600;
          font-size: 0.82rem;
          padding: 0.55rem 0.9rem;
          border-radius: var(--radio);
          cursor: pointer;
          white-space: nowrap;
          height: fit-content;
        }
        .boton-borrar:hover { background: var(--alerta-suave); }
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
          max-width: 14rem;
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
          max-width: 16rem;
          height: 3rem;
          padding: 0 0.85rem;
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          background: var(--papel);
          color: var(--tinta);
          font-family: var(--dato);
          font-size: 1.05rem;
        }
        .entrada--ancha { max-width: 100%; font-family: var(--texto); font-size: 1rem; }
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
        .boton-agregar {
          width: 100%;
          border: 0;
          background: var(--verde);
          color: var(--papel-alto);
          font-family: var(--display);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radio);
          cursor: pointer;
        }
        .boton-agregar:hover { background: var(--verde-claro); }
        .boton-agregar:disabled { opacity: 0.5; cursor: not-allowed; }
        .calc__resultado {
          background: var(--papel);
          border: 1px solid var(--linea);
          border-radius: var(--radio);
          padding: 1.5rem;
        }
        .vacio {
          text-align: center;
          padding: 2.5rem 1.25rem;
          border: 1px dashed var(--linea);
          border-radius: var(--radio);
          color: var(--apagado);
        }
        .vacio .rotulo { margin-bottom: 0.5rem; }
        .vacio p { margin: 0 auto; font-size: 0.95rem; max-width: 28ch; }
        .inventario__lista {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }
        .item {
          display: flex;
          border: 1px solid var(--linea);
          border-left-width: 4px;
          border-radius: var(--radio);
          padding: 0.9rem 1rem;
          background: var(--papel-alto);
        }
        .item--bien { border-left-color: var(--verde-claro); }
        .item--aviso { border-left-color: var(--ambar); }
        .item--vencido { border-left-color: var(--alerta); }
        .item__cuerpo { flex: 1; min-width: 0; }
        .item__cabecera {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 0.5rem;
        }
        .item__cabecera strong { font-family: var(--display); font-size: 1rem; }
        .item__quitar {
          border: 0;
          background: transparent;
          color: var(--apagado);
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          padding: 0 0.3rem;
        }
        .item__quitar:hover { color: var(--alerta); }
        .item__detalle { font-size: 0.85rem; color: var(--apagado); margin: 0.3rem 0 0; }
        .item__estado {
          font-family: var(--dato);
          font-size: 0.8rem;
          margin: 0.45rem 0 0;
        }
        .item__estado--vencido { color: var(--alerta); }
        .item__estado--aviso { color: var(--ambar); }
        .item__estado--bien { color: var(--verde); }
        .calc__resultado .fuente { margin-top: 1.25rem; }
      `}</style>
    </section>
  );
}

/**
 * FUENTE ÚNICA DE VERDAD
 * ----------------------
 * Todas las cifras del sitio viven aquí. Si una recomendación oficial cambia,
 * se edita en este archivo y se actualiza en toda la web sin tocar la interfaz.
 * Cada valor lleva su fuente: la credibilidad es el producto.
 */

// --- AGUA: consumo por persona y día -------------------------------------
export const PERFILES_AGUA = [
  {
    id: 'supervivencia',
    nombre: 'Supervivencia',
    litros: 4,
    descripcion: 'Solo beber y agua contenida en la comida. Sostenible pocos días.',
    fuente: 'Sphere / OMS: 2.5–3 L de ingesta; se redondea a 4 con margen',
  },
  {
    id: 'basico',
    nombre: 'Básico',
    litros: 15,
    descripcion: 'Beber, cocinar e higiene mínima. Es el estándar humanitario.',
    fuente: 'Sphere Handbook: mínimo de 15 L por persona y día',
  },
  {
    id: 'normal',
    nombre: 'Normal',
    litros: 30,
    descripcion: 'Vida cotidiana con lavado de ropa y aseo completo.',
    fuente: 'Sphere: contextos urbanos pueden requerir 50 L o más',
  },
];

// Multiplicadores acumulativos sobre el consumo base.
export const MODIFICADORES_AGUA = [
  {
    id: 'calor',
    etiqueta: 'Clima cálido o trabajo físico',
    factor: 1.5,
    nota: 'En calor con actividad, la ingesta puede llegar a 6 L/día o más.',
  },
  {
    id: 'vulnerables',
    etiqueta: 'Embarazo, lactancia o personas enfermas',
    factor: 1.3,
    nota: 'Mayor necesidad de hidratación y de higiene.',
  },
];

// Umbrales para el semáforo de autonomía, en días de consumo "básico".
export const UMBRALES_AUTONOMIA = { critico: 3, precaucion: 14 };

// --- AGUA: desinfección con cloro ----------------------------------------
// EPA — Emergency Disinfection of Drinking Water.
// Base: gotas por galón (3.785 L) de agua clara.
export const CLORO = {
  concentraciones: [
    { id: '6', etiqueta: 'Lejía 6%', gotasPorGalon: 8 },
    { id: '8.25', etiqueta: 'Lejía 8.25%', gotasPorGalon: 6 },
  ],
  mlPorGota: 0.05,
  litrosPorGalon: 3.785,
  factorTurbia: 2, // agua turbia, con color o muy fría
  esperaClara: 30, // minutos
  esperaTurbia: 60,
  fuente: 'EPA, Emergency Disinfection of Drinking Water',
  advertencia:
    'Solo lejía regular sin perfume ni aditivos, con hipoclorito de sodio como único ingrediente activo y menos de un año de antigüedad. Al terminar el tiempo de espera el agua debe oler levemente a cloro; si no huele, repite la dosis y espera 15 minutos más.',
};

// --- COMIDA: reserva por persona y año -----------------------------------
export const RESERVA_ANUAL = [
  { id: 'granos', nombre: 'Granos (arroz, trigo, maíz, avena, pasta)', kg: 180 },
  { id: 'legumbres', nombre: 'Legumbres (frijol, lenteja, garbanzo)', kg: 38 },
  { id: 'aceite', nombre: 'Aceite y grasas', kg: 11 },
  { id: 'azucar', nombre: 'Azúcar o miel', kg: 20 },
  { id: 'leche', nombre: 'Leche en polvo', kg: 12 },
  { id: 'sal', nombre: 'Sal', kg: 4 },
];

// --- COMIDA: vida útil base y ajuste por temperatura ---------------------
// Vida útil en años a 24 °C (75 °F), envasado en mylar con absorbedor de oxígeno.
// Regla de ajuste: cada 5.5 °C por encima de 24 °C reduce la vida útil a la mitad.
export const VIDA_UTIL_BASE = [
  { id: 'arroz-blanco', nombre: 'Arroz blanco', anios: 30 },
  { id: 'trigo', nombre: 'Trigo en grano', anios: 30 },
  { id: 'maiz', nombre: 'Maíz en grano', anios: 30 },
  { id: 'harina-blanca', nombre: 'Harina blanca', anios: 25 },
  { id: 'frijoles', nombre: 'Frijoles y lentejas secas', anios: 25 },
  { id: 'avena', nombre: 'Avena en hojuelas', anios: 15 },
  { id: 'pasta', nombre: 'Pasta seca', anios: 12 },
  { id: 'leche-polvo', nombre: 'Leche en polvo', anios: 15 },
  { id: 'liofilizado', nombre: 'Alimento liofilizado comercial', anios: 28 },
  { id: 'arroz-integral', nombre: 'Arroz integral', anios: 1, aviso: 'Sus aceites se enrancian aunque el sellado sea perfecto. Guárdalo en congelador.' },
  { id: 'nueces', nombre: 'Nueces y semillas oleaginosas', anios: 1, aviso: 'Alto contenido graso: se enrancia igual sin oxígeno.' },
];

export const TEMP_REFERENCIA_C = 24;
export const PASO_DUPLICACION_C = 5.5;

// Fuente general para el prorrateo de RESERVA_ANUAL a otros periodos.
export const RESERVA_ANUAL_FUENTE =
  'FEMA / Ready.gov y LDS Preparedness Manual: referencia de reserva de un año por persona.';

// --- ENVASADO: absorbedores de oxígeno -----------------------------------
export const ABSORBEDORES = {
  ccPorLitro: 100, // ~380 cc por galón; se redondea al alza por seguridad
  fuente: 'Referencia práctica: 300–500 cc por galón, 2000–2500 cc por balde de 19 L',
};

// --- SEMILLAS: regla de Harrington ---------------------------------------
export const HARRINGTON = {
  // La vida útil se duplica por cada 1% menos de humedad de la semilla
  // y por cada 5.6 °C menos de temperatura de almacenamiento.
  pasoHumedad: 1,
  pasoTempC: 5.6,
  // Condiciones de referencia sobre las que se calibran las vidas base.
  refHumedad: 8,
  refTempC: 20,
  fuente: 'Harrington (1963, 1973); estándares de banco genético FAO',
};

export const SEMILLAS_BASE = [
  { id: 'cebolla', nombre: 'Cebolla, puerro, chirivía', anios: 1, tipo: 'ortodoxa' },
  { id: 'maiz-dulce', nombre: 'Maíz dulce, perejil, apio', anios: 2, tipo: 'ortodoxa' },
  { id: 'zanahoria', nombre: 'Zanahoria, pimiento, guisante, frijol', anios: 3, tipo: 'ortodoxa' },
  { id: 'tomate', nombre: 'Tomate, berenjena, remolacha, calabaza', anios: 4, tipo: 'ortodoxa' },
  { id: 'col', nombre: 'Col, brócoli, rábano, pepino, lechuga', anios: 5, tipo: 'ortodoxa' },
  { id: 'granos', nombre: 'Trigo, cebada, arroz, sorgo', anios: 3, tipo: 'ortodoxa' },
  { id: 'mango', nombre: 'Mango, aguacate, cacao, café', anios: 0, tipo: 'recalcitrante' },
];

// --- CONVERSOR: peso, volumen y temperatura -------------------------------
export const CONVERSION_PESO = [
  { id: 'g', nombre: 'Gramos', abrev: 'g', enGramos: 1 },
  { id: 'kg', nombre: 'Kilogramos', abrev: 'kg', enGramos: 1000 },
  { id: 'lb', nombre: 'Libras', abrev: 'lb', enGramos: 453.592 },
  { id: 'oz', nombre: 'Onzas', abrev: 'oz', enGramos: 28.3495 },
];

export const CONVERSION_VOLUMEN = [
  { id: 'ml', nombre: 'Mililitros', abrev: 'ml', enMl: 1 },
  { id: 'l', nombre: 'Litros', abrev: 'L', enMl: 1000 },
  { id: 'cdta', nombre: 'Cucharadita', abrev: 'cdta', enMl: 4.92892 },
  { id: 'cda', nombre: 'Cucharada', abrev: 'cda', enMl: 14.7868 },
  { id: 'taza', nombre: 'Taza (US)', abrev: 'taza', enMl: 236.588 },
  { id: 'oz-fl', nombre: 'Onza fluida', abrev: 'fl oz', enMl: 29.5735 },
  { id: 'gal', nombre: 'Galón (US)', abrev: 'gal', enMl: 3785.41 },
];

export const CONVERSION_PESO_VOLUMEN_FUENTE =
  'Equivalencias estándar del Sistema Internacional y el sistema US customary.';

// Definición exacta de las escalas Celsius, Fahrenheit y Kelvin.
export const CONVERSION_TEMP = {
  factorFC: 9 / 5,
  offsetF: 32,
  offsetK: 273.15,
  fuente: 'Definición estándar de las escalas Celsius, Fahrenheit y Kelvin.',
};

// --- Utilidades compartidas ----------------------------------------------
export const formatearNumero = (n, decimales = 0) =>
  new Intl.NumberFormat('es', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(n);

/** Convierte un total de litros en una imagen mental concreta. */
export function equivalenciaFisica(litros) {
  if (litros >= 400) return `≈ ${Math.ceil(litros / 200)} tambores de 200 L`;
  if (litros >= 60) return `≈ ${Math.ceil(litros / 20)} garrafones de 20 L`;
  return `≈ ${Math.ceil(litros / 5)} bidones de 5 L`;
}

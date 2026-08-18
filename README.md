# Reserva Viva — base del proyecto

Nombre provisional. Para cambiarlo: `package.json` (campo `name`), `src/layouts/Base.astro`
(bloque `.marca`) y `astro.config.mjs` (campo `site`).

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:4321 — se recarga solo al guardar cualquier archivo.

```bash
npm run build     # genera el sitio estático en dist/
npm run preview   # revisa el resultado final antes de publicar
```

## Qué hay dentro

```
src/
  data/constantes.js      ← TODAS las cifras del sitio, con su fuente
  components/             ← islas React (interactivas)
    CalculadoraAgua.jsx
  layouts/Base.astro      ← cabecera, pie, SEO, fuentes
  pages/
    index.astro           ← portada
    guias/                ← cada archivo = una URL indexable
  styles/global.css       ← tokens de color y tipografía
```

Dos reglas que conviene no romper:

1. **Ninguna cifra se escribe dentro de un componente.** Todas salen de
   `constantes.js`. Si mañana la EPA cambia una dosis, editas un archivo y
   queda corregido en todo el sitio.
2. **Las páginas de contenido son `.astro`, no React.** Se sirven como HTML
   puro y por eso rankean. Solo las calculadoras son islas React.

## Por qué `client:visible`

En `index.astro` verás `<CalculadoraAgua client:visible />`. Eso significa: el
HTML de la página se sirve completo y estático, y el JavaScript de React solo se
descarga cuando la calculadora entra en pantalla.

Compruébalo tú mismo después de un `npm run build`: abre
`dist/guias/cuanta-agua-almacenar/index.html` y busca el texto del artículo. Está
ahí, escrito en el HTML. Eso es lo que ve Google. En una SPA encontrarías un
`<div id="root">` vacío.

## Publicar

1. `git init && git add -A && git commit -m "Base del proyecto"`
2. Crea un repositorio en GitHub y haz `push`
3. En vercel.com: importar repositorio → detecta Astro solo → Deploy

A partir de ahí, cada `git push` publica automáticamente.

## Vender los PDFs

No hace falta backend. Crea el producto en Lemon Squeezy (o Gumroad para
empezar), copia el enlace de checkout y pégalo en el `href` del
`.enlace-producto` que ya está maquetado en la guía de ejemplo. Ellos cobran,
entregan el archivo y se encargan de los impuestos de cada país.

## Primer prompt para Claude Code

Pega esto tal cual en la carpeta del proyecto:

```
Este es un sitio Astro con islas React. Lee src/data/constantes.js: todas las
cifras del proyecto viven ahí y ningún componente debe tener números escritos
a mano.

Sigue el patrón de src/components/CalculadoraAgua.jsx y crea tres calculadoras
nuevas, cada una con su propia página en src/pages/calculadoras/:

1. DosisCloro.jsx — entradas: litros a tratar, concentración de lejía (6% u
   8.25%) y estado del agua (clara / turbia o fría). Salida: gotas y
   mililitros, más el tiempo de espera. Muestra siempre la advertencia de
   CLORO.advertencia debajo del resultado.

2. ReservaComida.jsx — entradas: personas y días. Salida: kilos por categoría
   usando RESERVA_ANUAL, prorrateado a los días indicados, más el total.

3. Conversor.jsx — peso, volumen y temperatura, con las equivalencias de
   cocina más usadas.

Mantén el mismo sistema visual: los tokens de src/styles/global.css, la cifra
del resultado como elemento de mayor jerarquía, y la fuente citada debajo.
Todas deben funcionar sin registro.
```

## Siguiente paso después de eso

El inventario con alertas de rotación. Va en `localStorage` (sin cuentas, sin
base de datos) y usa `VIDA_UTIL_BASE` con el ajuste de temperatura:
cada 5.5 °C por encima de 24 °C reduce la vida útil a la mitad.

Esa es la función que hace que la gente vuelva.

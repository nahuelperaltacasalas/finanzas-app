# Finanzas App

Una aplicación web sencilla para el control personal de finanzas.

## Características

- Visualización de un calendario mensual con días distribuidos en una grilla de 7 columnas.
- Carga de ingresos y gastos de ejemplo (movimientos) para cada día.
- Cálculo del saldo diario (ingresos menos gastos) con formato positivo/negativo.
- Navegación entre meses (anterior/siguiente).
- Diseño responsive y amigable, construido con React y Vite.

## Estructura del proyecto

```
finanzas-app/
├─ index.html          # Plantilla HTML principal
├─ package.json        # Definición de dependencias y scripts
├─ vite.config.js      # Configuración de Vite con plugin de React
├─ src/
│  ├─ main.jsx         # Punto de entrada de React
│  ├─ App.jsx          # Componente raíz
│  ├─ index.css        # Estilos globales y del calendario
│  ├─ lib/
│  │  ├─ dateUtils.js  # Funciones auxiliares de fechas y calendario
│  │  └─ sampleData.js # Datos de ejemplo para ingresos y gastos
│  ├─ components/
│  │  └─ DayCell.jsx   # Componente que representa una celda del calendario
│  └─ pages/
│     └─ CalendarPage.jsx # Página principal que compone el calendario
└─ README.md           # Este documento
```

## Instalación

1. Asegúrate de tener [Node.js](https://nodejs.org/) instalado (versión 18 o superior) y npm.
2. Instala las dependencias:

   ```bash
   npm install
   ```

## Ejecución en modo desarrollo

Para lanzar un servidor de desarrollo con hot reload:

```bash
npm run dev
```

Luego abre tu navegador en `http://localhost:5173` para ver la aplicación.

## Construcción para producción

Para compilar la aplicación en modo de producción (genera código estático optimizado en la carpeta `dist`):

```bash
npm run build
```

## Personalización

- Puedes agregar tus propios movimientos editando el archivo `src/lib/sampleData.js` o integrando un backend para persistir datos.
- Los estilos globales están en `src/index.css`. Si prefieres un framework como Tailwind, puedes instalarlo y configurarlo en `vite.config.js`.
- Para añadir un ícono o logo, coloca tu archivo dentro de la carpeta `public` (debes crearla) y modifica la etiqueta `<link rel="icon">` en `index.html`.

## Licencia

Este proyecto se proporciona como ejemplo educativo y puede ser modificado a tu gusto.# finanzas-app

# Redesign - Figma TSD Interface

Pixel-perfect implementation of Figma design for Android TSD (Terminal Data Collector) screens.

## Design Source
- Figma: [Cleverence Морда web-interface](https://www.figma.com/design/gwuHD3Vqm68VwQFghwNRD9/)
- Frame: `11719-271` (Android Compact - 24)

## Tech Stack
- Vanilla JavaScript (ES6+)
- Vite dev server
- CSS3 with absolute positioning
- Atkinson Hyperlegible font

## Specifications
- Device viewport: 412×917px (720×1280 hdpi equivalent)
- Responsive scaling for different screen sizes
- Colors, spacing, typography match Figma specs exactly

## Development

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

Server will start on http://localhost:5173/ (or next available port).

### Build
```bash
npm run build
```

## Structure
- `index.html` - Entry point with font loading
- `src/main.js` - Card rendering logic with absolute positioning
- `src/styles.css` - Pixel-perfect styles from Figma
- Colors, coordinates, and typography extracted from Figma API

## Features
- 8 color-coded action cards with counts
- Burger menu icon (SVG)
- Warehouse selector ("Склад 15")
- Auto-scaling to fit viewport
- Touch-friendly for Android WebView

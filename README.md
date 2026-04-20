# Gym Tracker

App de tracking para rutina de 3 días (cuerpo completo). Detecta el día automáticamente, registra peso/reps por serie, muestra animaciones de cada ejercicio, trackea progresión semana a semana, y tiene timer de descanso que arranca solo al marcar una serie.

**Progressive Web App**: se instala como app nativa en iPhone/Android y funciona 100% offline.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS**
- **Recharts** (gráficas)
- **lucide-react** (iconos)
- **vite-plugin-pwa** (service worker + manifest)
- **localStorage** para persistencia (sin backend)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Build

```bash
npm run build
```

Genera la carpeta `dist/` con el bundle + service worker + manifest.

## Deploy en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa este repo (`alextrevio/gym-tracker`)
3. Vercel detecta Vite automáticamente — no hace falta configurar nada
4. Click en "Deploy"

En menos de un minuto tienes tu URL.

## Instalar como app

### iPhone (Safari)

1. Abre la URL de Vercel en Safari
2. Toca el botón de compartir (cuadro con flecha)
3. Scroll → "Add to Home Screen"
4. Nombre "Gym" → listo

### Android (Chrome)

Te va a aparecer automático un prompt para instalar. Si no, toca los 3 puntos → "Install app" o "Add to Home Screen".

## Funciones

- **3 días pre-cargados**: A (empuje + sentadilla), B (jalón + cadena posterior), C (piernas + condición)
- **Detección automática del día**: Lunes → A, Miércoles → B, Viernes → C
- **Animaciones SVG** para cada ejercicio con tips de técnica
- **Tracking de series** con peso y reps
- **Timer de descanso automático** con vibración + beep al terminar
- **Historial completo** agrupado por semana
- **Gráficas de progresión** con 1RM estimado (fórmula de Epley)
- **Récords personales** automáticos
- **100% offline** una vez abierta la primera vez

## Estructura

```
.
├── index.html
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── pwa-maskable-512x512.png
├── src/
│   ├── main.jsx       # entry point
│   ├── App.jsx        # toda la app (~2500 líneas)
│   └── index.css      # tailwind base + safe-area utils
├── package.json
├── vite.config.js     # PWA config incluida
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

Toda la lógica vive en `src/App.jsx` (un solo archivo con todos los componentes, animaciones y data de la rutina).

## Datos

Los datos se guardan en el `localStorage` del navegador con la key `gym-tracker-state-v2`. No hay backend, no hay cuentas, no hay sincronización entre dispositivos.

Para resetear todo: DevTools → Application → Local Storage → borrar.

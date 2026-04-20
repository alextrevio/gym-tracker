# Gym Tracker

App de tracking para rutina de 3 días (cuerpo completo). Detecta el día automáticamente, registra peso/reps por serie, muestra animaciones de cada ejercicio y trackea progresión semana a semana.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS**
- **Recharts** (gráficas)
- **lucide-react** (iconos)
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

Genera la carpeta `dist/`.

## Deploy en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa este repo (`alextrevio/gym-tracker`)
3. Vercel detecta Vite automáticamente — no hace falta configurar nada
4. Click en "Deploy"

En menos de un minuto tienes tu URL.

## Funciones

- **3 días pre-cargados**: A (empuje + sentadilla), B (jalón + cadena posterior), C (piernas + condición)
- **Detección automática del día**: Lunes → A, Miércoles → B, Viernes → C
- **Animaciones SVG** para cada ejercicio con tips de técnica
- **Tracking de series** con peso y reps
- **Historial completo** agrupado por semana
- **Gráficas de progresión** con 1RM estimado (fórmula de Epley)
- **Récords personales** automáticos

## Estructura

```
.
├── index.html
├── src/
│   ├── main.jsx       # entry point
│   ├── App.jsx        # toda la app
│   └── index.css      # tailwind base
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

Toda la lógica vive en `src/App.jsx` (un solo archivo con todos los componentes, animaciones y data de la rutina).

## Datos

Los datos se guardan en el `localStorage` del navegador con la key `gym-tracker-state-v2`. No hay backend, no hay cuentas, no hay sincronización entre dispositivos.

Para resetear todo: DevTools → Application → Local Storage → borrar.

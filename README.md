# FSports — Fútbol y F1, con otro estilo

La casa digital de **@FSports_21**: resultados, fixtures y estadísticas del Mundial 2026 y la Fórmula 1, con identidad premium nocturna. Web estática, rápida, instalable como app (PWA) y con datos que podés cargar vos mismo sin tocar código.

---

## 🚀 Cómo correr la web en tu compu

Necesitás tener **Node.js** instalado (versión LTS de [nodejs.org](https://nodejs.org)).

```bash
npm install     # solo la primera vez
npm run dev     # levanta la web
```

Abrí el navegador en `http://localhost:5173`. Listo.

Para generar la versión final (la que se publica):

```bash
npm run build   # crea la carpeta dist/ lista para subir
```

---

## ✏️ Cómo editar los datos (sin saber programar)

La web arranca en **modo manual**: lee todo de UN solo archivo:

> **`src/data/manifest.ts`**

Abrilo con el Bloc de notas (o cualquier editor). Adentro está todo comentado en español: partidos, posiciones, última carrera de F1, próximo GP y campeonatos.

**Para agregar un partido:** copiá un bloque completo `{ ... },` de la lista
`partidos`, pegalo debajo y cambiá los datos (equipos, fecha, hora, estado).

**Para cargar un resultado:** cambiá `estado: "programado"` por
`estado: "finalizado"` y completá `golesLocal` y `golesVisitante`.

**Para un partido en vivo:** poné `estado: "en_vivo"`, cargá los goles
parciales y el `minuto`. La tarjeta se "enciende" sola con el glow rojo.

Reglas de oro (también están en el archivo):
- Textos entre comillas (`"México"`), números sin comillas (`2`).
- Lo que no existe todavía va como `null` (ej: goles de un partido no jugado).
- No borres las comas entre elementos.

Si te equivocás en un dato, la web **no se rompe**: muestra un valor por defecto.

---

## 🔌 Cómo conectar datos reales (modo API)

1. Registrate gratis en [football-data.org](https://www.football-data.org/client/register) y copiá tu token.
2. Abrí el archivo `.env.local` (está en la raíz del proyecto) y dejalo así:
   ```
   VITE_DATA_MODE=api
   VITE_FOOTBALL_DATA_TOKEN=tu_token_aca
   ```
3. Frená el servidor (Ctrl+C) y volvé a correr `npm run dev`.

La F1 (API Jolpica) no necesita token: funciona sola en modo api.

**Los tres modos disponibles** (`VITE_DATA_MODE` en `.env.local`):

| Modo | Qué hace |
|---|---|
| `manual` | Lee `src/data/manifest.ts`. Sin internet, sin token. **El default.** |
| `api` | Datos en vivo del Mundial (football-data.org) y F1 (Jolpica). |
| `demo` | Datos de ejemplo abundantes, para desarrollo y capturas. |

> **¿Error de CORS con el token real?** football-data.org a veces bloquea
> llamadas directas desde el navegador. La solución gratis es un proxy con
> Cloudflare Workers: creá un Worker que reenvíe las peticiones a
> `https://api.football-data.org/v4` agregando tu token, y poné su URL en
> `VITE_FOOTBALL_API_BASE` dentro de `.env.local`. Pedile a Claude Code:
> *"Creá un Cloudflare Worker que haga de proxy para football-data.org"*.

---

## 🌐 Cómo publicar la web (gratis)

### Cloudflare Pages (recomendado)

1. Subí el proyecto a un repositorio de GitHub.
2. En [pages.cloudflare.com](https://pages.cloudflare.com): **Create a project** → conectá GitHub → elegí el repo.
3. Configuración de build:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. En **Environment variables** agregá `VITE_DATA_MODE` (y el token si usás modo api).
5. **Save and Deploy**. En 1-2 minutos tenés la web en `tuproyecto.pages.dev`.

> Importante: como la web usa rutas (`/f1`), si ves un 404 al recargar esa
> página, agregá una regla de "single page app fallback" (en Cloudflare Pages
> es automático; en Netlify creá un archivo `public/_redirects` con la línea
> `/* /index.html 200`).

### Actualizar datos en producción (modo manual)

Editás `src/data/manifest.ts`, hacés commit y push a GitHub, y Cloudflare
Pages reconstruye y publica solo. Dos minutos y la web está actualizada.

---

## 📱 Instalarla como app

La web es una **PWA**: en Android/Chrome aparece "Instalar app" en el menú ⋮;
en iPhone/Safari es botón compartir → "Agregar a inicio". Queda con ícono
propio y pantalla completa, sin pasar por las tiendas.

---

## 🎨 Decisiones de diseño

- **Concepto:** "broadcast premium nocturno" — gráfica de transmisión deportiva de alta gama, oscura y cálida, lo opuesto a lo frío de FlashScore.
- **Paleta:** definida UNA vez en `src/styles/tokens.css`. Cambiar un color ahí propaga a todo el sitio. Negro cálido + crema + dorado `#D4AF6A`; el naranja `#FF6B00` es exclusivo del logo.
- **Tipografías:** Bricolage Grotesque (titulares y marcadores), Inter (texto), JetBrains Mono (horas, tiempos, etiquetas — el toque "timing de broadcast").
- **Signature:** el *scoreboard glow* — las tarjetas en vivo brillan en rojo como pantalla de estadio, las destacadas en dorado — y una textura de líneas diagonales finísimas en banners y headers de sección.
- **Rendimiento:** sin librerías de UI, sin 3D, sin imágenes pesadas. Animaciones solo de opacidad/transform, respetando `prefers-reduced-motion`.
- **Robustez:** los tres modos de datos devuelven los mismos tipos normalizados; todo fetch tiene estado de carga (skeletons), error (con reintento) y vacío (en la voz de la marca). Si el CDN de banderas falla, se muestra el código del país. La web nunca queda en blanco.

## 🗂️ Dónde está cada cosa

```
src/
├── data/manifest.ts      ⭐ datos editables a mano
├── lib/config.ts         modo de datos + token
├── lib/types.ts          tipos normalizados (la moneda común)
├── lib/data/             adaptadores: manifest / api / demo
├── hooks/useData.ts      hooks de datos (caché y revalidación)
├── styles/tokens.css     paleta y tipografía (fuente única de verdad)
├── components/           layout, ui, football, f1
└── pages/                FootballPage (/) y F1Page (/f1)
```

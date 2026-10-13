# El sonido del movimiento — sitio web

Sitio estático, sin dependencias. Abrir `index.html` o publicar la carpeta tal cual.

## Publicar en GitHub Pages (desde el navegador)
1. En github.com: **New repository** → nombre, p. ej. `sonido-del-movimiento` → **Public** → *Create repository*.
2. En el repositorio vacío: **uploading an existing file** → arrastrar TODO el contenido de esta carpeta
   (`index.html`, `.nojekyll`, `LEEME.md` y las carpetas `v`, `p`, `g`) → **Commit changes**.
   Si Windows oculta `.nojekyll`, no es crítico: el sitio funciona igual.
3. **Settings → Pages** → *Source*: **Deploy from a branch** → *Branch*: `main` / `(root)` → **Save**.
4. En 1–2 min el sitio queda en `https://<usuario>.github.io/sonido-del-movimiento/`.

## Estructura
- `index.html` — página completa (estilos y código incluidos).
- `v/` — 18 videos (sala, nino, adulto × M0–M5), 960×540, maqueta audiovisual V5 · versión para niños v2 (9:07).
- `p/` — carátulas de los videos.
- `g/` — imágenes de la sección «Del papel a la sala».
- `kit/` — kit de impresión 3D por arcos (20 STL en mm a 1:4, 5 ZIP por arco, ZIP completo y LEEME_kit.txt); `g/kit_arco1…5.jpg` son sus vistas.
- `laminas/` — Laminas_proyeccion_relator.pdf (13 láminas A3 de la proyección sobre el relator).

Tamaño total ≈ 95 MB; ningún archivo supera 9 MB (límite web de GitHub: 25 MB por archivo, 100 archivos por carga).

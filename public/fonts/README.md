# Fonts

Self-hosted only. The prototype references three families:

- **Archivo** — display. `archivo-variable.woff2`
- **Public Sans** — body. `public-sans-variable.woff2`
- **IBM Plex Mono** — data. `plex-mono-regular.woff2`, `plex-mono-medium.woff2`

If the woff2 files are missing at runtime the CSS falls back to the platform stack defined in `globals.css`. The fallbacks are chosen with similar metrics so layout doesn't shift.

To bundle real fonts: drop the .woff2 files here and they load automatically via `@font-face` in `src/app/globals.css`.

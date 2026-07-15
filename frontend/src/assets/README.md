# /frontend/src/assets

Static assets bundled by Vite.

## Subdirectories

| Directory | Contents |
|---|---|
| `icons/` | SVG icons (accessible — each SVG has a `title` element and `aria-label`) |
| `images/` | Illustrations, hero images (optimised, WebP format with JPEG fallback) |
| `fonts/` | Web fonts if self-hosted (prefer system fonts for performance) |

## Accessibility Note

All `<img>` tags referencing assets in this directory must have meaningful `alt` attributes. Purely decorative images must use `alt=""` and `role="presentation"` so screen readers skip them.

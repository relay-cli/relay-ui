# Relay UI artwork

The banner and social preview are drawn by `draw-artwork.py` from the official Relay mark (`relay-avatar.png` in the Relay organization profile). They use the shared Relay palette, the Cascadia Mono typeface for interface text, and restrained terminal borders, without decorative code or robot imagery.

## Banner

`banner.png` uses a 3:1 composition. The left side contains the Relay mark, the product name, and a short description. The right side draws the real components as terminal panels: a table of HTTP requests with colored status codes and a selected row, spinners in their running, done, and failed states, and rendered Markdown with a heading, a numbered list, inline code, and a quote.

## Social preview

`.github/social-preview.png` recomposes the same panels for a 2:1 thumbnail. The description is removed, the mark sits beside the name, and the interface text is enlarged so it stays readable in repository cards.

## Redrawing

The script needs Python with Pillow and NumPy, and reads fonts from `C:/Windows/Fonts` (Cascadia Mono, Bahnschrift, Segoe UI Symbol):

```sh
python docs/assets/draw-artwork.py path/to/relay-avatar.png docs/assets
```

It writes `banner.png` and `social-preview.png`; copy the social preview to `.github/`. Upload it under the repository's Settings → Social preview as well, since GitHub does not read it from the repository.

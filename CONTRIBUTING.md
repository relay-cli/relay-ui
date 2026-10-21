# Contributing

Install Node.js 22 or newer, then run:

```sh
npm install
npm run check
```

Changes should include tests for observable behavior. A component belongs in Relay UI once more than one Relay tool needs it. Each component gets a section in the gallery (`src/gallery/sections.tsx`) and an entry in [docs/api.md](docs/api.md).

Components take colors from the theme rather than hard-coding them, and they must render the same way in `renderToString` as in an interactive terminal, apart from animation.

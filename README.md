# Relay UI

Relay UI holds the Ink components that Relay's terminal tools share, so each tool draws tables, spinners, Markdown, and colors the same way instead of keeping its own copy.

## See the components

```sh
npm install
npm run demo
```

The gallery shows every component with sample data. Press `q` to quit. To print it once without opening the interactive view:

```sh
npx tsx src/cli.tsx --snapshot
```

## Use it in a tool

```sh
npm install @relay-cli/ui ink react
```

Ink and React are peer dependencies, so the components render with your tool's own copy of each.

## Develop

```sh
npm run check
```

`check` runs Prettier, ESLint, the TypeScript compiler, the Vitest suite, and the build. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

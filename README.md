<h1 align="center">financier</h1>

<p align="center">
  <a href="https://github.com/financier-io/financier">⚙ Github</a> —
  <a href="https://app.financier.io">💰 Production app</a> —
  <a href="https://staging.financier.io">Staging app</a> —
  <a href="https://staging.financier.io/docs">📗 Staging Docs</a> —
  <a href="https://trello.com/b/bXcFuXrm">📢 Trello</a> —
  <a href="https://financier.io">🕸 Website</a> —
  <a href="https://github.com/orgs/financier-io/packages?repo_name=financier">🐳 Docker</a>
</p>

> A web-based, offline-first app. Built with Angular 1 and PouchDB.

### Develop

```sh
pnpm
pnpm start
```

### Test

```sh
pnpm test
# or continuous: `pnpm test-watch`
```

### Build (for production)

```sh
pnpm build
```

### Run locally

```sh
pnpm build
pnpm run docs # generate jsdoc documentation
node ./api
```

### Docs

Local docs would be `http://localhost:8080/docs`.

Generate with `pnpm run docs`.

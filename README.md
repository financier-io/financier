<h1 align="center">financier</h1>

<p align="center">
  <a href="https://gitlab.com/financier/financier">⚙ Gitlab</a> —
  <a href="https://app.financier.io">💰 Production app</a> —
  <a href="https://staging.financier.io">Staging app</a> —
  <a href="https://staging.financier.io/docs">📗 Staging Docs</a> —
  <a href="https://trello.com/b/bXcFuXrm">📢 Trello</a> —
  <a href="https://financier.io">🕸 Website</a> —
  <a href="https://gitlab.com/financier/financier/container_registry">🐳 Docker</a>
</p>

> A web-based, offline-first app. Built with Angular 1 and PouchDB.

[![build status](https://gitlab.com/financier/financier/badges/master/build.svg)](https://gitlab.com/financier/financier/commits/master)

### Develop

```sh
yarn
yarn start
```

### Test

```sh
yarn test
# or continuous: `yarn test-watch`
```

### Build (for production)

```sh
yarn build
```

### Run locally

```sh
yarn build
yarn docs # generate jsdoc documentation
node ./api
```

### Docs

Local docs would be `http://localhost:8080/docs`.

Generate with `yarn docs`.

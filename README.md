# financier

 > A web-based, offline-first, YNAB4 alternative. Built with Angular 1 and PouchDB.

[⚙ Github](https://github.com/aeharding/financier) 〜 [💰 Staging app](https://staging.financier.io) 〜 [📗 Docs](https://staging.financier.io/docs) 〜 [📢 Trello](https://trello.com/b/bXcFuXrm) 〜 [🕸 Website](https://financier.io) 〜 [🐳 Docker](https://hub.docker.com/r/aeharding/financier/)

[![Build Status](https://img.shields.io/travis/aeharding/financier/master.svg?style=flat-square)](https://travis-ci.org/aeharding/financier)
[![Coverage Status](https://img.shields.io/coveralls/aeharding/financier/master.svg?style=flat-square)](https://coveralls.io/github/aeharding/financier?branch=master)

## Are you a user?

This page is for developers. If you need help with financier, check out [the wiki](https://github.com/aeharding/financier/wiki) or [the website](https://financier.io).

## Install

```sh
# clone it
npm install -g gulp bower
npm install
bower install
```

### Develop

```sh
gulp watch
```

### Run locally

```sh
gulp build
npm run-script docs # generate jsdoc documentation
node ./api
```

### Docs

Local docs would be `http://localhost:8080/docs`.

Generate with `npm run-script docs`.

// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.
window.jasmine = true;
window.VERSION = {};
window.process = {
  env: {},
};

require("regenerator-runtime/runtime");
require("jest-fetch-mock").enableMocks();

require("angular");
require("angular-mocks/angular-mocks");

// https://github.com/pouchdb/pouchdb/issues/8383
window.setImmediate = (fn) => {
  setTimeout(fn, 0);
};
window.process.nextTick = (fn) => {
  setTimeout(fn, 0);
};

const PouchDB = require("pouchdb-browser");
const memory = require("pouchdb-adapter-memory");

PouchDB.plugin(memory);

require("./src/scripts/app");

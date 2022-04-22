// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.
window.jasmine = true;
require("jest-fetch-mock").enableMocks();

global.setImmediate = jest.useRealTimers;

require("angular");
require("angular-mocks/angular-mocks");

require("./src/scripts/app");

const PouchDB = require("pouchdb-browser");
const memory = require("pouchdb-adapter-memory");

PouchDB.plugin(memory);

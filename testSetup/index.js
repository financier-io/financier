import "./env.js";

import "angular";
import "vitest-angular-mocks/test/angular-mocks.js";

import PouchDB from "pouchdb-browser";
import memory from "pouchdb-adapter-memory";

PouchDB.plugin(memory);

import "../src/scripts/app.js";

// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.


import 'angular';
import 'angular-mocks/angular-mocks';

import './app';

import PouchDB from 'pouchdb';
import memory from 'pouchdb-adapter-memory';

window.Promise = require('es6-promise').Promise;

PouchDB.plugin(memory);

const context = require.context('.', true, /\.spec.js$/);

context.keys().forEach(context);

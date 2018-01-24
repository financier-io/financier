// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.


import 'angular';
import 'angular-mocks/angular-mocks';

import './app';

import PouchDB from 'pouchdb';
window.Promise = require('es6-promise').Promise

PouchDB.plugin(require('pouchdb-adapter-memory'));

const context = require.context('.', true, /\.js$/);

context.keys().forEach(context);

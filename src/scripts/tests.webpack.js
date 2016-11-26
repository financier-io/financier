// This file is an entry point for angular tests
// Avoids some weird issues when using webpack + angular.

import 'angular';
import './app';

import 'angular-mocks/angular-mocks';

import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-adapter-memory'));

const context = require.context('.', true, /.spec.js$/);

context.keys().forEach(context);

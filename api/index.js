var express = require('express');
var app = express();
var git = require('git-rev');
var pJson = require('../package.json');

if (process.env.NODE_ENV === 'development') {
  app.use(require('connect-livereload')({
    port: 35729
  }));  
}

app.use(express.static('dist'));
app.use('/bower_components', express.static('bower_components'));
app.use('/node_modules', express.static('node_modules'));

app.get('/api/version', function(req, res, next) {
  git.long(function (sha) {
    res.send({
      sha: sha,
      version: pJson.version
    });
  });
});

// html5mode
app.all('/*', function(req, res) {
  res.sendfile('dist/index.html');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

var path = require('path');
var express = require('express');
var app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(require('connect-livereload')({
    port: 35729
  }));  
}

app.use(express.static(path.join(__dirname, '../dist')));

// html5mode
app.all('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

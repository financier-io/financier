var path = require('path');
var express = require('express');
var app = express();

app.use('/docs', express.static(path.join(__dirname, '../docs')));

app.use(express.static(path.join(__dirname, '../dist')));

// html5mode
app.all('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

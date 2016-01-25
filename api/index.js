var express = require('express');
var app = express();

app.use(require('connect-livereload')({
  port: 35729
}));

app.use(express.static('dist'));
app.use('/bower_components', express.static('bower_components'));

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
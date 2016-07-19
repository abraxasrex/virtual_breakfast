
var express  = require('express');
var app = express();
var morgan = require('morgan');

app.use(express.static(__dirname + '/public'));  //set the static file name to public ...on top of current dir name?)
app.use(morgan('dev')); //logs to dev console

app.get('*', function (req, res) {
  res.sendFile('./public/index.html');
});

var port = process.env.PORT || 8080;
app.listen(port);

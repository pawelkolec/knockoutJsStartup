var express = require('express');
var fs = require('fs');
var open = require('open');
var bodyParser = require('body-parser');
var logger = require('morgan');
var path = require('path');

var app = express();
var PORT = 8000;
var STATIC_DIR = __dirname;

if(process.env.NODE_ENV == 'production') {
	STATIC_DIR += '/dist/';
}
else {
	STATIC_DIR += '/src/';
}

app.use(logger('dev'));
app.use(express.static(STATIC_DIR));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//redirect all requests to main file
app.get('*', function(req, res) {
	res.sendFile(path.join(STATIC_DIR + '/index.html'));
});

app.listen(PORT, function () {
	open('http://localhost:' + PORT + '/');
	logger('Example app listening on port ' + PORT + '!');
});

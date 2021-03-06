var express = require('express')
  , path = require('path')
  , http = require('http')
  , app = express()
  , cons = require('consolidate')
  , swig = require('swig')
  , fs = require('fs');

swig.init({ 
	root: path.join(__dirname, 'views'),
	allowErrors: true
});

app.configure(function(){
	app.set('port', process.env.PORT || process.env.NODE_PORT || 3000);
	app.engine('html', cons.swig)
	app.set('view engine', 'html');
	app.set('views', path.join(__dirname, '/views'));
	app.set('view options', {layout: false});
	app.use(express.bodyParser({keepExtensions: true, uploadDir: '/var/tmp'}));
	app.use(express.methodOverride());
	app.use(express['static'](path.join(__dirname, 'public')));
});

// Routing Vars
var routes = require('./routes');

app.get('/', routes.dashboard);
app.get('/add', routes.add);
app.post('/add', routes.create);
app.get('/employee/:id', routes.view);
app.get('/employee', routes.view);
app.get('/query/:name', routes.query);
app.post('/employee/:id', routes.edit);

// Error handler
app.use(function(err, req, res, next){
	console.warn((typeof err === 'string') ? err : JSON.stringify(err, null, 4));
	req.template = "error.html";
	var vars = {
		status: 500,
		message: "Officer Down!",
		error: err
	};
	if (req.xhr) {
		var tmpl = swig.compileFile('error.html');
		res.send(500, {template: tmpl.render(vars), swig: vars});
	} else {
		res.render('error.html', vars);
	}
});

// Global middleware for determining the type of response to send
app.use(function(req, res, next) {
	var template = req.template || 'error.html';
	var vars = req.swig || {status: 404, message: "That's a negative commander"};
	if (req.xhr) {
		var tmpl = swig.compileFile(template);
		res.send(200, {template: tmpl.render(vars), swig: vars});
	} else {
		res.render(template, vars);
	}
});

http.createServer(app).listen(app.get('port'), function(){
	console.warn('Listening on port ' + app.get('port'));
});
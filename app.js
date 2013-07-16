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
	
	// Error handler
	app.use(function(err, req, res, next){
		console.warn((typeof err === 'string') ? err : JSON.stringify(err, null, 4));
		if (req.xhr) res.send(500, {error: err});
		else res.render('error/500', {error: err});
	});
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

http.createServer(app).listen(app.get('port'), function(){
	console.warn('Listening on port ' + app.get('port'));
});
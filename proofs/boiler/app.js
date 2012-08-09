
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , swig = require('./config/consolidate-swig').swig



var app = express();

if ('development' == app.get('env')) {
	app.set('config', JSON.parse( require('fs').readFileSync('./config/development.json', 'utf8') ) )
	require('swig').init({ cache: false, allowErrors: true, filters: {} })
	console.log('configuring DEV')
}

if ('production' == app.get('env')) {
  app.set('config', JSON.parse( require('fs').readFileSync('./config/production.json', 'utf8') ) )
  require('swig').init({ cache: true, allowErrors: false, filters: {} })
	console.log('configuring PROD')
}



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.engine('html', swig);
	app.set('view engine', 'html');
	app.set('view options', { layout: false });
  app.use(express.favicon());
  //app.use(express.logger('dev'));
  app.use(express.logger({format: app.get('config').logger.format }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('yoursecrethere123123123123'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

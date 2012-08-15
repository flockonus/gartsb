
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , swig = require('./config/consolidate-swig').swig
  , redis = require('redis')
  , C 



var app = express();

if ('development' == app.get('env')) {
	C = console.log
	app.set('config', JSON.parse( require('fs').readFileSync('./config/development.json', 'utf8') ) )
	require('swig').init({ cache: false, allowErrors: true, filters: {}, root: __dirname + '/views' })
	console.log('configuring DEV')
}

if ('production' == app.get('env')) {
	C = function(){}
  app.set('config', JSON.parse( require('fs').readFileSync('./config/production.json', 'utf8') ) )
  require('swig').init({ cache: true, allowErrors: false, filters: {}, root: __dirname + '/views' })
	console.log('configuring PROD')
}



app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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
  app.use(express['static'](path.join(__dirname, 'public')));
  app.use(express['static'](path.join(__dirname, 'shared')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

require('./routes')(app)

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


// check me on production: http://handbook.nodejitsu.com/#Redis
// redis-cli -h $REDIS_URL -p $REDIS_PORT -a $REDIS_PASS
// redis-cli -h scat.redistogo.com -p 9495 -a ?
// TODO could be shared with connext/express as well
var pub, sub, R;

if ('production' == app.get('env')) {
	pub    = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL)
	pub.auth(process.env.REDIS_PASS )
  sub    = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL)
  sub.auth(process.env.REDIS_PASS )
  R      = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_URL)
  R.auth(  process.env.REDIS_PASS )
  console.log('pass', process.env.REDIS_PASS)
} else {
	pub    = redis.createClient()
  sub    = redis.createClient()
  R      = redis.createClient()
}

var io = require('./lib/sockets.js')(server, pub, sub, R, C )
//var gm = require('./lib/gm.js')


// FIXME only for redirect
// init redis


// TODO LREM 1 on disconnect

//C(io.sockets)

setInterval(function(){
	//R.llen("wait-queue",function(err,count){
		//C("wait-queue:", count)
	//})
}, 5000)



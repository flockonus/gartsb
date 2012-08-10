
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , swig = require('./config/consolidate-swig').swig
  , redis = require('redis')
  , C 



var app = express();

if ('development' == app.get('env')) {
	C = console.log
	app.set('config', JSON.parse( require('fs').readFileSync('./config/development.json', 'utf8') ) )
	require('swig').init({ cache: false, allowErrors: true, filters: {} })
	console.log('configuring DEV')
}

if ('production' == app.get('env')) {
	C = function(){}
  app.set('config', JSON.parse( require('fs').readFileSync('./config/production.json', 'utf8') ) )
  require('swig').init({ cache: true, allowErrors: false, filters: {} })
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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);
io.set('log level', 2);

// TODO check me on production: http://handbook.nodejitsu.com/#Redis
// TODO could be shared with connext/express as well
var RedisStore = require('socket.io/lib/stores/redis')
  , pub    = redis.createClient()
  , sub    = redis.createClient()
  , R = redis.createClient();

io.set('store', new RedisStore({
  redisPub : pub
, redisSub : sub
, redisClient : R
}));


// FIXME only for redirect
// init redis
R.set('room-count', 0)

// receive an uid
// shifts somebody from match-queue
//   if somebody, assign a room for both
//   or enqueue self uid
// when any of those quit, the game is over
io.sockets.on('connection', function(socket) {
	C( socket.id, "just connected!" )
	
	// looks for a contender
	R.lpop("wait-queue", function(err,partnerId){
		//C("lpop", partnerId)
		
		// well.. nobody shows up, enqueue myself
		if( !partnerId ){
			R.rpush("wait-queue", socket.id)
		} else {
			// found partner! start game for these guys!
			C("made a match!", socket.id, partnerId)
			
			R.incr('room-count',function(err, roomId){
				function rColor(){ return Math.floor( Math.random()*100 )+100 }
				var color = "rgb("+rColor()+","+rColor()+","+rColor()+")"
				io.sockets.socket(partnerId).emit('game start', {
					room: roomId,
					color: color,
				})
				socket.emit('game start', {
					room: roomId,
					color: color,
				})
				
				io.sockets.socket(partnerId).join("room-"+roomId)
				socket.join("room-"+roomId)
				
				// save both players id to the roomId
				R.set("socket-room-"+partnerId, roomId)
				R.set("socket-room-"+socket.id, roomId)
				// set expire to 4h
				R.expire("socket-room-"+partnerId, 60*60*4)
				R.expire("socket-room-"+socket.id, 60*60*4)
				// TODO create room
				
				
				//R.set("socket-"+)
			})
		}
	})
	
  // Emit a message to send it to the client.
  socket.emit('hello', { msg: 'Hello. I know socket.io.' });
  
	socket.on('disconnect', function(a) {
		// disbandle room
		R.lrem("wait-queue", 1, socket.id, function(err,count){
			C("1 client disconnect!",socket.id, count )
			// TODO emit game end
			R.get("socket-room-"+socket.id, function(err,roomId){
				io.sockets['in']("room-"+roomId).emit('game end',{result:"quitter"});
				C('disconnect',io.sockets['in']("room-"+roomId), roomId)
			})
		})
	})
});

// TODO LREM 1 on disconnect

//C(io.sockets)

setInterval(function(){
	R.llen("wait-queue",function(err,count){
		C("wait-queue:", count)
	})
}, 4000)



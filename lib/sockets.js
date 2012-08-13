module.exports = function(server, rPub, rSub, R, C){
	var io = require('socket.io').listen(server);
	var gm = require('./gm.js')(R, C)
	io.set('log level', 2);
	
	RedisStore = require('socket.io/lib/stores/redis')
	
	io.set('store', new RedisStore({
	  redisPub : rPub
	, redisSub : rSub
	, redisClient : R
	}));
	
	R.set('room-count', 0)
	R.del('wait-queue')

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
				
				R.incr('room-count',function(err, n){
					//function rColor(){ return Math.floor( Math.random()*100 )+100 }
					//var color = "rgb("+rColor()+","+rColor()+","+rColor()+")"
					var roomId = "room-"+(n+Math.random())
					io.sockets.socket(partnerId).join(roomId)
					socket.join(roomId)
					
					io.sockets['in'](roomId).emit('game start', {
						roomId: roomId,
						left: partnerId,
						right: socket.id,
					});
					
					// save both players id to the roomId
					R.set("socket-room-"+partnerId, roomId)
					R.set("socket-room-"+socket.id, roomId)
					// set expire to 4h
					R.expire("socket-room-"+partnerId, 60*60*4)
					R.expire("socket-room-"+socket.id, 60*60*4)
					
					gm.createGame( roomId, partnerId, socket.id )
				})
			}
		})
		
	  // Emit a message to send it to the client.
	  socket.emit('hello', {
	  	yourId: socket.id,
	  	msg: 'Hello. I know socket.io.',
	  });
	  
	  socket.on('do action', function(data){
	  	console.log('do action', data, socket.id)
	  });
	  
		socket.on('disconnect', function(a) {
			// disbandle room
			R.lrem("wait-queue", 1, socket.id, function(err,count){
				C("1 client disconnect!",socket.id, count )
				// TODO emit game end
				R.get("socket-room-"+socket.id, function(err,roomId){
					io.sockets['in'](roomId).emit('game end',{
						result:"quitter"
					});
					C('disconnect', roomId)
				})
			})
		})
	});
	
	return {
		io: io,
		out: function(){
			
		}
	}
}

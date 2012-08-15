module.exports = function(R, C, io){
	
	G = require('../shared/game_core')
	
	var GM = {
		all: {},
		createGame: function( roomId, user1, user2 ){
			C("createGame", roomId)
			var match = new G.GameManager(roomId, user1, user2)
			this.all[roomId] = match
			C(JSON.stringify(match))
			// TODO  this isn't scalable, turn rotation must be outside
			match.turnTimeout = setTimeout(this.nextTurn.bind(this), G.TURN_BASE*1000, roomId)
		},
		doAction: function(roomId, userId, data){
			var match = this.all[roomId]
			var res = match.executeAction(
				userId, data.actionId, 
				data.toX, data.toY,
				data.fromX, data.fromY
			)
			C('doAction', userId, data, res)
			io.sockets['in'](roomId).emit('play action',res);
			if(res)
				match.applyActionOutcome(res.sequence, res.ap)
			var winner = match.checkGameOver()
			if( winner ){
				setTimeout(function(){
					io.sockets['in'](roomId).emit('game end',{
						result: winner
					});
				},1000)
			}
		},
		nextTurn: function(roomId){
			var match = this.all[roomId]
			console.log(roomId, match.turn,match.whoseTurn)
			match.nextTurn()
			io.sockets['in'](roomId).emit('next turn',{});
			if( match.turn < 1000 )
				match.turnTimeout = setTimeout(this.nextTurn.bind(this), G.TURN_BASE*1000, roomId)
			else
				io.sockets['in'](roomId).emit('game end',{
					result: 'time over'
				});
		},
	}
	
	return GM
}
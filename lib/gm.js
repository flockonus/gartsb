module.exports = function(R, C){
	
	G = require('../shared/one_love')
	
	var GM = {
		all: {},
		createGame: function( roomId, user1, user2 ){
			C("createGame", roomId)
			var match = new G.GameManager(roomId, user1, user2)
			this.all[roomId] = match
			C(JSON.stringify(match))
		},
	}
	
	return GM
}
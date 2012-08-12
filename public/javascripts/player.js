var Player = {
	start: function(id, game){
		this.game = game
		this.myId = id
		for(var tId in game.teams)
			if(game.teams[tId].playerId == this.myId)
				this.teamId = tId
		this.heroes = this.game.teams[this.teamId].heroes
			//console.log(tId,game.teams[tId].playerId)
	},
	turnCb: function(){
		var ctx = this
		return function(whose, n){
			UI.refreshMap()
			setTimeout(function(){
				if( whose == ctx.teamId ){
					console.log('my turn!', n, whose)
					UI.setGauge( G.MAX_AP )
					// do some graphical stuff
					// enable controls
					
					UI.selectHero( ctx.getMyFirstHeroAlive() )
				} else {
					console.log('other turn!',n, whose)
					UI.showOtherTurn()
					// do some graphical stuff
					// disable controls
				}
				
			}, (n == 0 ? UI.beginDelay+100 : 1) )
		}
	},
	getMyFirstHeroAlive: function(){
		for (var i=0; i < this.heroes.length; i++) {
			if( this.heroes[i].hp.current > 0 )
				return this.game.map.positionOfHero( this.heroes[i] )
		};
	},
}

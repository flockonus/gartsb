/**
 * Is the implementation of a lawful  player, he sticks by the rules
 */
var Player = {
	start : function(id, game) {
		this.game = game
		this.myId = id
		for(var tId in game.teams)
			if(game.teams[tId].playerId == this.myId)
				this.teamId = tId
		this.heroes = this.game.teams[this.teamId].heroes
		//console.log(tId,game.teams[tId].playerId)
		this.activeHero = null
	},
	turnCb : function() {
		var ctx = this
		return function(whose, n) {
			UI.refreshMap()
			setTimeout(function() {
				if(whose == ctx.teamId) {
					// FIXME bad way to do this
					if( !$('#hero_avatar').length ){
						UI.showGUI()
					}
					console.log('my turn!', n, whose)
					UI.setGauge(ctx.game.teams[ctx.teamId].ap)
					// do some graphical stuff
					// enable controls

					ctx.selectHero(ctx.getMyFirstHeroAlive())
				} else {
					console.log('other turn!', n, whose)
					UI.showOtherTurn()
					// do some graphical stuff
					// disable controls
				}
				UI.startTurnCounter()
			}, (n == 0 ? UI.beginDelay + 100 : 1))
		}
	},
	getMyFirstHeroAlive : function() {
		for(var i = 0; i < this.heroes.length; i++) {
			if(this.heroes[i].hp.current > 0)
				return this.heroes[i]//this.game.map.heroWithPosition(this.heroes[i])
		};
	},
	selectHero : function(hero) {
		this.activeHero = hero
		UI.selectHero(hero)
	},
	selectAction : function(actBtn) {
		var actionId = actBtn.data('actionId')
		var action = G.ActionManager.get( actionId )
		var openPos = action.validBlocks(game.map, this.teamId, this.activeHero )
		console.log('available Pos', openPos)
		UI.displayAllowedPositions(openPos)
	},
	doActionAt: function(x,y){
		var actionId = $('#panel_wrap .attack_button.active').data('actionId')
		//var action = G.ActionManager.get( actionId )
		// should it be verified yet again before sending?
		socket.socket.requireAction(actionId,parseInt(x,10),parseInt(y,10))
	},
}
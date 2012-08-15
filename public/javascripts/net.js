//FIXME $(function () {
	// Connect to socket.io
	var socket = io.connect()
	var myId = null
	var game = null
	
	socket.socket.requireAction = function(actionId,x,y){
		//what a mess
		this.namespaces[''].emit('do action', {
			actionId:actionId,
			toX:x,
			toY:y,
			fromX: Player.activeHero.x,
			fromY: Player.activeHero.y,
		})
	}
	
	// React to a received message
	socket.on('hello', function (data) {
		console.log(":hello", data)
		myId = data.yourId
		UI.serverStatus('ON')
	});
	socket.on('disconnect', function (data) {
		console.log(":disconnect", data)
		UI.showWaitPanel()
		UI.serverStatus('OFF')
	});
	
	
	socket.on('game start', function(data){
		console.log(":game start", data)
		UI.displayGameStart()
		game = new G.GameManager(
			data.roomId,
			data.left,
			data.right
		)
		UI.setGame(game)
		Player.start(myId, game)
		game.start( Player.turnCb(), UI.actionCb )
	})
	
	socket.on('play action', function(data){
		game.applyActionOutcome(data.sequence, data.ap)
		UI.setGauge(data.ap)
		// TODO this better by applying outcomes individually
		//      instead of refreshing the whole map and gui
		UI.refreshMap()
		
		if( game.whoseTurn == Player.teamId )
			UI.selectHero( Player.activeHero )
	})
	
	socket.on('next turn', function(data){
		game.nextTurn()
		$.gritter.add({
			title: "Turn "+game.turn,
			text: game.whoseTurn,
			time: 1000,
		})
		//Player.turnCb()(game.whoseTurn,game.turn)
	})
	
	socket.on('game end', function(data){
		console.log(":game end", data)
		if( data.result == 'quitter' ){
			UI.gameOver("Your partner quit, you win!")
		}
		if( data.result == 'right' || data.result == 'left' ){
			if( Player.teamId == data.result )
				UI.gameOver("Congratulations, you won!")
			else
				UI.gameOver("Defeat")
		}
	})
//});
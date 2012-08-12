//FIXME $(function () {
	// Connect to socket.io
	var socket = io.connect()
	var myId = null
	var game = null
	
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
	
	socket.on('game nextTurn', function(data){
		game.nextTurn()
	})
	
	socket.on('game end', function(data){
		console.log(":game end", data)
		if( data.result == 'quitter' ){
			UI.gameOver("Your partner quit, you win!")
		}
	})
//});
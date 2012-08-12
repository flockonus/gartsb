window.onload = function () {
	// Connect to socket.io
	var socket = io.connect();
	
	// React to a received message
	socket.on('hello', function (data) {
		// Modify the DOM to show the message
		document.getElementById("status-label").innerHTML = data.msg;
	});
	
	socket.on('game start', function(data){
		console.log(data)
		// document.body.style['background'] = data
		document.getElementById("partner").innerHTML = "found!"
		document.getElementById("room-id").innerHTML = data.room
		document.body.style['background'] = data.color
	})
	
	socket.on('game end', function(data){
		// document.body.style['background'] = data
		document.getElementById("partner").innerHTML = "he quit!"
		document.getElementById("room-id").innerHTML = "none, again"
	})
};
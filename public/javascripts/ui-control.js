UI = {
	fillTiles: function(){
		var jmap = $('#map')
		var tileFill = $('#map .tile:first').children().clone()//.get(0).outerHTML
		$('#map .tile:first').children().remove()
		$('#map .tile').append( tileFill )
		$('#map .hero').remove()
	},
	setGame: function(g){
		this.game = g
	},
	storeGuiTemplate: function(){
		// store #panel_wrap into #game-panel-template
		this.guiTemplate = $('#panel_wrap').html()
		// and #waiting-panel-template
		this.waitTemplate = $('#waiting-panel-template').html()
		this.otherTurn = $('#other-turn-template').html()
		this.beginDelay = 100
	},
	showWaitPanel: function(){
		 $('#panel_wrap').html(this.waitTemplate)
	},
	serverStatus: function(msg){
		$('#server-status').text(msg)
	},
	displayGameStart: function(){
		$('#partner-status').text("Partner matched, the game is about to start!")
		var gui = this.guiTemplate
		setTimeout(function(){
			$('#panel_wrap').html(gui)
		// FIXME timer
		}, this.beginDelay)
	},
	gameOver: function(result){
		this.showWaitPanel()
		$('#partner-status').text(result)
		this.serverStatus('ON')
	},
	setGauge: function(n){
		var bars = $('#gauge_bar').children()
		 ,  barsS = bars.size()
		bars.each(function(i,e){
			//var je = $(e)
			if( i < n )
				$(e).removeClass('empty_gauge_unit')
			else
				$(e).addClass('empty_gauge_unit')
		})
	},
	refreshMap: function(game){
		$('#map .hero').remove()
		var ctx = this
		this.game.map.each(function(x,y,obj){
			if( obj ){ // since we only have heroes in map for now is fine
				ctx.plotHero(obj,x,y)
			}
		})
	},
	plotHero: function(hero, x, y){
		//console.log(x,y,hero)
		$('<div/>',{
			'class': "hero "+hero.type,
			// offset depend on the height and w of the hero
			'style': "left:"+(((x)*138)+48)+"px; top:"+((y*102)+72)+"px;",
			id: 'hero_'+x+"_"+y,
			title: hero.name,
		}).appendTo('#map')
	},
	showOtherTurn: function(){
		$('#panel_wrap').html(this.otherTurn)
		// probably only have this problem 1st turn
		var ctx = this
		setTimeout(function(){
			$('#panel_wrap').html(ctx.otherTurn)
		}, this.beginDelay+5)
	},
	selectHero: function(obj){
		$('#hero_'+obj.x+"_"+obj.y).append("*")
		
		$('#hero_avatar').html(
			obj.hero.name+" "+obj.hero.hp.current+"/"+obj.hero.hp.max+
			"<br/><br/><i>"+
			obj.hero.description+
			'</i>')
		
		$('#panel_wrap .attack_button').each(function(i,e){
			var actionId = obj.hero.actions[i]
			if( actionId ){
				var action = G.ActionManager.get( actionId )
				var elems = $(this).children()
				elems.filter(':first').text(action.title)
				elems.filter(':last').text(action.cost)
			} else {
				$(this).remove()
			}
		})
	}
}


$(function(){
	// FIXME uncomment
	UI.fillTiles()
	UI.storeGuiTemplate()
	UI.showWaitPanel()
})



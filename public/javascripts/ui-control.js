UI = {
	fillTiles: function(){
		var jmap = $('#map')
		var jtiles = $('#map .tile')
		var tileFill = jtiles.filter(':first').children(':first').removeClass('active').clone()//.get(0).outerHTML
		jtiles.filter(':first').children().remove()
		jtiles.append( tileFill )
		$('#map .hero').remove()
	},
	setGame: function(g){
		var jtiles = $('#map .tile')
		this.game = g
		var tileLength = g.map.w * g.map.h
		var x,y
		jtiles.each(function(i,e){
			y = i%(g.map.w)
			x = Math.floor(i/(g.map.h+1))
			e.id = x+"_"+y
		})
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
	selectHero: function(hero){
		$('#panel_wrap .attack_button').removeClass('active')
		
		$('#hero_'+hero.x+"_"+hero.y).append("*")
		
		$('#hero_avatar').html(
			hero.name+" "+hero.hp.current+"/"+hero.hp.max+
			"<br/><br/><i>"+
			hero.description+
			'</i>')
		
		$('#panel_wrap .attack_button').each(function(i,e){
			var actionId = hero.actions[i]
			if( actionId ){
				var action = G.ActionManager.get( actionId )
				var jbtn = $(this).data('actionId', actionId)
				var elems = jbtn.children()
				elems.filter(':first').text(action.title)
				elems.filter(':last').text(action.cost)
			} else {
				$(this).remove()
			}
		})
	},
	bindActionButtons: function(){
		var ctx = this
		function actionButtonClick(ev){
			$('#panel_wrap .attack_button').removeClass('active')
			var jact = $(this).addClass('active')
			Player.selectAction( jact )
		}
		$('#panel_wrap .attack_button').live('click',actionButtonClick)
	},
	bindTilesFill: function(){
		function isSkillActiveIn(ev){
			//console.log(this.parentNode.id)
			$(this).addClass('active')
		}
		function isSkillActiveOut(ev){
			//console.log(this.parentNode.id)
			$(this).removeClass('active')
		}
		$('#map .tile div').hover(isSkillActiveIn, isSkillActiveOut)
		
		
		function attemptMove(){
			var jelem = $(this)
			if( jelem.hasClass('allowed') ){
				var x = this.parentNode.id.split('_')[0]
				var y = this.parentNode.id.split('_')[1]
				Player.doActionAt( x, y )
			} else {
				jelem.removeClass('active').addClass('deny')
				setTimeout(function(){
					jelem.removeClass('deny')
				},350)
			}
		}
		$('#map .tile div').click(attemptMove)
	},
}


$(function(){
	// FIXME uncomment
	UI.fillTiles()
	UI.storeGuiTemplate()
	UI.showWaitPanel()
	UI.bindActionButtons()
	UI.bindTilesFill()
})



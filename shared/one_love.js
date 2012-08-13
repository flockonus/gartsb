(function(){
var G = {}
if(!console.group)    console.group = console.log
if(!console.groupEnd) console.groupEnd = console.log

MAP = {
	OFB: null,
	EMPTY: 0,
	//HERO: 1,
}
G.MAP = MAP

function Map1(){
	this.w = 5 //x
	this.h = 4 //y
	this.tiles = {}
	this.init()
}


Map1.prototype.init = function(){
	for (var x=0; x < this.w; x++) {
		for (var y=0; y < this.h; y++) {
			this.tiles[x+'_'+y] = MAP.EMPTY
		};
	};
}

Map1.prototype.get = function(x,y){
	if( x >= this.w ) return MAP.OFB
	if( y >= this.h ) return MAP.OFB
	return this.tiles[x+'_'+y]
}

Map1.prototype.set = function(x,y,obj){
	if( x >= this.w ) return false
	if( y >= this.h ) return false
	this.tiles[x+'_'+y] = obj
	return true
}

Map1.prototype.each = function(cb){
	for (var x=0; x < this.w; x++) {
		for (var y=0; y < this.h; y++) {
			cb(x,y,this.tiles[x+'_'+y])
		};
	};
}

Map1.prototype.inspect = function(){
	console.group("Map1")
	for(var key in this.tiles){
		console.log(key,this.tiles[key])
	}
	console.groupEnd()
}
G.Map1 = Map1

// not happy about this function, since it would be better to index each hero to the map via some hero.id
/* not used anymore
Map1.prototype.heroWithPosition = function(hero){
	for(var k in this.tiles){
		if( this.tiles[k] == hero ){
			var xy = k.split('_')
			return{
				x:xy[0],
				y:xy[1],
				hero: hero,
			}
		}
	}
}
G.Map1 = Map1
*/


function HP(max){
	this.max = max
	this.current = max
}

HP.prototype.rate = function(){
  return this.current/this.max
}
G.HP = HP

function Animation(classe, aName, aDuration, aIC, aTF){
	this.classe = classe || ""
	this['animation-name'] = aName || 'jumpy'
	this['animation-duration'] = aDuration || "1s"
	this['animation-iteration-count'] = aIC || 'infinite'
	this['animation-timing-function'] = aTF || 'ease-in-out'
}
G.Animation = Animation

function CastRange(shape, width, height){
	// the same, right?
	if( shape == 'circle' ) shape = 'square'
	this.shape = shape
	this.w = width || 1 // 1 would be self
	this.h = height || 1
}
G.CastRange = CastRange


/**
 * should only come as array of 'self', 'ally', 'enemy', 'empty'
 */
function Target(list){
	if( typeof list != 'object' || list.length < 1 ) throw( new Error('no param') )
	this.all = {}
	for (var i=0; i < list.length; i++) {
	  this.all[ list[i] ] = true
	};
}

Target.prototype.include = function(type){
	return !!this.all[type]
}
G.Target = Target

function Selection(cRange,target){
	this.range = cRange
	this.target = target
}
G.Selection = Selection

function Damage(base, interval, critRatio){
	this.base = base
	this.interval = interval
	this.critRatio = critRatio || 0
}

Damage.prototype.roll = function(){
	var output = this.base+((1+Math.random())*this.interval)
	var critTrigged = false
	if( Math.random() < this.critRatio ){
		output += this.base*0.6
		critTrigged = true
	}
	return {
		raw: Math.floor(output),
		critical: critTrigged,
	}
}

Damage.prototype.inspect = function(){
	var o = this.roll()
	console.log("Damage",this.base, this.interval, this.critRatio, o.raw, o.critical)
}
G.Damage = Damage


/**
 * description_list: takes either 1 array of string, or 1 array of arrays
 */
function Output( description_list ){
	if( typeof description_list != 'object' || description_list.length < 1 ) throw( new Error('no param') )
	if( typeof description_list[0] == 'string') description_list = [description_list]
	this.outcome = description_list
}
G.Output = Output

function Action(id, title, cost, description, selection, output){//animation
	this.id = id
	this.title = title
	this.cost = cost
	this.description = description
	this.selection = selection
	this.output = output
}


/**
 * fromPos: denote who casted, {x,y}
 * 
 * return: an array of blocks that are valid to be clicked
 */
Action.prototype.validBlocks = function( map, team_id, hero ){
	var blocks = []
	var posX, posY, what
	var rangeW = this.selection.range.w
	
	switch(this.selection.range.shape){
	case 'square':
		for (var x=(-1*rangeW); x <= rangeW; x++) {
			for (var y=(-1*rangeW); y <= rangeW; y++) {
				posX = hero.x+x
				posY = hero.y+y
				what = map.get(posX,posY)
				//console.log('eval', posX, posY)
				if( what == MAP.OFB ){
					// next!
				}else if( what == MAP.EMPTY && this.selection.target.include('empty') ){
					// FIXME something wrong with this swap!
					blocks.push({
						x:posY,
						y:posX,
					})
				}
				else if( typeof what == 'object' && // a hero
								this.selection.target.include('enemy') &&
								what.team_id != team_id ){
					blocks.push({
						x:posX,
						y:posY,
					})
				}
			//forend
			};
		};
		break;
	}
	return blocks
}
G.Action = Action



ActionManager = {
	list:{},
	register: function(action){
		this.list[action.id] = action
	},
	get: function(id){
		if( !!this.list[id] ) return this.list[id]
		throw new Error("no action by id: "+id)
	}
}
G.ActionManager = ActionManager

ActionManager.register(new Action(
	'move',
	"Move",
	2,
	"move to an adjacent tile",
	new Selection(
		new CastRange('square', 1),
		new Target(['empty'])
	),
	new Output([
		['move', 'endPos']
	])
))

ActionManager.register(new Action(
	'atk-sushi',
	"Atack",
	3,
	"Slice with sharp knife!",
	new Selection(
		new CastRange('square', 1), // the block itself
		new Target(['enemy'])
	),
	new Output([
		['damage', 'circle', 0, 'toPos', new Damage(5,2,0.15)]
	])
))

/*
ActionManager.register(new Action(
	'atk-pik',
	"ThunderJolt",
	"Damages every foe around",
	new Selection(
		CastRange('circle', 1), // the block itself
		Target(['enemy'])
	),
	new Output([
		['damage', 'circle', 1, 'toPos', new Damage(5,2,0.15)]
	])
))*/


/**
 * mere prototype for 'inheritance'
 */
function Hero(){
	
}

/**
 * thrown if anything is badly configured
 */
Hero.prototype.validate = function(){
	// validate this.id on Regex
	// validate this.animations against AnimationManager (if $CLIENT)
	// validate this.actions	against ActionManager
}

Hero.prototype.inspect = function(){
	console.log(this.type, 'hp: '+this.hp.current+'/'+this.hp.max)
}

Hero.prototype.setPos = function(x,y){
	this.x = x
	this.y = y
}


function SushiHero(team_id){
	this.team_id = team_id
	// simple, short, continous string
	this.type = "sushi"
	this.name = "Mad Sushi Man"
	this.x = null
	this.y = null
	this.description = "After his wife and son got killed by sharks he sees fish in the face of anyone! So technically he is not trying to kill you, just doing his job."
	this.hp = new HP(100)
	//later this.def = 0.3
	this.animations = ['sushi-alive', 'sushi-dead']
	this.actions = ['move', 'atk-sushi']//, 'madchop']
	this.validate()
}
G.SushiHero = SushiHero

// can be improved
SushiHero.prototype.validate = Hero.prototype.validate
SushiHero.prototype.inspect = Hero.prototype.inspect
SushiHero.prototype.setPos = Hero.prototype.setPos

MAX_AP = 6
G.MAX_AP = MAX_AP
/**
 * player_id = socket.id
 * side: 0 / 1  => left / right
 */
function Team(id, playerId, side){
	this.id = id
	this.playerId = playerId
	this.side = side
	this.ap = side
	// at this point have both sides come with same heroes
	this.heroes = [
		new SushiHero(this.id),
		//new SushiHero(this.id),
	]
}

Team.prototype.inspect = function(){
	console.group('Team '+this.id+' ('+this.playerId+')')
	for (var i=0; i < this.heroes.length; i++) {
		this.heroes[i].inspect()
	};
	console.groupEnd()
}
G.Team = Team

TURN_BASE = 20
G.TURN_BASE = TURN_BASE
/**
 * 2 players, turn based, game mananger
 * 
 */
function GameManager(roomId, p1Id, p2Id){
	// to start all we need are both players connected
	this.status = 'initialized' // initialized, running, ended
	this.teams = {}
	this.map = null
	this.turn = 0
	this.whoseTurn = 'left'
	//this.turnTimeLeft = TURN_BASE
	this.map = new Map1()
	this.teams['left'] = new Team('left', p1Id, 0 )
	this.teams['right'] = new Team('right', p2Id, 0 )
	this._setHeroesToMap()
	this.roomId = roomId
}

GameManager.prototype._setHeroesToMap = function(){
	if( !this.map ) throw new Error('no map!')
	var map = this.map
	this.teams['left' ].heroes[0].setPos(0,1)
	map.set( 0,	  1,    this.teams['left' ].heroes[0])
	//map.set( 0,	  2,    this.teams['left' ].heroes[1])
	this.teams['right'].heroes[0].setPos(map.w-1,2)
	map.set( map.w-1,2, this.teams['right'].heroes[0])
	//map.set( map.w-1,1, this.teams['right'].heroes[1])
}

GameManager.prototype.start = function(turnCb, playActionCb){
	this.status = 'running'
	turnCb(this.whoseTurn, this.turn)
	//this.turnTimeLeft = TURN_BASE
	this.turnCb = turnCb
	this.playActionCb = playActionCb
}

GameManager.prototype.nextTurn = function(){
	this.whoseTurn = (this.whoseTurn == 'left' ? 'right' : 'left')
	this.turn += 1
	this.turnCb(this.whoseTurn, this.turn)
}


GameManager.prototype.inspect = function(){
	console.log('gameman', this.status)
	if( this.map ){
		this.map.inspect()
		this.teams['left' ].inspect()
		this.teams['right' ].inspect()
	}
}

// invoke this callback every n secconds
//GameManager.prototype.registerCallbacks = function(turnCb, actionCb){
//	this.turnCb = cb
//}

G.GameManager = GameManager

if (typeof module != 'undefined' ) {
	module.exports = G
};

if (typeof window != 'undefined' ) {
	window.G = G
};

})()
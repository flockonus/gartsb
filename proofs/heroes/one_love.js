MAP = {
    OFB: null,
    EMPTY: 0,
    //HERO: 1,
}

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

Map1.prototype.inspect = function(){
    console.group("Map1")
    for(var key in this.tiles){
        console.log(key,this.tiles[key])
    }
    console.groupEnd()
}



function HP(max){
	this.max = max
	this.current = max
}

HP.prototype.rate = function(){
  return this.current/this.max
}

function Animation(classe, aName, aDuration, aIC, aTF){
	this.classe = classe || ""
	this['animation-name'] = aName || 'jumpy'
	this['animation-duration'] = aDuration || "1s"
	this['animation-iteration-count'] = aIC || 'infinite'
	this['animation-timing-function'] = aTF || 'ease-in-out'
}

function CastRange(shape, width, height){
	// the same, right?
	if( shape == 'circle' ) shape = 'square'
	this.shape = shape
	this.w = width || 1 // 1 would be self
	this.h = height || 1
}



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

function Selection(cRange,target){
    this.range = cRange
    this.target = target
}

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

function AreaOfEffect(shape, width, height){
    
}
/**
 * description_list: takes either 1 array of string, or 1 array of arrays
 */
function Output( description_list ){
    if( typeof description_list != 'object' || description_list.length < 1 ) throw( new Error('no param') )
    if( typeof description_list[0] == 'string') description_list = [description_list]
    this.outcome = description_list
}

function Action(id, title, cost, description, selection, output){//animation
    this.id = id
    this.title = title
    this.cost = cost
    this.description = description
    this.selection = selection
    this.output = output
}

/**
 * fromPos: denote who casted, always
 * toPos: where it was targeted
 */
Action.prototype.isValid = function( map, player, fromPos, toPos ){
    // find the move
    // check the cast-range
}

/**
 * fromPos: denote who casted, {x,y}
 * 
 * return: an array of blocks that are valid to be clicked
 */
Action.prototype.validBlocks = function( map, team_id, fromPos ){
	var blocks = []
	var posX, posY, what
	var rangeW = this.selection.range.w
	
	switch(this.selection.range.shape){
	case 'square':
		for (var x=(-1*rangeW); x <= rangeW; x++) {
			for (var y=(-1*rangeW); y <= rangeW; y++) {
				posX = fromPos.x+x
				posY = fromPos.y+y
				what = map.get(posX,posY)
				console.log('eval', posX, posY)
				if( what == MAP.OFB ){
					// next!
				}else if( what == MAP.EMPTY && this.selection.target.include('empty') ){
					console.log(' >push')
					blocks.push({
						x:posX,
						y:posY,
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
	// validate this.actions    against ActionManager
}

Hero.prototype.inspect = function(){
	console.log(this.type, 'hp: '+this.hp.current+'/'+this.hp.max)
}

function SushiHero(team_id){
	this.team_id = team_id
	// simple, short, continous string
	this.type = "sushi"
	this.name = "Mad Sushi Man"
	this.description = "After his wife and son got killed by sharks he sees fish in the face of anyone! So technically he is not trying to kill you, just doing his job."
	this.hp = new HP(100)
	//later this.def = 0.3
	this.animations = ['sushi-alive', 'sushi-dead']
	this.actions = ['move', 'atk-sushi']//, 'madchop']
	this.validate()
}

// can be improved
SushiHero.prototype.validate = Hero.prototype.validate
SushiHero.prototype.inspect = Hero.prototype.inspect

/**
 * player_id = socket.id
 * side: 0 / 1  => left / right
 */
function Team(id, playerId, side){
	this.id = id
	this.playerId = playerId
	this.side = side
	// at this point have both sides come with same heroes
	this.heroes = [
		new SushiHero(this.id),
		new SushiHero(this.id),
	]
}

Team.prototype.inspect = function(){
	console.group('Team '+this.id+' ('+this.playerId+')')
	for (var i=0; i < this.heroes.length; i++) {
		this.heroes[i].inspect()
	};
	console.groupEnd()
}

/**
 * 2 players, turn based, game mananger
 * 
 */
var GameManager = {
	// to start all we need are both players connected
	status: 'waiting', // waiting, running, ended
	teams: {},
	map: null,
	turn: 0,
	start: function(p1Id,p2Id){
		this.status = 'running'
		this.map = new Map1()
		this.teams['left'] = new Team('left', p1Id, 0 )
		this.teams['right'] = new Team('right', p2Id, 0 )
		this._setHeroesToMap()
	},
	_setHeroesToMap: function(){
		if( !this.map ) throw new Error('no map!')
		var map = this.map
		map.set( 0,      1, this.teams['left' ].heroes[0])
		map.set( 0,      2, this.teams['left' ].heroes[1])
		map.set( map.w-1,1, this.teams['right'].heroes[0])
		map.set( map.w-1,2, this.teams['right'].heroes[1])
	},
	inspect: function(){
		console.log('gameman', this.status)
		if( this.status == 'running' ){
			this.map.inspect()
			this.teams['left' ].inspect()
			this.teams['right' ].inspect()
		}
	}
}
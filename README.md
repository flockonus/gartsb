# GARTSB - HTML5 game architecture 

A mmo architecture for turn based games such as board, cards, strategy, social, trivia, puzzle and more!  
Allows for multiple players to play in a room.

## Demonstration
Open 2 windows from this link: [DEMO](http://fabianops-gartsb.jit.su/)  
Each window represent a player. When both windows are open, they are automatically connected!  
*as it has less than 40 hours of development this demo does not reflect the full state of the proposed architecture, it lives as a conceptual proof and is work in progress*

## Key Features and Choices

 * Support a huge number of small game rooms
 * Scalable both vertically and horizontally
 * Fault tollerant as game servers may respawn
 * Support turn-based game system
 * Node.js for low memory footprint and game logic code shared between client and server
 * Use Socket.io for leverage clients while keeping communications fast
 * Use Redis for pub/sub and game data storage

![overview schema](https://raw.github.com/flockonus/gartsb/master/docs/overview_schema.png)

This proposed architecture target the making of a turn based game, played by 2 or more players in closed room.  
Redis was chosen due it's low latency, concurrency level, great concurrency support, ability to expire key, large range of data structure and and ability for pub/sub channels.  
A reverse proxy (Nginx/HAproxy) that can handle websockets and long connections can be used for horizontal scalability. While each of the Servers get it's capacity fully used by spawning one server instance per cpu via the native cluster module.  
Socket.io is used to reliably connect a wide variety of clients in a consistent way while leveraging the fastest transport technologies  


![comm flow](https://raw.github.com/flockonus/gartsb/master/docs/comm_flow.png)

Node.js processes don't share state but there should be a way for each instance reply to client requests  
In the proposed architecture, all the data is stored in a Redis (in-memory data)  

Some perspective on main events follows  

#### sends UID
Each user must bear a key that survives page reload, disconnection, browser close. This may be replaced by authentication.
 * once the server recognize the user key it gets put to a match queue, (which may be specialized or common)
 * gets replied with **tells on queue** or directly with **match!**

#### match!
Let the client know that it has been assigned to a room and to which team it belongs.
 * the interface switch to a game mode
 * map, scenario, GUI gets initialized

#### turn 
The server is responsible to keep track and inform clients whose turn is it
 * the client must make adjustments to GUI and map to reflect turn state, it may be of Player's or opponents.

#### action do
During his turn the user may send actions, they get validated first at client and then at server.
 * room state gets restored
 * action gets processed
 * room state is persisted again
 * outcome gets transmitted (**action play**)

#### action Play
Clients get the information required to make the game state coherent between all peers.
 * actions outcome gets displayed

#### chat send
Assuming that users may send chat messages at any point and they get replicated within the room
 * no need to restore room state, message gets broadcast **chat broadcast**

#### chat broadcast
The chat message get displayed to all players

#### game end
The game may end at clients extended disconnection or the natural course, somebody win
 * the game result gets displayed to all peers





-- 
Fabiano Pereira Soriani
http://flockonus.github.com
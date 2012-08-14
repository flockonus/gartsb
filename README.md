GARTSB - Scalable HTML5 game  architecture 
============

Key Features and Characteristics
---

- Have game logic code shared between client and server
- Support a huge number of small game rooms
- Support turn-based game
- Use Socket.io for leverage clients while keeping fast
- Use Redis for pub/sub and game data storage

![overview schema](https://raw.github.com/flockonus/gartsb/master/docs/overview_schema.png)

This proposed architecture target the making of a turn based game, played by 2 or more players in closed room.  
Redis was choosen due it's low lattency, concurrency level, great concurrency support, ability to expire key, large range of data structure and and ability for pub/sub channels.  
A reverse proxy (Nginx/HAproxy) that can handle websockets and long connections is used to unify multiple servers, while each of these should spawn one server instance for each cpu, via the native cluster module.  
Socket.io is used to reliably connect a wide variety of clients in a consistent way while leveraging transport technologies  


![comm flow](https://raw.github.com/flockonus/gartsb/master/docs/comm_flow.png)

As known, Node.js processes don't share state, it allows then to keep fast, but there should be a way for each instance reply to client requests  
In the proposed architecture, all the data is stored in a Redis (in-memory data)  

For every action the user takes it is atutomatically transmitted to the server (action Do) 

the user takes is processed the room state is saved



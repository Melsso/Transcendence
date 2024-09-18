# Overview

Alright this is going to be quite confusing so let's just map this whole thing out right now, this is the structure that will be implemented in the upcoming days.

## Components

There will be four apps that will divide the work done by this backend api:

### Users

The users app will be in charge of the following takss/requests/whatever you want to call it.

- User registration/Login
- User profiles
- User lookup
- Password management
- Authentication // this is still quite unclear at the moment, the DRF token system for the session authetication might be moved elsewhere after

### Games

Same leading text as above...

- Starting a game
- Joining a game
- Finding game results
- Game settings

### Chats

Same leading text as above...

- Start/send/receive messages
- Join the world-chat
- Get chat history

### Game_Channels (WOOOOOOOOOOOOOOOOOOOOOOOOOOHOOOOOOOOO)

The Game Channels app will handle real-time features for the games, mainly the queuing system or match making system, as well as pvp using WebSockets.

- WebSocket Consumers: Manage the game state in real-time (player movements, score updates) and chat messaging during games???
- Routing: Define the WebSocket URL patterns for game channels and chat channels.

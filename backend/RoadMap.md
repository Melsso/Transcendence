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

#### More fun

- users app needs the following :
User profile update (e.g., allowing users to edit their bio or avatar).
Error responses are inconsistent in some places.
Consider adding password reset functionality.
Add unit tests for critical views (e.g., registration, login).

- chat app needs the following:
Message Deletion: Allow users to delete a message or conversation.
Unread Message Notifications: You can add functionality to notify users when they receive new, unread messages.
Pagination for long chat histories could be implemented.
Consider adding typing indicators and notifications for live chat.

- games app:
Rematch System: Allow users to challenge an opponent for a rematch directly from their history.
Leaderboard System: Implement a global leaderboard to show top-performing players.
Add pagination for match history if needed.

- homepage app:
Data Aggregation: The method for merging match history is good but ensure that it is optimized when you have large datasets (pagination for friends and match history could help).
Consider adding recent notifications, like friend requests, new messages, and upcoming matches.

- global notes:
Authentication and permission checks r good, but not every view enforces permissions.
Using different error responses (e.g., ValidationError, AuthenticationFailed) but should standardize the format.
Use a custom exception handler for consistent error messages across the app.
Standardize API responses (e.g., Response({'success': ..., 'data': ...})).
Make sure all serializers validate in a uniform way. For example, some views call serializer.is_valid() while others don’t handle all validation cases thoroughly.
Consider optimizing this by using Django's select_related or prefetch_related to minimize the number of queries.

##### What needs to be done next

User Profiles: Allow users to update their profile (bio, avatar).
Rematch Functionality: Add a feature allowing users to challenge previous opponents directly from match history.
Leaderboard System: Add a global leaderboard showing top players for different games.
Game Invitations: Allow users to invite friends to play Pong or other games directly from the chat or homepage.
Notification System: Implement a notification system to alert users of new messages, friend requests, or game challenges.
Forgotten password functionality
NOTIFICATIONS WILL ALSO USE WEBSOCKETS, it seems there is no running away from them
Implement functionality in the frontend to create chats, send messages, fetch message lists, mark messages as read, and list friends.

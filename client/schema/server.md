# Game work flow

1. User Connects To server 

game/handshake
```json
    {
        "room": "2389823",
        "id": null //If user doesnt have cookie set
    }
```
2. If user is a NEW user, allow them to enter a name
game/username
```json
    //TO SERVER
    {
        "username": "Example"
    }
    //FROM SERVER 
    {
        "id": "234324324"
    }
```

3. Now the first user who joins the link (so the one who created the room in theory) Will be the master. They can start the game

```js

this.rooms[].master = id

```

4. When the game starts, it runs within its process
    - Setup
    - Play
    - End

    1. Setup
        - This is where users can pick two slots on the board to pick. Its round robin when picking.
    2. Gameplay
        - Master will start as always [LZ]
        - They will then roll the dice
        - Then cards wil be given to players unless a robber is rolled (7)
            - If robber, half of the hand is selected, at random to be removed if they have over 7 cards. [LZ]
            - When the robber is place, it also picks at random who to steal a card, if they have any cards and that card is also random
        - After role, they can buy things
        - When done with turn, next player. This will repeat        
            - When turn is over, we need to update scores (users)
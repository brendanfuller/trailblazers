# Trailblazers
Web app recreation of Catan (WIP)
![Trailblazers](https://user-images.githubusercontent.com/13824197/65849316-d17e9e80-e317-11e9-9998-810fc8dc1f94.png)


## Gameplay
- Trailblazers is just like the wonderful catan but with a few key features missing.
  - First, there is no robber. 
  - The numbers are all random, so no list of board numbers
  - The bank is increase
  - No development cards (even though i do play on adding it later maybe?)
  
  - Everything else about the game is the same, buying roads, upgrading cities etc. 
    Victory Points are only up to 8, as it can take a while

## Client
- Built on React, Ant-Design and Duix
- Works on most browsers (not IE, and if its does, well how?)
- Builds with Parcel (1.0) 

## Server
- Node 10.x.x
- Uses Socket.io
- Needs client to be built and moved into /r/ (as a directory)
- Client files need to be updated in the main.js file (as the hashs from parcel are needed, unless remove but)

### Thing to Fix (if I ever have time)
- Probably should make the js files not have hashs when parcel builds so it can be built into the server?
- Add a gulp script to do this?4
- Better Documentation, probably wont happen as this was made in less than 3 weeks (not working on it full time)

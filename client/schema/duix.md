ONCLICK --> game/road/select --> SOCKET
SOCKET --> game/road/show --> RENDER
ONCLICK --> game/stations/select --> SOCKET
SOCKET --> game/stations/show --> RENDER

SOCKET --> game/trade/view --> RENDER
SOCKET --> game/trade/declines --> RENDER
ONCLICK --> game/trade/accept --> SOCKET

SOCKET --> game/shop/buy --> RENDER

SOCKET --> game/cards/development (dev) -> RENDER
SOCEKT --> game/cards/collection (items) -> RENDER

ONCLICK --> game/cards/development/use --> SERVER


ONCLICK --> game/roll/toss --> SOCKET
ONCLICK --> game/roll/update --> RENDER

SOCKET --> game/turn/start --> SOCKET
ONCLICK --> game/turn/end --> SOCKET

SOCKET -> game/users/ --> RENDER USER SIDEBAR
SOCKET -> game/timeline --> RENDER TIMELINE

USER -> game/user/forfeit -->  SOCKET [TRANSMISSION ENDED]
SOCKET -> game/user/disconnect --> RENDER
SOCKET -> game/user/reconnected --> SERVER


USER -> game/chat/post
USER -> game/chat/send

# Gameplay mechanics

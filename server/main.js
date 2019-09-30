
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var uuidv4 = require("uuid/v4")
var EventEmitter = require("events")
let port = process.env.PORT || 80



var glob = require("glob")

// options is optional
glob("dist/*", function (er, files) {
    let isFile = (file) => {
        for (let index in files) {
            if (files[index].split("dist/")[1] == file) {
                return true
            }
        }
        return false
    }
    server.listen(port);
    app.get('/', function (req, res) {

        res.sendFile(__dirname + '/index.html');
    });
    app.get('/r/:room', function (req, res) {
        if (isFile(req.params.room)) {

            res.sendFile(__dirname + "/dist/" + req.params.room);
        } else {

            res.send(`<html>
<head>
    <link rel="stylesheet" href="https://cdn.materialdesignicons.com/4.2.95/css/materialdesignicons.min.css">
    <link href="https://fonts.googleapis.com/css?family=Turret+Road&display=swap" rel="stylesheet">
    <title>Trailblazers</title>
    <link rel="stylesheet" href="src.8be3e13e.css">
</head>

<body>
    <div id="app">
        <div
            style="text-align:center;display:flex;justify-content:center;align-items:center;width:100vw;height:100vh;font-family:Turret Road,cursive;">
            <h1 style="font-size:70px">Trailblazers<br> <span style="font-size:30px">Loading...</span> </h1>
        </div>
    </div>
    <script>window.onload = function () { document.addEventListener("contextmenu", function (n) { n.preventDefault() }, !1) }, window.room = "${req.params.room}";</script>
    <script src="src.c4f95f9b.js" charset="utf-8"></script>
</body>`)
        }
    });
    console.log("[TB] Started server at port " + port)
})


let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

let isRoom = (id) => {
    for (let room in rooms) {
        if (rooms[room] == id) {
            return true
        }
    }
    return false
}
let isUserInRoom = (id, room) => {
    for (let user in users) {
        if (user == id && users[user].room == room) {
            return true
        }
    }
    return false
}



let rooms = {}
let users = {}


global.users = users;

class User {
    constructor(socket) {
        this.socket = socket
        this.room = null
        this.username = null
        this.session = null;
        this.EVENT_GAME_HANDSHAKE()
    }
    INIT() {
        this.EVENT_ROAD_SELECT()
        this.EVENT_STATION_SELECT()
        this.EVENT_CHAT_MESSAGE()
        this.EVENT_DICE_TOSS()
        this.EVENT_SHOP_BUY()
        this.EVENT_TURN_END()
        this.EMIT_TRADE_CREATE()
        this.EMIT_TRADE_CANCEL()
        this.EMIT_TRADE_SELECT()

    }
    DISCONNECT() {
        //
    }
    EVENT_ROAD_SELECT() {
        this.socket.on("game/road/select", (road) => {
            rooms[this.room]._SELECT_ROAD(this.session, road)
        })
    }
    EVENT_STATION_SELECT() {
        this.socket.on("game/station/select", (station) => {
            rooms[this.room]._SELECT_STATION(this.session, station)
        })
    }
    EVENT_CHAT_MESSAGE() {
        this.socket.on("game/chat/message", (message) => {
            io.to(this.room).emit("game/chat/update", {
                user: this.username,
                message: message
            });
        })
    }
    EVENT_DICE_TOSS() {
        this.socket.on("game/roll/toss", () => {
            rooms[this.room]._DICE_TOSS(this.session)
        })
    }
    EVENT_SHOP_BUY() {
        this.socket.on("game/shop/buy", (item) => {
            rooms[this.room]._SHOP_BUY(this.session, item)
        })
    }
    EVENT_TURN_END() {
        this.socket.on("game/turn/end", () => {
            rooms[this.room]._END_TURN(this.session)
        })
    }
    EMIT_TRADE_CREATE() {
        this.socket.on("game/trade/create", (offer) => {
            rooms[this.room]._TRADE_CREATE(this.session, offer)
        })
    }
    EMIT_TRADE_CANCEL() {
        this.socket.on("game/trade/cancel", () => {
            rooms[this.room]._TRADE_CANCEL(this.session)
        })
    }
    EMIT_TRADE_SELECT() {
        this.socket.on("game/trade/select", (accept) => {
            rooms[this.room]._TRADE_SELECT(this.session, accept)
        })
    }
    ////////////////////////////////////
    EVENT_GAME_HANDSHAKE() {
        this.socket.on("game/handshake", (handshake) => {
            //CREATE ROOM IF NOT CREATED
            if (rooms[handshake.room] == null) {
                rooms[handshake.room] = new Room(handshake.room) //Create a new room for that ID
            }
            //Give the user a session if they don't already have one
            if (handshake.room != null && handshake.session != null) {
                console.log("[TB] User has session")
                if (isUserInRoom(handshake.session, handshake.room)) { //Checks if the user is in the room
                    console.log("[TB] User has valid session and is in proper room")
                    this.room = handshake.room
                    this.session = handshake.session //Set session
                    this.username = users[handshake.session].name //Grab its name (which can't be changed [yet])
                    users[this.session].socket = this.socket
                } else {
                    //Remove the session on the client because its no longer valid
                    this.socket.emit("game/session/delete", true)
                }
            } else if (handshake.room != null && handshake.username != null) {
                console.log("[TB] User has username, so new user")
                this.room = handshake.room
                this.session = uuidv4() //Set session
                this.socket.emit("game/session", this.session)
                users[this.session] = {}
                users[this.session].name = handshake.username;
                users[this.session].socket = this.socket
                users[this.session].room = this.room
                users[this.session].color = "#" + (function lol(m, s, c) {
                    return s[m.floor(m.random() * s.length)] +
                        (c && lol(m, s, c - 1));
                })(Math, 'ABCDEF', 4);
                this.username = handshake.username
            }
            //If here user should be valid 
            if (this.room != null && this.session != null && this.username != null) {
                if (rooms[this.room].master == null) {
                    rooms[this.room].master = this.session
                    console.log(`[TB] ${this.username} is MASTER for room ${this.room}`)
                }
                if (rooms[this.room].master == this.session) {
                    //Update the TURN to start game.
                    this.socket.emit("game/turn/update", "END")
                }
                console.log(`[TB] Valid User - ${this.room} - ${this.session}`)
                this.socket.join(this.room)
                rooms[this.room].ADD_USER(this.session, this.username)
                this.INIT();
            } else {
                console.log("[TB] Invalid Session | Username | Room")
            }
        })
    }
}

class Room extends EventEmitter {
    constructor(id) {
        super();
        this.id = id
        this.started = false
        this.turn = null;
        this.master = null
        this.rolled = false;

        this.users = {}
        this.userList = []
        this.board = {}
        this.bank = {
            "LUMBER": 25,
            "GRAIN": 25,
            "STONE": 25,
            "SHEEP": 25,
            "BRICK": 25,
        }
        this.on("start", () => {
            this.START()
        })
        this.dice = []
        this.diceTotal = 0;
        this.state = null

        this.trade = false
        this.buy = false
        this.buyType = ""
    }
    print(message) {
        console.log(`[TB][${this.id}] ${message}`)
    }
    /**
     * ADD_USER - Adds the user to the room
     */
    ADD_USER(session) {
        if (this.started == false) {
            this.users[session] = {
                STATIONS: [],
                ROADS: [],
                HAND: {
                    "LUMBER": 0,
                    "GRAIN": 0,
                    "STONE": 0,
                    "SHEEP": 0,
                    "BRICK": 0,
                    "DEV": 0,
                },
            }
            this.userList.push(session)
        } else {
            io.to(users[session].socket.id).emit("game/grid", this.board)
            io.to(users[session].socket.id).emit("game/bank/update", this.bank);
        }
        this.UPDATE_USER_LIST()
    }
    /**
     * GENERATE_GRID - Generates the grid (hexagon) sizing for the board
     * @param {Integer} size 
     */
    GENERATE_GRID(size) {
        if (this.grid != null) return this.grid
        function reverse(array) {
            return array.map((item, idx) => array[array.length - 1 - idx])
        }
        //Offset from both sides
        let offset = size - 1
        //Total rows the board will contain
        let rows = (offset * 2) + 1
        //List contains the amount of rows
        let list = []
        for (let i = 0; i < (rows / 2) - 1; i++) {
            let amount = i + size
            list.push(amount)
        }
        //Grab the first half of the list, reverse it, append it to the end
        let reverseList = reverse(list)
        list.push(rows) //Also add the middle row (which is the length of all the wors)
        list = list.concat(reverseList)
        let grid = []
        for (let row in list) {
            let cols = []
            for (let col = 0; col < list[row]; col++) {
                cols.push(col)
            }
            grid.push(cols)
        }
        return grid
    }
    GENERATE_BOARD() {
        let plateObject = (id, type, value) => {
            return {
                "id": id,
                "plate": type,
                "value": value
            }
        }

        //List of all plate type
        let items = ["GRAIN", "LUMBER", "STONE", "BRICK", "SHEEP"]
        //List of used plates
        let used = {
            "DESERT": 0, "GRAIN": 0, "LUMBER": 0, "STONE": 0, "BRICK": 0, "SHEEP": 0
        }

        let PLATES = []
        let ROADS = {}
        let STATIONS = {}

        let total = 0;
        for (let row in this.grid) {
            total += this.grid[row].length
        }
        let desertSpot = getRandomInt(1, total);
        let n = 0
        for (let row in this.grid) {
            let plate = []
            for (let col in this.grid[row]) {
                //Loop state
                let loop = true
                n++
                //Here we randomize the plates, but we don't want many duplicates
                //So we keep in in a while loop and exited when needed
                while (loop) {
                    //Grab a random plate
                    var index = Math.floor(Math.random() * items.length)
                    let build = true //Can we build this plate?
                    for (let n in items) {
                        //Check if the plate randomly select is higher than other plartes
                        if (used[items[index]] > used[items[n]]) {
                            build = false
                        }
                    }

                    let generate = (row, col, item, amount = 1) => {
                        plate.push(plateObject(`${row},${col}`, item, getRandomInt(2, 12)))
                        used[item] = used[item] + amount
                        loop = false
                        ROADS[`${row},${col}`] = {
                            "top-right": {
                                "id": `${row},${col}-TR`,
                                "hidden": true,
                                "color": "blue"
                            },
                            "top-left": {
                                "id": `${row},${col}-TL`,
                                "hidden": true,
                                "color": "blue"
                            },
                            //ONLY LAST ONE
                            "right": {
                                "id": `${row},${col}-R`,
                                "hidden": true,
                                "color": "red",
                            },
                            /////////////////

                        }
                        STATIONS[`${row},${col}`] = {
                            "top-left": {
                                "id": `${row},${col}-TL`,
                                "hidden": true,
                                "color": "blue"
                            },
                            //ONLY LAST ONE
                            "top": {
                                "id": `${row},${col}-T`,
                                "hidden": true,
                                "color": "red",
                            },
                        }
                        if (col == 0) {
                            ROADS[`${row},${col}`]["left"] = {
                                "id": `${row},${col}-L`,
                                "hidden": true,
                                "color": "red"
                            }
                        }
                        if (row > ((this.grid.length / 2) - 1) && col == 0 || row == (this.grid.length - 1)) {
                            ROADS[`${row},${col}`]["bottom-left"] = {
                                "id": `${row},${col}-BL`,
                                "hidden": true,
                                "color": "red"
                            }
                            STATIONS[`${row},${col}`]["bottom-left"] = {
                                "id": `${row},${col}-BL`,
                                "hidden": true,
                                "color": "blue"
                            }
                        }
                        if (col == (this.grid[row].length - 1)) {
                            STATIONS[`${row},${col}`]["top-right"] = {
                                "id": `${row},${col}-TR`,
                                "hidden": true,
                                "color": "blue"
                            }
                        }
                        if (row == (this.grid.length - 1)) {
                            STATIONS[`${row},${col}`]["bottom"] = {
                                "id": `${row},${col}-B`,
                                "hidden": true,
                                "color": "blue"
                            }
                        }
                        if (row == (this.grid.length - 1) || row > ((this.grid.length / 2) - 1) && col == (this.grid[row].length - 1)) {
                            ROADS[`${row},${col}`]["bottom-right"] = {
                                "id": `${row},${col}-BR`,
                                "hidden": true,
                                "color": "red"
                            }
                        }
                        if (row > ((this.grid.length / 2) - 1) && col == (this.grid[row].length - 1)) {
                            STATIONS[`${row},${col}`]["bottom-right"] = {
                                "id": `${row},${col}-BR`,
                                "hidden": true,
                                "color": "blue"
                            }
                        }
                    }
                    if (desertSpot == n) {
                        generate(row, col, "DESERT", 1000000)
                    } else {
                        if (build) {
                            generate(row, col, items[index])
                        }
                    }
                }
            }
            //At the end of each row add them to the entire plate board
            PLATES.push(plate)
        }

        let board = {
            PLATES,
            ROADS,
            STATIONS
        }
        this.board = board
    }
    ////////////////////////////
    UPDATE_USER_LIST() {
        let list = []
        this.print("Updating User List")
        for (let user in this.users) {
            let cards = 0
            for (let c in this.users[user].HAND) {
                cards += this.users[user].HAND[c]
            }
            let points = 0;
            for (let station in this.users[user].STATIONS) {
                if (this.users[user].STATIONS[station].type == "CITY") {
                    points += 2
                } else {
                    points += 1
                }
            }


            let object = users[user]
            list.push({
                session: user,
                username: object.name,
                color: object.color,
                card: cards,
                devCard: 0,
                army: 0,
                road: 0,
                point: points
            })
        }
        io.to(this.id).emit("game/users/list", list);
    }
    UPDATE_BOARD() {
        io.to(this.id).emit("game/grid", this.board)
    }
    UPDATE_BANK() {
        io.to(this.id).emit("game/bank/update", this.bank);
    }
    UPDATE_COLLECTION(session) {
        io.to(users[session].socket.id).emit("game/cards/collection", this.users[session].HAND)
    }
    UPDATE_ALL_COLLECTION() {
        for (let user in this.users) {
            this.UPDATE_COLLECTION(user)
        }
    }
    UPDATE_DICE_ROLL() {
        io.to(this.id).emit("game/roll/update", this.dice);
    }
    UPDATE_USER_NOTIFICATION(type, message) {
        io.to(users[this.turn].socket.id).emit("game/notification", { type, message });
    }
    UPDATE_NOTIFICATION(type, message) {
        io.to(this.id).emit("game/notification", { type, message });
    }
    UPDATE_USER_TURN(session, type) {
        io.to(users[session].socket.id).emit("game/turn/update", type)
    }
    UPDATE_TRADE_USERS(users) {
        io.to(this.id).emit("game/trade/users", users)
    }
    UPDATE_TRADE_CLOSE() {
        io.to(this.id).emit("game/trade/close")
    }
    UPDATE_TRADE_OPEN() {
        io.to(this.id).emit("game/trade/open")
    }
    UPDATE_TRADE_UPDATE(offer) {
        io.to(this.id).emit("game/trade/offer", offer)
    }
    UPDATE_TURN_TIME(minutes, seconds) {
        io.to(this.id).emit("game/turn/time", { minutes, seconds })
    }
    //////////////////////////////
    _SELECT_ROAD(session, road) {
        if (this.started == true && this.turn == session) {
            this.emit("game/road/select", session, road)
        }
    }
    _SELECT_STATION(session, station) {
        if (this.started == true && this.turn == session) {
            this.emit("game/station/select", session, station)
        }
    }
    _DICE_TOSS(session) {
        if (this.started == true) {
            this.emit("game/roll/toss", session)
        }
    }
    /**
     * EVENT: Shop Buy - When a user buys a an item from the shop
     * @param {Objecgt} session 
     * @param {String} item 
     */
    _SHOP_BUY(session, item) {
        //Check if the game has started
        //Check if the clients turn is valid
        //Make sure the game is passed rolled state
        if (this.started == true && this.turn == session && this.rolled == true) {
            this.emit("game/shop/buy", session, item)
        }
    }
    /**
     * EVENT: End turn - When a user end turn (or starts game)
     */
    _END_TURN(session) {
        if (this.turn == session && this.started == true) {
            this.emit("game/turn/end", session)
        } else if (this.master == session && this.started == false) {
            this.emit("start")
        }
        console.log(this.id)
        console.log(this.users)
    }
    /**
     * EVENT: Trade Cancel - When the TRADE MASTER cancels a trade
     * @param {*} session 
     */
    _TRADE_CANCEL(session) {
        if (this.turn == session) {
            this.print("CANCELING TRADE")
            if (this.trade == true) {
                this.emit("game/trade/cancel")
            } else {
                this.UPDATE_TRADE_CLOSE()
            }

        }
    }
    /**
     * EVENT: Trade Select - The other TRADERS (who accept) can select (yes/no) [true/false]
     * @param {} session 
     * @param {*} accepted 
     */
    _TRADE_SELECT(session, accepted) {
        if (this.started == true) {
            this.emit("game/trade/select", session, accepted)
        }
    }
    //TRADE EVENT
    TRADE() {
        this.on("TRADE", async (session, offer) => {
            console.log("TRADE COMMENCING")
            this.trade = true

            let getTradersOffer = async () => {
                console.log("TRADE OFFER GET WORKING")
                let userCopy = [...this.userList]


                let _users = {}
                for (let user in userCopy) {
                    if (userCopy[user] != session) {
                        _users[userCopy[user]] = {
                            accepted: null,
                            name: users[userCopy[user]].name
                        }
                    }

                }
                let items = ["GRAIN", "LUMBER", "STONE", "BRICK", "SHEEP"]
                for (let item in items) {
                    if (items[item] in offer.give) {
                    } else {
                        offer.give[items[item]] = 0
                    }
                    if (items[item] in offer.want) {
                    } else {
                        offer.want[items[item]] = 0
                    }
                }

                this.UPDATE_TRADE_USERS(_users)
                this.UPDATE_TRADE_UPDATE(offer)


                let hasCards = (user, offer) => {
                    for (let item in offer) {
                        if (offer[item] != undefined) {
                            if (this.users[user].HAND[item] == NaN) return false
                            if (this.users[user].HAND[item] < offer[item]) return false
                        }
                    }
                    return true
                }
                let removeWant = (user) => {
                    for (let i in items) {
                        let item = items[i]
                        this.users[user].HAND[item] = this.users[user].HAND[item] - offer.want[item]
                    }
                }
                let addGive = (user) => {
                    for (let i in items) {
                        let item = items[i]
                        this.users[user].HAND[item] = this.users[user].HAND[item] + offer.give[item]
                    }

                }

                let removeGive = () => {
                    for (let i in items) {
                        let item = items[i]
                        this.users[session].HAND[item] = this.users[session].HAND[item] - offer.give[item]
                    }
                }
                let addWant = () => {
                    for (let i in items) {
                        let item = items[i]
                        this.users[session].HAND[item] = this.users[session].HAND[item] + offer.want[item]
                    }
                }
                if (offer.bank == true) {
                    this.print("BANK TRADE")
                    if (hasCards(session, offer)) {
                        let give = null;
                        let want = null
                        for (let item in offer.give) {
                            if (offer.give[item] == 4) {
                                give = item;
                                break;
                            }
                        }
                        for (let item in offer.want) {
                            if (offer.want[item] == 1) {
                                want = item
                                break;
                            }
                        }
                        if (give != null && want != null) {
                            this.print("WANT: " + want)
                            this.print("GIVE: " + give)
                            this.users[session].HAND[give] = this.users[session].HAND[give] - 4
                            this.users[session].HAND[want] = this.users[session].HAND[want] + 1;
                            this.bank[give] = this.bank[give] + 4
                            this.bank[want] = this.bank[want] - 1
                            this.UPDATE_ALL_COLLECTION()
                            this.UPDATE_USER_LIST()
                            this.UPDATE_TRADE_CLOSE()
                            this.UPDATE_BANK();
                            this.trade = false
                        } else {
                            this.trade = false
                            this.UPDATE_TRADE_CLOSE()
                            this.UPDATE_USER_NOTIFICATION("MESSAGE", "Invalid Trade")
                        }
                    } else {
                        this.trade = false
                        this.UPDATE_TRADE_CLOSE()
                        this.UPDATE_USER_NOTIFICATION("MESSAGE", "Invalid Trade")
                    }
                } else {

                    this.UPDATE_TRADE_OPEN()
                    let y = () => {
                        this.removeListener("game/trade/select", z)
                        end()
                    }
                    this.on("game/trade/cancel", y)
                    let z = (s, accepted) => {
                        //check if user already accept/declined
                        //Check if has in hand
                        if (_users[s].accepted == null) {
                            userCopy.pop()
                            if (accepted == true) {
                                if (hasCards(s)) {
                                    this.removeListener("game/trade/select", z)
                                    removeWant(s)
                                    addGive(s)
                                    removeGive()
                                    addWant()
                                    this.UPDATE_ALL_COLLECTION()
                                    this.UPDATE_USER_LIST()
                                    end()
                                } else {
                                    _users[s].accepted = false
                                }
                            } else {
                                _users[s].accepted = false
                            }
                        }
                        this.UPDATE_TRADE_USERS(_users)
                        if (userCopy.length == 1) {
                            this.removeListener("game/trade/select", z)
                            end()
                        }
                    }
                    let end = () => {

                        this.trade = false
                        this.UPDATE_TRADE_CLOSE()
                        this.removeListener("game/trade/cancel", y)
                    }
                    if (userCopy.length == 1) {
                        this.removeListener("game/trade/select", z)
                        end()
                    }
                    this.on("game/trade/select", z)
                }
            }
            getTradersOffer()
        })
    }
    //BUY EVENT
    BUY() {
        //Do user have cards?
        let hasCards = (user, offer) => {
            for (let item in offer) {
                if (offer[item] != undefined) {
                    if (this.users[user].HAND[item] == NaN) return false
                    if (this.users[user].HAND[item] < offer[item]) return false
                }
            }
            return true
        }
        //RemoveCards from users hand
        let removeCards = (user, cards) => {
            for (let i in cards) {
                this.users[user].HAND[i] = this.users[user].HAND[i] - cards[i]
            }
            for (let i in cards) {
                this.bank[i] = this.bank[i] + cards[i]
            }
        }
        //EVENT FOR SHOP BUY
        this.on("game/shop/buy", async (session, item) => {
            if (item == "ROAD" && this.buy == false) {
                if (hasCards(session, {
                    "LUMBER": 1,
                    "BRICK": 1,
                })) {
                    this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} is buying a ROAD`)
                    let places = []
                    for (let road in this.users[session].ROADS) {
                        let roads = this.getAllRoadsNearRoad(this.users[session].ROADS[road])
                        places = places.concat(roads)
                    }
                    for (let station in this.users[session].STATIONS) {
                        let stations = this.getNearByRoadsFromStation(this.users[session].STATIONS[station])
                        places = places.concat(stations)
                    }
                    this.buy = true
                    this.buyType = "ROAD"
                    return new Promise((resolve) => {
                        this.EMIT_SHOW_ROADS(places)
                        let x = () => {
                            this.removeListener("end_turn", x)
                            this.removeListener("game/station/select", z)
                            this.buy = false
                            resolve(true)
                        }
                        let z = (session, road) => {
                            if (this.turn == session) {
                                this.OWN_ROAD(session, road)
                                this.users[session].ROADS.push(road)
                                this.EMIT_SHOW_ROADS([])
                                removeCards(session, {
                                    "LUMBER": 1,
                                    "BRICK": 1,
                                })
                                this.UPDATE_ALL_COLLECTION();
                                this.UPDATE_USER_LIST();
                                this.UPDATE_BANK();
                                this.removeListener("game/road/select", z)
                                this.buy = false
                                this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} has placed a ROAD`)
                                resolve(true)
                            }
                        }
                        this.on("game/road/select", z)
                        this.on("end_turn", x)
                    })
                } else {
                    this.UPDATE_USER_NOTIFICATION("MESSAGE", "Can't buy ROAD!")
                }
            } else if (item == "VILLAGE" && this.buy == false) {
                if (hasCards(session, {
                    "SHEEP": 1,
                    "LUMBER": 1,
                    "GRAIN": 1,
                    "BRICK": 1
                })) {
                    this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} is building a VILLAGE`)
                    let places = []
                    for (let road in this.users[session].ROADS) {
                        let roads = this.getStationsAtRoad(this.users[session].ROADS[road])
                        places = places.concat(roads)
                    }
                    this.buy = true
                    this.buyType = "VILLAGE"
                    return new Promise((resolve) => {
                        this.EMIT_SHOW_STATIONS(places)
                        let x = () => {
                            this.removeListener("end_turn", x)
                            this.removeListener("game/station/select", z)
                            this.buy = false
                            resolve(true)
                        }

                        let z = (session, station) => {
                            if (this.turn == session) {
                                this.OWN_STATION(session, station)
                                this.users[session].STATIONS.push(station)
                                this.EMIT_SHOW_STATIONS([])
                                removeCards(session, {
                                    "SHEEP": 1,
                                    "LUMBER": 1,
                                    "GRAIN": 1,
                                    "BRICK": 1
                                })
                                this.UPDATE_ALL_COLLECTION();
                                this.UPDATE_USER_LIST();
                                this.UPDATE_BANK();
                                this.removeListener("game/station/select", z)
                                this.buy = false
                                this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} has built a VILLAGE`)
                                resolve(true)
                            }
                        }
                        this.on("game/station/select", z)
                        this.on("end_turn", x)
                    })
                } else {
                    this.UPDATE_USER_NOTIFICATION("MESSAGE", "Can't buy VILLAGE")
                }
            } else if (item == "CITY" && this.buy == false) {
                if (hasCards(session, {
                    "STONE": 3,
                    "GRAIN": 2,
                })) {
                    this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} is upgraded a VILLAGE`)
                    this.UPDATE_USER_NOTIFICATION("MESSAGE", `CLICK A VILLAGE TO UPGRADE TO A CITY`)
                    this.buy = true
                    this.buyType = "CITY"
                    let x = () => {
                        this.removeListener("end_turn", x)
                        this.removeListener("game/station/select", z)
                        this.buy = false
                    }
                    let z = (session, station) => {
                        if (this.turn == session) {
                            this.print("Buying City")
                            let pass = false;
                            for (let index in this.users[session].STATIONS) {
                                if (this.users[session].STATIONS[index] == station) {
                                    pass = true;
                                    break
                                }
                            }
                            if (pass == true) {
                                this.print("Buying City Passed")
                                this.OWN_STATION(session, station, "CITY")
                                this.EMIT_SHOW_STATIONS([])
                                removeCards(session, {
                                    "STONE": 3,
                                    "GRAIN": 2,
                                })
                                this.UPDATE_ALL_COLLECTION();
                                this.UPDATE_USER_LIST();
                                this.UPDATE_BANK();
                                this.removeListener("game/station/select", z)
                                this.buy = false
                                this.UPDATE_NOTIFICATION("SHOP", `${users[session].name} has built a VILLAGE`)
                            } else {
                                this.print("Failed to Buy City")
                            }
                        } else {
                            this.print("City What nos")
                        }
                    }
                    this.on("game/station/select", z)
                    this.on("end_turn", x)

                } else {
                    this.UPDATE_USER_NOTIFICATION("MESSAGE", "Can't buy CITY")
                }
            } else {
                this.UPDATE_USER_NOTIFICATION("MESSAGE", "You can't do this right now")
            }
        })
    }
    _TRADE_CREATE(session, offer) {
        if (this.turn == session && this.state == "GAME" && this.trade == false) {
            this.print("CREATING TRADE")
            this.print(offer)
            this.emit("TRADE", session, offer)
        }
    }
    //START OF GAME
    async START() {
        this.started = true
        let placeStation = async () => {
            this.EMIT_SHOW_STATIONS(this.getAllSelectableStations())
            return new Promise((resolve) => {
                let z = (session, station) => {
                    if (this.turn == session) {
                        this.OWN_STATION(session, station)
                        this.users[session].STATIONS.push(station) //Add station to the user
                        this.EMIT_SHOW_STATIONS([])
                        this.removeListener("game/station/select", z)
                        resolve(station)
                    }
                }

                this.on("game/station/select", z)
            })
        }

        let placeRoad = async (station) => {
            return new Promise((resolve) => {
                this.EMIT_SHOW_ROADS(this.getNearByRoadsFromStation(station))
                this.UPDATE_TURN_TIME(5, 0)
                let t = setTimeout(() => {
                    this.removeListener("game/road/select", z)
                    clearTimeout(t)
                    resolve(true)
                }, (5 * 60 * 1000))
                let z = (session, road) => {
                    if (this.turn == session) {
                        this.OWN_ROAD(session, road)
                        this.users[session].ROADS.push(road)
                        this.EMIT_SHOW_ROADS([])
                        this.removeListener("game/road/select", z)
                        clearTimeout(t)
                        resolve(true)
                    }
                }
                this.on("game/road/select", z)
            })
        }
        let setTurn = (session) => {
            this.turn = session
        }
        let addCard = (session, id) => {
            if (this.bank[id] > 0) {
                this.users[session].HAND[id]++
                this.bank[id]--
            }
        }
        let giveOneCardsFromPlates = (plates) => {
            for (let i in plates) {
                let x = plates[i][0]
                let y = plates[i][1]
                let plate = this.board.PLATES[x][y]

                if (plate.plate != "DESERT") {
                    if (plate.type == "CITY") {
                        addCard(this.turn, plate.plate)
                    }
                    addCard(this.turn, plate.plate)
                }
            }
            this.UPDATE_COLLECTION(this.turn)
            this.UPDATE_USER_LIST()
            this.UPDATE_BANK();
        }
        //Roll Dice
        let rollDice = async () => {
            return new Promise((resolve) => {
                this.UPDATE_TURN_TIME(0, 15)
                let t = setTimeout(() => {
                    this.DICE_ROLL(this.turn)
                    clearTimeout(t)
                    this.removeListener("game/roll/toss", z)
                    resolve(true)
                }, (1000 * 15))
                let z = (session) => {
                    if (this.turn == session) {
                        this.DICE_ROLL(session)
                        clearTimeout(t)
                        this.removeListener("game/roll/toss", z)
                        resolve(true)
                    }
                }
                this.on("game/roll/toss", z)
            })
        }
        //Give Cards
        let giveCards = async () => {
            for (let user in this.users) {
                for (let station in this.users[user].STATIONS) {
                    let plates = this.getNearbyPlatesFromStation(this.users[user].STATIONS[station])
                    for (let i in plates) {
                        let x = plates[i][0]
                        let y = plates[i][1]
                        let plate = this.board.PLATES[x][y]
                        if (plate.value == this.diceTotal) {
                            addCard(user, plate.plate)
                            if (plate.type == "CITY") {
                                addCard(user, plate.plate)
                            }
                        }
                    }
                }
            }
            this.UPDATE_ALL_COLLECTION();
            this.UPDATE_USER_LIST()
            this.UPDATE_BANK();
        }
        let turnOverYet = async () => {
            return new Promise((resolve) => {
                this.UPDATE_TURN_TIME(5, 0)
                let t = setTimeout(() => {

                    clearTimeout(t)
                    this.UPDATE_NOTIFICATION("TURN", `${users[this.turn].name} turn has ended`)
                    this.removeListener("game/turn/end", z)
                    resolve(true)

                }, (1000 * 60 * 5))
                let z = (session) => {
                    if (this.turn == session) {
                        clearTimeout(t)
                        this.UPDATE_NOTIFICATION("TURN", `${users[session].name} turn has ended`)
                        this.removeListener("game/turn/end", z)
                        resolve(true)
                    }
                }
                this.on("game/turn/end", z)
            })
        }

        let checkWinner = () => {
            for (let user in this.users) {
                let points = 0;
                for (let station in this.users[user].STATIONS) {
                    if (this.users[user].STATIONS[station].type == "CITY") {
                        points += 2
                    } else {
                        points += 1
                    }
                }
                if (points >= 8) {
                    this.UPDATE_NOTIFICATION("MESSAGE", "GAME OVER")
                    this.UPDATE_NOTIFICATION("MESSAGE", `${users[user].name} has WON`)
                    return false
                }
            }
            return true

        }


        let _users = [...this.userList]
        let _users_reverse = [...this.userList]
        _users_reverse = _users_reverse.reverse()

        ///////////////////////////
        this.state = "BEGIN"
        this.grid = this.GENERATE_GRID(3)
        this.TRADE()
        this.BUY()
        this.print("Generating Grid")
        this.GENERATE_BOARD()
        this.print("Generating Board")
        this.UPDATE_BOARD()
        this.print("Updating Board")
        this.UPDATE_BANK()
        this.print("Updating Bank")
        this.UPDATE_NOTIFICATION("Starting", "GAME IS STARTING")
        this.print("STARTING GAME | PHASE 1 PLACEMENT")

        for (let user in _users) {
            await setTurn(_users[user])
            await this.UPDATE_USER_TURN(_users[user], "WAIT")
            this.UPDATE_NOTIFICATION("SELECTING", `${users[_users[user]].name} is selecting`)
            this.UPDATE_USER_NOTIFICATION("MESSAGE", "Place Station")
            let station = await placeStation();
            this.UPDATE_USER_NOTIFICATION("MESSAGE", "Place Road")
            await placeRoad(station);
        }
        for (let user in _users_reverse) {
            await setTurn(_users_reverse[user]);
            await this.UPDATE_NOTIFICATION("SELECTING", `${users[_users_reverse[user]].name} is selecting`)
            this.UPDATE_USER_NOTIFICATION("MESSAGE", "Place Station")
            let station = await placeStation();
            this.UPDATE_USER_NOTIFICATION("MESSAGE", "Place Road")
            await placeRoad(station);
            await giveOneCardsFromPlates(this.getNearbyPlatesFromStation(station));
        }
        //this.EMIT_SHOW_ROADS(true)
        this.state = "GAME"
        let stillRunning = true
        this.UPDATE_NOTIFICATION("MESSAGE", "Pre-Game Ended. Game Begins. 8 Stars to Win")
        while (stillRunning) {
            for (let user in _users) {
                await setTurn(_users[user])
                await this.UPDATE_USER_TURN(_users[user], "WAIT")
                this.UPDATE_NOTIFICATION("MESSAGE", `${users[_users[user]].name} turn has started`)
                this.UPDATE_USER_NOTIFICATION("MESSAGE", "It's your turn. Roll the dice!")
                await this.UPDATE_NOTIFICATION("ROLLING", `${users[_users[user]].name} is rolling`)
                this.rolled = false;
                await rollDice()
                this.rolled = true;
                await this.UPDATE_USER_TURN(_users[user], "END")
                await giveCards()
                await this.UPDATE_NOTIFICATION("BANK", "Pay Day!")
                await turnOverYet()
                this.rolled = false;
                await this.UPDATE_USER_TURN(_users[user], "WAIT")
                stillRunning = await checkWinner()
                this.emit("end_turn")
                await this.EMIT_HIDE_STATIONS([]);
                await this.EMIT_BUY_STATIONS([])
            }
        }
        for (let users in this.users) {
            //Close All Users :D
            io.sockets.connected[users[user].socket.id].disconnect();
        }
        delete rooms[this.id]
    }
    EMIT_SHOW_STATIONS(stations) {
        if (this.turn != null) {
            io.to(this.id).emit("game/stations/show", stations)
        }
    }
    EMIT_HIDE_STATIONS() {
        if (this.turn != null) {
            io.to(this.id).emit("game/stations/show", [])
        }
    }
    EMIT_SHOW_ROADS(roads) {
        if (this.turn != null) {
            io.to(this.id).emit("game/roads/show", roads)
        }
    }
    ///////////
    OWN_ROAD(session, road) {
        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "L": "left",
            "R": "right",
        }
        let validRoad = (x, y, loc) => {
            if (typeof this.board.ROADS[`${y},${x}`] !== 'undefined') {
                if (typeof this.board.ROADS[`${y},${x}`][alias[loc]] !== 'undefined') {
                    return this.board.ROADS[`${y},${x}`][alias[loc]].hidden
                }
            }
            return false
        }
        let location = road.split("-")[1]
        let plate = road.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        if (validRoad(x, y, location)) {
            this.board.ROADS[`${y},${x}`][alias[location]].hidden = false
            this.board.ROADS[`${y},${x}`][alias[location]].color = users[session].color
        }
        this.UPDATE_BOARD()
    }
    OWN_STATION(session, station, type = null) {
        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "T": "top",
            "B": "bottom",
        }
        let validStation = (x, y, loc) => {
            if (typeof this.board.STATIONS[`${y},${x}`] !== 'undefined') {
                if (typeof this.board.STATIONS[`${y},${x}`][alias[loc]] !== 'undefined') {
                    return true
                }
            }
            return false
        }
        let location = station.split("-")[1]
        let plate = station.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        if (validStation(x, y, location)) {
            this.board.STATIONS[`${y},${x}`][alias[location]].hidden = false
            this.board.STATIONS[`${y},${x}`][alias[location]].color = users[session].color
            this.board.STATIONS[`${y},${x}`][alias[location]].type = type == null ? "VILLAGE" : type
        }
        this.UPDATE_BOARD()
    }
    DICE_ROLL(session) {
        let first = getRandomInt(1, 6);
        let second = getRandomInt(1, 6);
        this.dice = [first, second]
        this.diceTotal = first + second
        this.UPDATE_DICE_ROLL();
        this.UPDATE_NOTIFICATION("ROLL", `${users[session].name} rolled a ${first + second}`)
        this.UPDATE_NOTIFICATION("MESSAGE", `${users[session].name} rolled a ${first + second}`)
    }
    /////////////////////////////////
    getAllSelectableStations() {
        let stations = {}
        for (let plate in this.board.STATIONS) {
            for (let station in this.board.STATIONS[plate]) {
                let id = this.board.STATIONS[plate][station].id
                if (this.board.STATIONS[plate][station].hidden == true) {
                    stations[id] = stations[id] != null ? stations[id] : true
                } else {
                    stations[id] = false
                }
            }
        }
        let list = []
        for (let station in stations) {
            if (stations[station]) {
                list.push(station);
            }
        }
        return list
    }
    getAllRoadsNearRoad(id) {
        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "T": "top",
            "B": "bottom",
        }
        let location = id.split("-")[1]
        let plate = id.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        let roads = []

        let check = (x, y, loc) => {
            if (typeof this.board.ROADS[`${y},${x}`] !== 'undefined') {

                if (typeof this.board.ROADS[`${y},${x}`][loc] !== 'undefined') {
                    return true
                }
            }
            return false
        }
        if (location == "TL") {
            if (check(x, y, "top-right")) roads.push(`${y},${x}-TR`)


            if (y < (this.grid.length / 2)) {
                if (check(x - 1, y - 1, "right")) roads.push(`${y - 1},${x - 1}-R`)
                else if (check(x, y - 1, "left")) roads.push(`${y - 1},${x}-L`)
            } else {
                if (check(x, y - 1, "right")) roads.push(`${y - 1},${x}-R`)
                else if (check(x, y - 1, "left")) roads.push(`${y - 1},${x}-L`)
            }

            if (check(x, y, "right")) roads.push(`${y},${x}-R`)
            else if (check(x, y, "left")) roads.push(`${y},${x}-L`)



            if (check(x + 1, y, "top-right")) roads.push(`${y},${x + 1}-TR`)
            if (check(x + 1, y - 1, "bottom-right")) roads.push(`${y - 1},${x + 1}-BR`)


        }
        if (location == "TR") {
            if (check(x, y, "top-left")) roads.push(`${y},${x}-TL`)
            if (check(x - 1, y, "top-left")) roads.push(`${y},${x - 1}-TL`)

            if (check(x - 1, y, "right")) roads.push(`${y},${x - 1}-R`)

            if (y < (this.grid.length / 2)) {
                if (check(x - 1, y - 1, "right")) roads.push(`${y - 1},${x - 1}-R`)
                if (check(x, y - 1, "left")) roads.push(`${y - 1},${x}-L`)
            } else {
                if (check(x, y - 1, "right")) roads.push(`${y - 1},${x}-R`)
            }
            if (check(x, y - 1, "bottom-left")) roads.push(`${y - 1},${x}-BL`)
            if (check(x, y, "left")) roads.push(`${y},${x}-L`)

        }
        if (location == "R") {
            if (check(x, y, "top-left")) roads.push(`${y},${x}-TL`)
            if (check(x + 1, y, "top-right")) roads.push(`${y},${x + 1}-TR`)

            if (y < (this.grid.length / 2) - 1) {
                if (check(x + 1, y + 1, "top-right")) roads.push(`${y + 1},${x + 1}-TR`)
                if (check(x + 1, y + 1, "top-left")) roads.push(`${y + 1},${x + 1}-TL`)
            } else {
                if (check(x, y + 1, "top-right")) roads.push(`${y + 1},${x}-TR`)
                if (check(x, y + 1, "top-left")) roads.push(`${y + 1},${x}-TL`)
            }


            if (check(x, y, "bottom-right")) roads.push(`${y},${x}-BR`)
            if (check(x + 1, y - 1, "bottom-right")) roads.push(`${y - 1},${x + 1}-BR`)
            if (check(x + 1, y, "bottom-left")) roads.push(`${y},${x + 1}-BL`)
        }


        if (location == "L") {
            if (check(x, y, "top-right")) roads.push(`${y},${x}-TR`)
            if (y < (this.grid.length / 2) - 1) {
                if (check(x, y + 1, "top-left")) roads.push(`${y + 1},${x}-TL`)
                if (check(x, y + 1, "top-right")) roads.push(`${y + 1},${x}-TR`)
            } else {
                if (check(x, y, "bottom-left")) roads.push(`${y},${x}-BL`)
                if (check(x, y - 1, "bottom-left")) roads.push(`${y - 1},${x}-BL`)
            }
        }
        if (location == "BL") {
            if (check(x, y, "left")) roads.push(`${y},${x}-L`)
            if (check(x, y + 1, "left")) roads.push(`${y + 1},${x}-L`)
            if (check(x, y + 1, "top-right")) roads.push(`${y + 1},${x}-TR`)
            if (check(x, y, "bottom-right")) roads.push(`${y},${x}-BR`)
            if (check(x - 1, y, "bottom-right")) roads.push(`${y},${x - 1}-BR`)
            if (check(x - 1, y, "right")) roads.push(`${y},${x - 1}-R`)
        }
        if (location == "BR") {
            if (check(x, y, "right")) roads.push(`${y},${x}-R`)
            if (check(x - 1, y + 1, "right")) roads.push(`${y + 1},${x - 1}-R`)
            if (check(x - 1, y + 1, "top-left")) roads.push(`${y + 1},${x - 1}-TL`)
            if (check(x, y, "bottom-left")) roads.push(`${y},${x}-BL`)
            if (check(x + 1, y, "bottom-left")) roads.push(`${y},${x + 1}-BL`)
        }
        return roads
    }
    getNearByStation(id) {
        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "T": "top",
            "B": "bottom",
        }
        let location = id.split("-")[1]
        let plate = id.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        let stations = []
        let check = (x, y, loc) => {
            if (typeof this.board.STATIONS[`${y},${x}`] !== 'undefined') {
                if (typeof this.board.STATIONS[`${y},${x}`][loc] !== 'undefined') {
                    return true
                }
            }
            return false
        }
        if (location == "TL") {
            stations.push(`${y},${x}-T`)
            if (check(x - 1, y, "top")) stations.push(`${y},${x - 1}-T`)
            if (check(x, y + 1, "top")) stations.push(`${y + 1},${x}-T`)
            if (check(x, y - 1, "bottom-left")) stations.push(`${y - 1},${x}-BL`)
            if (check(x, y, "bottom-left")) stations.push(`${y},${x}-BL`)
        } else if (location == "TR") {
            stations.push(`${y},${x}-T`)

            if (check(x + 1, y + 1, "top")) stations.push(`${y + 1},${x + 1}-T`)
            if (check(x, y, "bottom-right")) stations.push(`${y},${x}-BR`)
            if (check(x + 1, y - 1, "bottom-right")) stations.push(`${y - 1},${x + 1}-BR`)
        } else if (location == "BL") {
            stations.push(`${y},${x}-TL`)
            if (check(x, y, "bottom")) stations.push(`${y},${x}-B`)
            if (check(x - 1, y, "bottom")) stations.push(`${y},${x - 1}-B`)
            if (check(x, y + 1, "top-left")) stations.push(`${y + 1},${x}-TL`)
        } else if (location == "BR") {
            stations.push(`${y},${x}-TL`)
            if (check(x, y, "bottom")) stations.push(`${y},${x}-B`)
            if (check(x - 1, y + 1, "top-right")) stations.push(`${y + 1},${x - 1}-TR`)
        } else if (location == "T") {
            stations.push(`${y},${x}-TL`)
            if (check(x, y - 1, "top-left")) stations.push(`${y - 1},${x}-TL`)
            if (check(x + 1, y, "top-left")) stations.push(`${y},${x + 1}-TL`)
            if (check(x, y, "top-right")) stations.push(`${y},${x}-TR`)
            if (check(x - 1, y - 1, "top-right")) stations.push(`${y - 1},${x - 1}-TR`)
        } else if (location == "B") {
            stations.push(`${y},${x}-BL`)
            if (check(x, y, "bottom-right")) stations.push(`${y},${x}-BR`)
            if (check(x + 1, y, "bottom-left")) stations.push(`${y},${x + 1}-BL`)
        }
        return stations

    }
    getNearbyPlatesFromStation(id) {
        let location = id.split("-")[1]
        let plate = id.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        let plates = []
        if (location == "T") {
            if (this.grid[y - 1 < 0 ? 0 : y - 1].length > this.grid[y].length) {
                if (typeof this.board.PLATES[y - 1] !== 'undefined') {
                    if (typeof this.board.PLATES[y - 1][x] !== 'undefined') plates.push([y - 1, x])
                    if (typeof this.board.PLATES[y - 1][x + 1] !== 'undefined') plates.push([y - 1, x + 1])
                }

            } else {
                if (typeof this.board.PLATES[y - 1] !== 'undefined') {
                    if (typeof this.board.PLATES[y - 1][x] !== 'undefined') plates.push([y - 1, x])
                    if (typeof this.board.PLATES[y - 1][x - 1] !== 'undefined') plates.push([y - 1, x - 1])
                }
            }
        } else if (location == "TL") {
            if (this.grid[y - 1 < 0 ? 0 : y - 1].length > this.grid[y].length) {
                if (typeof this.board.PLATES[y - 1] !== 'undefined') {
                    if (typeof this.board.PLATES[y - 1][x] !== 'undefined') plates.push([y - 1, x])
                }
                if (typeof this.board.PLATES[y][x - 1] !== 'undefined') plates.push([y, x - 1])

            } else {
                if (typeof this.board.PLATES[y - 1] !== 'undefined') {
                    if (typeof this.board.PLATES[y - 1][x - 1] !== 'undefined') plates.push([y - 1, x - 1])
                }
                if (typeof this.board.PLATES[y][x - 1] !== 'undefined') plates.push([y, x - 1])
            }
        } else if (location == "TR") {
            if (typeof this.board.PLATES[y - 1] !== 'undefined') {
                if (typeof this.board.PLATES[y - 1][x + 1] !== 'undefined') plates.push([y - 1, x + 1])
            }

        }
        plates.push([y, x])
        return plates;
    }
    getNearByRoadsFromStation(id) {

        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "T": "top",
            "B": "bottom",
        }
        let location = id.split("-")[1]
        let plate = id.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        let roads = []

        let check = (x, y, loc) => {
            if (typeof this.board.ROADS[`${y},${x}`] !== 'undefined') {

                if (typeof this.board.ROADS[`${y},${x}`][loc] !== 'undefined') {
                    return true
                }
            }
            return false
        }
        if (location == "TL") {
            if (check(x, y, "left")) roads.push(`${y},${x}-L`)
            if (check(x, y, "top-right")) roads.push(`${y},${x}-TR`)
            if (check(x - 1, y, "top-left")) roads.push(`${y},${x - 1}-TL`)
            if (check(x, y - 1, "bottom-left")) roads.push(`${y - 1},${x}-BL`)
            if (check(x - 1, y, "right")) roads.push(`${y},${x - 1}-R`)
        }
        if (location == "TR") {
            if (check(x, y, "top-right")) roads.push(`${y},${x}-TL`)
            if (check(x, y, "right")) roads.push(`${y},${x}-R`)
            if (check(x + 1, y - 1, "bottom-right")) roads.push(`${y - 1},${x + 1}-BR`)
        }
        if (location == "T") {

            if (check(x, y, "top-left")) roads.push(`${y},${x}-TL`)
            if (check(x, y, "top-right")) roads.push(`${y},${x}-TR`)
            if (y < (this.grid.length / 2)) {
                if (check(x, y - 1, "left")) roads.push(`${y - 1},${x}-L`)
                if (check(x - 1, y - 1, "right")) roads.push(`${y - 1},${x - 1}-R`)
            } else {
                if (check(x, y - 1, "right")) roads.push(`${y - 1},${x}-R`)
            }
        }
        if (location == "BL") {
            if (check(x, y, "bottom-left")) roads.push(`${y},${x}-BL`)
            if (check(x - 1, y, "bottom-right")) roads.push(`${y},${x - 1}-BR`)
            if (check(x, y, "left")) roads.push(`${y},${x}-L`)
            if (check(x - 1, y, "right")) roads.push(`${y},${x - 1}-R`)
        }
        if (location == "B") {
            if (check(x, y, "bottom-left")) roads.push(`${y},${x}-BL`)
            if (check(x, y, "bottom-right")) roads.push(`${y},${x}-BR`)
        }
        if (location == "BR") {
            if (check(x, y, "right")) roads.push(`${y},${x}-R`)
            if (check(x, y, "bottom-right")) roads.push(`${y},${x}-BR`)
        }
        return roads
    }
    getStationsAtRoad(id) {
        let alias = {
            "TL": "top-left",
            "TR": "top-right",
            "BL": "bottom-left",
            "BR": "bottom-right",
            "T": "top",
            "B": "bottom",
        }
        let location = id.split("-")[1]
        let plate = id.split("-")[0].split(",")
        let y = parseInt(plate[0])
        let x = parseInt(plate[1])
        let stations = []

        let check = (x, y, loc) => {
            if (typeof this.board.STATIONS[`${y},${x}`] !== 'undefined') {
                if (typeof this.board.STATIONS[`${y},${x}`][loc] !== 'undefined') {
                    return true
                }
            }
            return false
        }
        if (location == "TR") {
            if (check(x, y, "top")) stations.push(`${y},${x}-T`)
            if (check(x, y, "top-left")) stations.push(`${y},${x}-TL`)
        }
        if (location == "TL") {
            if (check(x, y, "top")) stations.push(`${y},${x}-T`)
            if (check(x + 1, y, "top-left")) stations.push(`${y},${x + 1}-TL`)
            if (check(x, y, "top-right")) stations.push(`${y},${x}-TR`)
            if (check(x + 1, y - 1, "bottom")) stations.push(`${y - 1},${x + 1}-TL`)
        }
        if (location == "R") {
            if (check(x, y, "top-right")) stations.push(`${y},${x}-TR`)

            if (y < (this.grid.length / 2) - 1) {
                if (check(x + 1, y, "top-left")) stations.push(`${y},${x + 1}-TL`)
                if (check(x + 1, y + 1, "top")) stations.push(`${y + 1},${x + 1}-T`)
            } else {
                if (check(x + 1, y, "top-left")) stations.push(`${y},${x + 1}-TL`)
                if (check(x, y + 1, "top")) stations.push(`${y + 1},${x}-T`)
                if (check(x, y, "bottom-right")) stations.push(`${y},${x}-BR`)
                if (check(x + 1, y, "bottom-left")) stations.push(`${y},${x + 1}-BL`)
            }

        }
        if (location == "L") {
            if (check(x, y, "top-left")) stations.push(`${y},${x}-TL`)
            if (check(x, y, "bottom-left")) stations.push(`${y},${x}-BL`)
            if (y < (this.grid.length / 2) - 1) if (check(x, y + 1, "top")) stations.push(`${y + 1},${x}-T`)
        }
        if (location == "BL") {
            if (check(x, y, "bottom")) stations.push(`${y},${x}-B`)
            if (check(x, y, "bottom-left")) stations.push(`${y},${x}-BL`)
            if (check(x, y + 1, "top-left")) stations.push(`${y + 1},${x}-TL`)
        }
        if (location == "BR") {
            if (check(x, y, "bottom")) stations.push(`${y},${x}-B`)
            if (check(x, y, "bottom-right")) stations.push(`${y},${x}-BR`)
            if (check(x - 1, y + 1, "top-right")) stations.push(`${y + 1},${x - 1}-TR`)

        }
        return stations;
    }

}

io.on('connection', function (socket) {
    let user = new User(socket)
    socket.on("disconnect", () => {
        user.DISCONNECT()
    })
});
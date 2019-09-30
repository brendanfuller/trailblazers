
import duix from "duix"
import DuixComponent from "~src/lib/duix"
import { notification, message, Modal } from "antd"


import brickImage from "~imgs/brick.svg"
import lumberImage from "~imgs/lumber.svg"
import sheepImage from "~imgs/sheep.svg"
import rockImage from "~imgs/rock.svg"
import grainImage from "~imgs/grain.svg"
import desertImage from "~imgs/desert.svg"

import io from 'socket.io-client'; //Socket client
import Cookie from "js-cookie"


notification.config({
    placement: 'topLeft',
});


let PLATES = {
    "GRAIN": {
        plate: {
            color: "green",
            image: grainImage,
        },
    },
    "LUMBER": {
        plate: {
            color: "green",
            image: lumberImage,
        }
    },
    "BRICK": {
        plate: {
            color: "#8b4f39",
            image: brickImage,
        }
    },
    "STONE": {
        plate: {
            color: "gray",
            image: rockImage,
        }
    },
    "SHEEP": {
        plate: {
            image: sheepImage,
            color: "white",
        }
    },
    "DESERT": {
        plate: {
            image: desertImage,
            color: "yellow",
        }
    },
    "?": {
        plate: {
            color: "black",
        }
    }
}




export default class Trailblazers extends DuixComponent {
    constructor() {
        super()
        //SOCKET.IO CLIENT
        /*duix.set("game/users/list")*/
        duix.set("game/plates", PLATES)
        //duix.set("game/username", "Brendan")

        //Checks if user has a session (disconnected in a game for example)


        this.subscribe("game/road/select", this.EMIT_ROAD_SELECT.bind(this))
        this.subscribe("game/station/select", this.EMIT_STATION_SELECT.bind(this))

        this.subscribe("game/chat/message", this.EMIT_CHAT_MESSAGE.bind(this))

        this.subscribe("game/roll/toss", this.EMIT_DICE_TOSS.bind(this))
        this.subscribe("game/username", this.EMIT_USERNAME_SET.bind(this))

        this.subscribe("game/shop/buy", this.EMIT_SHOP_BUY.bind(this))
        this.subscribe("game/turn/end", this.EMIT_TURN_END.bind(this))

        this.subscribe("game/trade/create", this.EMIT_TRADE_CREATE.bind(this))
        this.subscribe("game/trade/cancel", this.EMIT_TRADE_CANCEL.bind(this))
        this.subscribe("game/trade/select", this.EMIT_TRADE_SELECT.bind(this))
        this.INIT()
        /**F
         * game/cards/collection
         * game/cards/development
         *  */







    }
    INIT(bypass = false) {
        let cookieCopy = Cookie.get()
        if (cookieCopy.session != null && bypass == false) {
            console.log(`[TB] User has a SESSION ${cookieCopy.session}`)
            this.session = cookieCopy.session
            let self = this
            Modal.confirm({
                title: "Do you want to continue the previous session?",
                onOk() {
                    self.CONNECT()
                },
                onCancel() {
                    self.username = null
                    self.session = null
                    Modal.destroyAll();
                    duix.set("ui/username/show")
                }

            })
        } else if (duix.get("game/username") != null) {
            this.username = duix.get("game/username")
            this.session = null;
            this.CONNECT()
        } else {
            this.username = null;
            this.session = null;
            setTimeout(() => {
                duix.set("ui/username/show")
            }, 200)
        }
    }
    CONNECT() {
        let ip = "trail-blazers-game.herokuapp.com"
        this.client = io.connect(`https://${ip}/`)
        //Connected to the server
        let makeModal = () => {
            Modal.info({
                title: "Attempting To Connect",
                maskClosable: false,
                onOk() {
                    makeModal()
                }
            })
        }
        makeModal()
        this.client.on("connect", () => {
            Modal.destroyAll()
            this.client.emit("game/handshake", { room: window.room, session: this.session, username: this.username })
            this.EVENT_GRID() //game/grid
            this.EVENT_SESSION() //game/session
            this.EVENT_CHAT_MESSAGE()  //game/chat/update
            this.EVENT_CARDS_COLLECTION() //game/cards/collection
            this.EVENT_USERS_LIST() //game/users/list

            this.EVENT_ROLL_UPDATE() //game/roll/update

            this.EVENT_TURN_UPDATE() //game/turn/update
            this.EVENT_TURN_TIME()
            this.EVENT_ROAD_SHOW() //game/road/show
            this.EVENT_STATIONS_SHOW() //game/stations/show

            this.EVENT_BANK_UPDATE() //game/bank/update

            this.EVENT_TRADE_USERS()
            this.EVENT_TRADE_OFFER()
            this.EVENT_TRADE_CLOSE()
            this.EVENT_TRADE_OPEN()


            this.EVENT_NOTIFICATION();
            let self = this
            this.client.on("disconnect", () => {
                this.client.disconnect()

                Modal.error({
                    title: "You were disconnected from the server!",
                    onOk() {
                        self.INIT()
                    }
                })
                //REMOVE COOKIE?
            })
        })

    }

    //////////////////////
    /**
     * ROAD_SELECT - Selection of a hidden road piece
     * @param {Stirng} id of road selected 
     */
    EMIT_ROAD_SELECT(id) {
        this.client.emit("game/road/select", id)
    }
    EMIT_STATION_SELECT(id) {
        this.client.emit("game/station/select", id)
    }
    EMIT_CHAT_MESSAGE(message) {
        this.client.emit("game/chat/message", message)
    }
    EMIT_DICE_TOSS(toss) {
        this.client.emit("game/roll/toss", toss)
    }
    EMIT_SHOP_BUY(item) {
        this.client.emit("game/shop/buy", item)
    }
    EMIT_TURN_END(item) {
        this.client.emit("game/turn/end", item)
    }
    EMIT_TRADE_CREATE(offer) {
        this.client.emit("game/trade/create", offer)
    }
    EMIT_TRADE_CANCEL() {
        this.client.emit("game/trade/cancel", true)
    }
    EMIT_TRADE_SELECT(option) {
        this.client.emit("game/trade/select", option)
    }

    /**
     * EMIT_USERNAME_SET - Sets username for user
     */
    EMIT_USERNAME_SET(name) {
        this.INIT(true)
    }




    /////////////////////////////
    EVENT_GRID() {
        this.client.on("game/grid", (data) => {
            duix.set("game/grid", data)
        })
    }
    EVENT_SESSION() {
        this.client.on("game/session", (data) => {
            duix.set("game/session", data)
            console.log(`[TB] Create New Session ${data}`)
            Cookie.set('session', data, { expires: 1 });
        })
    }
    EVENT_CHAT_MESSAGE() {
        this.client.on("game/chat/update", (data) => {
            duix.set("game/chat/update", data)
        })
    }
    EVENT_CARDS_COLLECTION() {
        this.client.on("game/cards/collection", (data) => {
            duix.set("game/cards/collection", data)
        })
    }
    EVENT_USERS_LIST() {
        this.client.on("game/users/list", (data) => {
            duix.set("game/users/list", data)
        })
    }
    EVENT_ROLL_UPDATE() {
        this.client.on("game/roll/update", (data) => {
            duix.set("game/roll/update", data)
        })
    }
    EVENT_TURN_UPDATE() {
        this.client.on("game/turn/update", (data) => {
            duix.set("game/turn/update", data)
        })
    }
    EVENT_TURN_TIME() {
        this.client.on("game/turn/time", (data) => {
            duix.set("game/turn/time", data)
        })
    }
    EVENT_ROAD_SHOW() {
        this.client.on("game/roads/show", (data) => {
            duix.set("game/road/show", data)
        })
    }
    EVENT_STATIONS_SHOW() {
        this.client.on("game/stations/show", (data) => {
            //alert("SHOWING")
            duix.set("game/stations/show", data)
        })
    }
    EVENT_BANK_UPDATE() {
        this.client.on("game/bank/update", (data) => {
            duix.set("game/bank/update", data)
        })
    }
    EVENT_TRADE_USERS() {
        this.client.on("game/trade/users", (data) => {
            duix.set("game/trade/users", data)
        })
    }
    EVENT_TRADE_OFFER() {
        this.client.on("game/trade/offer", (data) => {
            duix.set("game/trade/offer", data)
        })
    }
    EVENT_TRADE_CLOSE() {
        this.client.on("game/trade/close", (data) => {
            console.log(`[TB] Closing Trade ${data}`)
            duix.set("ui/trade/close", data)
        })
    }
    EVENT_TRADE_OPEN() {
        this.client.on("game/trade/open", () => {
            console.log(`[TB] Opening Trade`)
            duix.set("ui/trade/open", "SERVER")
        })
    }
    EVENT_NOTIFICATION() {
        this.client.on("game/notification", (notification) => {
            if (notification.type == "MESSAGE") {
                message.open({
                    content: notification.message,
                    icon: ""
                })
            } else {
                let list = duix.get("game/timeline") ? duix.get("game/timeline") : []
                list.unshift(notification)
                duix.set("game/timeline", list)
            }

        })
    } _
}
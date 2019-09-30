import React, { Component } from "react"

import duix from "duix"
import eventListener from "eventlistener"
import { Spin } from "antd"
import FlexGrid from "~src/lib/grid"
import DuixComponent from "~src/lib/duix"
import { mdiHome, mdiCity, mdiChevronTripleLeft } from "@mdi/js"



let Icon = (props) => (
    <svg style={{ width: 30, height: 30, color: props.color }} viewBox="0 0 24 24">
        <path fill={props.color} d={props.icon} />
    </svg>
)

/**
 * Area - The game board
 *  
 *  - Panning/Dragging
 *  - Displaying all plates, roads and stations
 *  - Selecting all plates rows and stations
 */
class Area extends DuixComponent {
    constructor() {
        super()
        this.state = {
            //All plate data (type)
            plates: null,
            //All grid data 
            grid: null,
            //Show all ROADS and STATIONS locations
            showSelectableStations: null,
            showSelectableRoads: null,
            dice: 0,
        }
    }
    /**
     * shouldComponentUpdate - Do we need to update this component
     */
    shouldComponentUpdate() {
        return false
    }
    /**
     * componentDidMount - When the component mounts
     */
    componentDidMount() {
        //Add Global State Events
        this.subscribe("game/plates", this.__UpdatePlates.bind(this))
        this.subscribe("game/grid", this.__UpdateGrid.bind(this))
        this.subscribe("game/road/show", this.__UpdateShowSelectableRoads.bind(this))
        this.subscribe("game/stations/show", this.__UpdateShowSelectableStations.bind(this))
        this.subscribe("game/roll/update", this.__UpdateRoll.bind(this))
    }
    /**
     * UpdatesPlates - Updates the plates for the object
     * @param {Object} plates 
     */
    __UpdatePlates(plates) {
        this.setState({ plates })
        this.forceUpdate()
    }
    /**
     * UpdateGrid [DUIX] - Updates the grid outlines
     */
    __UpdateGrid(grid) {

        this.setState({ grid })
        this.forceUpdate()
    }
    /**
     * UpdateRoadShow - Updates all roads to be shown for clicking abilities
     */
    __UpdateShowSelectableRoads(showSelectableRoads) {
        this.setState({ showSelectableRoads })
        this.forceUpdate()
    }
    /**
     * UpdateRoadShow - Updates all roads to be shown for clicking abilities
     */
    __UpdateShowSelectableStations(showSelectableStations) {
        this.setState({ showSelectableStations })
        this.forceUpdate()
    }
    /**
     * UpdateRoll - Updates the roll amount, so the highlighted plate can be colored
     * @param {Integer} dice 
     */
    __UpdateRoll(dice) {
        let value = dice[0] + dice[1]
        this.setState({ dice: value })
        this.forceUpdate()
    }
    ////////
    renderRows() {
        //Reference this to the other local functions
        let self = this
        let Plate = (props) => {
            //Grab the local road
            let roads = props.roads
            let stations = props.stations
            let items = []
            for (let location in roads) {
                let road = roads[location]
                //Add all of the roads to the list of roads
                items.push(<Road key={location} road={road} location={location} />)
            }
            for (let location in stations) {
                let station = stations[location]

                items.push(<Station key={location + "1"} station={station} location={location} />)
            }
            if (props.plate != "DESERT") {
                let background = "white"
                if (props.value == this.state.dice) {
                    background = "orange"
                }
                items.push(<FlexGrid className="value" background={background}>{props.value}</FlexGrid>)
            }
            //Render the Plate, Road and Station
            return <FlexGrid className="plate">
                {items}
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200" className="hexagon" viewBox="0 0 173.20508075688772 200" >4
                   <defs>
                        <pattern id={`img-${props.plate}`} patternUnits="userSpaceOnUse" width="200" height="200">
                            <image href={props.image} x="0" y="0"
                                width="200" height="200" />
                        </pattern>
                    </defs>
                    <path fill={`url(#img-${props.plate})`} d="M77.94228634059948 4.999999999999999Q86.60254037844386 0 95.26279441628824 4.999999999999999L164.54482671904333 45Q173.20508075688772 50 173.20508075688772 60L173.20508075688772 140Q173.20508075688772 150 164.54482671904333 155L95.26279441628824 195Q86.60254037844386 200 77.94228634059948 195L8.660254037844387 155Q0 150 0 140L0 60Q0 50 8.660254037844387 45Z"></path>
                </svg >
            </FlexGrid>
        }
        /**
         * Road - Renders a road component
         * @param {Object} props 
         */
        let Station = (props) => {
            //Grab all of the station properties
            let color = props.station.color ? props.station.color : "black" //Color of City
            let hidden = props.station.hidden != null ? props.station.hidden : true //Hidden City
            let type = props.station.type ? props.station.type : "CITY" //Type of station [VILLAGE, CITY]
            let location = props.location ? props.location : "" //City Location
            let id = props.station.id ? props.station.id : "ERROR";
            let style = { background: color }

            //First lets not render anything if its hidden and station is not being shown
            if (hidden && self.state.showSelectableStations == null) {
                return null;
                //Secondly, if all station is shown, AND the plate is hidden lets show it
            } else if (self.state.showSelectableStations && hidden) {
                if (self.state.showSelectableStations == true) {
                    style = { background: "white", border: "1px solid black" }
                    return <div onClick={() => { duix.set("game/station/select", id) }} className={`station ${location} select`} style={style}></div>
                }
                //Show given stations from the array and show them on screen
                for (let station in self.state.showSelectableStations) {
                    if (self.state.showSelectableStations[station] == id) {
                        style = { background: "white", border: "1px solid black" }
                        return <div onClick={() => { duix.set("game/station/select", id) }} className={`station ${location} select`} style={style}></div>
                    }
                }
                return null
            } else {
                //Then of course lets just normally render the station
                let icon = mdiHome
                if (type == "CITY") {
                    icon = mdiCity
                }
                return <div className={`station ${location} ${type}`} style={{ background: "gray" }} onClick={() => { duix.set("game/station/select", id) }} >
                    <Icon icon={icon} color={color} />
                </div>
            }

        }
        /**
         * Road - Renders a road component
         * @param {Object} props 
         */
        let Road = (props) => {
            //Grab all of the road properties
            let color = props.road.color ? props.road.color : "black"
            let hidden = props.road.hidden != null ? props.road.hidden : true
            let location = props.location ? props.location : ""
            let style = { background: color }
            let id = props.road.id ? props.road.id : "ERROR";
            //First lets not render anything if its hidden and roads are not being shown
            if (hidden && self.state.showSelectableRoads == null) {
                return null;
                //Secondly, if all roads are shown, AND the plate is hidden lets show it
            } else if (self.state.showSelectableRoads != null && hidden) {
                if (self.state.showSelectableRoads == true) {
                    style = { background: "white", border: "1px solid black" }
                    return <div onClick={() => { duix.set("game/road/select", id) }} className={`road ${location}`} style={style}></div>
                } else {
                    for (let station in self.state.showSelectableRoads) {
                        if (self.state.showSelectableRoads[station] == id) {
                            style = { background: "white", border: "1px solid black" }
                            return <div onClick={() => { duix.set("game/road/select", id) }} className={`road ${location}`} style={style}></div>
                        }
                    }
                }


                return null
            }
            //Then of course lets just normally render the roads
            return <div className={`road ${location}`} style={style}></div>
        }
        /**
         * PlateRow - A row for the plates  
         * @param {Object} props 
         */

        let PlateRow = (props) => {
            return <FlexGrid col height={150} style={{ marginTop: 3 }} center h>
                <FlexGrid col>
                    {props.children}
                </FlexGrid>
            </FlexGrid>

        }


        //Create a list of items, PlateRows in this case
        let items = []
        //Check if we have the grid and plates
        if (this.state.grid != null && this.state.plates != null) {
            //Check if the plates are valid
            if (this.state.grid["PLATES"] != null) {
                //Now lets loop through the plates
                for (let row in this.state.grid["PLATES"]) {
                    let plates = []
                    for (let i in this.state.grid["PLATES"][row]) {
                        //Check if this is a valid plate
                        let p = this.state.grid["PLATES"][row][i] ? this.state.grid["PLATES"][row][i] : null
                        if (p != null) {
                            let roads = this.state.grid["ROADS"][p.id] ? this.state.grid["ROADS"][p.id] : null
                            let stations = this.state.grid["STATIONS"][p.id] ? this.state.grid["STATIONS"][p.id] : null
                            let image = this.state.plates[p.plate].plate.image ? this.state.plates[p.plate].plate.image : null



                            plates.push(<Plate key={p.id + i}
                                plate={p.plate}
                                image={image}
                                roads={roads}
                                value={p.value}
                                stations={stations} />)


                        } else {
                            console.log("[game/area/render] Invalid Plate?")
                        }

                    }
                    items.push(<PlateRow key={row}>
                        {plates}
                    </PlateRow>)
                }
                return items;
            }

        }
        return <div style={{ fontSize: 30, fontWeight: "bold" }}>
            Waiting for players...
        </div>
    }
    render() {
        if (this.state.plates) {
            return <FlexGrid row center h v>
                {this.renderRows()}
            </FlexGrid>
        }
        return null

    }
}

export default class GameArea extends DuixComponent {
    constructor() {
        super();
        this.state = {
            panning_x: 0, //X
            panning_y: 0, //Y
            panning_xS: 0, //Start X
            panning_yS: 0, //Start Y
            panning_mouse_xS: 0, //Mouse X Start
            panning_mouse_yS: 0, //Mouse Y Start
            zoom: 1, //CSS Scale
            turn: null,
            grid: false
        };
        this.handlePanStop = this.handlePanStop.bind(this);
        this.handlePanStart = this.handlePanStart.bind(this);
        this.handlePanMove = this.handlePanMove.bind(this);

    }
    __UpdateTurn(turn) {
        let a = () => {
            return "hi"
        }
        this.setState({ turn })
    }
    /**
     * handleZoom - Zooming the game area
     * @param {Object} event Event of the scroll wheel event
     */
    handleZoom(event) {
        //Check the wheel delta (direction)
        let wDelta = event.wheelDelta < 0 ? "down" : "up";
        //If we are going up, or down
        if (wDelta == "up") {
            //Grab the zoom value from state
            let zoom = this.state.zoom;
            //Check if the zoom is below the threshold
            if (zoom < 5) {
                //Apply a zoom increment each time a zoom
                this.setState({
                    zoom: zoom + 0.1
                });
            }
            //If we are zooming in, its out
        } else {
            //Grab zoom state
            let zoom = this.state.zoom;
            if (zoom > 0.4) {
                this.setState({
                    zoom: zoom - 0.1
                });
            }
        }
    }
    /**
     * handlePanStart - Handles the begin of panning (click)
     * @param {Object} e Mouse Button Event 
     */
    handlePanStart(e) {
        if (e.buttons == 4) {
            let startX =
                typeof e.clientX === "undefined"
                    ? e.changedTouches[0].clientX
                    : e.clientX,
                startY =
                    typeof e.clientY === "undefined"
                        ? e.changedTouches[0].clientY
                        : e.clientY;
            eventListener.add(window, "mousemove", this.handlePanMove);
            eventListener.add(window, "touchmove", this.handlePanMove);
            eventListener.add(window, "mouseup", this.handlePanStop);
            eventListener.add(window, "touchend", this.handlePanStop);

            this.setState({
                panning_STATE: true,
                panning_mouse_xS: startX,
                panning_mouse_yS: startY,
                panning_xS: this.state.panning_x,
                panning_yS: this.state.panning_y
            });
        }
    }
    /**
     * handlePanMove - Handles the panning moving
     * @param {Object} e Mouse Move Event 
     */
    handlePanMove(e) {
        if (e.buttons == 4 && this.state.panning_STATE) {
            //Grab the X and Y of the mouse
            var x =
                typeof e.clientX === "undefined"
                    ? e.changedTouches[0].clientX
                    : e.clientX,
                y =
                    typeof e.clientY === "undefined"
                        ? e.changedTouches[0].clientY
                        : e.clientY;
            //Check the start of the mouse, and find the delta
            let local_xC = (x - this.state.panning_mouse_xS) * -1;
            let local_yC = (y - this.state.panning_mouse_yS) * -1;

            //Now with the delta of the difference between of the mouse 
            //find that difference with the start X (handlePanStart)
            let local_x = this.state.panning_xS - local_xC;
            let local_y = this.state.panning_yS - local_yC;

            //Update the State
            this.setState({
                panning_x: local_x,
                panning_y: local_y
            });
        } else {
            return null;
        }
    }
    /**
     * handlePanStop - When the mouse event stops
     * @param {Object} e Mouse Event Stop
     */
    handlePanStop(e) {
        //Update panning state (False = no pan)
        this.setState({ panning_STATE: false });
        //Remove all eventlisteners, which were binded to window
        eventListener.remove(window, "mousemove", this.handlePanMove);
        eventListener.remove(window, "touchmove", this.handlePanMove);
        eventListener.remove(window, "mouseup", this.handlePanStop);
        eventListener.remove(window, "touchend", this.handlePanStop);

    }
    /**
     * handlePanReset - handles the reset of the Game Area
     */
    handlePanReset() {
        this.setState({ panning_x: 0, panning_y: 0 })
    }
    /**
     * handleTradeOpen - Opens the trading GUI
     */
    handleTradeOpen() {
        duix.set("ui/trade/open", "BUTTON")
    }
    componentDidMount() {
        let drag = document.querySelector("#game-area");
        drag.onmousedown = this.handlePanStart.bind(this);
        drag.ontouchstart = this.handlePanStart.bind(this);
        drag.onmousewheel = this.handleZoom.bind(this);
        this.subscribe("game/turn/update", this.__UpdateTurn.bind(this))
        this.subscribe("game/grid", () => {
            this.setState({ grid: true })
        })
    }
    /**
     * renderTradeOpen - Renders the button to open trading
     */
    renderTradeOpen() {
        if (this.state.turn === "END" && this.state.grid == true) {
            return <div className="reset" style={{ padding: 10, right: 300 }} onClick={this.handleTradeOpen.bind(this)} >
                <Icon icon={mdiChevronTripleLeft} />
            </div>
        }
        return null
    }
    //Render the game board
    render() {
        let gameStyle = {
            transform: `translate3d(${this.state.panning_x}px, ${this.state.panning_y}px, 0px)`
        };
        if (this.state.panning_STATE) {
            gameStyle["cursor"] = "move";
        }
        return (
            <FlexGrid
                className="water"
                id="game-area"
                style={{ width: "calc(80vw - 300px)", zIndex: 1 }}>
                <div className="reset" style={{ padding: 10 }} onClick={this.handlePanReset.bind(this)}>
                    <Icon icon={mdiHome} />
                </div>
                {this.renderTradeOpen()}
                <FlexGrid id="game-wrapper" style={gameStyle}>
                    <div
                        id="game"
                        style={{ transform: `scale(${this.state.zoom})`, }}
                    >
                        <Area />
                    </div>
                </FlexGrid>
            </FlexGrid>

        );
    }
}


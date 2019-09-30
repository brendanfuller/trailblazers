import React, { Component } from "react"
import duix from "duix"
import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"
import { mdiCheck, mdiTimerSand } from "@mdi/js"
let Icon = (props) => (
    <svg style={{ width: 60, height: 60 }} viewBox="0 0 24 24">
        <path fill="white" d={props.icon} />
    </svg>
)

function AdjustingInterval(workFunc, inter, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = inter;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            // You could have some default stuff here too...
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
    }
}
/**
 * Dice
 * 
 * The Dice component is a all natural component, which
 * runs from tough sweat and a lot of chance.
 * 
 * DUIX:
 * - game/roll/update
 */
export default class Dice extends DuixComponent {
    constructor() {
        super()
        this.state = {
            dice: [5, 3],
            turnState: null,
            time: {
                minutes: 0,
                seconds: 0,
            }
        }
    }
    /**
     * shouldComponentUpdate
     */
    shouldComponentUpdate() {
        return true
    }
    /**
     * componentDidMount
     */
    componentDidMount() {
        this.subscribe("game/roll/update", this.__UpdateDice.bind(this))
        this.subscribe("game/turn/update", this.__UpdateTurn.bind(this))
        this.subscribe("game/turn/time", this.__UpdateTurnTime.bind(this))


        let ticker = new AdjustingInterval(() => {
  
            let mins = this.state.time.minutes
            let secs = this.state.time.seconds
            if (secs < 1) {
                if (mins > 0) {
                    mins = mins - 1;
                    secs = 59;
                } else {
                    secs = 0
                }
            } else {
                secs = secs - 1
            }
            this.setState({
                time: {
                    minutes: mins,
                    seconds: secs
                }
            })
        }, 1000, () => {
            //error
        })
        ticker.start()
    }
    /**
     * UpdateDice - Update the number that was tossed
     * @param {Array} dice list of dice 
     */
    __UpdateDice(dice) {
        this.setState({ dice })
        this.forceUpdate();
    }
    __UpdateTurn(turnState) {
        this.setState({ turnState })
        this.forceUpdate();
    }
    __UpdateTurnTime(time) {
        this.setState({time})
    }
    _onRollDice() {
        duix.set("game/roll/toss", true)
    }
    _onEndTurn() {
        duix.set("game/turn/end", true)
    }
    renderTime() {
        let mins = this.state.time.minutes
        let secs = this.state.time.seconds
        let minutes = mins
        let seconds = secs
        if (mins < 10) {
            minutes = `0${mins}`
        }
        if (secs < 10) {
            seconds = `0${secs}`
        }
        return `${minutes}:${seconds}`
    }
    //Render Method
    render() {
        let dice = []
        if (this.state.dice == null) {
            dice = ["1", "1"]
        } else {
            dice = this.state.dice
        }

        let turnState = mdiTimerSand
        if (this.state.turnState == "END") {
            turnState = mdiCheck
        }
        return <FlexGrid width={200} col className="turn" >
            <FlexGrid row onClick={this._onRollDice.bind(this)} style={{ margin: 5 }} className="dices">
                <span className={`dice dice-${dice[0]} dice-large`} title="Dice 0"></span>
                <span className={`dice dice-${dice[1]} dice-large`} title="Dice 1"></span>
            </FlexGrid>
            <FlexGrid row>
                <FlexGrid onClick={this._onEndTurn.bind(this)} className="turn">
                    <Icon icon={turnState} />
                </FlexGrid>
                <FlexGrid>
                    <p style={{ color: "white", fontSize: 30 }}>{this.renderTime()}</p>
                </FlexGrid>
            </FlexGrid>
        </FlexGrid>
    }
}
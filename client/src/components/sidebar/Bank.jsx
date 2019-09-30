





import React, { Component } from "react"
import duix from "duix"
import { Badge, Tooltip, Tabs } from "antd"

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"

import { mdiBank } from "@mdi/js"


import brickImage from "~imgs/brick.svg"
import lumberImage from "~imgs/lumber.svg"
import sheepImage from "~imgs/sheep.svg"
import rockImage from "~imgs/rock.svg"
import grainmage from "~imgs/grain.svg"
import devImage from "~imgs/dev.svg"

let Card = (props) => {
    let width = 70
    let height = 70
    let style = { backgroundImage: `url(${props.icon})`, margin: -3 }
    if (props.color) {
        style = { background: props.color, margin: -3 }
    }
    return <FlexGrid style={{ overflow: "hidden" }} width={width} height={height} className="card" >
        <Tooltip title={props.title ? props.title : "UNKNOWN"}>
            <FlexGrid center v h width={width} height={height} style={style}>
                <Badge count={props.amount ? props.amount : 0} showZero style={{ background: "black" }} />
            </FlexGrid>
        </Tooltip>
    </FlexGrid>
}



let Icon = (props) => (
    <svg style={{ width: 70, height: 70 }} viewBox="0 0 24 24">
        <path fill="white" d={props.icon} />
    </svg>
)

export default class Sidebar extends DuixComponent {
    constructor() {
        super()
        this.state = {
            cards: {
                "BRICK": 0,
                "LUMBER": 0,
                "STONE": 0,
                "SHEEP": 0,
                "GRAIN": 0,
                "DEVELOPMENT": 0
            }
        }
    }
    componentDidMount() {
        this.subscribe("game/bank/update", this.__UpdateBank.bind(this))
    }
    /**
     * UpdateDice - Update the number that was tossed
     * @param {Array} dice list of dice 
     */
    __UpdateBank(cards) {
        this.setState({ cards })

    }
    render() {
        return <FlexGrid
            height={150}
            width={300}
            className="bank"

        >
            <FlexGrid col height={80}>
                <Card icon={brickImage} title="BRICK" amount={this.state.cards["BRICK"]} />
                <Card icon={lumberImage} title="LUMBER" amount={this.state.cards["LUMBER"]} />
                <Card icon={rockImage} title="STONE" amount={this.state.cards["STONE"]} />
            </FlexGrid>
            <FlexGrid col>
                <Card icon={sheepImage} title="SHEEP" amount={this.state.cards["SHEEP"]} />
                <Card icon={grainmage} title="GRAIN" amount={this.state.cards["GRAIN"]} />
                <FlexGrid style={{ padding: 5 }}>
                    <Tooltip title="BANK">
                        <Icon icon={mdiBank} />
                    </Tooltip>
                </FlexGrid>
            </FlexGrid>
        </FlexGrid>
    }
}






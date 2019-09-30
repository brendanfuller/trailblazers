import React, { Component } from "react"
import duix from "duix"
import { Badge, Tooltip, Popover } from "antd"

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"
import { Container, Row, Col, Visible } from 'react-grid-system';

import brickImage from "~imgs/brick.svg"
import lumberImage from "~imgs/lumber.svg"
import sheepImage from "~imgs/sheep.svg"
import rockImage from "~imgs/rock.svg"
import grainmage from "~imgs/grain.svg"
import { mdiCardsVariant } from "@mdi/js"


let Card = (props) => {

    return <FlexGrid style={{ overflow: "hidden" }} width={75} height={100} className="card" >
        <Tooltip title={props.title ? props.title : "UNKNOWN"}>
            <FlexGrid center v h width="100%" height="100%" className="box" style={{ backgroundImage: `url(${props.icon})` }}>
                <Badge count={props.amount ? props.amount : 0} showZero style={{ background: "black" }} />
            </FlexGrid>
        </Tooltip>
    </FlexGrid>
}



let Icon = (props) => (
    <svg style={{ width: 100, height: 100 }} viewBox="0 0 24 24">
        <path d={props.icon} />
    </svg>
)

/**
 * Cards - A
 */
export default class Cards extends DuixComponent {
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
        this.subscribe("game/cards/collection", this.__UpdateCardCollection.bind(this))
    }
    /**
     * UpdateDice - Update the number that was tossed
     * @param {Array} dice list of dice 
     */
    __UpdateCardCollection(cards) {
        this.setState({ cards })
        this.forceUpdate();
    }
    renderCards() {
        return <FlexGrid col>
                <Card icon={brickImage} title="BRICK" amount={this.state.cards["BRICK"]} />
                <Card icon={lumberImage} title="LUMBER" amount={this.state.cards["LUMBER"]} />
                <Card icon={rockImage} title="STONE" amount={this.state.cards["STONE"]} />
                <Card icon={sheepImage} title="SHEEP" amount={this.state.cards["SHEEP"]} />
                <Card icon={grainmage} title="GRAIN" amount={this.state.cards["GRAIN"]} />
                {/*<Card icon={devImage} title="DEVELOPMENT CARD" amount={this.state.cards["DEVELOPMENT"]} /> */}
            </FlexGrid>
    }
    render() {
        return <FlexGrid col style={{ margin: 20 }} center h>

            <Visible xl>

                {this.renderCards()}

            </Visible>
            <Visible md sm lg>
                <Row>
                    <Col sm={3}>
                        <Popover content={this.renderCards()} className="shop-icon" title="Shop" trigger="hover">
                            <FlexGrid col width={90} height={100}>
                                <Icon icon={mdiCardsVariant} />
                            </FlexGrid>
                        </Popover>
                    </Col>
                </Row>
            </Visible>

        </FlexGrid>
    }
}
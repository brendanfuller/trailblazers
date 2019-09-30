import React, { Component } from "react"
import duix from "duix"
import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"

import { Popover, Tooltip, Badge } from "antd"
import { Container, Row, Col, Visible } from 'react-grid-system';

import brickImage from "~imgs/brick.svg"
import lumberImage from "~imgs/lumber.svg"
import sheepImage from "~imgs/sheep.svg"
import rockImage from "~imgs/rock.svg"
import grainmage from "~imgs/grain.svg"
import { mdiRoad, mdiHome, mdiCity, mdiCard, mdiShopping } from "@mdi/js"




let Icon = (props) => (
    <svg style={{ width: 100, height: 100 }} viewBox="0 0 24 24">
        <path d={props.icon} />
    </svg>
)


let Card = (props) => {

    return <FlexGrid style={{ margin: 10, overflow: "hidden" }} width={75} height={100} className="card" >
        <Tooltip title={props.title ? props.title : "UNKNOWN"}>
            <FlexGrid center v h width={70} height={100} className="box" style={{ backgroundImage: `url(${props.icon})` }}>
                <Badge count={props.amount ? props.amount : 0} showZero style={{ background: "black" }} />
            </FlexGrid>
        </Tooltip>
    </FlexGrid>
}



let roadContent = (
    <FlexGrid col>
        <Card icon={lumberImage} title="LUMBER" amount={1} />
        <Card icon={brickImage} title="BRICK" amount={1} />

    </FlexGrid>
)
let villageContent = (
    <FlexGrid col>
        <Card icon={lumberImage} title="LUMBER" amount={1} />
        <Card icon={brickImage} title="BRICK" amount={1} />
        <Card icon={grainmage} title="GRAIN" amount={1} />
        <Card icon={sheepImage} title="SHEEP" amount={1} />

    </FlexGrid>
)
let cityContent = (
    <FlexGrid col>
        <Card icon={grainmage} title="GRAIN" amount={2} />
        <Card icon={rockImage} title="STONE" amount={3} />

    </FlexGrid>
)
let devCardContent = (
    <FlexGrid col>
        <Card icon={grainmage} title="GRAIN" amount={1} />
        <Card icon={sheepImage} title="SHEEP" amount={1} />
        <Card icon={rockImage} title="STONE" amount={1} />
    </FlexGrid>
)

/**
 * shop
 * 
 * Where you can buy things
 * 
 */
export default class Shop extends DuixComponent {
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

    }
    _onBuyRoad() {
        duix.set("game/shop/buy", "ROAD")
    }
    _onBuyVillage() {
        duix.set("game/shop/buy", "VILLAGE")
    }
    _onBuyCity() {
        duix.set("game/shop/buy", "CITY")
    }
    _onBuyDevCard() {
        duix.set("game/shop/buy", "DEV_CARD")
    }
    renderContent() {
        return <Row>
            <Col sm={3}>
                <Popover content={roadContent} title="Road" trigger="hover">
                    <FlexGrid onClick={this._onBuyRoad.bind(this)} width={100} height={100} className="shop-icon">
                        <Icon icon={mdiRoad} />
                    </FlexGrid>
                </Popover>
            </Col>
            <Col sm={3}>
                <Popover content={villageContent} title="Village" trigger="hover">
                    <FlexGrid onClick={this._onBuyVillage.bind(this)} width={100} height={100} className="shop-icon">
                        <Icon icon={mdiHome} />
                    </FlexGrid>
                </Popover>
            </Col>
            <Col sm={3}>
                <Popover content={cityContent} title="City" trigger="hover">
                    <FlexGrid onClick={this._onBuyCity.bind(this)} width={100} height={100} className="shop-icon">
                        <Icon icon={mdiCity} />
                    </FlexGrid>
                </Popover>
            </Col>
            {/*} <Col sm={3}>
                <Popover content={devCardContent} title="Development Card" trigger="hover">
                    <FlexGrid onClick={this._onBuyDevCard.bind(this)} width={100} height={100} className="shop-icon">
                        <Icon icon={mdiCard} />
                    </FlexGrid>
                </Popover>
    </Col>*/}
        </Row>
    }
    //Render Method
    render() {
        return <FlexGrid center h v className="shop">
            <Visible xl>
                {this.renderContent()}
            </Visible>
            <Visible md sm lg>

                <Row>
                    <Col sm={3}>
                        <Popover content={this.renderContent()} className="shop-icon" title="Shop" trigger="hover">
                            <FlexGrid width={100} height={100}>
                                <Icon icon={mdiShopping} />
                            </FlexGrid>
                        </Popover>
                    </Col>
                </Row>
            </Visible>
        </FlexGrid >

    }
}
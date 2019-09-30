import React, { Component } from "react"
import duix from "duix"
import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"

import { Modal, Tooltip, InputNumber, Avatar, Badge } from "antd"

//Import Images
import brickImage from "~imgs/brick.svg"
import lumberImage from "~imgs/lumber.svg"
import sheepImage from "~imgs/sheep.svg"
import rockImage from "~imgs/rock.svg"
import grainmage from "~imgs/grain.svg"
import { mdiCardsVariant, mdiClose, mdiCheck, mdiBank } from "@mdi/js"


let User = (props) => {
    return <FlexGrid row height={50} background={props.color} className="user">
        <FlexGrid col className="user-info">
            <FlexGrid>
                <Avatar className="user-avatar" />
                <span className="user-name">{props.username}</span></FlexGrid>
        </FlexGrid>
    </FlexGrid>
}


let Card = (props) => {
    let type = () => {
        if (props.amount != null) {
            return <Badge count={props.amount ? props.amount : 0} showZero style={{ background: "black" }} />
        } else {
            return <InputNumber style={{ width: 50 }} size="small" min={0} max={props.max} defaultValue={0} onChange={props.onChange} />
        }
    }
    return <FlexGrid style={{ overflow: "hidden" }} width={75} height={100} className="card-no-hover" >
        <Tooltip title={props.title ? props.title : "UNKNOWN"}>
            <FlexGrid center v h width={70} height={100} className="box" style={{ backgroundImage: `url(${props.icon})` }}>
                {type()}
            </FlexGrid>
        </Tooltip>
    </FlexGrid>
}
/**
 * Icon
 * @param {Objevt} props 
 */
let Icon = (props) => (
    <svg style={{ width: 70, height: 70, color: props.color }} viewBox="0 0 24 24">
        <path fill={props.color} d={props.icon} />
    </svg>
)
/**
 * Trade - The Main UI for trading
 */
export default class Trade extends DuixComponent {
    constructor() {
        super()
        this.state = {
            creator: false,
            cards: {
                "BRICK": 0,
                "LUMBER": 0,
                "STONE": 0,
                "SHEEP": 0,
                "GRAIN": 0,
            },
            offer: {
                give: null,
                want: null
            },
            give: {},
            want: {},
            open: false
        }

    }
    componentDidMount() {
        this.subscribe("game/cards/collection", this.__UpdateCardCollection.bind(this))
        this.subscribe("game/trade/users", this.__UpdateTradeUsers.bind(this))
        this.subscribe("game/trade/offer", this.__UpdateTradeOffer.bind(this))
        this.subscribe("ui/trade/open", this.__UpdateTradeOpen.bind(this))
        this.subscribe("ui/trade/close", this.__UpdateTradeClose.bind(this))
    }
    createTrade(bank = false) {
        console.log("TRADE SELECT")
        if (this.state.creator == true) {
            duix.set("game/trade/create", {
                give: this.state.give,
                want: this.state.want,
                bank
            })
        } else {
            console.log("TRADE SELECT")
            duix.set("game/trade/select", true)
        }
    }
    cancelTrade() {
        if (this.state.creator == true) {
            duix.set("game/trade/cancel")
        } else {
            console.log("TRADE SELECT")
            duix.set("game/trade/select", false)
        }
    }
    /**
     * __UpdateTradeUsers - Update users who are trading.
     * @param {Object} users 
     */
    __UpdateTradeUsers(users) {
        this.setState({ users })
    }
    __UpdateTradeOffer(offer) {
        this.setState({ offer })
    }
    /**
     * __UpdateTradeOpen - Open Trade UI?
     * @param {String} location 
     */
    __UpdateTradeOpen(location) {
        if (location == "BUTTON") {
            this.setState({ open: true, creator: true })
        } else {
            this.setState({ open: true })
        }
    }
    /**
     * __UpdateTradeClose -  Close Trade UI
     */
    __UpdateTradeClose() {
        this.setState({
            creator: false,
            offer: {
                give: null,
                want: null
            },
            give: {},
            want: {},
            open: false
        })
    }
    /**
     * __UpdateCardCollection - Update Collection, used for max amount when trading
     * @param {*} cards 
     */
    __UpdateCardCollection(cards) {
        this.setState({ cards })
    }
    /**
     * onChangeGive - Event fired when the Number Input has changed
     * @param {String} type 
     * @param {Integer} amount 
     */
    onChangeGive(type, amount) {
        let give = this.state.give
        give[type] = amount;
        this.setState({ give })
    }
    /**
     * onChangeWant - Event fired when the Number Input has changed
     * @param {String} type 
     * @param {Integer} amount 
     */
    onChangeWant(type, amount) {
        let want = this.state.want
        want[type] = amount;
        this.setState({ want })
    }
    //Renders Users on the trade UI
    renderUsers() {
        let items = []
        for (let user in this.state.users) {
            let color = "orange"
            if (this.state.users[user].accepted == false) color = "red"
            items.push(<User key={user} color={color} username={this.state.users[user].name} />)
        }
        return items
    }
    //Render GIVE cards
    renderGive() {
        let give = {
            "BRICK": null,
            "LUMBER": null,
            "STONE": null,
            "SHEEP": null,
            "GRAIN": null,
        }
        if (this.state.offer.give) {
            give = this.state.offer.give
        }
        return <>
            <Card icon={brickImage} title="BRICK" amount={give["BRICK"]} max={this.state.cards["BRICK"]} onChange={this.onChangeGive.bind(this, "BRICK")} />
            <Card icon={lumberImage} title="LUMBER" amount={give["LUMBER"]} max={this.state.cards["LUMBER"]} onChange={this.onChangeGive.bind(this, "LUMBER")} />
            <Card icon={rockImage} title="STONE" amount={give["STONE"]} max={this.state.cards["STONE"]} onChange={this.onChangeGive.bind(this, "STONE")} />
            <Card icon={sheepImage} title="SHEEP" amount={give["SHEEP"]} max={this.state.cards["SHEEP"]} onChange={this.onChangeGive.bind(this, "SHEEP")} />
            <Card icon={grainmage} title="GRAIN" amount={give["GRAIN"]} max={this.state.cards["GRAIN"]} onChange={this.onChangeGive.bind(this, "GRAIN")} />
        </>
    }
    //RENDER WANT CARDS
    renderWant() {
        let want = {
            "BRICK": null,
            "LUMBER": null,
            "STONE": null,
            "SHEEP": null,
            "GRAIN": null,
        }
        if (this.state.offer.want) {
            want = this.state.offer.want
        }
        return <>
            <Card icon={brickImage} title="BRICK" max={10} amount={want["BRICK"]} onChange={this.onChangeWant.bind(this, "BRICK")} />
            <Card icon={lumberImage} title="LUMBER" max={10} amount={want["LUMBER"]} onChange={this.onChangeWant.bind(this, "LUMBER")} />
            <Card icon={rockImage} title="STONE" max={10} amount={want["STONE"]} onChange={this.onChangeWant.bind(this, "STONE")} />
            <Card icon={sheepImage} title="SHEEP" max={10} amount={want["SHEEP"]} onChange={this.onChangeWant.bind(this, "SHEEP")} />
            <Card icon={grainmage} title="GRAIN" max={10} amount={want["GRAIN"]} onChange={this.onChangeWant.bind(this, "GRAIN")} />
        </>
    }
    renderButtons() {
        let items = []
        let crossName = "Decline"
        let checkName = "Accept"
        if (this.state.creator == true) {
            crossName = "Cancel"
            checkName = "Create"
        }

        items.push(<FlexGrid style={{ cursor: "pointer" }} onClick={this.cancelTrade.bind(this)}>
            <Tooltip title={crossName}>
                <div style={{ height: 70, width: 70 }}>
                    <Icon icon={mdiClose} color="red" />
                </div>
            </Tooltip>
        </FlexGrid>)
        //Is this not the creator? and has the trade started?
        if (this.state.creator == false || this.state.offer.want == null) {
            items.push(<FlexGrid style={{ cursor: "pointer" }} onClick={this.createTrade.bind(this, false)}>
                <Tooltip title={checkName}>
                    <div style={{ height: 70, width: 70 }}>
                        <Icon icon={mdiCheck} color="green" />
                    </div>
                </Tooltip>
            </FlexGrid>)
        }
        //This is the creator
        if (this.state.creator == true) {
            items.push(<FlexGrid style={{ cursor: "pointer" }} onClick={this.createTrade.bind(this, true)}>
                <Tooltip title="Bank Trade">
                    <div style={{ height: 50, width: 50 }}>
                        <Icon icon={mdiBank} color="black" />
                    </div>
                </Tooltip>
            </FlexGrid>)
        }
        return items
    }
    render() {
        return <Modal
            width={800}
            visible={this.state.open}
            closable={false}
            onCancel={this.handleCancel}
            footer={null}
            bodyStyle={{ height: 405 }}>
            <FlexGrid col canvas>
                <FlexGrid row>
                    <FlexGrid height={40} center h>
                        <h1>Give</h1>
                    </FlexGrid>
                    <FlexGrid col>
                        {this.renderGive()}
                    </FlexGrid>
                    <FlexGrid height={40} center h>
                        <h1>Want</h1>
                    </FlexGrid>
                    <FlexGrid col>
                        {this.renderWant()}
                    </FlexGrid>
                    <FlexGrid center h row>
                        <FlexGrid col>
                            {this.renderButtons()}
                        </FlexGrid>
                    </FlexGrid>
                </FlexGrid>
                <FlexGrid row>
                    <FlexGrid height={30} center h>
                        <h1>Trader's</h1>
                    </FlexGrid>
                    <FlexGrid row className="users" scrollY background="gray" style={{ borderRadius: 10, marginLeft: 25 }}>
                        <div style={{ paddingRight: 0 }}>
                            {this.renderUsers()}
                        </div>
                    </FlexGrid>
                </FlexGrid>
            </FlexGrid>
        </Modal>
    }
}
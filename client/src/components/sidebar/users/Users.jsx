

import React, { Component } from "react"
import duix from "duix"
import { Input, Avatar } from "antd"

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


import { mdiCards, mdiStar, mdiShieldHalfFull, mdiCardsVariant, mdiRoadVariant } from '@mdi/js';


let Icon = (props) => (
    <svg style={{ width: 30, height: 30 }}>
        <path d={props.icon} />
    </svg>
)

let InfoItems = (props) => (
    <FlexGrid col className="item">
        <FlexGrid width={30}>
            <Icon icon={props.icon} />
        </FlexGrid>
        <FlexGrid>
            <p>{props.count}</p>
        </FlexGrid>
    </FlexGrid>

)


let User = (props) => {

    let background = ""
    if (props.bold) {
        background = "maroon"
    }
    return <FlexGrid row height={90} background={props.color} className="user">
        <FlexGrid col className="user-info">
            <FlexGrid>
                <Avatar className="user-avatar" />
                <span className="user-name">{props.username}</span></FlexGrid>
            <FlexGrid col width={50} className="user-triumph">
                <FlexGrid> <Icon icon={mdiStar} /></FlexGrid>
                <FlexGrid>
                    {props.points}
                </FlexGrid>
            </FlexGrid>
        </FlexGrid>
        <FlexGrid col className="user-specs" background={background}>
            <InfoItems icon={mdiCards} count={props.card} />
            <InfoItems icon={mdiCardsVariant} count={props.devCard} />
            <InfoItems icon={mdiRoadVariant} count={props.road} />

        </FlexGrid>
    </FlexGrid>
}


export default class Chat extends DuixComponent {
    constructor() {
        super()
        this.state = {
            users: null
        }
    }
    /**
     * componentDidMount
     */
    componentDidMount() {
        this.subscribe("game/users/list", this.__UpdateUsersList.bind(this))
        this.subscribe("game/session", this.__UpdateSession.bind(this))
    }
    /**
     * UpdateDice - Update the number that was tossed
     * @param {Array} dice list of dice 
     */
    __UpdateUsersList(users) {
        this.setState({ users })
   
    }
    __UpdateSession(session) {
        this.setState({session})
    }
    render() {
        if (this.state.users != null) {
            let users = []
            for (let index in this.state.users) {
                let object = this.state.users[index]
                let session = object.session ? object.session : null;
                let user = object.username ? object.username : "Unknown"
                let color = object.color ? object.color : "red"
                let card = object.card ? object.card : 0
                let devCard = object.devCard ? object.devCard : 0
                let army = object.army ? object.army : 0 
                let road = object.road ? object.road : 0
                let points = object.point ? object.point : 0
                let bold = false
                if (this.state.session == session) {
                    bold = true
                }
                users.push(<User bold={bold} key={user} username={user} color={color} card={card} devCard={devCard} army={army} road={road} points={points}/>)
            
            }
            users.push(<div style={{height: 50}}></div>)
            return <FlexGrid row className="users" scrollY>
                <div style={{ paddingRight: 0 }}>
                    {users}
                </div>
            </FlexGrid>
        } else {
            return null
        }
    }
}
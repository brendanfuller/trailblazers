

import React, { Component } from "react"
import duix from "duix"
import { Input } from "antd"

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


let Message = (props) => {
    return <div className="message">
        <p><span className="user">{props.user}</span>: <span>{props.message}</span></p>
    </div>
}


export default class Chat extends DuixComponent {
    constructor() {
        super()
        this.state = {
            messages: [
          
            ],
            message: "",
            oldMessage: ""
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
        this.subscribe("game/chat/update", this.__UpdateChat.bind(this))
    }
    /**
     * UpdateNewPost - Update messages by adding the new message to the list of messages
     * @param {Array} dice list of dice 
     */
    __UpdateChat(message) {
        let messages = this.state.messages
        messages.unshift(message)
        this.setState({ messages })
        this.forceUpdate();
    }

    _onSubmit(event) {
        if (event.key === "Enter" && this.state.message != this.state.oldMessage && this.state.message != "" && this.state.message != null) {
            duix.set("game/chat/message", this.state.message)
            let message = this.state.message
            console.log(message)
            console.log(this.state)
            this.setState({ message: "", oldMessage: message })
            this.forceUpdate();
        }

    }
    _onInput(event) {
        this.setState({ message: event.currentTarget.value })
        this.forceUpdate();
    }
    renderMessages() {
        let items = []
        for (let message in this.state.messages) {
            let info = this.state.messages[message]
            items.push(<Message key={message} user={info.user} message={info.message} />)
        }
        return items
    }
    render() {
        return <FlexGrid row className="chat">
            <FlexGrid scrollY>
                <div style={{ paddingRight: 20 }}>
                    {this.renderMessages()}

                </div>
            </FlexGrid>
            <FlexGrid className="input" height={70}>
                <Input value={this.state.message} onKeyDown={this._onSubmit.bind(this)} onInput={this._onInput.bind(this)}></Input>
            </FlexGrid>
        </FlexGrid>
    }
}


import React, { Component } from "react"
import duix from "duix"
import { Timeline } from "antd"

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


export default class TimelineSidebar extends DuixComponent {
    constructor() {
        super()
        this.state = {
            list: [{
                title: "?",
                message: "Welcome"
            }]
        }
    }
    componentDidMount() {
        this.setState({list: duix.get("game/timeline")})
        this.subscribe("game/timeline", this.__UpdateTimeline.bind(this))
    }
    __UpdateTimeline(list) {
        this.setState({ list })
    }
    renderList() {
        let items = []
        for (let i in this.state.list) {
            let notification = this.state.list[i]
            items.push(<Timeline.Item key={i}>{notification.message}</Timeline.Item>)
        }
        return items
    }
    render() {
        return <FlexGrid scrollY style={{ color: "white", padding: 10, margin: 5, borderRadius: 5, marginBottom: 20 }} background="white">
            <Timeline>
                {this.renderList()}
            </Timeline>
        </FlexGrid>
    }
}


import React, { Component } from "react"
import duix from "duix"
import { Badge, Tooltip, Tabs } from "antd"
const { TabPane } = Tabs



import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


import Chat from "./chat/Chat"
import Users from "./users/Users"
import Timeline from "./timeline/Timeline"
import Bank from "./Bank"
export default class Sidebar extends DuixComponent {
    constructor() {
        super()
    }
    render() {
        return <FlexGrid
            height="100vh"
            width={300}
            id="sidebar"
            row
        >
            <div id="corner">
                <div className="background">
                </div>
            </div>

            <FlexGrid row className="tabs">
                <FlexGrid className="card-container" style={{ overflow: "hidden" }}>
                    <Tabs type="card" animated={false} >
                        <TabPane tab="Users" key="1" >
                            <Users />
                        </TabPane>
                        <TabPane tab="Chat" key="2"  >
                            <Chat />
                        </TabPane>
                        <TabPane tab="Timeline" key="3"  >
                            <Timeline />
                        </TabPane>

                    </Tabs>
                </FlexGrid>
                <Bank />
            </FlexGrid>

        </FlexGrid>
    }
}
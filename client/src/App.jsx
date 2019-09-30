import React, { Component } from "react"
import duix from "duix"

import "./app.less"
import 'antd/dist/antd.css';
import './style/dice.css';

import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


import { Modal, Input } from "antd"


import Sidebar from "./components/sidebar/Sidebar"
import Footer from "./components/footer/Footer"
import Area from "./components/game/Area"
import Trade from "./components/Trade"


const { info } = Modal;
import { hot } from 'react-hot-loader';

import Trailblazers from "./Trailblazers"

/**
 * APP 
 * The core of Trailblazers client
 * 
 * 
 */
class App extends DuixComponent {
    constructor() {
        super();
        this.state = {
            width: 0,
            username: ""
        };
    }
    componentDidMount() {
        this.subscribe("game/road/select", this.__SelectRoad.bind(this))
        this.subscribe("ui/username/show", this.__ShowUsername.bind(this))
        new Trailblazers(); //Boot up the General Pass through
    }
    /**
     * SelectRoad - The value of selecting when selecting a road
     * @param {String} value 
     */
    __SelectRoad(value) {
        duix.set("game/road/show", false)
    }
    //Submit via the enter key (on press down)
    _onSubmit(event) {
        if (event.key === "Enter" && this.state.username != "" && this.state.username != null || event === true) {
            duix.set("game/username", this.state.username)
            this.modal.destroy()
        }
    }
    //When You hit the ok button on the submit dialog
    _onSubmitOk() {
        if (this.state.username != "" && this.state.username != null || event === true) {
            duix.set("game/username", this.state.username)
            this.modal.destroy()
        } else {
            //if we have no username, just reopen the dialog, as it automatically closes
            this.__ShowUsername()
        }
    }
    //Username Input
    _onInput(event) {
        this.setState({ username: event.currentTarget.value })
    }
    //Shows Username Dialog
    __ShowUsername(value) {
        let self = this
        this.modal = info({
            title: "Enter Username",
            content: <Input onKeyDown={this._onSubmit.bind(this)} onInput={this._onInput.bind(this)}></Input>,
            icon: null,
            keyboard: false,
            onOk: () => {
                self._onSubmitOk(true)
            }
        });
    }
    render() {
        return (
            <FlexGrid canvas height="100vh" width="100vw">
                <FlexGrid row>
                    <FlexGrid col>
                        <Area />
                    </FlexGrid>
                    <Footer />
                </FlexGrid>
                <Sidebar />
                <Trade />
            </FlexGrid>
        );
    }
}
export default App
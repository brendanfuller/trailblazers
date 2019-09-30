import React, {Component} from "react"
import duix from "duix"



export default class DuixComponent extends Component {
    constructor() {
        super()
        this.unsubscribe = []
    }
    subscribe(name, callback) {
        let sub = duix.subscribe(name, callback)
        this.unsubscribe.push(sub)
        return sub
    }
    componentWillUnmount() {
        for (node in this.unsubscribe) {
            this.unsubscribe[node]()
        }
    }
}

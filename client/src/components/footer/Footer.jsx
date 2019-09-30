import React, { Component } from "react"
import duix from "duix"
import DuixComponent from "~src/lib/duix"
import FlexGrid from "~src/lib/grid"


import Cards from "./Cards"
import Turn from "./Turn"
import Shop from "./Shop"


/**
 * Footer
 * 
 * The footer is the bottom part of the game area which incliudes
 * - Cards
 * - Shop
 * - Trade
 * - Turn State
 * - Dice
 * 
 * 
 */
export default class Footer extends DuixComponent {
    render() {
        return <FlexGrid col height={150} background="lightgray" id="footer">
            <Cards />
            <Shop/>
            <Turn />
        </FlexGrid>
    }
}
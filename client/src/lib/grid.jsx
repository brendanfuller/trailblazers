import React, { Component } from "react";
import classNames from "classnames";
//Import Generic Styles
import "./grid.css"
export default class Grid extends Component {
  render() {
    let id = this.props.id || "";
    const {
      className,
      style,
      v,
      h,
      center,
      col,
      row,
      canvas,
      scrollX,
      scrollY,
      grow,
      ...props
    } = this.props;
    let gridClass = classNames({
      "flex--grid": true,
      "flex--grid--col": col & !center || (canvas && !col),
      "flex--grid--row": row & !center,
      scrollY: scrollY,
      scrollX: scrollX
    });
    let gridStyle = {};
    if (this.props.background) {
      gridStyle.backgroundColor = this.props.background;
    }
    //Change the background
    if (this.props.width) {
      gridStyle.flex = "0 0 auto";
      gridStyle.width = this.props.width;
    }
    //Change the height
    if (this.props.height) {
      gridStyle.flex = "0 0 auto";
      gridStyle.height = this.props.height;
    }
    if (this.props.canvas) {
      id = "flex--grid--canvas";
    }
    let _id = "?";
    if (this.props.id) {
      _id = this.props.id;
    }
    if (scrollX) {
      gridStyle.overflowY = "auto";
      gridStyle.overflow = "overlay";
    }
    if (scrollY) {
      gridStyle.overflowX = "auto";
      gridStyle.overflow = "overlay";
    }
    let children = this.props.children;
    if (grow) {
        gridStyle.flexGrow = grow
    }
    if (center) {
      gridStyle.display = "flex";
      //Check if the CENTER is
      if (this.props.h) {
        gridStyle.justifyContent = "center";
      }
      //Check if the CENTER is going to be centered HORIZONTALLY
      if (this.props.v) {
        gridStyle.alignItems = "center";
      }
      //Wrap it
      children = <div> {this.props.children} </div>;
    }
    return (
      <div
        ref={this.props.gridRef}
        className={classNames(gridClass, this.props.className)}
        id={id}
        style={{ ...gridStyle, ...this.props.style }}
        {...props}
      >
        {children}
      </div>
    );
  }
}

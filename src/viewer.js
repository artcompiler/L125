/* Copyright (c) 2017, Art Compiler LLC */
/* @flow */
import {
  assert,
  message,
  messages,
  reserveCodeRange,
  decodeID,
  encodeID,
} from "./share.js";
import * as React from "react";
import * as d3 from "d3";
function loadAPI(resume) {
  let src = "https://www.desmos.com/api/v0.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
  let script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  script.onload = resume;
  document.head.appendChild(script); //or something of the likes
}
window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  var Viewer = React.createClass({
    calculator: undefined,
    calculatorState: undefined,
    componentDidMount() {
      loadAPI(() => {
        var elt = document.getElementById('calculator');
        this.calculator = Desmos.GraphingCalculator(elt, {
          keyboard: false,
          expressions: false,
          graphpaper: true,
          settingsMenu: false,
          zoomButtons: false,
          expressionsTopbar: false,
          pointsOfInterest: false,
          border: true,
          expressionsCollapsed: true,
        });
        this.interval = setInterval(() => {
          let state = this.calculator.getState();
          if (!this.calculatorState) {
            this.calculatorState = state;
          } else if (JSON.stringify(this.calculatorState) !== JSON.stringify(state)) {
            this.calculatorState = state;
            window.gcexports.dispatcher.dispatch({
              "L125": {
                data: {
                  calculatorState: state,
                },
              }
            });
          }
        }, 1000);
        let obj = this.props.obj;
        this.calculator.setBlank();
        this.calculator.updateSettings({
          showGrid: obj.showGrid || false,
          showXAxis: obj.showXAxis || false,
          showYAxis: obj.showYAxis || false,
        });
        let data = [].concat(obj.exprs ? obj.exprs : obj);
        data.forEach((expr) => {
          if (typeof expr === "string") {
            expr = {
              latex: expr,
            };
          }
          this.calculator.setExpression(expr);
        });
        this.componentDidUpdate();
      });
    },
    componentDidUpdate() {
      if (this.calculator && this.props.calculatorState) {
        this.calculator.setState(this.props.calculatorState);
      }
    },
    render() {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      let width = this.props.obj.width || "600px";
      let height = this.props.obj.height || "400px"
      return (
        <div id="calculator" style={{
          "width": width,
          "height": height,
        }}></div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

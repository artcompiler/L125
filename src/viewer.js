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
        this.componentDidUpdate();
      });
    },
    componentDidUpdate() {
      this.calculator.setBlank();
      this.calculator.updateSettings({
        showGrid: false,
        showXAxis: false,
        showYAxis: false,
      });
      let data = [].concat(this.props.obj);
      data.forEach((d) => {
        this.calculator.setExpression({
          latex: d,
        });
      });
    },
    render() {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      return (
        <div id="calculator" style={{
          "width": "600px",
          "height": "400px",
        }}></div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

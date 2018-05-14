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
    interval: undefined,
    timer: undefined,
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
          // Check for state changes. Set a timer to wait for user pause
          // of 1 second before saving state.
          let state = this.calculator.getState();
          if (!this.calculatorState) {
            this.calculatorState = state;
          } else if (JSON.stringify(this.calculatorState) !== JSON.stringify(state)) {
            // calculatorState has changed so set timer for save.
            this.calculatorState = state;
            let timer = this.timer;
            if (timer) {
              // Reset timer to wait another second pause.
              window.clearTimeout(timer);
            }
            this.timer = window.setTimeout(function () {
              // It's been 1000ms since last change, so save it.
              let state = {}
              state[window.gcexports.id] = {
                data: {
                  calculatorState: state,
                },
              };
              window.gcexports.dispatcher.dispatch(state);
            }, 1000);
          }
        }, 100);
        this.componentDidUpdate();
      });
    },
    updateCode() {
      let obj = this.props.obj;
      let graph = {
        showGrid: obj.showGrid || false,
        showXAxis: obj.showXAxis || false,
        showYAxis: obj.showYAxis || false,
      };
      this.calculator.updateSettings(graph);
      let exprs = [].concat(obj.exprs ? obj.exprs : obj);
      exprs.forEach((expr) => {
        if (typeof expr === "string") {
          expr = {
            latex: expr,
          };
        }
        this.calculator.setExpression(expr);
      });
    },
    componentDidUpdate() {
      if (!this.calculator) {
        return;
      }
      // Three states:
      //             | code      | state
      // State       | old | new | old | new
      // ------------|-----|-----|-----|-----|-----------
      // Reload      | N   | Y   | N   | ?   | setState + setCode
      // New code    | Y   | Y   | ?   | ?   | clrState + setCode
      // User action | Y   | N   | ?   | Y   | saveState
      // [1] Move, edit, reload needs to apply latest code.
      // [2] Move needs to apply state.
      if (!this.lastOBJ) {
        if (this.props.calculatorState) {
          this.calculator.setState(this.props.calculatorState);
        } else if (this.props.obj.bounds) {
          // Set bounds if first time through and not state
          this.calculator.setMathBounds(this.props.obj.bounds);
        }
        this.updateCode();
      } else if (JSON.stringify(this.lastOBJ) !== JSON.stringify(this.props.obj)) {
        // Code changed so clear user state.
        this.calculator.setBlank();
        this.updateCode();
        if (this.props.obj.bounds) {
          // Set bounds if code changes.
          this.calculator.setMathBounds(this.props.obj.bounds);
        }
      }
      this.lastOBJ = this.props.obj;
      this.calculatorState = this.calculator.getState();
    },
    render() {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      let width = this.props.obj.width || "600px";
      let height = this.props.obj.height || "400px"
      return (
        <div>
          <link rel="stylesheet" href="https://l125.artcompiler.com/style.css" />
          <div className="L116 viewer">
          <div id="calculator" style={{
          "width": width,
          "height": height,
          }}>
          </div>
          </div>
        </div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

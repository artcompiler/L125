"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compiler = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* Copyright (c) 2016, Art Compiler LLC */


var _share = require("./share.js");

(0, _share.reserveCodeRange)(1000, 1999, "compile");
_share.messages[1001] = "Node ID %1 not found in pool.";
_share.messages[1002] = "Invalid tag in node with Node ID %1.";
_share.messages[1003] = "No async callback provided.";
_share.messages[1004] = "No visitor method defined for '%1'.";

var transform = function () {
  var table = {
    // v1
    "PROG": program,
    "EXPRS": exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD": add,
    "MUL": mul,
    "VAL": val,
    "KEY": key,
    "LEN": len,
    "STYLE": style,
    "CONCAT": concat,
    "ARG": arg,
    "IN": inData,
    "LAMBDA": lambda,
    "PAREN": paren,
    "WIDTH": width,
    "HEIGHT": height,
    "BOUNDS": bounds,
    "SHOW-GRID": showGrid,
    "SHOW-X-AXIS": showXAxis,
    "SHOW-Y-AXIS": showYAxis,
    "MAP": map,
    "COLOR": color
  };
  var nodePool = void 0;
  var version = void 0;
  function getVersion(pool) {
    return pool.version ? +pool.version : 0;
  }
  function transform(code, data, resume) {
    nodePool = code;
    version = getVersion(code);
    return visit(code.root, data, resume);
  }
  function error(str, nid) {
    return {
      str: str,
      nid: nid
    };
  }
  function visit(nid, options, resume) {
    (0, _share.assert)(typeof resume === "function", (0, _share.message)(1003));
    // Get the node from the pool of nodes.
    var node = void 0;
    if ((typeof nid === "undefined" ? "undefined" : _typeof(nid)) === "object") {
      node = nid;
    } else {
      node = nodePool[nid];
    }
    (0, _share.assert)(node, (0, _share.message)(1001, [nid]));
    (0, _share.assert)(node.tag, (0, _share.message)(1001, [nid]));
    (0, _share.assert)(typeof table[node.tag] === "function", (0, _share.message)(1004, [JSON.stringify(node.tag)]));
    return table[node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  function str(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function num(node, options, resume) {
    var val = node.elts[0];
    resume([], +val);
  }
  function ident(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function bool(node, options, resume) {
    var val = node.elts[0];
    resume([], !!val);
  }
  function concat(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var str = "";
      if (val1 instanceof Array) {
        val1.forEach(function (v) {
          str += v;
        });
      } else {
        str = val1.toString();
      }
      resume(err1, str);
    });
  }
  function paren(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      resume(err1, val1);
    });
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "LIST",
          elts: node.elts.slice(1)
        };
        list(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function inData(node, options, resume) {
    var data = options.data ? options.data : [];
    resume([], data);
  }
  function arg(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), options.args[key]);
    });
  }
  function color(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        if (typeof val2 === "string") {
          val2 = {
            latex: val2
          };
        }
        val2.color = val1;
        resume([].concat(err1).concat(err2), val2);
      });
    });
  }
  function style(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        if (typeof val2 === "string") {
          val2 = {
            latex: val2
          };
        }
        val2.style = val1;
        resume([].concat(err1).concat(err2), val2);
      });
    });
  }
  function args(node, options, resume) {
    resume([], options.args);
  }
  function lambda(node, options, resume) {
    // Return a function value.
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), val2);
      });
    });
  }
  function width(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      visit(node.elts[1], options, function (err1, val1) {
        if (!val1.exprs) {
          val1 = {
            exprs: val1
          };
        }
        val1.width = val0;
        resume([].concat(err0).concat(err1), val1);
      });
    });
  }
  function height(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      visit(node.elts[1], options, function (err1, val1) {
        if (!val1.exprs) {
          val1 = {
            exprs: val1
          };
        }
        val1.height = val0;
        resume([].concat(err0).concat(err1), val1);
      });
    });
  }
  function bounds(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      visit(node.elts[1], options, function (err1, val1) {
        if (!val1.exprs) {
          val1 = {
            exprs: val1
          };
        }
        var left = void 0,
            right = void 0,
            bottom = void 0,
            top = void 0;
        if (isFinite(+val0)) {
          left = bottom = -val0;
          top = right = -left;
        } else if (val0 instanceof Array) {
          if (val0.length === 1) {
            left = bottom = -val0[0];
            right = top = -left;
          } else if (val0.length === 2) {
            left = bottom = +val0[0];
            right = top = +val0[1];
          } else if (val0.length === 4) {
            left = +val0[0];
            bottom = +val0[1];
            top = +val0[2];
            right = +val0[3];
          }
        }
        (0, _share.assert)(isFinite(left) && isFinite(right) && isFinite(top) && isFinite(bottom), "bounds() expected array");
        val1.bounds = {
          left: left,
          right: right,
          top: top,
          bottom: bottom
        };
        resume([].concat(err0).concat(err1), val1);
      });
    });
  }
  function showGrid(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      if (!val0.exprs) {
        val0 = {
          exprs: val0
        };
      }
      val0.showGrid = true;
      resume([].concat(err0), val0);
    });
  }
  function showXAxis(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      if (!val0.exprs) {
        val0 = {
          exprs: val0
        };
      }
      val0.showXAxis = true;
      resume([].concat(err0), val0);
    });
  }
  function showYAxis(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[0], options, function (err0, val0) {
      if (!val0.exprs) {
        val0 = {
          exprs: val0
        };
      }
      val0.showYAxis = true;
      resume([].concat(err0), val0);
    });
  }
  function map(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[1], options, function (err1, val1) {
      // args
      var errs = [];
      var vals = [];
      val1.forEach(function (val) {
        options.args = [val];
        visit(node.elts[0], options, function (err0, val0) {
          vals.push(val0);
          errs = errs.concat(err0);
        });
      });
      resume(errs, vals);
    });
  }
  function binding(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), { key: val1, val: val2 });
      });
    });
  }
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1)
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = {};
        val[val1.key] = val1.val;
        resume([].concat(err1), val);
      });
    } else {
      resume([], {});
    }
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "EXPRS",
          elts: node.elts.slice(1)
        };
        exprs(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, function (err, val) {
      // Return the value of the last expression.
      resume(err, val.pop());
    });
  }
  function key(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), Object.keys(obj)[key]);
      });
    });
  }
  function val(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), obj[key]);
      });
    });
  }
  function len(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var obj = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), obj.length);
    });
  }
  function add(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 + val2);
      });
    });
  }
  function mul(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 * val2);
      });
    });
  }
  return transform;
}();
var render = function () {
  function escapeXML(str) {
    return String(str).replace(/&(?!\w+;)/g, "&amp;").replace(/\n/g, " ").replace(/\\/g, "\\\\").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function render(val, resume) {
    // Do some rendering here.
    resume([], val);
  }
  return render;
}();
var compiler = exports.compiler = function () {
  exports.version = "v1.0.0";
  exports.compile = function compile(code, data, resume) {
    // Compiler takes an AST in the form of a node pool and transforms it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      var options = {
        data: data
      };
      transform(code, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          render(val, function (err, val) {
            resume(err, val);
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume(["Compiler error"], {
        score: 0
      });
    }
  };
}();
"use strict";
const colors = require('colors');
const _ = require('lodash');

colors.setTheme({
  print: ["white", "bold"],
  completed: ["green", "bold"],
  failed: ["red", "bold"],
  header: ["cyan", "bold"]
});

module.exports = {
  print: function (...args) {
    const next = withNewLine(args);
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚       '.print, ...transform("print", args)]);
  },

  completed: function (...args) {
    const next = withNewLine(args);
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚  ✔    '.completed, ...transform("completed", args)]);
  },

  failed: function (...args) {
    const next = withNewLine(args);
    console.log.apply(console, [next ? '\n' : '', '⮚⮚⮚⮚⮚  ✘    '.failed, ...transform("failed", args)]);
  },

  header: function (data) {
    console.log(String('\n\t\t °°°·.°·..·°¯°·._.· ' + data + ' ·._.·°¯°·.·° .·°°°\n').header);
  }
};


function transform(type, args) {
  return _.flatten(args.map(function (el) {
    return typeof el === "object" ? ["\n", el] : String(el)[type];
  }), true);
}

function withNewLine(args) {
  if (args.length > 1) {
    if (typeof args[args.length - 1] === 'boolean') {
      return args[args.length - 1];
    }
  }
  return false;
}
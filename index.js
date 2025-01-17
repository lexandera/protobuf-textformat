"use strict";

var parse = require('./src/parser')

function buildMessageFromAST(message, ast) {
  ast.map(function(entry) {
    var value;
    var field = message.$type.fields[entry.name];
    if (!field) {
      return;
    }
    if (entry.type === 'pair') {
      value = entry.value;
    } else if (entry.type === 'message') {
      var ChildMessageClass = field.resolvedType;
      if (!ChildMessageClass) {
        return;
      }
      var value = ChildMessageClass.create();
      buildMessageFromAST(value, entry.values);
    }

    if (field.repeated) {
      message[entry.name].push(value);
    } else {
      message[entry.name] = value;
    }
  });
};

module.exports.parse = function(root, fqn, input) {
  var MessageClass = root.lookupType(fqn);
  var message = MessageClass.create();

  var result = parse(input);

  if (result.status) {
    buildMessageFromAST(message, result.value);
    result.message = message;
  }
  return result;
};


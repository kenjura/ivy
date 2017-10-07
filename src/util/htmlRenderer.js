const fs = require('fs');

module.exports = function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));

    var raw = content.toString();
    var rendered = raw.replace( /\{\{([^}]+)\}\}/g , function(em,g1) {
      try { return eval('options.'+g1) } catch(e) { return '??eval error??' }
    });
    return callback(null, rendered);
  });
}
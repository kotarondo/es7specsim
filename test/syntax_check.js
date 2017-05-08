var fs = require('fs');
var path = require('path');
var vm = require('vm');

var filenames = [
    "helper.js",
    "5-notational-conventions.js",
    "6-data-types-and-values.js",
    "7-abstract-operations.js",
    "8-executable-code-and-execution-contexts.js",
    "9-ordinary-and-exotic-objects-behaviours.js",
    //TODO 10,11
    "12-expressions.js",
    "13-statements-and-declarations.js",
    "14-functions-and-classes.js",
    "15-scripts-and-modules.js",
];

for (var filename of filenames) {
    var text = fs.readFileSync(path.join(__dirname, "..", "src", filename), "utf8");
    vm.runInThisContext(text, {
        filename: filename,
        displayErrors: true,
    });
}

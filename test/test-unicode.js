var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var filenames = [
    "unicode.js",
];

for (var filename of filenames) {
    var text = fs.readFileSync(path.join(__dirname, "..", "src", filename), "utf8");
    vm.runInThisContext(text, {
        filename: filename,
        displayErrors: true,
    });
}

var count = 0;
for (var i = 0; i < 0x100000; i++) {
    var c = String.fromCodePoint(i);
    if (isUnicodeZs(c)) count++;
}
assert(count === 17);

var count = 0;
for (var i = 0; i < 0x100000; i++) {
    var c = String.fromCodePoint(i);
    if (isUnicodeIDStart(c)) count++;
}
assert(count === 109830);

var count = 0;
for (var i = 0; i < 0x100000; i++) {
    var c = String.fromCodePoint(i);
    if (isUnicodeIDContinue(c)) count++;
}
assert(count === 112352);

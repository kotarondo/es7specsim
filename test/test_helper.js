var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var text = fs.readFileSync(path.join(__dirname, "..", "src", "helper.js"), "utf8");
vm.runInThisContext(text, {
    filename: "helper.js",
    displayErrors: true,
});

assert(get_symbol_description(Symbol('test desc')) === 'test desc');

assert(is_negative_zero(-0) === true);
assert(is_negative_zero(+0) === false);

assert(['a', 'b', 'c'].contains('test') === false);
assert([0, 'test', 2].contains('test') === true);

assert('test'.is_an_element_of(['a', 'b', 'c']) === false);
assert('test'.is_an_element_of([0, 'test', 2]) === true);

assert(['test', 1, 'test'].contains_any_duplicate_entries() === true);
assert([0, '0'].contains_any_duplicate_entries() === false);

assert([0, 'test'].also_occurs_in(['test', 1]) === true);
assert([0, '1'].also_occurs_in(['0', 1]) === false);

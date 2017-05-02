var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var Production = {};

function strip(e) {
    return e.split(/[[:]/)[0];
}

function isref(e) {
    return (/[A-Z]/.exec(e[0]) !== null);
}

function rename(e, i, names) {
    var r;
    var k = 0;
    for (var j = 0; j < names.length; j++) {
        if (names[j] !== e) continue;
        k++;
        if (i === j) {
            r = k;
        }
    }
    assert(k > 0);
    if (k === 1) return e;
    return e + r;
}

function expandOpts(elems, func) {
    for (var i = 1; i < elems.length; i++) {
        if (elems[i] === null) continue;
        var j = elems[i].indexOf("[opt]");
        if (j > 0) {
            var elems = elems.slice();
            elems[i] = elems[i].substring(0, j);
            expandOpts(elems, func);
            elems[i] = null
            expandOpts(elems, func);
            return;
        }
    }
    func(elems);
}

global.Syntax = function(a) {
    for (var p of a) {
        var elems = p.split(' ');
        var refs = elems.slice(1).filter(isref).map(strip).map(rename);
        expandOpts(elems, createProduction.bind(null, refs));
    }
};

function createProduction(refs, elems) {
    var name = strip(elems[0]) + ":";
    for (var i = 1; i < elems.length; i++) {
        if (elems[i] === null) continue;
        if (isref(elems[i])) {
            name += " " + strip(elems[i]);
        } else {
            name += " " + elems[i];
        }
    }
    if (name in Production) {
        console.log("duplicate production", name);
        return;
    }
    Production[name] = function(params, prods) {
        this.params = params;
        for (var i = 0; i < prods.length; i++) {
            this[i] = prods[i];
        }
    }
    var proto = Production[name].prototype;
    refs.forEach((e, i) => {
        if (e in proto) {
            console.log("duplicate term/nonterm", refs);
            return;
        }
        Object.defineProperty(proto, e, { Get: () => this[i] });
    });
    // console.log("createProduction", name, refs);
}

global.Static_Semantics = function(method, a) {
    var prods = [];
    for (var i = 0; i < a.length; i++) {
        if (typeof a[i] === 'string') {
            var elems = a[i].split(' ');
            expandOpts(elems, function(elems) {
                var name = elems[0];
                for (var i = 1; i < elems.length; i++) {
                    if (elems[i] === null) continue;
                    name += " " + elems[i];
                }
                prods.push(name);
            });
            continue;
        }
        for (var j = 0; j < prods.length; j++) {
            var name = prods[j];
            if (!(name in Production)) {
                console.log("unknown production", name);
                continue;
            }
            var proto = Production[name].prototype;
            if (method in proto) {
                if (method === 'Early Errors') {
                    if (!Array.isArray(proto[method])) {
                        proto[method] = [proto[method]];
                    }
                    proto[method].push(a[i]);
                    continue;
                }
                console.log("duplicate method", method, name);
                continue;
            }
            proto[method] = a[i];
        }
        prods = [];
    }
};

global.Runtime_Semantics = global.Static_Semantics;

var filenames = [
    "12-expressions.js",
    "13-statements-and-declarations.js",
];

for (var filename of filenames) {
    var text = fs.readFileSync(path.join(__dirname, "..", "src", filename), "utf8");
    vm.runInThisContext(text, {
        filename: filename,
        displayErrors: true,
    });
}

console.log("FREE PRODUCTIONS:");
for (var name of Object.keys(Production)) {
    var methods = Object.keys(Production[name].prototype);
    if (methods.length === 0) console.log(name);
}

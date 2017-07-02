# An ECMAScript 2016 Specification Simulator

[![npm version](https://badge.fury.io/js/es7specsim.svg)](https://badge.fury.io/js/es7specsim)

es7specsim is a JavaScript interpreter written in JavaScript. It is implemented according to the "ECMAScript 2016 Language Specification" without any optimization. So you can easily find one-to-one correspondences between the specification and the implementation.

Although es7specsim can run in Node.js environment, there is no use in practice because it runs several hundred times slower than native executions.

You may run es7specsim
- if you want to know pure conforming results
- for studying purpose
- just for fun

How to run es7specsim
-----------------------
Simple:
```
require('es7specsim');
var entries = [
    { sourceText: "script source code", isModule: false},
    { sourceText: "module source code", isModule: true},
    // more scripts or modules
];
InitializeHostDefinedRealm(entries);
```

Customized:
```
require('es7specsim');
HostResolveImportedModule = function(referencingModule, specifier) {
    // your implementation
};
HostReportErrors = function(errorList) {
    // your implementation
};
HostPromiseRejectionTracker = function(promise, operation) {
    // your implementation
};
function customize_global_object(realm, global) {
    // your implementation
}
var entries = [
    { sourceText: "script source code", isModule: false},
    { sourceText: "module source code", isModule: true},
    // more scripts or modules
];
InitializeHostDefinedRealm(entries, customize_global_object);
```

Practical example can be found in es7specsim/test/test262.js



STRICT CONFORMANCE flag
-----------------------
As default, es7specsim implements some extensions and modifications in order to pass the tests of the tc39/test262 project. If you want es7specsim to be strictly conforming to the specification normative only, you can set the STRICT_CONFORMANCE flag to true.

It *disables* following supports.
- String.prototype is an string exotic object instead of an ordinary object.
- ES5 compatibility for early errors of 'eval' and 'arguments' left-hand-side.
- ES8 compatibility for additional early syntax errors of direct eval.
- ES8 compatibility for TypedArray.prototype.fill() called with non-number value.
- ES8 compatibility for Date.UTC() called without month argument.
- ES8 compatibility for %ArrayIteratorPrototype%.next() called with detached buffer.
- ES8 compatibility for cyclic "export *" resolution.
- ES8 compatibility for Module Name Space Exotic Object.
- ES8 compatibility for RegExp.
- ES8 compatible ToIndex() is used in index conversions.
- ES8 compatibility for Date.prototype.toString() called on non-Object.


# An ECMAScript 2016 Specification Simulator

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
- Early Error of 'eval' and 'arguments' left-hand-side compatibility with ES5.
- String.prototype is an string exotic object instead of an ordinary object.
- more extensions TODO

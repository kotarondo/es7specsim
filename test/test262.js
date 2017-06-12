require("../loader");

var fs = require("fs");
var path = require("path");
var util = require("util");
var parser = require("test262-parser");

Error.stackTraceLimit = 5;

function print(a) {
    Assert(typeof a === "string");
    console.log(a);
}

function createRealm() {
    var realm = CreateRealm();
    SetRealmGlobalObject(realm);
    var globalObj = SetDefaultGlobalBindings(realm);
    customize_global_object(realm, globalObj);
    return Get(globalObj, "$262");
}

function detachArrayBuffer(a) {
    DetachArrayBuffer(a);
}

function evalScript(sourceText) {
    Assert(typeof sourceText === 'string');
    var hostDefined = undefined;
    var realm = currentRealm;
    var s = ParseScript(sourceText, realm, hostDefined);
    if (Array.isArray(s)) {
        var error = s[0];
        throw Completion({ Type: 'throw', Value: error, Target: empty });
    }
    var status = ScriptEvaluation(s);
    return status;
}

function customize_global_object(realm, global) {
    var intrinsics = realm.Intrinsics;
    var obj262, agent;
    CreateMethodProperty(global, `print`, CreateBuiltinFunction(currentRealm, print, intrinsics['%FunctionPrototype%']));
    CreateMethodProperty(global, `$262`, obj262 = ObjectCreate(intrinsics['%ObjectPrototype%']));
    CreateMethodProperty(obj262, `createRealm`, CreateBuiltinFunction(currentRealm, createRealm, intrinsics['%FunctionPrototype%']));
    CreateMethodProperty(obj262, `detachArrayBuffer`, CreateBuiltinFunction(currentRealm, detachArrayBuffer, intrinsics['%FunctionPrototype%']));
    CreateMethodProperty(obj262, `evalScript`, CreateBuiltinFunction(currentRealm, evalScript, intrinsics['%FunctionPrototype%']));
    CreateDataProperty(obj262, `global`, global);
    CreateDataProperty(obj262, `agent`, agent = ObjectCreate(intrinsics['%ObjectPrototype%']));
    //TODO implement agent
}

var test262_dir = path.join(__dirname, "../../test262");
var assert_src = fs.readFileSync(path.join(test262_dir, "harness/assert.js"), "utf8");
var sta_src = fs.readFileSync(path.join(test262_dir, "harness/sta.js"), "utf8");
var current_dirname;
var total = 0;
var heavy = 0;
var failure = 0;
var exception = [];
var failed_tests = [];

var module_cache = {};

HostResolveImportedModule = function(referencingModule, specifier) {
    if (module_cache[specifier]) return module_cache[specifier];
    var sourceText = fs.readFileSync(path.join(current_dirname, specifier), "utf8");
    var realm = referencingModule.Realm;
    var m = ParseModule(sourceText, realm);
    if (Array.isArray(m)) {
        var error = m[0];
        throw Completion({ Type: 'throw', Value: error, Target: empty });
    }
    module_cache[specifier] = m;
    return module_cache[specifier];
};

function test_do(src, spec) {
    total++;
    var errors;
    HostReportErrors = function(errorList) {
        errors = errorList;
    };
    var entries = [
        { sourceText: assert_src },
        { sourceText: sta_src },
    ];
    for (var inc of spec.includes) {
        var inc_src = fs.readFileSync(path.join(test262_dir, "harness", inc), "utf8");
        entries.push({ sourceText: inc_src });
    }
    entries.push({ sourceText: src, isModule: !!spec.flags.module });
    InitializeHostDefinedRealm(entries, customize_global_object);
    if (!spec.negative && !errors) return true;
    if (spec.negative && errors && Type(errors[0]) === 'Object') {
        var c = Get(errors[0], "constructor");
        if (c && Get(c, "name") === spec.negative.type) return true;
    }
    if (errors) {
        if (Type(errors[0]) === 'Object') console.log(Get(errors[0], "name"), Get(errors[0], "message"));
        else console.log(errors[0]);
    }
    failure++;
    return false;
}

function test_file(pathname) {
    if (pathname.endsWith("_FIXTURES.js")) return;
    for (var testname of heavy_tests) {
        if (pathname.endsWith(testname)) return;
    }
    current_dirname = path.dirname(pathname);
    var src = fs.readFileSync(pathname, "utf8");
    var file = { contents: src };
    parser.parseFile(file);
    var spec = file.attrs;
    if (!spec.features) spec.features = [];

    if (!spec.flags.module) return;

    if (spec.features.contains("object-spread")) return; // unsupported
    if (spec.features.contains("object-rest")) return; // unsupported
    if (spec.features.contains("caller")) return; // unsupported
    if (spec.features.contains("SharedArrayBuffer")) return; // unsupported
    if (spec.negative) {
        if (spec.negative.phase === "early" && !spec.flags.raw) {
            src = "throw 'no early error occurred';\n" + src;
        }
    }
    console.log(pathname);
    var begin = Date.now();
    var f = true;
    try {
        if (spec.flags.async) {
            //TODO
            return;
        }
        if (!spec.flags.onlyStrict || spec.flags.module) {
            f &= test_do(src, spec);
        }
        if (!spec.flags.noStrict && !spec.flags.raw && !spec.flags.module) {
            f &= test_do('"use strict";\n' + src, spec);
        }
    } catch (e) {
        exception.push(pathname);
        console.log(e);
        execution_context_stack.length = 0;
    }
    if (!f) failed_tests.push(pathname);
    var elapsed = Date.now() - begin;
    if (elapsed > 10000) {
        heavy++;
        console.log("elapsed", elapsed);
    }
}

function test_dir(pathname) {
    if (pathname[0] !== '/') {
        var org_pathname = pathname;
        pathname = path.join(test262_dir, "test", org_pathname);
        if (!fs.existsSync(pathname)) {
            pathname = path.join(test262_dir, "test", "built-ins", org_pathname);
        }
    }
    if (/\.js$/.test(pathname)) {
        return test_file(pathname);
    }
    try {
        var files = fs.readdirSync(pathname);
    } catch (e) {
        console.log("skip:", pathname);
        return;
    }
    for (var f of files) {
        test_dir(path.join(pathname, f));
    }
}

const heavy_tests = [
    "/S7.4_A5.js",
    "/S7.4_A6.js",
    "/S7.8.5_A1.1_T2.js",
    "/S7.8.5_A1.4_T2.js",
    "/S7.8.5_A2.1_T2.js",
    "/S7.8.5_A2.4_T2.js",
    "/S15.1.2.2_A8.js",
    "/S15.1.2.3_A6.js",
    "/S15.1.3.1_A1.10_T1.js",
    "/S15.1.3.1_A1.11_T1.js",
    "/S15.1.3.1_A1.11_T2.js",
    "/S15.1.3.1_A1.12_T1.js",
    "/S15.1.3.1_A1.12_T2.js",
    "/S15.1.3.1_A1.12_T3.js",
    "/S15.1.3.1_A1.2_T1.js",
    "/S15.1.3.1_A1.2_T2.js",
    "/S15.1.3.1_A2.1_T1.js",
    "/S15.1.3.1_A2.4_T1.js",
    "/S15.1.3.1_A2.5_T1.js",
    "/S15.1.3.2_A1.10_T1.js",
    "/S15.1.3.2_A1.11_T1.js",
    "/S15.1.3.2_A1.11_T2.js",
    "/S15.1.3.2_A1.12_T1.js",
    "/S15.1.3.2_A1.12_T2.js",
    "/S15.1.3.2_A1.12_T3.js",
    "/S15.1.3.2_A1.2_T1.js",
    "/S15.1.3.2_A1.2_T2.js",
    "/S15.1.3.2_A2.1_T1.js",
    "/S15.1.3.2_A2.4_T1.js",
    "/S15.1.3.2_A2.5_T1.js",
    "/S15.1.3.3_A1.3_T1.js",
    "/S15.1.3.3_A2.3_T1.js",
    "/S15.1.3.3_A2.4_T1.js",
    "/S15.1.3.3_A2.4_T2.js",
    "/S15.1.3.3_A2.5_T1.js",
    "/S15.1.3.4_A1.3_T1.js",
    "/S15.1.3.4_A2.3_T1.js",
    "/S15.1.3.4_A2.4_T1.js",
    "/S15.1.3.4_A2.4_T2.js",
    "/S15.1.3.4_A2.5_T1.js",
    "/S15.4.5.2_A3_T4.js",
    "/S15.10.2.12_A3_T1.js",
    "/S15.10.2.12_A4_T1.js",
    "/S15.10.2.12_A5_T1.js",
    "/S15.10.2.12_A6_T1.js",
    "/Array.prototype.concat_large-typed-array.js",
];

for (var i = 2; i < process.argv.length; i++) {
    test_dir(process.argv[i]);
}

if (failed_tests.length) console.log("FAILED TESTS:\n" + failed_tests.join('\n'));
if (exception.length) console.log("EXCEPTION THROWN TESTS:\n" + exception.join('\n'));
if (heavy) console.log("heavy", heavy);
if (failure) console.log("failure", failure);
if (exception.length) console.log("exception", exception.length);
console.log("total", total);

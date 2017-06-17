/*
 Copyright (c) 2017, Kotaro Endo.
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 
 2. Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
 
 3. Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
'use strict';

// 19 Fundamental Objects

// 19.1 Object Objects

// 19.1.1 The Object Constructor

// 19.1.1.1
function Object$(value) {
    if (!(NewTarget === undefined || NewTarget === active_function_object)) {
        return OrdinaryCreateFromConstructor(NewTarget, "%ObjectPrototype%");
    }
    if (value === null || value === undefined) return ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    return ToObject(value);
}

// 19.1.2 Properties of the Object Constructor

// 19.1.2.1
function Object_assign(target, ...sources) {
    var to = ToObject(target);
    if (arguments.length === 1) return to;
    for (var nextSource of sources) {
        if (nextSource === undefined || nextSource === null) var keys = [];
        else {
            var from = ToObject(nextSource);
            var keys = from.OwnPropertyKeys();
        }
        for (var nextKey of keys) {
            var desc = from.GetOwnProperty(nextKey);
            if (desc !== undefined && desc.Enumerable === true) {
                var propValue = Get(from, nextKey);
                _Set(to, nextKey, propValue, true);
            }
        }
    }
    return to;
}

// 19.1.2.2
function Object_create(O, Properties) {
    if (!(Type(O) === 'Object' || Type(O) === 'Null')) throw $TypeError();
    var obj = ObjectCreate(O);
    if (Properties !== undefined) {
        return ObjectDefineProperties(obj, Properties);
    }
    return obj;
}

// 19.1.2.3
function Object_defineProperties(O, Properties) {
    return ObjectDefineProperties(O, Properties);
}

// 19.1.2.3.1
function ObjectDefineProperties(O, Properties) {
    if (Type(O) !== 'Object') throw $TypeError();
    var props = ToObject(Properties);
    var keys = props.OwnPropertyKeys();
    var descriptors = [];
    for (var nextKey of keys) {
        var propDesc = props.GetOwnProperty(nextKey);
        if (propDesc !== undefined && propDesc.Enumerable === true) {
            var descObj = Get(props, nextKey);
            var desc = ToPropertyDescriptor(descObj);
            descriptors.push([nextKey, desc]);
        }
    }
    for (var pair of descriptors) {
        var P = pair[0];
        var desc = pair[1];
        DefinePropertyOrThrow(O, P, desc);
    }
    return O;
}

// 19.1.2.4
function Object_defineProperty(O, P, Attributes) {
    if (Type(O) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(P);
    var desc = ToPropertyDescriptor(Attributes);
    DefinePropertyOrThrow(O, key, desc);
    return O;
}

// 19.1.2.5
function Object_freeze(O) {
    if (Type(O) !== 'Object') return O;
    var status = SetIntegrityLevel(O, "frozen");
    if (status === false) throw $TypeError();
    return O;
}

// 19.1.2.6
function Object_getOwnPropertyDescriptor(O, P) {
    var obj = ToObject(O);
    var key = ToPropertyKey(P);
    var desc = obj.GetOwnProperty(key);
    return FromPropertyDescriptor(desc);
}

// 19.1.2.7
function Object_getOwnPropertyNames(O) {
    return GetOwnPropertyKeys(O, 'String');
}

// 19.1.2.8
function Object_getOwnPropertySymbols(O) {
    return GetOwnPropertyKeys(O, 'Symbol');
}

// 19.1.2.8.1
function GetOwnPropertyKeys(O, _Type) {
    var obj = ToObject(O);
    var keys = obj.OwnPropertyKeys();
    var nameList = [];
    for (var nextKey of keys) {
        if (Type(nextKey) === _Type) {
            nameList.push(nextKey);
        }
    }
    return CreateArrayFromList(nameList);
}

// 19.1.2.9
function Object_getPrototypeOf(O) {
    var obj = ToObject(O);
    return obj.GetPrototypeOf();
}

// 19.1.2.10
function Object_is(value1, value2) {
    return SameValue(value1, value2);
}

// 19.1.2.11
function Object_isExtensible(O) {
    if (Type(O) !== 'Object') return false;
    return IsExtensible(O);
}

// 19.1.2.12
function Object_isFrozen(O) {
    if (Type(O) !== 'Object') return true;
    return TestIntegrityLevel(O, "frozen");
}

// 19.1.2.13
function Object_isSealed(O) {
    if (Type(O) !== 'Object') return true;
    return TestIntegrityLevel(O, "sealed");
}

// 19.1.2.14
function Object_keys(O) {
    var obj = ToObject(O);
    var nameList = EnumerableOwnNames(obj);
    return CreateArrayFromList(nameList);
}

// 19.1.2.15
function Object_preventExtensions(O) {
    if (Type(O) !== 'Object') return O;
    var status = O.PreventExtensions();
    if (status === false) throw $TypeError();
    return O;
}

// 19.1.2.16 Object.prototype

// 19.1.2.17
function Object_seal(O) {
    if (Type(O) !== 'Object') return O;
    var status = SetIntegrityLevel(O, "sealed");
    if (status === false) throw $TypeError();
    return O;
}

// 19.1.2.18
function Object_setPrototypeOf(O, proto) {
    var O = RequireObjectCoercible(O);
    if (!(Type(proto) === 'Object' || Type(proto) === 'Null')) throw $TypeError();
    if (Type(O) !== 'Object') return O;
    var status = O.SetPrototypeOf(proto);
    if (status === false) throw $TypeError();
    return O;
}

// 19.1.3 Properties of the Object Prototype Object

// 19.1.3.1 Object.prototype.constructor

// 19.1.3.2
function Object_prototype_hasOwnProperty(V) {
    var P = ToPropertyKey(V);
    var O = ToObject(this);
    return HasOwnProperty(O, P);
}

// 19.1.3.3
function Object_prototype_isPrototypeOf(V) {
    if (Type(V) !== 'Object') return false;
    var O = ToObject(this);
    while (true) {
        var V = V.GetPrototypeOf();
        if (V === null) return false;
        if (SameValue(O, V) === true) return true;
    }
}

// 19.1.3.4
function Object_prototype_propertyIsEnumerable(V) {
    var P = ToPropertyKey(V);
    var O = ToObject(this);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) return false;
    return desc.Enumerable;
}

// 19.1.3.5
function Object_prototype_toLocaleString(reserved1, reserved2) {
    var O = this;
    return Invoke(O, "toString");
}

// 19.1.3.6
function Object_prototype_toString() {
    if (this === undefined) return "[object Undefined]";
    if (this === null) return "[object Null]";
    var O = ToObject(this);
    var isArray = IsArray(O);
    if (isArray === true) var builtinTag = "Array";
    else if (O instanceof StringExoticObject) var builtinTag = "String";
    else if ('ParameterMap' in O) var builtinTag = "Arguments";
    else if ('Call' in O) var builtinTag = "Function";
    else if ('ErrorData' in O) var builtinTag = "Error";
    else if ('BooleanData' in O) var builtinTag = "Boolean";
    else if ('NumberData' in O) var builtinTag = "Number";
    else if ('DateValue' in O) var builtinTag = "Date";
    else if ('RegExpMatcher' in O) var builtinTag = "RegExp";
    else var builtinTag = "Object";
    var tag = Get(O, wellKnownSymbols['@@toStringTag']);
    if (Type(tag) !== 'String') var tag = builtinTag;
    return "[object " + tag + "]";
}

// 19.1.3.7
function Object_prototype_valueOf() {
    return ToObject(this);
}

// 19.1.4 Properties of Object Instances

// 19.2 Function Objects

// 19.2.1 The Function Constructor

// 19.2.1.1
function Function$() {
    var C = active_function_object;
    var args = arguments;
    return CreateDynamicFunction(C, NewTarget, "normal", args);
}

// 19.2.1.1.1
function CreateDynamicFunction(constructor, newTarget, kind, args) {
    if (newTarget === undefined) var newTarget = constructor;
    if (kind === "normal") {
        var goal = 'FunctionBody';
        var parameterGoal = 'FormalParameters';
        var fallbackProto = "%FunctionPrototype%";
    } else {
        var goal = 'GeneratorBody';
        var parameterGoal = 'FormalParameters[Yield]';
        var fallbackProto = "%Generator%";
    }
    var argCount = args.length;
    var P = '';
    if (argCount === 0) var bodyText = '';
    else if (argCount === 1) var bodyText = args[0];
    else {
        var firstArg = args[0];
        var P = ToString(firstArg);
        var k = 1;
        while (k < argCount - 1) {
            var nextArg = args[k];
            var nextArgString = ToString(nextArg);
            var P = P + "," + nextArgString;
            k++;
        }
        var bodyText = args[k];
    }
    var bodyText = ToString(bodyText);
    try {
        setParsingText(P);
        if (parameterGoal === 'FormalParameters') {
            var parameters = parseFormalParameters();
        } else {
            Assert(parameterGoal === 'FormalParameters[Yield]');
            var parameters = parseFormalParameters('Yield');
        }
        if (peekToken() !== '') throw EarlySyntaxError();
        setParsingText(bodyText);
        if (goal === 'FunctionBody') {
            var body = parseFunctionBody();
        } else {
            Assert(goal === 'GeneratorBody');
            var body = parseGeneratorBody();
        }
        if (peekToken() !== '') throw EarlySyntaxError();
        if (body.ContainsUseStrict()) var strict = true;
        else var strict = false;
        determineStrictModeCode(parameters, strict);
        determineStrictModeCode(body, strict);
        body.apply_early_error_rules();
        if (strict === true) {
            var nt = Production['StrictFormalParameters: FormalParameters'](parameters);
            nt.strict = true;
            nt.apply_early_error_rules();
        } else {
            parameters.apply_early_error_rules();
        }
    } catch (e) {
        if (e instanceof EarlySyntaxError) throw $SyntaxError();
        if (e instanceof EarlyReferenceError) throw $ReferenceError();
        throw e;
    }
    if (body.ContainsUseStrict() === true && parameters.IsSimpleParameterList() === false) throw $SyntaxError();
    if (parameters.BoundNames().also_occurs_in(body.LexicallyDeclaredNames())) throw $SyntaxError();
    if (body.Contains('SuperCall') === true) throw $SyntaxError();
    if (parameters.Contains('SuperCall') === true) throw $SyntaxError();
    if (body.Contains('SuperProperty') === true) throw $SyntaxError();
    if (parameters.Contains('SuperProperty') === true) throw $SyntaxError();
    if (kind === "generator") {
        if (parameters.Contains('YieldExpression') === true) throw $SyntaxError();
    }
    if (strict === true) {
        if (parameters.BoundNames().contains_any_duplicate_elements()) throw $SyntaxError();
    }
    var proto = GetPrototypeFromConstructor(newTarget, fallbackProto);
    var F = FunctionAllocate(proto, strict, kind);
    var realmF = F.Realm;
    var scope = realmF.GlobalEnv;
    FunctionInitialize(F, 'Normal', parameters, body, scope);
    if (kind === "generator") {
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(F, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
    } else {
        MakeConstructor(F);
    }
    SetFunctionName(F, "anonymous");
    return F;
}

// 19.2.2 Properties of the Function Constructor

// 19.2.2.1 Function.length

// 19.2.2.2 Function.prototype

// 19.2.3 Properties of the Function Prototype Object

// 19.2.3.1
function Function_prototype_apply(thisArg, argArray) {
    var func = this;
    if (IsCallable(func) === false) throw $TypeError();
    if (argArray === null || argArray === undefined) {
        throw new PendingTailCall(func, thisArg); // PrepareForTailCall()
    }
    var argList = CreateListFromArrayLike(argArray);
    throw new PendingTailCall(func, thisArg, argList); // PrepareForTailCall()
}

// 19.2.3.2
function Function_prototype_bind(thisArg, ...args) {
    var Target = this;
    if (IsCallable(Target) === false) throw $TypeError();
    var F = BoundFunctionCreate(Target, thisArg, args);
    var targetHasLength = HasOwnProperty(Target, "length");
    if (targetHasLength === true) {
        var targetLen = Get(Target, "length");
        if (Type(targetLen) !== 'Number') var L = 0;
        else {
            var targetLen = ToInteger(targetLen);
            var L = Math.max(0, targetLen - args.length);
        }
    } else var L = 0;
    DefinePropertyOrThrow(F, "length", PropertyDescriptor({ Value: L, Writable: false, Enumerable: false, Configurable: true }));
    var targetName = Get(Target, "name");
    if (Type(targetName) !== 'String') var targetName = '';
    SetFunctionName(F, targetName, "bound");
    return F;
}

// 19.2.3.3
function Function_prototype_call(thisArg, ...args) {
    var func = this;
    if (IsCallable(func) === false) throw $TypeError();
    var argList = args;
    throw new PendingTailCall(func, thisArg, argList); // PrepareForTailCall()
}

// 19.2.3.4 Function.prototype.constructor

// 19.2.3.5
function Function_prototype_toString() {
    var func = this;
    if (func instanceof BoundFunctionExoticObject) {
        return "function anonymous(){ ... }"; //TODO
    }
    if (Type(func) === 'Object' && (func instanceof BuiltinFunctionObject || 'ECMAScriptCode' in func)) {
        return "function anonymous(){ ... }"; //TODO
    }
    throw $TypeError();
}

// 19.2.3.6 Function.prototype [ @@hasInstance ] ( V )
function Function_prototype_hasInstance(V) {
    var F = this;
    return OrdinaryHasInstance(F, V);
}

// 19.2.4 Function Instances

// 19.2.4.1 length

// 19.2.4.2 name

// 19.2.4.3 prototype

// 19.3 Boolean Objects

// 19.3.1 The Boolean Constructor

// 19.3.1.1
function Boolean$(value) {
    var b = ToBoolean(value);
    if (NewTarget === undefined) return b;
    var O = OrdinaryCreateFromConstructor(NewTarget, "%BooleanPrototype%", ['BooleanData']);
    O.BooleanData = b;
    return O;
}

// 19.3.2 Properties of the Boolean Constructor

// 19.3.2.1 Boolean.prototype

// 19.3.3 Properties of the Boolean Prototype Object

// 19.3.3.1
function thisBooleanValue(value) {
    if (Type(value) === 'Boolean') return value;
    if (Type(value) === 'Object' && 'BooleanData' in value) {
        Assert(Type(value.BooleanData) === 'Boolean');
        return value.BooleanData;
    }
    throw $TypeError();
}

// 19.3.3.2 Boolean.prototype.constructor

// 19.3.3.3
function Boolean_prototype_toString() {
    var b = thisBooleanValue(this);
    if (b === true) return "true";
    else return "false";
}

// 19.3.3.4
function Boolean_prototype_valueOf() {
    return thisBooleanValue(this);
}

// 19.3.4 Properties of Boolean Instances

// 19.4 Symbol Objects

// 19.4.1 The Symbol Constructor

// 19.4.1.1
function Symbol$(description) {
    if (NewTarget !== undefined) throw $TypeError();
    if (description === undefined) var descString = undefined;
    else var descString = ToString(description);
    return new_unique_symbol(descString);
}

// 19.4.2 Properties of the Symbol Constructor

// 19.4.2.1
function Symbol_for(key) {
    var stringKey = ToString(key);
    for (var e of GlobalSymbolRegistry) {
        if (SameValue(e.Key, stringKey) === true) return e.Symbol;
    }
    var newSymbol = new_unique_symbol(stringKey);
    GlobalSymbolRegistry.push(Record({ Key: stringKey, Symbol: newSymbol }));
    return newSymbol;
}

const GlobalSymbolRegistry = [];

// 19.4.2.2 Symbol.hasInstance

// 19.4.2.3 Symbol.isConcatSpreadable

// 19.4.2.4 Symbol.iterator

// 19.4.2.5
function Symbol_keyFor(sym) {
    if (Type(sym) !== 'Symbol') throw $TypeError();
    for (var e of GlobalSymbolRegistry) {
        if (SameValue(e.Symbol, sym) === true) return e.Key;
    }
    return undefined;
}

// 19.4.2.6 Symbol.match

// 19.4.2.7 Symbol.prototype

// 19.4.2.8 Symbol.replace

// 19.4.2.9 Symbol.search

// 19.4.2.10 Symbol.species

// 19.4.2.11 Symbol.split

// 19.4.2.12 Symbol.toPrimitive

// 19.4.2.13 Symbol.toStringTag

// 19.4.2.14 Symbol.unscopables

// 19.4.3 Properties of the Symbol Prototype Object

// 19.4.3.1 Symbol.prototype.constructor

// 19.4.3.2
function Symbol_prototype_toString() {
    var s = this;
    if (Type(s) === 'Symbol') var sym = s;
    else {
        if (Type(s) !== 'Object') throw $TypeError();
        if (!('SymbolData' in s)) throw $TypeError();
        var sym = s.SymbolData;
    }
    return SymbolDescriptiveString(sym);
}

// 19.4.3.2.1
function SymbolDescriptiveString(sym) {
    Assert(Type(sym) === 'Symbol');
    var desc = get_symbol_description(sym);
    if (desc === undefined) var desc = '';
    Assert(Type(desc) === 'String');
    return "Symbol(" + desc + ")";
}

// 19.4.3.3
function Symbol_prototype_valueOf() {
    var s = this;
    if (Type(s) === 'Symbol') return s;
    if (Type(s) !== 'Object') throw $TypeError();
    if (!('SymbolData' in s)) throw $TypeError();
    return s.SymbolData;
}

// 19.4.3.4 Symbol.prototype [ @@toPrimitive ] ( hint )
function Symbol_prototype_toPrimitive(hint) {
    var s = this;
    if (Type(s) === 'Symbol') return s;
    if (Type(s) !== 'Object') throw $TypeError();
    if (!('SymbolData' in s)) throw $TypeError();
    return s.SymbolData;
}

// 19.4.3.5 Symbol.prototype [ @@toStringTag ]

// 19.4.4 Properties of Symbol Instances

// 19.5 Error Objects

// 19.5.1 The Error Constructor

// 19.5.1.1
function Error$(message) {
    if (NewTarget === undefined) var newTarget = active_function_object;
    else var newTarget = NewTarget;
    var O = OrdinaryCreateFromConstructor(newTarget, "%ErrorPrototype%", ['ErrorData']);
    if (message !== undefined) {
        var msg = ToString(message);
        var msgDesc = PropertyDescriptor({ Value: msg, Writable: true, Enumerable: false, Configurable: true });
        DefinePropertyOrThrow(O, "message", msgDesc);
    }
    return O;
}

// 19.5.2 Properties of the Error Constructor

// 19.5.2.1 Error.prototype

// 19.5.3 Properties of the Error Prototype Object

// 19.5.3.1 Error.prototype.constructor

// 19.5.3.2 Error.prototype.message

// 19.5.3.3 Error.prototype.name

// 19.5.3.4
function Error_prototype_toString() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    var name = Get(O, "name");
    if (name === undefined) var name = "Error";
    else var name = ToString(name);
    var msg = Get(O, "message");
    if (msg === undefined) var msg = '';
    else var msg = ToString(msg);
    if (name === '') return msg;
    if (msg === '') return name;
    return name + ': ' + msg;
}

// 19.5.4 Properties of Error Instances

// 19.5.5 Native Error Types Used in This Standard

// 19.5.5.1 EvalError

// 19.5.5.2 RangeError

// 19.5.5.3 ReferenceError

// 19.5.5.4 SyntaxError

// 19.5.5.5 TypeError

// 19.5.5.6 URIError

// 19.5.6 NativeError Object Structure

// 19.5.6.1 NativeError Constructors

// 19.5.6.1.1
function NativeError$(name, message) {
    if (NewTarget === undefined) var newTarget = active_function_object;
    else var newTarget = NewTarget;
    var O = OrdinaryCreateFromConstructor(newTarget, "%" + name + "Prototype%", ['ErrorData']);
    if (message !== undefined) {
        var msg = ToString(message);
        var msgDesc = PropertyDescriptor({ Value: msg, Writable: true, Enumerable: false, Configurable: true });
        DefinePropertyOrThrow(O, "message", msgDesc);
    }
    return O;
}

const NativeError_constructors = {
    EvalError: NativeError$.bind(null, 'EvalError'),
    RangeError: NativeError$.bind(null, 'RangeError'),
    ReferenceError: NativeError$.bind(null, 'ReferenceError'),
    SyntaxError: NativeError$.bind(null, 'SyntaxError'),
    TypeError: NativeError$.bind(null, 'TypeError'),
    URIError: NativeError$.bind(null, 'URIError'),
};

function call_NativeError(name, message) {
    return Call(currentRealm.Intrinsics['%' + name + '%'], null, [message]);
}

const $EvalError = call_NativeError.bind(null, 'EvalError');
const $RangeError = call_NativeError.bind(null, 'RangeError');
const $ReferenceError = call_NativeError.bind(null, 'ReferenceError');
const $SyntaxError = call_NativeError.bind(null, 'SyntaxError');
const $TypeError = call_NativeError.bind(null, 'TypeError');
const $URIError = call_NativeError.bind(null, 'URIError');

// 19.5.6.2 Properties of the NativeError Constructors

// 19.5.6.2.1 NativeError.prototype

// 19.5.6.3 Properties of the NativeError Prototype Objects

// 19.5.6.3.1 NativeError.prototype.constructor

// 19.5.6.3.2 NativeError.prototype.message

// 19.5.6.3.3 NativeError.prototype.name

// 19.5.6.4 Properties of NativeError Instances

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

// 7 Abstract Operations

// 7.1 Type Conversion

// 7.1.1
function ToPrimitive(input, PreferredType) {
    if (Type(input) === 'Object') {
        if (PreferredType === undefined) var hint = "default";
        else if (PreferredType === 'hint String') var hint = "string";
        else {
            Assert(PreferredType === 'hint Number');
            var hint = "number";
        }
        var exoticToPrim = GetMethod(input, wellKnownSymbols['@@toPrimitive']);
        if (exoticToPrim !== undefined) {
            var result = Call(exoticToPrim, input, [hint]);
            if (Type(result) !== 'Object') return result;
            throw $TypeError();
        }
        if (hint === "default") var hint = "number";
        return OrdinaryToPrimitive(input, hint);
    }
    return input;
}

function OrdinaryToPrimitive(O, hint) {
    Assert(Type(O) === 'Object');
    Assert(hint === "string" || hint === "number");
    if (hint === "string") {
        var methodNames = ["toString", "valueOf"];
    } else {
        var methodNames = ["valueOf", "toString"];
    }
    for (var name of methodNames) {
        var method = Get(O, name);
        if (IsCallable(method) === true) {
            var result = Call(method, O);
            if (Type(result) !== 'Object') return result;
        }
    }
    throw $TypeError();
}

// 7.1.2
function ToBoolean(argument) {
    switch (Type(argument)) {
        case 'Undefined':
            return false;
        case 'Null':
            return false;
        case 'Boolean':
            return argument;
        case 'Number':
            if (argument === 0 || isNaN(argument)) return false;
            return true;
        case 'String':
            if (argument === "") return false;
            return true;
        case 'Symbol':
            return true;
        case 'Object':
            return true;
    }
}

// 7.1.3
function ToNumber(argument) {
    switch (Type(argument)) {
        case 'Undefined':
            return NaN;
        case 'Null':
            return +0;
        case 'Boolean':
            if (argument === true) return 1;
            return +0;
        case 'Number':
            return argument;
        case 'String':
            return ToNumber_Applied_to_the_String_Type(argument);
        case 'Symbol':
            throw $TypeError();
        case 'Object':
            var primValue = ToPrimitive(argument, 'hint Number');
            return ToNumber(primValue);
    }
}

// 7.1.3.1
function ToNumber_Applied_to_the_String_Type(argument) {
    // Here we rely on underlying virtual machine.
    return +argument;
}

// 7.1.4
function ToInteger(argument) {
    var number = ToNumber(argument);
    if (isNaN(number)) return +0;
    if (number === 0) return number;
    if (number < 0) return -Math.floor(-number);
    return Math.floor(number);
}

// 7.1.5
function ToInt32(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    return (number >> 0);
}

// 7.1.6
function ToUint32(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    return (number >>> 0);
}

// 7.1.7
function ToInt16(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    var int16bit = (number & 0xffff);
    if (int16bit >= 0x8000) return int16bit - 0x10000;
    return int16bit;
}

// 7.1.8
function ToUint16(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    var int16bit = (number & 0xffff);
    return int16bit;
}

// 7.1.9
function ToInt8(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    var int8bit = (number & 0xff);
    if (int8bit >= 0x80) return int8bit - 0x100;
    return int8bit;
}

// 7.1.10
function ToUint8(argument) {
    var number = ToNumber(argument);
    // Here we rely on underlying virtual machine.
    var int8bit = (number & 0xff);
    return int8bit;
}

// 7.1.11
function ToUint8Clamp(argument) {
    var number = ToNumber(argument);
    if (isNaN(number)) return +0;
    if (number <= 0) return +0;
    if (number >= 255) return 255;
    var f = Math.floor(number);
    if (f + 0.5 < number) return f + 1;
    if (number < f + 0.5) return f;
    if ((f & 1) === 1) return f + 1;
    return f;
}

// 7.1.12
function ToString(argument) {
    switch (Type(argument)) {
        case 'Undefined':
            return "undefined";
        case 'Null':
            return "null";
        case 'Boolean':
            if (argument === true) return "true";
            return "false";
        case 'Number':
            return ToString_Applied_to_the_Number_Type(argument);
        case 'String':
            return argument;
        case 'Symbol':
            throw $TypeError();
        case 'Object':
            var primValue = ToPrimitive(argument, 'hint String');
            return ToString(primValue);
    }
}

// 7.1.12.1
function ToString_Applied_to_the_Number_Type(argument) {
    // Here we rely on underlying virtual machine.
    return String(argument);
}

// 7.1.13
function ToObject(argument) {
    switch (Type(argument)) {
        case 'Undefined':
            throw $TypeError();
        case 'Null':
            throw $TypeError();
        case 'Boolean':
            var obj = ObjectCreate(currentRealm.Intrinsics['%BooleanPrototype%'], ['BooleanData']);
            obj.BooleanData = argument;
            return obj;
        case 'Number':
            var obj = ObjectCreate(currentRealm.Intrinsics['%NumberPrototype%'], ['NumberData']);
            obj.NumberData = argument;
            return obj;
        case 'String':
            return StringCreate(argument, currentRealm.Intrinsics['%StringPrototype%']);
        case 'Symbol':
            var obj = ObjectCreate(currentRealm.Intrinsics['%SymbolPrototype%'], ['SymbolData']);
            obj.SymbolData = argument;
            return obj;
        case 'Object':
            return argument;
    }
}

// 7.1.14
function ToPropertyKey(argument) {
    var key = ToPrimitive(argument, 'hint String');
    if (Type(key) === 'Symbol') return key;
    return ToString(key);
}

// 7.1.15
function ToLength(argument) {
    var len = ToInteger(argument);
    if (len <= +0) return +0;
    if (len === +Infinity) return 0x1fffffffffffff;
    return Math.min(len, 0x1fffffffffffff);
}

// 7.1.16
function CanonicalNumericIndexString(argument) {
    Assert(Type(argument) === 'String');
    if (argument === "-0") return -0;
    var n = ToNumber(argument);
    if (SameValue(ToString(n), argument) === false) return undefined;
    return n;
}

// 7.2 Testing  and  and  Comparison Operations

// 7.2.1
function RequireObjectCoercible(argument) {
    switch (Type(argument)) {
        case 'Undefined':
            throw $TypeError();
        case 'Null':
            throw $TypeError();
        case 'Boolean':
            return argument;
        case 'Number':
            return argument;
        case 'String':
            return argument;
        case 'Symbol':
            return argument;
        case 'Object':
            return argument;
    }
}

// 7.2.2
function IsArray(argument) {
    if (Type(argument) !== 'Object') return false;
    if (argument instanceof ArrayExoticObject) return true;
    if (argument instanceof ProxyExoticObject) {
        if (argument.ProxyHandler === null) throw $TypeError();
        var target = argument.ProxyTarget;
        return IsArray(target);
    }
    return false;
}

// 7.2.3
function IsCallable(argument) {
    if (Type(argument) !== 'Object') return false;
    if (argument.Call) return true;
    return false;
}

// 7.2.4
function IsConstructor(argument) {
    if (Type(argument) !== 'Object') return false;
    if (argument.Construct) return true;
    return false;
}

// 7.2.5
function IsExtensible(O) {
    Assert(Type(O) === 'Object');
    return O.IsExtensible();
}

// 7.2.6
function IsInteger(argument) {
    if (Type(argument) !== 'Number') return false;
    if (isNaN(argument) || argument === +Infinity || argument === -Infinity) return false;
    if (Math.floor(Math.abs(argument)) !== Math.abs(argument)) return false;
    return true;
}

// 7.2.7
function IsPropertyKey(argument) {
    if (Type(argument) === 'String') return true;
    if (Type(argument) === 'Symbol') return true;
    return false;
}

// 7.2.8
function IsRegExp(argument) {
    if (Type(argument) !== 'Object') return false;
    var isRegExp = Get(argument, wellKnownSymbols['@@match']);
    if (isRegExp !== undefined) return ToBoolean(isRegExp);
    if (argument.RegExpMatcher) return true;
    return false;
}

// 7.2.9
function SameValue(x, y) {
    if (Type(x) !== Type(y)) return false;
    if (Type(x) === 'Number') {
        if (isNaN(x) && isNaN(y)) return true;
        if (x === 0 && y === 0 && 1 / (x * y) === -Infinity) return false;
        if (x === y) return true;
        return false;
    }
    return SameValueNonNumber(x, y);
}

// 7.2.10
function SameValueZero(x, y) {
    if (Type(x) !== Type(y)) return false;
    if (Type(x) === 'Number') {
        if (isNaN(x) && isNaN(y)) return true;
        if (x === y) return true;
        return false;
    }
    return SameValueNonNumber(x, y);
}

// 7.2.11
function SameValueNonNumber(x, y) {
    // Here we rely on underlying virtual machine.
    return (x === y);
}

// 7.2.12 Abstract Relational Comparison
// 7.2.13 Abstract Equality Comparison
// 7.2.14 Strict Equality Comparison

// 7.3 Operations on Objects

// 7.3.1
function Get(O, P) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    return O.Get(P, O);
}

// 7.3.2
function GetV(V, P) {
    Assert(IsPropertyKey(P) === true);
    var O = ToObject(V);
    return O.Get(P, V);
}

// 7.3.3
function _Set(O, P, V, Throw) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    Assert(Type(Throw) === 'Boolean');
    var success = O.Set(P, V, O);
    if (success === false && Throw === true) throw $TypeError();
    return success;
}

// 7.3.4
function CreateDataProperty(O, P, V) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var newDesc = PropertyDescriptor({ Value: V, Writable: true, Enumerable: true, Configurable: true });
    return O.DefineOwnProperty(P, newDesc);
}

// 7.3.5
function CreateMethodProperty(O, P, V) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var newDesc = PropertyDescriptor({ Value: V, Writable: true, Enumerable: false, Configurable: true });
    return O.DefineOwnProperty(P, newDesc);
}

// 7.3.6
function CreateDataPropertyOrThrow(O, P, V) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var success = CreateDataProperty(O, P, V);
    if (success === false) throw $TypeError();
    return success;
}

// 7.3.7
function DefinePropertyOrThrow(O, P, desc) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var success = O.DefineOwnProperty(P, desc);
    if (success === false) throw $TypeError();
    return success;
}

// 7.3.8
function DeletePropertyOrThrow(O, P) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var success = O.Delete(P);
    if (success === false) throw $TypeError();
    return success;
}

// 7.3.9
function GetMethod(V, P) {
    Assert(IsPropertyKey(P) === true);
    var func = GetV(V, P);
    if (func === undefined || func === null) return undefined;
    if (IsCallable(func) === false) throw $TypeError();
    return func;
}

// 7.3.10
function HasProperty(O, P) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    return O.HasProperty(P);
}

// 7.3.11
function HasOwnProperty(O, P) {
    Assert(Type(O) === 'Object');
    Assert(IsPropertyKey(P) === true);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) return false;
    return true;
}

// 7.3.12
function Call(F, V, argumentsList) {
    if (argumentsList === undefined) var argumentsList = [];
    if (IsCallable(F) === false) throw $TypeError();
    return F.Call(V, argumentsList);
}

// 7.3.13
function Construct(F, argumentsList, newTarget) {
    if (newTarget === undefined) var newTarget = F;
    if (argumentsList === undefined) var argumentsList = [];
    Assert(IsConstructor(F) === true);
    Assert(IsConstructor(newTarget) === true);
    return F.Construct(argumentsList, newTarget);
}

// 7.3.14
function SetIntegrityLevel(O, level) {
    Assert(Type(O) === 'Object');
    Assert(level === "sealed" || level === "frozen");
    var status = O.PreventExtensions();
    if (status === false) return false;
    var keys = O.OwnPropertyKeys();
    if (level === "sealed") {
        for (var k of keys) {
            DefinePropertyOrThrow(O, k, PropertyDescriptor({ Configurable: false }));
        }
    } else {
        for (var k of keys) {
            var currentDesc = O.GetOwnProperty(k);
            if (currentDesc !== undefined) {
                if (IsAccessorDescriptor(currentDesc) === true) {
                    var desc = PropertyDescriptor({ Configurable: false });
                } else {
                    var desc = PropertyDescriptor({ Configurable: false, Writable: false });
                }
                DefinePropertyOrThrow(O, k, desc);
            }
        }
    }
    return true;
}

// 7.3.15
function TestIntegrityLevel(O, level) {
    Assert(Type(O) === 'Object');
    Assert(level === "sealed" || level === "frozen");
    var status = IsExtensible(O);
    if (status === true) return false;
    var keys = O.OwnPropertyKeys();
    for (var k of keys) {
        var currentDesc = O.GetOwnProperty(k);
        if (currentDesc !== undefined) {
            if (currentDesc.Configurable === true) return false;
            if (level === "frozen" && IsDataDescriptor(currentDesc) === true) {
                if (currentDesc.Writable === true) return false;
            }
        }
    }
    return true;
}

// 7.3.16
function CreateArrayFromList(elements) {
    var array = ArrayCreate(0);
    var n = 0;
    for (var e of elements) {
        var status = CreateDataProperty(array, ToString(n), e);
        Assert(status === true);
        n++;
    }
    return array;
}

// 7.3.17
function CreateListFromArrayLike(obj, elementTypes) {
    if (elementTypes === undefined) var elementTypes = ['Undefined', 'Null', 'Boolean', 'String', 'Symbol', 'Number', 'Object'];
    if (Type(obj) !== 'Object') throw $TypeError();
    var len = ToLength(Get(obj, "length"));
    var list = [];
    var index = 0;
    while (index < len) {
        var indexName = ToString(index);
        var next = Get(obj, indexName);
        if (!Type(next).is_an_element_of(elementTypes)) throw $TypeError();
        list.push(next);
        index = index + 1;
    }
    return list;
}

// 7.3.18
function Invoke(V, P, argumentsList) {
    Assert(IsPropertyKey(P) === true);
    if (argumentsList === undefined) var argumentsList = [];
    var func = GetV(V, P);
    return Call(func, V, argumentsList);
}

// 7.3.19
function OrdinaryHasInstance(C, O) {
    if (IsCallable(C) === false) return false;
    if (C.BoundTargetFunction !== undefined) {
        var BC = C.BoundTargetFunction;
        return InstanceofOperator(O, BC);
    }
    if (Type(O) !== 'Object') return false;
    var P = Get(C, "prototype");
    if (Type(P) !== 'Object') throw $TypeError();
    while (true) {
        var O = O.GetPrototypeOf();
        if (O === null) return false;
        if (SameValue(P, O) === true) return true;
    }
}

// 7.3.20
function SpeciesConstructor(O, defaultConstructor) {
    Assert(Type(O) === 'Object');
    var C = Get(O, "constructor");
    if (C === undefined) return defaultConstructor;
    if (Type(C) !== 'Object') throw $TypeError();
    var S = Get(C, wellKnownSymbols['@@species']);
    if (S === undefined || S === null) return defaultConstructor;
    if (IsConstructor(S) === true) return S;
    throw $TypeError();
}

// 7.3.21
function EnumerableOwnNames(O) {
    Assert(Type(O) === 'Object');
    var ownKeys = O.OwnPropertyKeys();
    var names = [];
    for (var key of ownKeys) {
        if (Type(key) === 'String') {
            var desc = O.GetOwnProperty(key);
            if (desc !== undefined) {
                if (desc.Enumerable === true) names.push(key);
            }
        }
    }
    //TODO Order the elements of names so they are in the same relative order as would be produced by the Iterator that would be returned if the EnumerateObjectProperties internal method was invoked with O;
    return names;
}

// 7.3.22
function GetFunctionRealm(obj) {
    Assert(IsCallable(obj) === true);
    if (obj.Realm !== undefined) {
        return obj.Realm;
    }
    if (obj instanceof BoundFunctionExoticObject) {
        var target = obj.BoundTargetFunction;
        return GetFunctionRealm(target);
    }
    if (obj instanceof ProxyExoticObject) {
        if (obj.ProxyHandler === null) throw $TypeError();
        var proxyTarget = obj.ProxyTarget;
        return GetFunctionRealm(proxyTarget);
    }
    return currentRealm;
}

// 7.4 Operations on Iterator Objects

// 7.4.1
function GetIterator(obj, method) {
    if (method === undefined) {
        var method = GetMethod(obj, wellKnownSymbols['@@iterator']);
    }
    var iterator = Call(method, obj);
    if (Type(iterator) !== 'Object') throw $TypeError();
    return iterator;
}

// 7.4.2
function IteratorNext(iterator, value) {
    if (value === undefined) {
        var result = Invoke(iterator, "next", []);
    } else {
        var result = Invoke(iterator, "next", [value]);
    }
    if (Type(result) !== 'Object') throw $TypeError();
    return result;
}

// 7.4.3
function IteratorComplete(iterResult) {
    Assert(Type(iterResult) === 'Object');
    return ToBoolean(Get(iterResult, "done"));
}

// 7.4.4
function IteratorValue(iterResult) {
    Assert(Type(iterResult) === 'Object');
    return Get(iterResult, "value");
}

// 7.4.5
function IteratorStep(iterator) {
    var result = IteratorNext(iterator);
    var done = IteratorComplete(result);
    if (done === true) return false;
    return result;
}

// 7.4.6
function IteratorClose(iterator, completion) {
    Assert(Type(iterator) === 'Object');
    Assert(Type(completion) === 'Completion Record');
    var _return = GetMethod(iterator, "return");
    if (_return === undefined) return resolveCompletion(completion);
    var innerResult = concreteCompletion(Call(_return, iterator, []));
    if (completion.Type === 'throw') return resolveCompletion(completion);
    if (innerResult.Type === 'throw') return resolveCompletion(innerResult);
    if (Type(innerResult.Value) !== 'Object') throw $TypeError();
    return resolveCompletion(completion);
}

// 7.4.7
function CreateIterResultObject(value, done) {
    Assert(Type(done) === 'Boolean');
    var obj = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    CreateDataProperty(obj, "value", value);
    CreateDataProperty(obj, "done", done);
    return obj;
}

// 7.4.8
function CreateListIterator(list) {
    var iterator = ObjectCreate(currentRealm.Intrinsics['%IteratorPrototype%'], ['IteratorNext', 'IteratedList', 'ListIteratorNextIndex']);
    iterator.IteratedList = list;
    iterator.ListIteratorNextIndex = 0;
    var next = CreateBuiltinFunction(currentRealm, ListIterator_next, currentRealm.Intrinsics['%FunctionPrototype%']);
    iterator.IteratorNext = next;
    CreateMethodProperty(iterator, "next", next);
    return iterator;
}

// 7.4.8.1
function ListIterator_next() {
    var O = this;
    var f = activeFunction;
    if (O.IteratorNext === undefined) throw $TypeError();
    var next = O.IteratorNext;
    if (SameValue(f, next) === false) throw $TypeError();
    if (O.IteratedList === undefined) throw $TypeError();
    var list = O.IteratedList;
    var index = O.ListIteratorNextIndex;
    var len = list.length;
    if (index >= len) {
        return CreateIterResultObject(undefined, true);
    }
    O.ListIteratorNextIndex = index + 1;
    return CreateIterResultObject(list[index], false);
}

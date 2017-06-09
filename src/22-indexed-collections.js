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

// 22 Indexed Collections

// 22.1 Array Objects

// 22.1.1
function Array$() {
    switch (arguments.length) {
        case 0:
            return Array$1.apply(this, arguments);
        case 1:
            return Array$2.apply(this, arguments);
        default:
            return Array$3.apply(this, arguments);
    }
}

// 22.1.1.1
function Array$1() {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs === 0);
    if (NewTarget === undefined) var newTarget = active_function_object
    else var newTarget = NewTarget;
    var proto = GetPrototypeFromConstructor(newTarget, "%ArrayPrototype%");
    return ArrayCreate(0, proto);
}

// 22.1.1.2
function Array$2(len) {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs === 1);
    if (NewTarget === undefined) var newTarget = active_function_object
    else var newTarget = NewTarget;
    var proto = GetPrototypeFromConstructor(newTarget, "%ArrayPrototype%");
    var array = ArrayCreate(0, proto);
    if (Type(len) !== 'Number') {
        var defineStatus = CreateDataProperty(array, "0", len);
        Assert(defineStatus === true);
        var intLen = 1;
    } else {
        var intLen = ToUint32(len);
        if (intLen !== len) throw $RangeError();
    }
    _Set(array, "length", intLen, true);
    return array;
}

// 22.1.1.3
function Array$3(...items) {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs >= 2);
    if (NewTarget === undefined) var newTarget = active_function_object
    else var newTarget = NewTarget;
    var proto = GetPrototypeFromConstructor(newTarget, "%ArrayPrototype%");
    var array = ArrayCreate(numberOfArgs, proto);
    var k = 0;
    while (k < numberOfArgs) {
        var Pk = ToString(k);
        var itemK = items[k];
        var defineStatus = CreateDataProperty(array, Pk, itemK);
        Assert(defineStatus === true);
        k++;
    }
    Assert(Get(array, 'length') === numberOfArgs);
    return array;
}

// 22.1.2 Properties of the Array Constructor

// 22.1.2.1
function Array_from(items, mapfn, thisArg) {
    var C = this;
    if (mapfn === undefined) var mapping = false;
    else {
        if (IsCallable(mapfn) === false) throw $TypeError();
        var T = thisArg;
        var mapping = true;
    }
    var usingIterator = GetMethod(items, wellKnownSymbols['@@iterator']);
    if (usingIterator !== undefined) {
        if (IsConstructor(C) === true) {
            var A = Construct(C);
        } else {
            var A = ArrayCreate(0);
        }
        var iterator = GetIterator(items, usingIterator);
        var k = 0;
        while (true) {
            if (k >= 0x1fffffffffffff) {
                var error = Completion({ Type: 'throw', Value: $TypeError(), Target: empty });
                return IteratorClose(iterator, error);
            }
            var Pk = ToString(k);
            var next = IteratorStep(iterator);
            if (next === false) {
                _Set(A, "length", k, true);
                return A;
            }
            var nextValue = IteratorValue(next);
            if (mapping === true) {
                var mappedValue = concreteCompletion(Call(mapfn, T, [nextValue, k]));
                if (mappedValue.is_an_abrupt_completion()) return IteratorClose(iterator, mappedValue);
                var mappedValue = mappedValue.Value;
            } else var mappedValue = nextValue;
            var defineStatus = concreteCompletion(CreateDataPropertyOrThrow(A, Pk, mappedValue));
            if (defineStatus.is_an_abrupt_completion()) return IteratorClose(iterator, defineStatus);
            k++;
        }
    }
    var arrayLike = ToObject(items);
    var len = ToLength(Get(arrayLike, "length"));
    if (IsConstructor(C) === true) {
        var A = Construct(C, [len]);
    } else {
        var A = ArrayCreate(len);
    }
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(arrayLike, Pk);
        if (mapping === true) {
            var mappedValue = Call(mapfn, T, [kValue, k]);
        } else {
            var mappedValue = kValue;
        }
        CreateDataPropertyOrThrow(A, Pk, mappedValue);
        k++;
    }
    _Set(A, "length", len, true);
    return A;
}

// 22.1.2.2
function Array_isArray(arg) {
    return IsArray(arg);
}

// 22.1.2.3
function Array_of(...items) {
    var len = arguments.length;
    var C = this;
    if (IsConstructor(C) === true) {
        var A = Construct(C, [len]);
    } else {
        var A = ArrayCreate(len);
    }
    var k = 0;
    while (k < len) {
        var kValue = items[k];
        var Pk = ToString(k);
        CreateDataPropertyOrThrow(A, Pk, kValue);
        k++;
    }
    _Set(A, "length", len, true);
    return A;
}

// 22.1.2.4 Array.prototype

// 22.1.2.5 get Array [ @@species ]
function get_Array_species() {
    return this;
}

// 22.1.3 Properties of the Array Prototype Object

// 22.1.3.1
function Array_prototype_concat() {
    var O = ToObject(this);
    var A = ArraySpeciesCreate(O, 0);
    var n = 0;
    var items = [O, ...arguments];
    while (items.length > 0) {
        var E = items.shift();
        var spreadable = IsConcatSpreadable(E);
        if (spreadable === true) {
            var k = 0;
            var len = ToLength(Get(E, "length"));
            if (n + len > 0x1fffffffffffff) throw $TypeError();
            while (k < len) {
                var P = ToString(k);
                var exists = HasProperty(E, P);
                if (exists === true) {
                    var subElement = Get(E, P);
                    CreateDataPropertyOrThrow(A, ToString(n), subElement);
                }
                n++;
                k++;
            }
        } else {
            if (n >= 0x1fffffffffffff) throw $TypeError();
            CreateDataPropertyOrThrow(A, ToString(n), E);
            n++;
        }
    }
    _Set(A, "length", n, true);
    return A;
}

// 22.1.3.1.1
function IsConcatSpreadable(O) {
    if (Type(O) !== 'Object') return false;
    var spreadable = Get(O, wellKnownSymbols['@@isConcatSpreadable']);
    if (spreadable !== undefined) return ToBoolean(spreadable);
    return IsArray(O);
}

// 22.1.3.2 Array.prototype.constructor

// 22.1.3.3
function Array_prototype_copyWithin(target, start, end) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var relativeTarget = ToInteger(target);
    if (relativeTarget < 0) var to = Math.max((len + relativeTarget), 0);
    else var to = Math.min(relativeTarget, len);
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var from = Math.max((len + relativeStart), 0);
    else var from = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    var count = Math.min(final - from, len - to);
    if (from < to && to < from + count) {
        var direction = -1;
        var from = from + count - 1;
        var to = to + count - 1;
    } else {
        var direction = 1;
    }
    while (count > 0) {
        var fromKey = ToString(from);
        var toKey = ToString(to);
        var fromPresent = HasProperty(O, fromKey);
        if (fromPresent === true) {
            var fromVal = Get(O, fromKey);
            _Set(O, toKey, fromVal, true);
        } else {
            DeletePropertyOrThrow(O, toKey);
        }
        var from = from + direction;
        var to = to + direction;
        var count = count - 1;
    }
    return O;
}

// 22.1.3.4
function Array_prototype_entries() {
    var O = ToObject(this);
    return CreateArrayIterator(O, "key+value");
}

// 22.1.3.5
function Array_prototype_every(callbackfn, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var testResult = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
            if (testResult === false) return false;
        }
        k++;
    }
    return true;
}

// 22.1.3.6
function Array_prototype_fill(value, start, end) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var k = Math.max((len + relativeStart), 0);
    else var k = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    while (k < final) {
        var Pk = ToString(k);
        _Set(O, Pk, value, true);
        k++;
    }
    return O;
}

// 22.1.3.7
function Array_prototype_filter(callbackfn, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var A = ArraySpeciesCreate(O, 0);
    var k = 0;
    var to = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var selected = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
            if (selected === true) {
                CreateDataPropertyOrThrow(A, ToString(to), kValue);
                to++;
            }
        }
        k++;
    }
    return A;
}

// 22.1.3.8
function Array_prototype_find(predicate, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(predicate) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var testResult = ToBoolean(Call(predicate, T, [kValue, k, O]));
        if (testResult === true) return kValue;
        k++;
    }
    return undefined;
}

// 22.1.3.9
function Array_prototype_findIndex(predicate, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(predicate) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var testResult = ToBoolean(Call(predicate, T, [kValue, k, O]));
        if (testResult === true) return k;
        k++;
    }
    return -1;
}

// 22.1.3.10
function Array_prototype_forEach(callbackfn, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            Call(callbackfn, T, [kValue, k, O]);
        }
        k++;
    }
    return undefined;
}

// 22.1.3.11
function Array_prototype_includes(searchElement, fromIndex) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (len === 0) return false;
    var n = ToInteger(fromIndex);
    if (n >= 0) {
        var k = n;
    } else {
        var k = len + n;
        if (k < 0) var k = 0;
    }
    while (k < len) {
        var elementK = Get(O, ToString(k));
        if (SameValueZero(searchElement, elementK) === true) return true;
        k++;
    }
    return false;
}

// 22.1.3.12
function Array_prototype_indexOf(searchElement, fromIndex) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (len === 0) return -1;
    var n = ToInteger(fromIndex);
    if (n >= len) return -1;
    if (n >= 0) {
        if (is_negative_zero(n)) var k = +0;
        else var k = n;
    } else {
        var k = len + n;
        if (k < 0) var k = 0;
    }
    while (k < len) {
        var kPresent = HasProperty(O, ToString(k));
        if (kPresent === true) {
            var elementK = Get(O, ToString(k));
            var same = StrictEqualityComparison(searchElement, elementK);
            if (same === true) return k;
        }
        k++;
    }
    return -1;
}

// 22.1.3.13
function Array_prototype_join(separator) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (separator === undefined) var separator = ",";
    var sep = ToString(separator);
    if (len === 0) return '';
    var element0 = Get(O, "0");
    if (element0 === undefined || element0 === null) var R = '';
    else var R = ToString(element0);
    var k = 1;
    while (k < len) {
        var S = R + sep;
        var element = Get(O, ToString(k));
        if (element === undefined || element === null) var next = '';
        else var next = ToString(element);
        var R = S + next;
        k++;
    }
    return R;
}

// 22.1.3.14
function Array_prototype_keys() {
    var O = ToObject(this);
    return CreateArrayIterator(O, "key");
}

// 22.1.3.15
function Array_prototype_lastIndexOf(searchElement, fromIndex) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (len === 0) return -1;
    if (arguments.length >= 2) var n = ToInteger(fromIndex);
    else var n = len - 1;
    if (n >= 0) {
        if (is_negative_zero(n)) var k = +0;
        else var k = Math.min(n, len - 1);
    } else {
        var k = len + n;
    }
    while (k >= 0) {
        var kPresent = HasProperty(O, ToString(k));
        if (kPresent === true) {
            var elementK = Get(O, ToString(k));
            var same = StrictEqualityComparison(searchElement, elementK);
            if (same === true) return k;
        }
        k--;
    }
    return -1;
}

// 22.1.3.16
function Array_prototype_map(callbackfn, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var A = ArraySpeciesCreate(O, len);
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var mappedValue = Call(callbackfn, T, [kValue, k, O]);
            CreateDataPropertyOrThrow(A, Pk, mappedValue);
        }
        k++;
    }
    return A;
}

// 22.1.3.17
function Array_prototype_pop() {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (len === 0) {
        _Set(O, "length", 0, true);
        return undefined;
    } else {
        var newLen = len - 1;
        var indx = ToString(newLen);
        var element = Get(O, indx);
        DeletePropertyOrThrow(O, indx);
        _Set(O, "length", newLen, true);
        return element;
    }
}

// 22.1.3.18
function Array_prototype_push(...items) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var argCount = arguments.length;
    if (len + argCount > 0x1fffffffffffff) throw $TypeError();
    while (items.length > 0) {
        var E = items.shift();
        _Set(O, ToString(len), E, true);
        var len = len + 1;
    }
    _Set(O, "length", len, true);
    return len;
}

// 22.1.3.19
function Array_prototype_reduce(callbackfn, initialValue) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    if (len === 0 && arguments.length <= 1) throw $TypeError();
    var k = 0;
    if (arguments.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (kPresent === true) {
                var accumulator = Get(O, Pk);
            }
            k++;
        }
        if (kPresent === false) throw $TypeError();
    }
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var accumulator = Call(callbackfn, undefined, [accumulator, kValue, k, O]);
        }
        k++;
    }
    return accumulator;
}

// 22.1.3.20
function Array_prototype_reduceRight(callbackfn, initialValue) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    if (len === 0 && arguments.length <= 1) throw $TypeError();
    var k = len - 1;
    if (arguments.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && k >= 0) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (kPresent === true) {
                var accumulator = Get(O, Pk);
            }
            k--;
        }
        if (kPresent === false) throw $TypeError();
    }
    while (k >= 0) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var accumulator = Call(callbackfn, undefined, [accumulator, kValue, k, O]);
        }
        k--;
    }
    return accumulator;
}

// 22.1.3.21
function Array_prototype_reverse() {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var middle = Math.floor(len / 2);
    var lower = 0;
    while (lower !== middle) {
        var upper = len - lower - 1;
        var upperP = ToString(upper);
        var lowerP = ToString(lower);
        var lowerExists = HasProperty(O, lowerP);
        if (lowerExists === true) {
            var lowerValue = Get(O, lowerP);
        }
        var upperExists = HasProperty(O, upperP);
        if (upperExists === true) {
            var upperValue = Get(O, upperP);
        }
        if (lowerExists === true && upperExists === true) {
            _Set(O, lowerP, upperValue, true);
            _Set(O, upperP, lowerValue, true);
        } else if (lowerExists === false && upperExists === true) {
            _Set(O, lowerP, upperValue, true);
            DeletePropertyOrThrow(O, upperP);
        } else if (lowerExists === true && upperExists === false) {
            DeletePropertyOrThrow(O, lowerP);
            _Set(O, upperP, lowerValue, true);
        }
        lower++;
    }
    return O;
}

// 22.1.3.22
function Array_prototype_shift() {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (len === 0) {
        _Set(O, "length", 0, true);
        return undefined;
    }
    var first = Get(O, "0");
    var k = 1;
    while (k < len) {
        var from = ToString(k);
        var to = ToString(k - 1);
        var fromPresent = HasProperty(O, from);
        if (fromPresent === true) {
            var fromVal = Get(O, from);
            _Set(O, to, fromVal, true);
        } else {
            DeletePropertyOrThrow(O, to);
        }
        k++;
    }
    DeletePropertyOrThrow(O, ToString(len - 1));
    _Set(O, "length", len - 1, true);
    return first;
}

// 22.1.3.23
function Array_prototype_slice(start, end) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var k = Math.max((len + relativeStart), 0);
    else var k = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    var count = Math.max(final - k, 0);
    var A = ArraySpeciesCreate(O, count);
    var n = 0;
    while (k < final) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            CreateDataPropertyOrThrow(A, ToString(n), kValue);
        }
        k++;
        n++;
    }
    _Set(A, "length", n, true);
    return A;
}

// 22.1.3.24
function Array_prototype_some(callbackfn, thisArg) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var testResult = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
            if (testResult === true) return true;
        }
        k++;
    }
    return false;
}

// 22.1.3.25
function Array_prototype_sort(comparefn) {
    var obj = ToObject(this);
    var len = ToLength(Get(obj, "length"));
    var actual = [];
    for (var j = 0; j < len; j++) {
        var P = ToString(j);
        if (HasOwnProperty(obj, P)) {
            actual.push(obj.Get(P, obj));
        }
    }
    var actlen = actual.length;
    for (var j = actlen; j < len; j++) {
        var P = ToString(j);
        DeletePropertyOrThrow(obj, P);
    }
    var index = 0;
    qsort(actual);
    Assert(index === actlen);
    return obj;

    function qsort(values) {
        var l = values.length;
        if (l <= 1) {
            if (l === 1) {
                if (obj.Set(ToString(index++), values[0], obj) === false) throw $TypeError();
            }
            return;
        }
        var lower = [];
        var same = [];
        var higher = [];
        var p = values[l >>> 1];
        for (var i = 0; i < l; i++) {
            var q = values[i];
            var c = (q === p) ? 0 : SortCompare(q, p);
            switch (c) {
                case -1:
                    lower.push(q);
                    break;
                case 0:
                    same.push(q);
                    break;
                case 1:
                    higher.push(q);
                    break;
            }
        }
        values = null;
        qsort(lower);
        for (var i = 0; i < same.length; i++) {
            if (obj.Set(ToString(index++), same[i], obj) === false) throw $TypeError();
        }
        qsort(higher);
    }

    // 22.1.3.25.1
    function SortCompare(x, y) {
        if (x === undefined && y === undefined) return +0;
        if (x === undefined) return 1;
        if (y === undefined) return -1;
        if (comparefn !== undefined) {
            var v = ToNumber(Call(comparefn, undefined, [x, y]));
            if (Number.isNaN(v)) return +0;
            return v;
        }
        var xString = ToString(x);
        var yString = ToString(y);
        var xSmaller = (xString < yString);
        if (xSmaller === true) return -1;
        var ySmaller = (yString < xString);
        if (ySmaller === true) return 1;
        return +0;
    }
}

// 22.1.3.26
function Array_prototype_splice(start, deleteCount, ...items) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var actualStart = Math.max((len + relativeStart), 0);
    else var actualStart = Math.min(relativeStart, len);
    if (arguments.length === 0) {
        var insertCount = 0;
        var actualDeleteCount = 0;
    } else if (arguments.length === 1) {
        var insertCount = 0;
        var actualDeleteCount = len - actualStart;
    } else {
        var insertCount = arguments.length - 2;
        var dc = ToInteger(deleteCount);
        var actualDeleteCount = Math.min(Math.max(dc, 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > 0x1fffffffffffff) throw $TypeError();
    var A = ArraySpeciesCreate(O, actualDeleteCount);
    var k = 0;
    while (k < actualDeleteCount) {
        var from = ToString(actualStart + k);
        var fromPresent = HasProperty(O, from);
        if (fromPresent === true) {
            var fromValue = Get(O, from);
            CreateDataPropertyOrThrow(A, ToString(k), fromValue);
        }
        k++;
    }
    _Set(A, "length", actualDeleteCount, true);
    var itemCount = items.length;
    if (itemCount < actualDeleteCount) {
        var k = actualStart;
        while (k < (len - actualDeleteCount)) {
            var from = ToString(k + actualDeleteCount);
            var to = ToString(k + itemCount);
            var fromPresent = HasProperty(O, from);
            if (fromPresent === true) {
                var fromValue = Get(O, from);
                _Set(O, to, fromValue, true);
            } else {
                DeletePropertyOrThrow(O, to);
            }
            k++;
        }
        var k = len;
        while (k > (len - actualDeleteCount + itemCount)) {
            DeletePropertyOrThrow(O, ToString(k - 1));
            k--;
        }
    } else if (itemCount > actualDeleteCount) {
        var k = (len - actualDeleteCount);
        while (k > actualStart) {
            var from = ToString(k + actualDeleteCount - 1);
            var to = ToString(k + itemCount - 1);
            var fromPresent = HasProperty(O, from);
            if (fromPresent === true) {
                var fromValue = Get(O, from);
                _Set(O, to, fromValue, true);
            } else {
                DeletePropertyOrThrow(O, to);
            }
            k--;
        }
    }
    var k = actualStart;
    while (items.length > 0) {
        var E = items.shift();
        _Set(O, ToString(k), E, true);
        k++;
    }
    _Set(O, "length", len - actualDeleteCount + itemCount, true); // necessary to preserve backward compatibility
    return A;
}

// 22.1.3.27
function Array_prototype_toLocaleString() {
    var array = ToObject(this);
    var len = ToLength(Get(array, "length"));
    var separator = ', ';
    if (len === 0) return '';
    var firstElement = Get(array, "0");
    if (firstElement === undefined || firstElement === null) {
        var R = '';
    } else {
        var R = ToString(Invoke(firstElement, "toLocaleString"));
    }
    var k = 1;
    while (k < len) {
        var S = R + separator;
        var nextElement = Get(array, ToString(k));
        if (nextElement === undefined || nextElement === null) {
            var R = '';
        } else {
            var R = ToString(Invoke(nextElement, "toLocaleString"));
        }
        var R = S + R;
        k++;
    }
    return R;
}

// 22.1.3.28
function Array_prototype_toString() {
    var array = ToObject(this);
    var func = Get(array, "join");
    if (IsCallable(func) === false) var func = currentRealm.Intrinsics['%ObjProto_toString%'];
    return Call(func, array);
}

// 22.1.3.29
function Array_prototype_unshift(...items) {
    var O = ToObject(this);
    var len = ToLength(Get(O, "length"));
    var argCount = arguments.length;
    if (argCount > 0) {
        if (len + argCount > 0x1fffffffffffff) throw $TypeError();
        var k = len;
        while (k > 0) {
            var from = ToString(k - 1);
            var to = ToString(k + argCount - 1);
            var fromPresent = HasProperty(O, from);
            if (fromPresent === true) {
                var fromValue = Get(O, from);
                _Set(O, to, fromValue, true);
            } else {
                DeletePropertyOrThrow(O, to);
            }
            k--;
        }
        var j = 0;
        while (items.length > 0) {
            var E = items.shift();
            _Set(O, ToString(j), E, true);
            j++;
        }
    }
    _Set(O, "length", len + argCount, true);
    return len + argCount;
}

// 22.1.3.30
function Array_prototype_values() {
    var O = ToObject(this);
    return CreateArrayIterator(O, "value");
}

// 22.1.3.31 Array.prototype [ @@iterator ] ( )

// 22.1.3.32
function create_Array_prototype_unscopables() {
    var blackList = ObjectCreate(null);
    CreateDataProperty(blackList, "copyWithin", true);
    CreateDataProperty(blackList, "entries", true);
    CreateDataProperty(blackList, "fill", true);
    CreateDataProperty(blackList, "find", true);
    CreateDataProperty(blackList, "findIndex", true);
    CreateDataProperty(blackList, "includes", true);
    CreateDataProperty(blackList, "keys", true);
    CreateDataProperty(blackList, "values", true);
    return blackList;
}

// 22.1.4 Properties of Array Instances

// 22.1.4.1 length

// 22.1.5 Array Iterator Objects

// 22.1.5.1
function CreateArrayIterator(array, kind) {
    Assert(Type(array) === 'Object');
    var iterator = ObjectCreate(currentRealm.Intrinsics['%ArrayIteratorPrototype%'], ['IteratedObject', 'ArrayIteratorNextIndex', 'ArrayIterationKind']);
    iterator.IteratedObject = array;
    iterator.ArrayIteratorNextIndex = 0;
    iterator.ArrayIterationKind = kind;
    return iterator;
}

// 22.1.5.2 The %ArrayIteratorPrototype% Object

// 22.1.5.2.1 %ArrayIteratorPrototype%.next( )
function ArrayIteratorPrototype_next() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('IteratedObject' in O && 'ArrayIteratorNextIndex' in O && 'ArrayIterationKind' in O)) throw $TypeError();
    var a = O.IteratedObject;
    if (a === undefined) return CreateIterResultObject(undefined, true);
    var index = O.ArrayIteratorNextIndex;
    var itemKind = O.ArrayIterationKind;
    if ('TypedArrayName' in a) {
        var len = a.ArrayLength;
    } else {
        var len = ToLength(Get(a, "length"));
    }
    if (index >= len) {
        O.IteratedObject = undefined;
        return CreateIterResultObject(undefined, true);
    }
    O.ArrayIteratorNextIndex = index + 1;
    if (itemKind === "key") return CreateIterResultObject(index, false);
    var elementKey = ToString(index);
    var elementValue = Get(a, elementKey);
    if (itemKind === "value") var result = elementValue;
    else {
        Assert(itemKind === "key+value");
        var result = CreateArrayFromList([index, elementValue]);
    }
    return CreateIterResultObject(result, false);
}

// 22.1.5.2.2 %ArrayIteratorPrototype% [ @@toStringTag ]

// 22.1.5.3 Properties of Array Iterator Instances

// 22.2 TypedArray Objects

const Table50 = {
    Int8Array: { ElementType: 'Int8', ElementSize: 1, ConversionOperation: ToInt8 },
    Uint8Array: { ElementType: 'Uint8', ElementSize: 1, ConversionOperation: ToUint8 },
    Uint8ClampedArray: { ElementType: 'Uint8C', ElementSize: 1, ConversionOperation: ToUint8Clamp },
    Int16Array: { ElementType: 'Int16', ElementSize: 2, ConversionOperation: ToInt16 },
    Uint16Array: { ElementType: 'Uint16', ElementSize: 2, ConversionOperation: ToUint16 },
    Int32Array: { ElementType: 'Int32', ElementSize: 4, ConversionOperation: ToInt32 },
    Uint32Array: { ElementType: 'Uint32', ElementSize: 4, ConversionOperation: ToUint32 },
    Float32Array: { ElementType: 'Float32', ElementSize: 4 },
    Float64Array: { ElementType: 'Float64', ElementSize: 8 },
};

// 22.2.1 The %TypedArray% Intrinsic Object

// 22.2.1.1 %TypedArray%()

function TypedArray$() {
    throw $TypeError();
}

// 22.2.2 Properties of the %TypedArray% Intrinsic Object

// 22.2.2.1
function TypedArray_from(source, mapfn, thisArg) {
    var C = this;
    if (IsConstructor(C) === false) throw $TypeError();
    if (mapfn !== undefined) {
        if (IsCallable(mapfn) === false) throw $TypeError();
        var mapping = true;
    } else var mapping = false;
    var T = thisArg;
    var arrayLike = IterableToArrayLike(source);
    var len = ToLength(Get(arrayLike, "length"));
    var targetObj = TypedArrayCreate(C, [len]);
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(arrayLike, Pk);
        if (mapping === true) {
            var mappedValue = Call(mapfn, T, [kValue, k]);
        } else var mappedValue = kValue;
        _Set(targetObj, Pk, mappedValue, true);
        k++;
    }
    return targetObj;
}

// 22.2.2.1.1
function IterableToArrayLike(items) {
    var usingIterator = GetMethod(items, wellKnownSymbols['@@iterator']);
    if (usingIterator !== undefined) {
        var iterator = GetIterator(items, usingIterator);
        var values = [];
        var next = true;
        while (next !== false) {
            var next = IteratorStep(iterator);
            if (next !== false) {
                var nextValue = IteratorValue(next);
                values.push(nextValue);
            }
        }
        return CreateArrayFromList(values);
    }
    return ToObject(items);
}

// 22.2.2.2
function TypedArray_of(...items) {
    var len = arguments.length;
    var C = this;
    if (IsConstructor(C) === false) throw $TypeError();
    var newObj = TypedArrayCreate(C, [len]);
    var k = 0;
    while (k < len) {
        var kValue = items[k];
        var Pk = ToString(k);
        _Set(newObj, Pk, kValue, true);
        k++;
    }
    return newObj;
}

// 22.2.2.3 %TypedArray%.prototype

// 22.2.2.4 get %TypedArray% [ @@species ]
function get_TypedArray_species() {
    return this;
}

// 22.2.3 Properties of the %TypedArrayPrototype% Object

// 22.2.3.1
function get_TypedArray_prototype_buffer() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    return buffer;
}

// 22.2.3.2
function get_TypedArray_prototype_byteLength() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) return 0;
    var size = O.ByteLength;
    return size;
}

// 22.2.3.3
function get_TypedArray_prototype_byteOffset() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) return 0;
    var offset = O.ByteOffset;
    return offset;
}

// 22.2.3.4 %TypedArray%.prototype.constructor

// 22.2.3.5
function TypedArray_prototype_copyWithin(target, start, end) {
    var O = this;
    ValidateTypedArray(this);
    var len = O.ArrayLength;
    var relativeTarget = ToInteger(target);
    if (relativeTarget < 0) var to = Math.max((len + relativeTarget), 0);
    else var to = Math.min(relativeTarget, len);
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var from = Math.max((len + relativeStart), 0);
    else var from = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    var count = Math.min(final - from, len - to);
    if (from < to && to < from + count) {
        var direction = -1;
        var from = from + count - 1;
        var to = to + count - 1;
    } else {
        var direction = 1;
    }
    while (count > 0) {
        var fromKey = ToString(from);
        var toKey = ToString(to);
        var fromPresent = HasProperty(O, fromKey);
        if (fromPresent === true) {
            var fromVal = Get(O, fromKey);
            _Set(O, toKey, fromVal, true);
        } else {
            DeletePropertyOrThrow(O, toKey);
        }
        var from = from + direction;
        var to = to + direction;
        var count = count - 1;
    }
    return O;
}

// 22.2.3.5.1 
function ValidateTypedArray(O) {
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('TypedArrayName' in O)) throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    return buffer;
}

// 22.2.3.6
function TypedArray_prototype_entries() {
    var O = this;
    ValidateTypedArray(O);
    return CreateArrayIterator(O, "key+value");
}

// 22.2.3.7
function TypedArray_prototype_every(callbackfn, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var testResult = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
            if (testResult === false) return false;
            k++;
        }
        return true;
    }
}


// 22.2.3.8
function TypedArray_prototype_fill(value, start, end) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var k = Math.max((len + relativeStart), 0);
    else var k = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    while (k < final) {
        var Pk = ToString(k);
        _Set(O, Pk, value, true);
        k++;
    }
    return O;
}

// 22.2.3.9
function TypedArray_prototype_filter(callbackfn, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var kept = [];
    var k = 0;
    var captured = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var selected = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
        if (selected === true) {
            kept.push(kValue);
        }
        captured++;
        k++;
    }
    var A = TypedArraySpeciesCreate(O, [captured]);
    var n = 0;
    for (var e of kept) {
        _Set(A, ToString(n), e, true);
        n++;
    }
    return A;
}

// 22.2.3.10
function TypedArray_prototype_find(predicate, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(predicate) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var testResult = ToBoolean(Call(predicate, T, [kValue, k, O]));
        if (testResult === true) return kValue;
        k++;
    }
    return undefined;
}

// 22.2.3.11
function TypedArray_prototype_findIndex(predicate, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(predicate) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var testResult = ToBoolean(Call(predicate, T, [kValue, k, O]));
        if (testResult === true) return k;
        k++;
    }
    return -1;
}

// 22.2.3.12
function TypedArray_prototype_forEach(callbackfn, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            Call(callbackfn, T, [kValue, k, O]);
        }
        k++;
    }
    return undefined;
}

// 22.2.3.13
function TypedArray_prototype_indexOf(searchElement, fromIndex) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (len === 0) return -1;
    var n = ToInteger(fromIndex);
    if (n >= len) return -1;
    if (n >= 0) {
        if (is_negative_zero(n)) var k = +0;
        else var k = n;
    } else {
        var k = len + n;
        if (k < 0) var k = 0;
    }
    while (k < len) {
        var kPresent = HasProperty(O, ToString(k));
        if (kPresent === true) {
            var elementK = Get(O, ToString(k));
            var same = StrictEqualityComparison(searchElement, elementK);
            if (same === true) return k;
        }
        k++;
    }
    return -1;
}

// 22.2.3.14
function TypedArray_prototype_includes(searchElement, fromIndex) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (len === 0) return false;
    var n = ToInteger(fromIndex);
    if (n >= 0) {
        var k = n;
    } else {
        var k = len + n;
        if (k < 0) var k = 0;
    }
    while (k < len) {
        var elementK = Get(O, ToString(k));
        if (SameValueZero(searchElement, elementK) === true) return true;
        k++;
    }
    return false;
}

// 22.2.3.15
function TypedArray_prototype_join(separator) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (separator === undefined) var separator = ",";
    var sep = ToString(separator);
    if (len === 0) return '';
    var element0 = Get(O, "0");
    if (element0 === undefined || element0 === null) var R = '';
    else var R = ToString(element0);
    var k = 1;
    while (k < len) {
        var S = R + sep;
        var element = Get(O, ToString(k));
        if (element === undefined || element === null) var next = '';
        else var next = ToString(element);
        var R = S + next;
        k++;
    }
    return R;
}

// 22.2.3.16
function TypedArray_prototype_keys() {
    var O = this;
    ValidateTypedArray(O);
    return CreateArrayIterator(O, "key");
}

// 22.2.3.17
function TypedArray_prototype_lastIndexOf(searchElement, fromIndex) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (len === 0) return -1;
    if (arguments.length >= 2) var n = ToInteger(fromIndex);
    else var n = len - 1;
    if (n >= 0) {
        if (is_negative_zero(n)) var k = +0;
        else var k = Math.min(n, len - 1);
    } else {
        var k = len + n;
    }
    while (k >= 0) {
        var kPresent = HasProperty(O, ToString(k));
        if (kPresent === true) {
            var elementK = Get(O, ToString(k));
            var same = StrictEqualityComparison(searchElement, elementK);
            if (same === true) return k;
        }
        k++;
    }
    return -1;
}

// 22.2.3.18
function get_TypedArray_prototype_length() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('TypedArrayName' in O)) throw $TypeError();
    Assert('ViewedArrayBuffer' in O && 'ArrayLength' in O);
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) return 0;
    var length = O.ArrayLength;
    return length;
}

// 22.2.3.19

function TypedArray_prototype_map(callbackfn, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var A = TypedArraySpeciesCreate(O, [len]);
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(O, Pk);
        var mappedValue = Call(callbackfn, T, [kValue, k, O]);
        _Set(A, Pk, mappedValue, true);
        k++;
    }
    return A;
}

// 22.2.3.20
function TypedArray_prototype_reduce(callbackfn, initialValue) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    if (len === 0 && arguments.length <= 1) throw $TypeError();
    var k = 0;
    if (arguments.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (kPresent === true) {
                var accumulator = Get(O, Pk);
            }
            k++;
        }
        if (kPresent === false) throw $TypeError();
    }
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var accumulator = Call(callbackfn, undefined, [accumulator, kValue, k, O]);
        }
        k++;
    }
    return accumulator;
}

// 22.2.3.21
function TypedArray_prototype_reduceRight(callbackfn, initialValue) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    if (len === 0 && arguments.length <= 1) throw $TypeError();
    var k = len - 1;
    if (arguments.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && k >= 0) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (kPresent === true) {
                var accumulator = Get(O, Pk);
            }
            k--;
        }
        if (kPresent === false) throw $TypeError();
    }
    while (k >= 0) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var accumulator = Call(callbackfn, undefined, [accumulator, kValue, k, O]);
        }
        k--;
    }
    return accumulator;
}

// 22.2.3.22
function TypedArray_prototype_reverse() {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    var middle = Math.floor(len / 2);
    var lower = 0;
    while (lower !== middle) {
        var upper = len - lower - 1;
        var upperP = ToString(upper);
        var lowerP = ToString(lower);
        var lowerExists = HasProperty(O, lowerP);
        if (lowerExists === true) {
            var lowerValue = Get(O, lowerP);
        }
        var upperExists = HasProperty(O, upperP);
        if (upperExists === true) {
            var upperValue = Get(O, upperP);
        }
        if (lowerExists === true && upperExists === true) {
            _Set(O, lowerP, upperValue, true);
            _Set(O, upperP, lowerValue, true);
        } else if (lowerExists === false && upperExists === true) {
            _Set(O, lowerP, upperValue, true);
            DeletePropertyOrThrow(O, upperP);
        } else if (lowerExists === true && upperExists === false) {
            DeletePropertyOrThrow(O, lowerP);
            _Set(O, upperP, lowerValue, true);
        }
        lower++;
    }
    return O;
}

// 22.2.3.23
function TypedArray_prototype_set(overloaded, offset) {
    if (Type(overloaded) === 'Object' && 'TypedArrayName' in overloaded) {
        return TypedArray_prototype_set$2(overloaded, offset);
    } else {
        return TypedArray_prototype_set$1(overloaded, offset);
    }
}


// 22.2.3.23.1
function TypedArray_prototype_set$1(array, offset) {
    var target = this;
    if (Type(target) !== 'Object') throw $TypeError();
    if (!('TypedArrayName' in target)) throw $TypeError();
    Assert('ViewedArrayBuffer' in target);
    var targetOffset = ToInteger(offset);
    if (targetOffset < 0) throw $RangeError();
    var targetBuffer = target.ViewedArrayBuffer;
    if (IsDetachedBuffer(targetBuffer) === true) throw $TypeError();
    var targetLength = target.ArrayLength;
    var targetName = target.TypedArrayName;
    var targetElementSize = Table50[targetName].ElementSize;
    var targetType = Table50[targetName].ElementType;
    var targetByteOffset = target.ByteOffset;
    var src = ToObject(array);
    var srcLength = ToLength(Get(src, "length"));
    if (srcLength + targetOffset > targetLength) throw $RangeError();
    var targetByteIndex = targetOffset * targetElementSize + targetByteOffset;
    var k = 0;
    var limit = targetByteIndex + targetElementSize * srcLength;
    while (targetByteIndex < limit) {
        var Pk = ToString(k);
        var kNumber = ToNumber(Get(src, Pk));
        if (IsDetachedBuffer(targetBuffer) === true) throw $TypeError();
        SetValueInBuffer(targetBuffer, targetByteIndex, targetType, kNumber);
        k = k + 1;
        targetByteIndex = targetByteIndex + targetElementSize;
    }
    return undefined;
}

// 22.2.3.23.2
function TypedArray_prototype_set$2(typedArray, offset) {
    var target = this;
    if (Type(target) !== 'Object') throw $TypeError();
    if (!('TypedArrayName' in target)) throw $TypeError();
    Assert('ViewedArrayBuffer' in target);
    var targetOffset = ToInteger(offset);
    if (targetOffset < 0) throw $RangeError();
    var targetBuffer = target.ViewedArrayBuffer;
    if (IsDetachedBuffer(targetBuffer) === true) throw $TypeError();
    var targetLength = target.ArrayLength;
    var srcBuffer = typedArray.ViewedArrayBuffer;
    if (IsDetachedBuffer(srcBuffer) === true) throw $TypeError();
    var targetName = target.TypedArrayName;
    var targetType = Table50[targetName].ElementType;
    var targetElementSize = Table50[targetName].ElementSize;
    var targetByteOffset = target.ByteOffset;
    var srcName = typedArray.TypedArrayName;
    var srcType = Table50[srcName].ElementType;
    var srcElementSize = Table50[srcName].ElementSize;
    var srcLength = typedArray.ArrayLength;
    var srcByteOffset = typedArray.ByteOffset;
    if (srcLength + targetOffset > targetLength) throw $RangeError();
    if (SameValue(srcBuffer, targetBuffer) === true) {
        var srcBuffer = CloneArrayBuffer(targetBuffer, srcByteOffset, currentRealm.Intrinsics['%ArrayBuffer%']);
        var srcByteIndex = 0;
    } else var srcByteIndex = srcByteOffset;
    var targetByteIndex = targetOffset * targetElementSize + targetByteOffset;
    var limit = targetByteIndex + targetElementSize * srcLength;
    if (SameValue(srcType, targetType) === false) {
        while (targetByteIndex < limit) {
            var value = GetValueFromBuffer(srcBuffer, srcByteIndex, srcType);
            SetValueInBuffer(targetBuffer, targetByteIndex, targetType, value);
            srcByteIndex = srcByteIndex + srcElementSize;
            targetByteIndex = targetByteIndex + targetElementSize;
        }
    } else {
        while (targetByteIndex < limit) {
            var value = GetValueFromBuffer(srcBuffer, srcByteIndex, "Uint8");
            SetValueInBuffer(targetBuffer, targetByteIndex, "Uint8", value);
            srcByteIndex = srcByteIndex + 1;
            targetByteIndex = targetByteIndex + 1;
        }
    }
    return undefined;
}

// 22.2.3.24
function TypedArray_prototype_slice(start, end) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var k = Math.max((len + relativeStart), 0);
    else var k = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    var count = Math.max(final - k, 0);
    var A = TypedArraySpeciesCreate(O, [count]);
    var srcName = O.TypedArrayName;
    var srcType = Table50[srcName].ElementType;
    var targetName = A.TypedArrayName;
    var targetType = Table50[targetName].ElementType;
    if (SameValue(srcType, targetType) === false) {
        var n = 0;
        while (k < final) {
            var Pk = ToString(k);
            var kValue = Get(O, Pk);
            _Set(A, ToString(n), kValue, true);
            k++;
            n++;
        }
    } else if (count > 0) {
        var srcBuffer = O.ViewedArrayBuffer;
        if (IsDetachedBuffer(srcBuffer) === true) throw $TypeError();
        var targetBuffer = A.ViewedArrayBuffer;
        var elementSize = Table50[srcType].ElementSize;
        var srcByteOffet = O.ByteOffset;
        var targetByteIndex = A.ByteOffset;
        var srcByteIndex = (k * elementSize) + srcByteOffet;
        var limit = targetByteIndex + count * elementSize;
        while (targetByteIndex < limit) {
            var value = GetValueFromBuffer(srcBuffer, srcByteIndex, "Uint8");
            SetValueInBuffer(targetBuffer, targetByteIndex, "Uint8", value);
            srcByteIndex++;
            targetByteIndex++;
        }
    }
    return A;
}

// 22.2.3.25
function TypedArray_prototype_some(callbackfn, thisArg) {
    var O = this;
    ValidateTypedArray(O);
    var len = O.ArrayLength;
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            var testResult = ToBoolean(Call(callbackfn, T, [kValue, k, O]));
            if (testResult === true) return true;
        }
        k++;
    }
    return false;
}

// 22.2.3.26
function TypedArray_prototype_sort(comparefn) {
    var obj = this;
    var buffer = ValidateTypedArray(obj);
    var len = obj.ArrayLength;
    var actual = [];
    for (var j = 0; j < len; j++) {
        actual[j] = obj.Get(ToString(j), obj);
    }
    var actlen = actual.length;
    var index = 0;
    qsort(actual);
    Assert(index === actlen);
    return obj;

    function qsort(values) {
        var l = values.length;
        if (l <= 1) {
            if (l === 1) {
                if (obj.Set(ToString(index++), values[0], obj) === false) throw $TypeError();
            }
            return;
        }
        var lower = [];
        var same = [];
        var higher = [];
        var p = values[l >>> 1];
        for (var i = 0; i < l; i++) {
            var q = values[i];
            var c = (q === p) ? 0 : SortCompare(q, p);
            switch (c) {
                case -1:
                    lower.push(q);
                    break;
                case 0:
                    same.push(q);
                    break;
                case 1:
                    higher.push(q);
                    break;
            }
        }
        values = null;
        qsort(lower);
        for (var i = 0; i < same.length; i++) {
            if (obj.Set(ToString(index++), same[i], obj) === false) throw $TypeError();
        }
        qsort(higher);
    }

    function SortCompare(x, y) {
        Assert(Type(x) === 'Number' && Type(y) === 'Number');
        if (comparefn !== undefined) {
            var v = Call(comparefn, undefined, [x, y]);
            if (IsDetachedBuffer(buffer) === true) throw $TypeError();
            if (Number.isNaN(v)) return +0;
            return v;
        }
        if (Number.isNaN(x) && Number.isNaN(y)) return +0;
        if (Number.isNaN(x)) return 1;
        if (Number.isNaN(y)) return -1;
        if (x < y) return -1;
        if (x > y) return 1;
        if (is_negative_zero(x) && is_positive_zero(y)) return -1;
        if (is_positive_zero(x) && is_negative_zero(y)) return 1;
        return +0;
    }
}

// 22.2.3.27
function TypedArray_prototype_subarray(begin, end) {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('TypedArrayName' in O)) throw $TypeError();
    Assert('ViewedArrayBuffer' in O);
    var buffer = O.ViewedArrayBuffer;
    var srcLength = O.ArrayLength;
    var relativeBegin = ToInteger(begin);
    if (relativeBegin < 0) var beginIndex = Math.max((srcLength + relativeBegin), 0);
    else var beginIndex = Math.min(relativeBegin, srcLength);
    if (end === undefined) var relativeEnd = srcLength;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var endIndex = Math.max((srcLength + relativeEnd), 0);
    else var endIndex = Math.min(relativeEnd, srcLength);
    var newLength = Math.max(endIndex - beginIndex, 0);
    var constructorName = O.TypedArrayName;
    var elementSize = Table50[constructorName].ElementSize;
    var srcByteOffset = O.ByteOffset;
    var beginByteOffset = srcByteOffset + beginIndex * elementSize;
    var argumentsList = [buffer, beginByteOffset, newLength];
    return TypedArraySpeciesCreate(O, argumentsList);
}

// 22.2.3.28
function TypedArray_prototype_toLocaleString() {
    var array = this;
    ValidateTypedArray(array);
    var len = array.ArrayLength;
    var separator = ', ';
    if (len === 0) return '';
    var firstElement = Get(array, "0");
    if (firstElement === undefined || firstElement === null) {
        var R = '';
    } else {
        var R = ToString(Invoke(firstElement, "toLocaleString"));
    }
    var k = 1;
    while (k < len) {
        var S = R + separator;
        var nextElement = Get(array, ToString(k));
        if (nextElement === undefined || nextElement === null) {
            var R = '';
        } else {
            var R = ToString(Invoke(nextElement, "toLocaleString"));
        }
        var R = S + R;
        k++;
    }
    return R;
}

// 22.2.3.29 %TypedArray%.prototype.toString ( )

// 22.2.3.30
function TypedArray_prototype_values() {
    var O = this;
    ValidateTypedArray(O);
    return CreateArrayIterator(O, "value");
}

// 22.2.3.31 %TypedArray%.prototype [ @@iterator ] ( )

// 22.2.3.32
function get_TypedArray_prototype_toStringTag() {
    var O = this;
    if (Type(O) !== 'Object') return undefined;
    if (!('TypedArrayName' in O)) return undefined;
    var name = O.TypedArrayName;
    Assert(typeof name === 'string');
    return name;
}

// 22.2.4.2.1 
function AllocateTypedArray(constructorName, newTarget, defaultProto, length) {
    var proto = GetPrototypeFromConstructor(newTarget, defaultProto);
    var obj = IntegerIndexedObjectCreate(proto, ['ViewedArrayBuffer', 'TypedArrayName', 'ByteLength', 'ByteOffset', 'ArrayLength']);
    Assert(obj.ViewedArrayBuffer === undefined);
    obj.TypedArrayName = constructorName;
    if (arguments.length <= 3) {
        obj.ByteLength = 0;
        obj.ByteOffset = 0;
        obj.ArrayLength = 0;
    } else {
        AllocateTypedArrayBuffer(obj, length);
    }
    return obj;
}

// 22.2.4.2.2
function AllocateTypedArrayBuffer(O, length) {
    Assert('ViewedArrayBuffer' in O);
    Assert(O.ViewedArrayBuffer === undefined);
    Assert(length >= 0);
    var constructorName = O.TypedArrayName;
    var elementSize = Table50[constructorName].ElementSize;
    var byteLength = elementSize * length;
    var data = AllocateArrayBuffer(currentRealm.Intrinsics['%ArrayBuffer%'], byteLength);
    O.ViewedArrayBuffer = data;
    O.ByteLength = byteLength;
    O.ByteOffset = 0;
    O.ArrayLength = length;
    return O;
}

// 22.2.4.6
function TypedArrayCreate(constructor, argumentList) {
    var newTypedArray = Construct(constructor, argumentList);
    ValidateTypedArray(newTypedArray);
    if (argumentList.length === 1 && typeof argumentList[0] === 'number') {
        if (newTypedArray.ArrayLength < argumentList[0]) throw $TypeError();
    }
    return newTypedArray;
}

// 22.2.4.7
function TypedArraySpeciesCreate(exemplar, argumentList) {
    Assert('TypedArrayName' in exemplar);
    var defaultConstructor = currentRealm.Intrinsics['%' + exemplar.TypedArrayName + '%'];
    var constructor = SpeciesConstructor(exemplar, defaultConstructor);
    return TypedArrayCreate(constructor, argumentList);
}

// 22.2.5 Properties of the TypedArray Constructors

// 22.2.5.1 TypedArray.BYTES_PER_ELEMENT

// 22.2.5.2 TypedArray.prototype

// 22.2.6 Properties of TypedArray Prototype Objects

// 22.2.6.1 TypedArray.prototype.BYTES_PER_ELEMENT

// 22.2.6.2 TypedArray.prototype.constructor

// 22.2.7 Properties of TypedArray Instances

const TypedArray_constructors = {};

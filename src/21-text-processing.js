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

// 21 Text Processing

// 21.1 String Objects

// 21.1.1 The String Constructor

// 21.1.1.1
function String$(value) {
    if (arguments.length === 0) var s = "";
    else {
        if (NewTarget === undefined && Type(value) === 'Symbol') return SymbolDescriptiveString(value);
        var s = ToString(value);
    }
    if (NewTarget === undefined) return s;
    return StringCreate(s, GetPrototypeFromConstructor(NewTarget, "%StringPrototype%"));
}

// 21.1.2 Properties of the String Constructor

// 21.1.2.1
function String_fromCharCode(...codeUnits) {
    var length = codeUnits.length;
    var elements = [];
    var nextIndex = 0;
    while (nextIndex < length) {
        var next = codeUnits[nextIndex];
        var nextCU = ToUint16(next);
        elements.push(nextCU);
        var nextIndex = nextIndex + 1;
    }
    return String.fromCharCode(...elements);
}

// 21.1.2.2
function String_fromCodePoint(...codePoints) {
    var length = codePoints.length;
    var elements = [];
    var nextIndex = 0;
    while (nextIndex < length) {
        var next = codePoints[nextIndex];
        var nextCP = ToNumber(next);
        if (SameValue(nextCP, ToInteger(nextCP)) === false) throw $RangeError();
        if (nextCP < 0 || nextCP > 0x10FFFF) throw $RangeError();
        elements.push(UTF16Encoding(nextCP));
        var nextIndex = nextIndex + 1;
    }
    return elements.join('');
}

// 21.1.2.3 String.prototype

// 21.1.2.4
function String_raw(template, ...substitutions) {
    var numberOfSubstitutions = substitutions.length;
    var cooked = ToObject(template);
    var raw = ToObject(Get(cooked, "raw"));
    var literalSegments = ToLength(Get(raw, "length"));
    if (literalSegments <= 0) return '';
    var stringElements = [];
    var nextIndex = 0;
    while (true) {
        var nextKey = ToString(nextIndex);
        var nextSeg = ToString(Get(raw, nextKey));
        stringElements.push(nextSeg);
        if (nextIndex + 1 === literalSegments) {
            return stringElements.join('');
        }
        if (nextIndex < numberOfSubstitutions) var next = substitutions[nextIndex];
        else var next = '';
        var nextSub = ToString(next);
        stringElements.push(nextSub);
        var nextIndex = nextIndex + 1;
    }
}

// 21.1.3 Properties of the String Prototype Object

function thisStringValue(value) {
    if (Type(value) === 'String') return value;
    if (Type(value) === 'Object' && 'StringData' in value) {
        Assert(Type(value.StringData) === 'String');
        return value.StringData;
    }
    throw $TypeError();
}

// 21.1.3.1
function String_prototype_charAt(pos) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var position = ToInteger(pos);
    var size = S.length;
    if (position < 0 || position >= size) return '';
    return S.charAt(position);
}

// 21.1.3.2
function String_prototype_charCodeAt(pos) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var position = ToInteger(pos);
    var size = S.length;
    if (position < 0 || position >= size) return NaN;
    return S.charCodeAt(position);
}

// 21.1.3.3
function String_prototype_codePointAt(pos) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var position = ToInteger(pos);
    var size = S.length;
    if (position < 0 || position >= size) return undefined;
    var first = S.charCodeAt(position);
    if (first < 0xD800 || first > 0xDBFF || position + 1 === size) return first;
    var second = S.charCodeAt(position + 1);
    if (second < 0xDC00 || second > 0xDFFF) return first;
    return UTF16Decode(first, second);
}

// 21.1.3.4
function String_prototype_concat(...args) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var R = S;
    while (args.length > 0) {
        var next = args.shift();
        var nextString = ToString(next);
        var R = R + nextString;
    }
    return R;
}

// 21.1.3.5 String.prototype.constructor

// 21.1.3.6
function String_prototype_endsWith(searchString, endPosition) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var isRegExp = IsRegExp(searchString);
    if (isRegExp === true) throw $TypeError();
    var searchStr = ToString(searchString);
    var len = S.length;
    if (endPosition === undefined) var pos = len;
    else var pos = ToInteger(endPosition);
    var end = Math.min(Math.max(pos, 0), len);
    var searchLength = searchStr.length;
    var start = end - searchLength;
    if (start < 0) return false;
    if (S.substring(start, start + searchLength) === searchStr) return true;
    else return false;
}

// 21.1.3.7
function String_prototype_includes(searchString, position) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var isRegExp = IsRegExp(searchString);
    if (isRegExp === true) throw $TypeError();
    var searchStr = ToString(searchString);
    var pos = ToInteger(position);
    var len = S.length;
    var start = Math.min(Math.max(pos, 0), len);
    var searchLen = searchStr.length;
    // Here we rely on underlying virtual machine.
    return S.includes(searchStr, start);
}

// 21.1.3.8
function String_prototype_indexOf(searchString, position) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var searchStr = ToString(searchString);
    var pos = ToInteger(position);
    var len = S.length;
    var start = Math.min(Math.max(pos, 0), len);
    var searchLen = searchStr.length;
    // Here we rely on underlying virtual machine.
    return S.indexOf(searchStr, start);
}

// 21.1.3.9
function String_prototype_lastIndexOf(searchString, position) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var searchStr = ToString(searchString);
    var numPos = ToNumber(position);
    if (Number.isNaN(numPos)) var pos = +Infinity;
    else var pos = ToInteger(numPos);
    var len = S.length;
    var start = Math.min(Math.max(pos, 0), len);
    var searchLen = searchStr.length;
    // Here we rely on underlying virtual machine.
    return S.lastIndexOf(searchStr, start);
}

// 21.1.3.10
function String_prototype_localeCompare(that, reserved1, reserved2) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var That = ToString(that);
    return S.localeCompare(That);
}

// 21.1.3.11
function String_prototype_match(regexp) {
    var O = RequireObjectCoercible(this);
    if (!(regexp === undefined || regexp === null)) {
        var matcher = GetMethod(regexp, wellKnownSymbols['@@match']);
        if (matcher !== undefined) {
            return Call(matcher, regexp, [O]);
        }
    }
    var S = ToString(O);
    var rx = RegExpCreate(regexp, undefined);
    return Invoke(rx, wellKnownSymbols['@@match'], [S]);
}

// 21.1.3.12
function String_prototype_normalize(form) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    if (form === undefined) var form = "NFC";
    var f = ToString(form);
    if (!(f.is_an_element_of(["NFC", "NFD", "NFKC", "NFKD"]))) throw $RangeError();
    var ns = S.normalize(f);
    return ns;
}

// 21.1.3.13
function String_prototype_repeat(count) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var n = ToInteger(count);
    if (n < 0) throw $RangeError();
    if (n === +Infinity) throw $RangeError();
    var T = S.repeat(n);
    return T;
}

// 21.1.3.14
function String_prototype_replace(searchValue, replaceValue) {
    var O = RequireObjectCoercible(this);
    if (!(searchValue === undefined || searchValue === null)) {
        var replacer = GetMethod(searchValue, wellKnownSymbols['@@replace']);
        if (replacer !== undefined) {
            return Call(replacer, searchValue, [O, replaceValue]);
        }
    }
    var string = ToString(O);
    var searchString = ToString(searchValue);
    var functionalReplace = IsCallable(replaceValue);
    if (functionalReplace === false) {
        var replaceValue = ToString(replaceValue);
    }
    var pos = string.indexOf(searchString);
    var matched = searchString;
    if (pos < 0) return string;
    if (functionalReplace === true) {
        var replValue = Call(replaceValue, undefined, [matched, pos, string]);
        var replStr = ToString(replValue);
    } else {
        var captures = [];
        var replStr = GetSubstitution(matched, string, pos, captures, replaceValue);
    }
    var tailPos = pos + matched.length;
    var newString = string.substring(0, pos) + replStr + string.substring(tailPos);
    return newString;
}

// 21.1.3.14.1 
function GetSubstitution(matched, str, position, captures, replacement) {
    Assert(Type(matched) === 'String');
    var matchLength = matched.length;
    Assert(Type(str) === 'String');
    var stringLength = str.length;
    Assert(position >= 0);
    Assert(position <= stringLength);
    Assert(Type(replacement) === 'String');
    var tailPos = position + matchLength;
    var m = captures.length;
    var buffer = [];
    for (var i = 0; i < replacement.length; i++) {
        var c = replacement[i];
        if (c === '$') {
            var a = replacement[i + 1];
            var b = replacement[i + 2];
            if (a === '$') {
                buffer.push('$');
                i++;
                continue;
            }
            if (a === '&') {
                buffer.push(matched);
                i++;
                continue;
            }
            if (a === '`') {
                buffer.push(str.substring(0, position));
                i++;
                continue;
            }
            if (a === "'") {
                buffer.push(str.substring(tailPos));
                i++;
                continue;
            }
            if (a !== undefined && is_digit_char(a)) {
                var x = mv_of_digit_char(a);
                if (b !== undefined && is_digit_char(b)) {
                    var y = mv_of_digit_char(b);
                    var nn = x * 10 + y;
                    if (1 <= nn && nn <= m) {
                        var c = captures[nn - 1];
                        if (c === undefined) c = '';
                        buffer.push(c);
                        i += 2;
                        continue;
                    }
                }
                if (1 <= x && x <= m) {
                    var c = captures[x - 1];
                    if (c === undefined) c = '';
                    buffer.push(c);
                    i++;
                    continue;
                }
            }
        }
        buffer.push(c);
    }
    var result = buffer.join('');
    return result;
}

// 21.1.3.15
function String_prototype_search(regexp) {
    var O = RequireObjectCoercible(this);
    if (!(regexp === undefined || regexp === null)) {
        var searcher = GetMethod(regexp, wellKnownSymbols['@@search']);
        if (searcher !== undefined) {
            return Call(searcher, regexp, [O]);
        }
    }
    var string = ToString(O);
    var rx = RegExpCreate(regexp, undefined);
    return Invoke(rx, wellKnownSymbols['@@search'], [string]);
}

// 21.1.3.16
function String_prototype_slice(start, end) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var len = S.length;
    var intStart = ToInteger(start);
    if (end === undefined) var intEnd = len;
    else var intEnd = ToInteger(end);
    if (intStart < 0) var from = Math.max(len + intStart, 0);
    else var from = Math.min(intStart, len);
    if (intEnd < 0) var to = Math.max(len + intEnd, 0);
    else var to = Math.min(intEnd, len);
    var span = Math.max(to - from, 0);
    return S.substring(from, from + span);
}

// 21.1.3.17
function String_prototype_split(separator, limit) {
    var O = RequireObjectCoercible(this);
    if (!(separator === undefined || separator === null)) {
        var splitter = GetMethod(separator, wellKnownSymbols['@@split']);
        if (splitter !== undefined) {
            return Call(splitter, separator, [O, limit]);
        }
    }
    var S = ToString(O);
    var A = ArrayCreate(0);
    var lengthA = 0;
    if (limit === undefined) var lim = 0x100000000 - 1;
    else var lim = ToUint32(limit);
    var s = S.length;
    var p = 0;
    var R = ToString(separator);
    if (lim === 0) return A;
    if (separator === undefined) {
        CreateDataProperty(A, "0", S);
        return A;
    }
    if (s === 0) {
        var z = SplitMatch(S, 0, R);
        if (z !== false) return A;
        CreateDataProperty(A, "0", S);
        return A;
    }
    var q = p;
    while (q !== s) {
        var e = SplitMatch(S, q, R);
        if (e === false) var q = q + 1;
        else { // e is an integer index ≤ s,
            if (e === p) var q = q + 1;
            else {
                var T = S.substring(p, q);
                CreateDataProperty(A, ToString(lengthA), T);
                lengthA++;
                if (lengthA === lim) return A;
                var p = e;
                var q = p;
            }
        }
    }
    var T = S.substring(p, s);
    CreateDataProperty(A, ToString(lengthA), T);
    return A;
}

// 21.1.3.17.1
function SplitMatch(S, q, R) {
    Assert(Type(R) === 'String');
    var r = R.length;
    var s = S.length;
    if (q + r > s) return false;
    if (S.substring(q, q + r) !== R) return false;
    return q + r;
}

// 21.1.3.18
function String_prototype_startsWith(searchString, position) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var isRegExp = IsRegExp(searchString);
    if (isRegExp === true) throw $TypeError();
    var searchStr = ToString(searchString);
    var pos = ToInteger(position);
    var len = S.length;
    var start = Math.min(Math.max(pos, 0), len);
    var searchLength = searchStr.length;
    if (searchLength + start > len) return false;
    if (S.substring(start, start + searchLength) === searchStr) return true;
    else return false;
}

// 21.1.3.19
function String_prototype_substring(start, end) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    var len = S.length;
    var intStart = ToInteger(start);
    if (end === undefined) var intEnd = len;
    else var intEnd = ToInteger(end);
    var finalStart = Math.min(Math.max(intStart, 0), len);
    var finalEnd = Math.min(Math.max(intEnd, 0), len);
    var from = Math.min(finalStart, finalEnd);
    var to = Math.max(finalStart, finalEnd);
    return S.substring(from, to);
}

// 21.1.3.20
function String_prototype_toLocaleLowerCase(reserved1, reserved2) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    // Here we rely on underlying virtual machine.
    return S.toLocaleLowerCase();
}

// 21.1.3.21
function String_prototype_toLocaleUpperCase(reserved1, reserved2) {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    // Here we rely on underlying virtual machine.
    return S.toLocaleUpperCase();
}

// 21.1.3.22
function String_prototype_toLowerCase() {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    // Here we rely on underlying virtual machine.
    return S.toLowerCase();
}

// 21.1.3.23
function String_prototype_toString() {
    return thisStringValue(this);
}

// 21.1.3.24
function String_prototype_toUpperCase() {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    // Here we rely on underlying virtual machine.
    return S.toUpperCase();
}

// 21.1.3.25
function String_prototype_trim() {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    // Here we rely on underlying virtual machine.
    var T = S.trim();
    return T;
}

// 21.1.3.26
function String_prototype_valueOf() {
    return thisStringValue(this);
}

// 21.1.3.27 String.prototype [ @@iterator ] ( )
function String_prototype_iterator() {
    var O = RequireObjectCoercible(this);
    var S = ToString(O);
    return CreateStringIterator(S);
}

// 21.1.5 String Iterator Objects

// 21.1.5.1
function CreateStringIterator(string) {
    Assert(Type(string) === 'String');
    var iterator = ObjectCreate(currentRealm.Intrinsics['%StringIteratorPrototype%'], ['IteratedString', 'StringIteratorNextIndex']);
    iterator.IteratedString = string;
    iterator.StringIteratorNextIndex = 0;
    return iterator;
}

// 21.1.5.2 The %StringIteratorPrototype% Object

// 21.1.5.2.1 %StringIteratorPrototype%.next ( )
function StringIteratorPrototype_next() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('IteratedString' in O && 'StringIteratorNextIndex' in O)) throw $TypeError();
    var s = O.IteratedString;
    if (s === undefined) return CreateIterResultObject(undefined, true);
    var position = O.StringIteratorNextIndex;
    var len = s.length;
    if (position >= len) {
        O.IteratedString = undefined;
        return CreateIterResultObject(undefined, true);
    }
    var first = s.charCodeAt(position);
    if (first < 0xD800 || first > 0xDBFF || position + 1 === len) var resultString = String.fromCharCode(first);
    else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) var resultString = String.fromCharCode(first);
        else var resultString = String.fromCharCode(first, second);
    }
    var resultSize = resultString.length;
    O.StringIteratorNextIndex = position + resultSize;
    return CreateIterResultObject(resultString, false);
}

// 21.1.5.2.2 %StringIteratorPrototype% [ @@toStringTag ]

// 21.1.5.3 Properties of String Iterator Instances

// 21.2 RegExp (Regular Expression) Objects

const failure = { failure: true };

// 21.2.3 The RegExp Constructor

// 21.2.3.1
function RegExp$(pattern, flags) {
    var patternIsRegExp = IsRegExp(pattern);
    if (NewTarget !== undefined) var newTarget = NewTarget;
    else {
        var newTarget = active_function_object;
        if (patternIsRegExp === true && flags === undefined) {
            var patternConstructor = Get(pattern, "constructor");
            if (SameValue(newTarget, patternConstructor) === true) return pattern;
        }
    }
    if (Type(pattern) === 'Object' && 'RegExpMatcher' in pattern) {
        var P = pattern.OriginalSource;
        if (flags === undefined) var F = pattern.OriginalFlags;
        else var F = flags;
    } else if (patternIsRegExp === true) {
        var P = Get(pattern, "source");
        if (flags === undefined) {
            var F = Get(pattern, "flags");
        } else var F = flags;
    } else {
        var P = pattern;
        var F = flags;
    }
    var O = RegExpAlloc(newTarget);
    return RegExpInitialize(O, P, F);
}

// 21.2.3.2 Abstract Operations for the RegExp Constructor

// 21.2.3.2.1 
function RegExpAlloc(newTarget) {
    var obj = OrdinaryCreateFromConstructor(newTarget, "%RegExpPrototype%", ['RegExpMatcher', 'OriginalSource', 'OriginalFlags']);
    DefinePropertyOrThrow(obj, "lastIndex", PropertyDescriptor({ Writable: true, Enumerable: false, Configurable: false }));
    return obj;
}

// 21.2.3.2.2
function RegExpInitialize(obj, pattern, flags) {
    if (pattern === undefined) var P = '';
    else var P = ToString(pattern);
    if (flags === undefined) var F = '';
    else var F = ToString(flags);
    if (F.split('').some((e, i) => !'gimuy'.contains(e) || F.indexOf(e) !== i)) throw $SyntaxError();
    if (F.contains("u")) var BMP = false;
    else var BMP = true;
    obj.OriginalSource = P;
    obj.OriginalFlags = F;
    obj.RegExpMatcher = compile_pattern(P, F);
    _Set(obj, "lastIndex", 0, true);
    return obj;
}

function compile_pattern(P, F) {
    // TODO independent RegExp compiler
    try {
        var f = 'y' + (F.contains('i') ? 'i' : '') + (F.contains('m') ? 'm' : '') + (F.contains('u') ? 'u' : '');
        var rex = new RegExp(P, f);
        return function(str, index) {
            rex.lastIndex = index;
            var m = rex.exec(str);
            if (m === null) return failure;
            if (m.index !== index) return failure; // when 'y' doesn't work
            var captures = m.slice(1);
            var endIndexUTF = rex.lastIndex;
            return { endIndexUTF, captures };
        };
    } catch (e) {
        throw $SyntaxError();
    }
}

// 21.2.3.2.3
function RegExpCreate(P, F) {
    var obj = RegExpAlloc(currentRealm.Intrinsics['%RegExp%']);
    return RegExpInitialize(obj, P, F);
}

// 21.2.3.2.4
function EscapeRegExpPattern(P, F) {
    if (P === '') return '(?:)';
    var buffer = [];
    var i = 0;
    while (i < P.length) {
        var c = P[i++];
        if (c === '/') {
            buffer.push('\\/');
        } else if (isLineTerminator(c)) {
            buffer.push('\\u' + make_hex4digit(c, '0123456789ABCDEF'));
        } else if (c === '\\' && i < P.length) {
            var a = P[i++];
            buffer.push(c, a);
        } else {
            buffer.push(c);
        }
    }
    return buffer.join('');
}

// 21.2.4 Properties of the RegExp Constructor

// 21.2.4.1 RegExp.prototype

// 21.2.4.2 get RegExp [ @@species ]
function get_RegExp_species() {
    return this;
}

// 21.2.5 Properties of the RegExp Prototype Object

// 21.2.5.1 RegExp.prototype.constructor

// 21.2.5.2
function RegExp_prototype_exec(string) {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (!('RegExpMatcher' in R)) throw $TypeError();
    var S = ToString(string);
    return RegExpBuiltinExec(R, S);
}

// 21.2.5.2.1
function RegExpExec(R, S) {
    Assert(Type(R) === 'Object');
    Assert(Type(S) === 'String');
    var exec = Get(R, "exec");
    if (IsCallable(exec) === true) {
        var result = Call(exec, R, [S]);
        if (!(Type(result) === 'Object' || Type(result) === 'Null')) throw $TypeError();
        return result;
    }
    if (!('RegExpMatcher' in R)) throw $TypeError();
    return RegExpBuiltinExec(R, S);
}

// 21.2.5.2.2
function RegExpBuiltinExec(R, S) {
    Assert(Type(S) === 'String');
    var length = S.length;
    var lastIndex = ToLength(Get(R, "lastIndex"));
    if (STRICT_CONFORMANCE) {
        var global = ToBoolean(Get(R, "global"));
        var sticky = ToBoolean(Get(R, "sticky"));
    } else {
        var flags = R.OriginalFlags;
        if (flags.contains("g")) var global = true;
        else var global = false;
        if (flags.contains("y")) var sticky = true;
        else var sticky = false;
    }
    if (global === false && sticky === false) var lastIndex = 0;
    var matcher = R.RegExpMatcher;
    var flags = R.OriginalFlags;
    if (flags.contains("u")) var fullUnicode = true;
    else var fullUnicode = false;
    var matchSucceeded = false;
    while (matchSucceeded === false) {
        if (lastIndex > length) {
            if (STRICT_CONFORMANCE) {
                _Set(R, "lastIndex", 0, true);
            } else {
                if (global === true || sticky === true) {
                    _Set(R, "lastIndex", 0, true);
                }
            }
            return null;
        }
        var r = matcher(S, lastIndex);
        if (r === failure) {
            if (sticky === true) {
                _Set(R, "lastIndex", 0, true);
                return null;
            }
            var lastIndex = AdvanceStringIndex(S, lastIndex, fullUnicode);
        } else {
            matchSucceeded = true;
        }
    }
    var e = r.endIndexUTF;
    if (global === true || sticky === true) {
        _Set(R, "lastIndex", e, true);
    }
    var n = r.captures.length;
    var A = ArrayCreate(n + 1);
    var matchIndex = lastIndex;
    CreateDataProperty(A, "index", matchIndex);
    CreateDataProperty(A, "input", S);
    var matchedSubstr = S.substring(matchIndex, e);
    CreateDataProperty(A, "0", matchedSubstr);
    for (var i = 1; i <= n; i++) {
        var captureI = r.captures[i - 1];
        if (captureI === undefined) var capturedValue = undefined;
        else var capturedValue = captureI;
        CreateDataProperty(A, ToString(i), capturedValue);
    }
    return A;
}

// 21.2.5.2.3
function AdvanceStringIndex(S, index, unicode) {
    Assert(Type(S) === 'String');
    Assert(0 <= index && index <= 0x1fffffffffffff);
    Assert(Type(unicode) === 'Boolean');
    if (unicode === false) return index + 1;
    var length = S.length;
    if (index + 1 >= length) return index + 1;
    var first = S.charCodeAt(index);
    if (first < 0xD800 || first > 0xDBFF) return index + 1;
    var second = S.charCodeAt(index + 1);
    if (second < 0xDC00 || second > 0xDFFF) return index + 1;
    return index + 2;
}

// 21.2.5.3
function get_RegExp_prototype_flags() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    var result = '';
    var global = ToBoolean(Get(R, "global"));
    if (global === true) result += "g";
    var ignoreCase = ToBoolean(Get(R, "ignoreCase"));
    if (ignoreCase === true) result += "i";
    var multiline = ToBoolean(Get(R, "multiline"));
    if (multiline === true) result += "m";
    var unicode = ToBoolean(Get(R, "unicode"));
    if (unicode === true) result += "u";
    var sticky = ToBoolean(Get(R, "sticky"));
    if (sticky === true) result += "y";
    return result;
}

// 21.2.5.4
function get_RegExp_prototype_global() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalFlags' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return undefined;
            else throw $TypeError();
        }
    }
    var flags = R.OriginalFlags;
    if (flags.contains("g")) return true;
    return false;
}

// 21.2.5.5
function get_RegExp_prototype_ignoreCase() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalFlags' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return undefined;
            else throw $TypeError();
        }
    }
    var flags = R.OriginalFlags;
    if (flags.contains("i")) return true;
    return false;
}

// 21.2.5.6 RegExp.prototype [ @@match ] ( string )
function RegExp_prototype_match(string) {
    var rx = this;
    if (Type(rx) !== 'Object') throw $TypeError();
    var S = ToString(string);
    var global = ToBoolean(Get(rx, "global"));
    if (global === false) {
        return RegExpExec(rx, S);
    } else {
        var fullUnicode = ToBoolean(Get(rx, "unicode"));
        _Set(rx, "lastIndex", 0, true);
        var A = ArrayCreate(0);
        var n = 0;
        while (true) {
            var result = RegExpExec(rx, S);
            if (result === null) {
                if (n === 0) return null;
                else return A;
            } else {
                var matchStr = ToString(Get(result, "0"));
                var status = CreateDataProperty(A, ToString(n), matchStr);
                Assert(status === true);
                if (matchStr === '') {
                    var thisIndex = ToLength(Get(rx, "lastIndex"));
                    var nextIndex = AdvanceStringIndex(S, thisIndex, fullUnicode);
                    _Set(rx, "lastIndex", nextIndex, true);
                }
                n++;
            }
        }
    }
}

// 21.2.5.7
function get_RegExp_prototype_multiline() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalFlags' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return undefined;
            else throw $TypeError();
        }
    }
    var flags = R.OriginalFlags;
    if (flags.contains("m")) return true;
    return false;
}

// 21.2.5.8 RegExp.prototype [ @@replace ] ( string, replaceValue )
function RegExp_prototype_replace(string, replaceValue) {
    var rx = this;
    if (Type(rx) !== 'Object') throw $TypeError();
    var S = ToString(string);
    var lengthS = S.length;
    var functionalReplace = IsCallable(replaceValue);
    if (functionalReplace === false) {
        var replaceValue = ToString(replaceValue);
    }
    var global = ToBoolean(Get(rx, "global"));
    if (global === true) {
        var fullUnicode = ToBoolean(Get(rx, "unicode"));
        _Set(rx, "lastIndex", 0, true);
    }
    var results = [];
    var done = false;
    while (done === false) {
        var result = RegExpExec(rx, S);
        if (result === null) done = true;
        else {
            results.push(result);
            if (global === false) done = true;
            else {
                var matchStr = ToString(Get(result, "0"));
                if (matchStr === '') {
                    var thisIndex = ToLength(Get(rx, "lastIndex"));
                    var nextIndex = AdvanceStringIndex(S, thisIndex, fullUnicode);
                    _Set(rx, "lastIndex", nextIndex, true);
                }
            }
        }
    }
    var accumulatedResult = '';
    var nextSourcePosition = 0;
    for (var result of results) {
        var nCaptures = ToLength(Get(result, "length"));
        var nCaptures = Math.max(nCaptures - 1, 0);
        var matched = ToString(Get(result, "0"));
        var matchLength = matched.length;
        var position = ToInteger(Get(result, "index"));
        var position = Math.max(Math.min(position, lengthS), 0);
        var n = 1;
        var captures = [];
        while (n <= nCaptures) {
            var capN = Get(result, ToString(n));
            if (capN !== undefined) {
                var capN = ToString(capN);
            }
            captures.push(capN);
            var n = n + 1;
        }
        if (functionalReplace === true) {
            var replacerArgs = [matched].concat(captures, position, S);
            var replValue = Call(replaceValue, undefined, replacerArgs);
            var replacement = ToString(replValue);
        } else {
            var replacement = GetSubstitution(matched, S, position, captures, replaceValue);
        }
        if (position >= nextSourcePosition) {
            var accumulatedResult = accumulatedResult + S.substring(nextSourcePosition, position) + replacement;
            var nextSourcePosition = position + matchLength;
        }
    }
    if (nextSourcePosition >= lengthS) return accumulatedResult;
    return accumulatedResult + S.substring(nextSourcePosition);
}

// 21.2.5.9 RegExp.prototype [ @@search ] ( string )
function RegExp_prototype_search(string) {
    var rx = this;
    if (Type(rx) !== 'Object') throw $TypeError();
    var S = ToString(string);
    var previousLastIndex = Get(rx, "lastIndex");
    if (STRICT_CONFORMANCE) {
        _Set(rx, "lastIndex", 0, true);
    } else {
        if (SameValue(previousLastIndex, 0) === false) {
            _Set(rx, "lastIndex", 0, true);
        }
    }
    var result = RegExpExec(rx, S);
    if (STRICT_CONFORMANCE) {
        _Set(rx, "lastIndex", previousLastIndex, true);
    } else {
        var currentLastIndex = Get(rx, "lastIndex");
        if (SameValue(currentLastIndex, previousLastIndex) === false) {
            _Set(rx, "lastIndex", previousLastIndex, true);
        }
    }
    if (result === null) return -1;
    return Get(result, "index");
}

// 21.2.5.10
function get_RegExp_prototype_source() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalSource' in R)) throw $TypeError();
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalSource' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return "(?:)";
            else throw $TypeError();
        }
        Assert('OriginalFlags' in R);
    }
    var src = R.OriginalSource;
    var flags = R.OriginalFlags;
    return EscapeRegExpPattern(src, flags);
}

// 21.2.5.11 RegExp.prototype [ @@split ] ( string, limit )
function RegExp_prototype_split(string, limit) {
    var rx = this;
    if (Type(rx) !== 'Object') throw $TypeError();
    var S = ToString(string);
    var C = SpeciesConstructor(rx, currentRealm.Intrinsics['%RegExp%']);
    var flags = ToString(Get(rx, "flags"));
    if (flags.contains("u")) var unicodeMatching = true;
    else var unicodeMatching = false;
    if (flags.contains("y")) var newFlags = flags;
    else var newFlags = flags + "y";
    var splitter = Construct(C, [rx, newFlags]);
    var A = ArrayCreate(0);
    var lengthA = 0;
    if (limit === undefined) var lim = 0x100000000 - 1;
    else var lim = ToUint32(limit);
    var size = S.length;
    var p = 0;
    if (lim === 0) return A;
    if (size === 0) {
        var z = RegExpExec(splitter, S);
        if (z !== null) return A;
        CreateDataProperty(A, "0", S);
        return A;
    }
    var q = p;
    while (q < size) {
        _Set(splitter, "lastIndex", q, true);
        var z = RegExpExec(splitter, S);
        if (z === null) var q = AdvanceStringIndex(S, q, unicodeMatching);
        else {
            var e = ToLength(Get(splitter, "lastIndex"));
            var e = Math.min(e, size);
            if (e === p) var q = AdvanceStringIndex(S, q, unicodeMatching);
            else {
                var T = S.substring(p, q);
                CreateDataProperty(A, ToString(lengthA), T);
                var lengthA = lengthA + 1;
                if (lengthA === lim) return A;
                var p = e;
                var numberOfCaptures = ToLength(Get(z, "length"));
                var numberOfCaptures = Math.max(numberOfCaptures - 1, 0);
                var i = 1;
                while (i <= numberOfCaptures) {
                    var nextCapture = Get(z, ToString(i));
                    CreateDataProperty(A, ToString(lengthA), nextCapture);
                    var i = i + 1;
                    var lengthA = lengthA + 1;
                    if (lengthA === lim) return A;
                }
                var q = p;
            }
        }
    }
    var T = S.substring(p, size);
    CreateDataProperty(A, ToString(lengthA), T);
    return A;
}

// 21.2.5.12
function get_RegExp_prototype_sticky() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalFlags' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return undefined;
            else throw $TypeError();
        }
    }
    var flags = R.OriginalFlags;
    if (flags.contains("y")) return true;
    return false;
}

// 21.2.5.13
function RegExp_prototype_test(S) {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    var string = ToString(S);
    var match = RegExpExec(R, string);
    if (match !== null) return true;
    else return false;
}

// 21.2.5.14
function RegExp_prototype_toString() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    var pattern = ToString(Get(R, "source"));
    var flags = ToString(Get(R, "flags"));
    var result = "/" + pattern + "/" + flags;
    return result;
}

// 21.2.5.15
function get_RegExp_prototype_unicode() {
    var R = this;
    if (Type(R) !== 'Object') throw $TypeError();
    if (STRICT_CONFORMANCE) {
        if (!('OriginalFlags' in R)) throw $TypeError();
    } else {
        if (!('OriginalFlags' in R)) {
            if (SameValue(R, currentRealm.Intrinsics['%RegExpPrototype%']) === true) return undefined;
            else throw $TypeError();
        }
    }
    var flags = R.OriginalFlags;
    if (flags.contains("u")) return true;
    return false;
}

// 21.2.6 Properties of RegExp Instances

// 21.2.6.1 lastIndex

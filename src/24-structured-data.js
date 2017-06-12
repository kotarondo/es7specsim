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

// 24 Structured Data

// 24.1 ArrayBuffer Objects

// 24.1.1 Abstract Operations For ArrayBuffer Objects

// 24.1.1.1
function AllocateArrayBuffer(constructor, byteLength) {
    var obj = OrdinaryCreateFromConstructor(constructor, "%ArrayBufferPrototype%", ['ArrayBufferData', 'ArrayBufferByteLength']);
    Assert(byteLength >= 0);
    var block = CreateByteDataBlock(byteLength);
    obj.ArrayBufferData = block;
    obj.ArrayBufferByteLength = byteLength;
    return obj;
}

// 24.1.1.2
function IsDetachedBuffer(arrayBuffer) {
    Assert(Type(arrayBuffer) === 'Object' && 'ArrayBufferData' in arrayBuffer);
    if (arrayBuffer.ArrayBufferData === null) return true;
    return false;
}

// 24.1.1.3
function DetachArrayBuffer(arrayBuffer) {
    Assert(Type(arrayBuffer) === 'Object' && 'ArrayBufferData' in arrayBuffer && 'ArrayBufferByteLength' in arrayBuffer);
    arrayBuffer.ArrayBufferData = null;
    arrayBuffer.ArrayBufferByteLength = 0;
    return null;
}

// 24.1.1.4
function CloneArrayBuffer(srcBuffer, srcByteOffset, cloneConstructor) {
    Assert(Type(srcBuffer) === 'Object' && 'ArrayBufferData' in srcBuffer);
    if (arguments.length <= 2) {
        var cloneConstructor = SpeciesConstructor(srcBuffer, currentRealm.Intrinsics['%ArrayBuffer%']);
        if (IsDetachedBuffer(srcBuffer) === true) throw $TypeError();
    } else Assert(IsConstructor(cloneConstructor) === true);
    var srcLength = srcBuffer.ArrayBufferByteLength;
    Assert(srcByteOffset <= srcLength);
    var cloneLength = srcLength - srcByteOffset;
    var srcBlock = srcBuffer.ArrayBufferData;
    var targetBuffer = AllocateArrayBuffer(cloneConstructor, cloneLength);
    if (IsDetachedBuffer(srcBuffer) === true) throw $TypeError();
    var targetBlock = targetBuffer.ArrayBufferData;
    CopyDataBlockBytes(targetBlock, 0, srcBlock, srcByteOffset, cloneLength);
    return targetBuffer;
}

// 24.1.1.5
function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
    Assert(IsDetachedBuffer(arrayBuffer) === false);
    Assert(byteIndex >= 0);
    var block = arrayBuffer.ArrayBufferData;
    switch (type) {
        case 'Int8':
            return block.getInt8(byteIndex, isLittleEndian);
        case 'Uint8':
        case 'Uint8C':
            return block.getUint8(byteIndex, isLittleEndian);
        case 'Int16':
            return block.getInt16(byteIndex, isLittleEndian);
        case 'Uint16':
            return block.getUint16(byteIndex, isLittleEndian);
        case 'Int32':
            return block.getInt32(byteIndex, isLittleEndian);
        case 'Uint32':
            return block.getUint32(byteIndex, isLittleEndian);
        case 'Float32':
            return block.getFloat32(byteIndex, isLittleEndian);
        case 'Float64':
            return block.getFloat64(byteIndex, isLittleEndian);
    }
    Assert(false);
}

// 24.1.1.6
function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {
    Assert(IsDetachedBuffer(arrayBuffer) === false);
    Assert(byteIndex >= 0);
    Assert(Type(value) === 'Number');
    var block = arrayBuffer.ArrayBufferData;
    Assert(block !== undefined);
    if (type === "Float32") {
        if (Number.isNaN(value)) value = NaN;
        block.setFloat32(byteIndex, value, isLittleEndian);
    } else if (type === "Float64") {
        if (Number.isNaN(value)) value = NaN;
        block.setFloat64(byteIndex, value, isLittleEndian);
    } else {
        var n = Table50[type].ElementSize;
        var convOp = Table50[type].ConversionOperation;
        var intValue = convOp(value);
        switch (type) {
            case 'Int8':
                block.setInt8(byteIndex, intValue, isLittleEndian);
                break;
            case 'Uint8':
            case 'Uint8C':
                block.setUint8(byteIndex, intValue, isLittleEndian);
                break;
            case 'Int16':
                block.setInt16(byteIndex, intValue, isLittleEndian);
                break;
            case 'Uint16':
                block.setUint16(byteIndex, intValue, isLittleEndian);
                break;
            case 'Int32':
                block.setInt32(byteIndex, intValue, isLittleEndian);
                break;
            case 'Uint32':
                block.setUint32(byteIndex, intValue, isLittleEndian);
                break;
        }
    }
    return undefined;
}

// 24.1.2 The ArrayBuffer Constructor

// 24.1.2.1
function ArrayBuffer$(length) {
    if (NewTarget === undefined) throw $TypeError();
    var numberLength = ToNumber(length);
    var byteLength = ToLength(numberLength);
    if (SameValueZero(numberLength, byteLength) === false) throw $RangeError();
    return AllocateArrayBuffer(NewTarget, byteLength);
}

// 24.1.3 Properties of the ArrayBuffer Constructor

// 24.1.3.1
function ArrayBuffer_isView(arg) {
    if (Type(arg) !== 'Object') return false;
    if ('ViewedArrayBuffer' in arg) return true;
    return false;
}

// 24.1.3.2 ArrayBuffer.prototype

// 24.1.3.3 get ArrayBuffer [ @@species ]
function get_ArrayBuffer_species() {
    return this;
}

// 24.1.4 Properties of the ArrayBuffer Prototype Object

// 24.1.4.1
function get_ArrayBuffer_prototype_byteLength() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ArrayBufferData' in O)) throw $TypeError();
    if (IsDetachedBuffer(O) === true) throw $TypeError();
    var length = O.ArrayBufferByteLength;
    return length;
}

// 24.1.4.2 ArrayBuffer.prototype.constructor

// 24.1.4.3
function ArrayBuffer_prototype_slice(start, end) {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ArrayBufferData' in O)) throw $TypeError();
    if (IsDetachedBuffer(O) === true) throw $TypeError();
    var len = O.ArrayBufferByteLength;
    var relativeStart = ToInteger(start);
    if (relativeStart < 0) var first = Math.max((len + relativeStart), 0);
    else var first = Math.min(relativeStart, len);
    if (end === undefined) var relativeEnd = len;
    else var relativeEnd = ToInteger(end);
    if (relativeEnd < 0) var final = Math.max((len + relativeEnd), 0);
    else var final = Math.min(relativeEnd, len);
    var newLen = Math.max(final - first, 0);
    var ctor = SpeciesConstructor(O, currentRealm.Intrinsics['%ArrayBuffer%']);
    var _new = Construct(ctor, [newLen]);
    if (!('ArrayBufferData' in _new)) throw $TypeError();
    if (IsDetachedBuffer(_new) === true) throw $TypeError();
    if (SameValue(_new, O) === true) throw $TypeError();
    if (_new.ArrayBufferByteLength < newLen) throw $TypeError();
    if (IsDetachedBuffer(O) === true) throw $TypeError();
    var fromBuf = O.ArrayBufferData;
    var toBuf = _new.ArrayBufferData;
    CopyDataBlockBytes(toBuf, 0, fromBuf, first, newLen);
    return _new;
}

// 24.1.4.4 ArrayBuffer.prototype [ @@toStringTag ]

// 24.1.5 Properties of the ArrayBuffer Instances

// 24.2 DataView Objects

// 24.2.1 Abstract Operations For DataView Objects

// 24.2.1.1
function GetViewValue(view, requestIndex, isLittleEndian, type) {
    if (Type(view) !== 'Object') throw $TypeError();
    if (!('DataView' in view)) throw $TypeError();
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (numberIndex !== getIndex || getIndex < 0) throw $RangeError();
    var isLittleEndian = ToBoolean(isLittleEndian);
    var buffer = view.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var viewOffset = view.ByteOffset;
    var viewSize = view.ByteLength;
    var elementSize = Table50[type].ElementSize;
    if (getIndex + elementSize > viewSize) throw $RangeError();
    var bufferIndex = getIndex + viewOffset;
    return GetValueFromBuffer(buffer, bufferIndex, type, isLittleEndian);
}

// 24.2.1.2
function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
    if (Type(view) !== 'Object') throw $TypeError();
    if (!('DataView' in view)) throw $TypeError();
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (numberIndex !== getIndex || getIndex < 0) throw $RangeError();
    var numberValue = ToNumber(value);
    var isLittleEndian = ToBoolean(isLittleEndian);
    var buffer = view.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var viewOffset = view.ByteOffset;
    var viewSize = view.ByteLength;
    var elementSize = Table50[type].ElementSize;
    if (getIndex + elementSize > viewSize) throw $RangeError();
    var bufferIndex = getIndex + viewOffset;
    return SetValueInBuffer(buffer, bufferIndex, type, numberValue, isLittleEndian);
}

// 24.2.2 The DataView Constructor

// 24.2.2.1
function DataView$(buffer, byteOffset, byteLength) {
    if (NewTarget === undefined) throw $TypeError();
    if (Type(buffer) !== 'Object') throw $TypeError();
    if (!('ArrayBufferData' in buffer)) throw $TypeError();
    var numberOffset = ToNumber(byteOffset);
    var offset = ToInteger(numberOffset);
    if (numberOffset !== offset || offset < 0) throw $RangeError();
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var bufferByteLength = buffer.ArrayBufferByteLength;
    if (offset > bufferByteLength) throw $RangeError();
    if (byteLength === undefined) {
        var viewByteLength = bufferByteLength - offset;
    } else {
        var viewByteLength = ToLength(byteLength);
        if (offset + viewByteLength > bufferByteLength) throw $RangeError();
    }
    var O = OrdinaryCreateFromConstructor(NewTarget, "%DataViewPrototype%", ['DataView', 'ViewedArrayBuffer', 'ByteLength', 'ByteOffset']);
    O.DataView = true;
    O.ViewedArrayBuffer = buffer;
    O.ByteLength = viewByteLength;
    O.ByteOffset = offset;
    return O;
}

// 24.2.3 Properties of the DataView Constructor

// 24.2.3.1 DataView.prototype

// 24.2.4 Properties of the DataView Prototype Object

// 24.2.4.1
function get_DataView_prototype_buffer() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    return buffer;
}

// 24.2.4.2
function get_DataView_prototype_byteLength() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var size = O.ByteLength;
    return size;
}

// 24.2.4.3
function get_DataView_prototype_byteOffset() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('ViewedArrayBuffer' in O)) throw $TypeError();
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var offset = O.ByteOffset;
    return offset;
}

// 24.2.4.4 DataView.prototype.constructor

// 24.2.4.5
function DataView_prototype_getFloat32(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Float32");
}
//length=1

// 24.2.4.6
function DataView_prototype_getFloat64(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Float64");
}
//length=1

// 24.2.4.7
function DataView_prototype_getInt8(byteOffset) {
    var v = this;
    return GetViewValue(v, byteOffset, true, "Int8");
}

// 24.2.4.8
function DataView_prototype_getInt16(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Int16");
}
//length=1

// 24.2.4.9
function DataView_prototype_getInt32(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = undefined;
    return GetViewValue(v, byteOffset, littleEndian, "Int32");
}

// 24.2.4.10
function DataView_prototype_getUint8(byteOffset) {
    var v = this;
    return GetViewValue(v, byteOffset, true, "Uint8");
}

// 24.2.4.11
function DataView_prototype_getUint16(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Uint16");
}

// 24.2.4.12
function DataView_prototype_getUint32(byteOffset, littleEndian) {
    var v = this;
    if (arguments.length <= 1) var littleEndian = false;
    return GetViewValue(v, byteOffset, littleEndian, "Uint32");
}

// 24.2.4.13
function DataView_prototype_setFloat32(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Float32", value);
}

// 24.2.4.14
function DataView_prototype_setFloat64(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Float64", value);
}

// 24.2.4.15
function DataView_prototype_setInt8(byteOffset, value) {
    var v = this;
    return SetViewValue(v, byteOffset, true, "Int8", value);
}

// 24.2.4.16
function DataView_prototype_setInt16(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Int16", value);
}

// 24.2.4.17
function DataView_prototype_setInt32(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Int32", value);
}

// 24.2.4.18
function DataView_prototype_setUint8(byteOffset, value) {
    var v = this;
    return SetViewValue(v, byteOffset, true, "Uint8", value);
}

// 24.2.4.19
function DataView_prototype_setUint16(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Uint16", value);
}

// 24.2.4.20
function DataView_prototype_setUint32(byteOffset, value, littleEndian) {
    var v = this;
    if (arguments.length <= 2) var littleEndian = false;
    return SetViewValue(v, byteOffset, littleEndian, "Uint32", value);
}

// 24.2.4.21 DataView.prototype [ @@toStringTag ]

// 24.2.5 Properties of DataView Instances

// 24.3 The JSON Object

// 24.3.1
function JSON_parse(text, reviver) {
    var JText = ToString(text);
    try {
        // Here we rely on underlying virtual machine.
        JSON.parse(JText);
    } catch (e) {
        throw $SyntaxError();
    }
    var scriptText = "(" + JText + ");";
    var orig = parseDoubleStringCharacter_opt;
    parseDoubleStringCharacter_opt = parseDoubleStringCharacter_opt_JSON;
    var scriptRecord = ParseScript(scriptText, currentRealm);
    parseDoubleStringCharacter_opt = orig;
    var completion = ScriptEvaluation(scriptRecord);
    var unfiltered = completion;
    if (IsCallable(reviver) === true) {
        var root = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
        var rootName = '';
        var status = CreateDataProperty(root, rootName, unfiltered);
        Assert(status === true);
        return InternalizeJSONProperty(root, rootName, reviver);
    } else {
        return unfiltered;
    }
}

Syntax([
    'DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_U+0000_through_U+001F',
]);

Static_Semantics('SV', [
    'DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_U+0000_through_U+001F',
    function() {
        return this.SourceCharacter.char;
    },
]);

function parseDoubleStringCharacter_opt_JSON() {
    var c = peekChar();
    if (c === '"' || c.codePointAt(0) <= 0x1f) return null;
    if (c === '\\') {
        if (isLineTerminator(peekChar(1))) {
            var nt = parseLineContinuation();
            return Production['DoubleStringCharacter:: LineContinuation'](nt);
        }
        consumeChar('\\');
        var nt = parseEscapeSequence();
        return Production['DoubleStringCharacter:: \\ EscapeSequence'](nt);
    }
    var nt = parseSourceCharacter();
    return Production['DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_U+0000_through_U+001F'](nt);
}

// 24.3.1.1
function InternalizeJSONProperty(holder, name, reviver) { //MODIFIED: 'reviver' argument added
    var val = Get(holder, name);
    if (Type(val) === 'Object') {
        var isArray = IsArray(val);
        if (isArray === true) {
            var I = 0;
            var len = ToLength(Get(val, "length"));
            while (I < len) {
                var newElement = InternalizeJSONProperty(val, ToString(I), reviver);
                if (newElement === undefined) {
                    val.Delete(ToString(I));
                } else {
                    CreateDataProperty(val, ToString(I), newElement);
                }
                I++;
            }
        } else {
            var keys = EnumerableOwnNames(val);
            for (var P of keys) {
                var newElement = InternalizeJSONProperty(val, P, reviver);
                if (newElement === undefined) {
                    val.Delete(P);
                } else {
                    CreateDataProperty(val, P, newElement);
                }
            }
        }
    }
    return Call(reviver, holder, [name, val]);
}

// 24.3.2
function JSON_stringify(value, replacer, space) {
    var stack = [];
    var indent = '';
    var PropertyList, ReplacerFunction;
    if (Type(replacer) === 'Object') {
        if (IsCallable(replacer) === true) {
            var ReplacerFunction = replacer;
        } else {
            var isArray = IsArray(replacer);
            if (isArray === true) {
                var PropertyList = [];
                var len = ToLength(Get(replacer, "length"));
                var k = 0;
                while (k < len) {
                    var v = Get(replacer, ToString(k));
                    var item = undefined;
                    if (Type(v) === 'String') var item = v;
                    else if (Type(v) === 'Number') var item = ToString(v);
                    else if (Type(v) === 'Object') {
                        if ('StringData' in v || 'NumberData' in v) var item = ToString(v);
                    }
                    if (item !== undefined && !item.is_an_element_of(PropertyList)) {
                        PropertyList.push(item);
                    }
                    var k = k + 1;
                }
            }
        }
    }
    if (Type(space) === 'Object') {
        if ('NumberData' in space) {
            var space = ToNumber(space);
        } else if ('StringData' in space) {
            var space = ToString(space);
        }
    }
    if (Type(space) === 'Number') {
        var space = Math.min(10, ToInteger(space));
        var gap = '';
        for (var i = 0; i < space; i++) {
            gap += ' ';
        }
    } else if (Type(space) === 'String') {
        if (space.length <= 10) var gap = space;
        else var gap = space.substring(0, 10);
    } else {
        var gap = '';
    }
    var wrapper = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    var status = CreateDataProperty(wrapper, '', value);
    Assert(status === true);
    return SerializeJSONProperty('', wrapper, { stack, indent, PropertyList, ReplacerFunction, gap });
}

// 24.3.2.1
function SerializeJSONProperty(key, holder, access) { //MODIFIED: 'access' argument added
    var { ReplacerFunction } = access;
    var value = Get(holder, key);
    if (Type(value) === 'Object') {
        var toJSON = Get(value, "toJSON");
        if (IsCallable(toJSON) === true) {
            var value = Call(toJSON, value, [key]);
        }
    }
    if (ReplacerFunction !== undefined) {
        var value = Call(ReplacerFunction, holder, [key, value]);
    }
    if (Type(value) === 'Object') {
        if ('NumberData' in value) {
            var value = ToNumber(value);
        } else if ('StringData' in value) {
            var value = ToString(value);
        } else if ('BooleanData' in value) {
            var value = value.BooleanData;
        }
    }
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (Type(value) === 'String') return QuoteJSONString(value);
    if (Type(value) === 'Number') {
        if (Number.isFinite(value)) return ToString(value);
        else return "null";
    }
    if (Type(value) === 'Object' && IsCallable(value) === false) {
        var isArray = IsArray(value);
        if (isArray === true) return SerializeJSONArray(value, access);
        else return SerializeJSONObject(value, access);
    }
    return undefined;
}

// 24.3.2.2 
function QuoteJSONString(value) {
    var product = '"';
    for (var C of value) {
        if (C === '"' || C === '\\') {
            var product = product + '\\';
            var product = product + C;
        } else if (C === '\b' || C === '\f' || C === '\n' || C === '\r' || C === '\t') {
            var product = product + '\\';
            switch (C) {
                case '\b':
                    var abbrev = "b";
                    break;
                case '\f':
                    var abbrev = "f";
                    break;
                case '\n':
                    var abbrev = "n";
                    break;
                case '\r':
                    var abbrev = "r";
                    break;
                case '\t':
                    var abbrev = "t";
                    break;
            }
            var product = product + abbrev;
        } else if (code_unit_value(C) < 0x0020) {
            var product = product + '\\';
            var product = product + "u";
            var hex = make_hex4digit(C, '0123456789abcdef');
            var product = product + hex;
        } else {
            var product = product + C;
        }
    }
    var product = product + '"';
    return product;
}

// 24.3.2.3
function SerializeJSONObject(value, access) { //MODIFIED: 'access' argument added
    var { stack, indent, gap, PropertyList } = access;
    if (stack.contains(value)) throw $TypeError();
    stack.push(value);
    var stepback = indent;
    indent = indent + gap;
    if (PropertyList !== undefined) {
        var K = PropertyList;
    } else {
        var K = EnumerableOwnNames(value);
    }
    var partial = [];
    for (var P of K) {
        var strP = SerializeJSONProperty(P, value, access);
        if (strP !== undefined) {
            var member = QuoteJSONString(P);
            var member = member + ":";
            if (gap !== '') {
                var member = member + ' ';
            }
            var member = member + strP;
            partial.push(member);
        }
    }
    if (partial.length === 0) {
        var final = "{}";
    } else {
        if (gap === '') {
            var properties = partial.join(',');
            var final = "{" + properties + "}";
        } else {
            var separator = ',' + '\n' + indent;
            var properties = partial.join(separator);
            var final = "{" + '\n' + indent + properties + '\n' + stepback + "}";
        }
    }
    stack.pop();
    indent = stepback;
    return final;
}

// 24.3.2.4
function SerializeJSONArray(value, access) { //MODIFIED: 'access' argument added
    var { stack, indent, gap } = access;
    if (stack.contains(value)) throw $TypeError();
    stack.push(value);
    var stepback = indent;
    indent = indent + gap;
    var partial = [];
    var len = ToLength(Get(value, "length"));
    var index = 0;
    while (index < len) {
        var strP = SerializeJSONProperty(ToString(index), value, access);
        if (strP === undefined) {
            partial.push("null");
        } else {
            partial.push(strP);
        }
        index++;
    }
    if (partial.length === 0) {
        var final = "[]";
    } else {
        if (gap === '') {
            var properties = partial.join(',');
            var final = "[" + properties + "]";
        } else {
            var separator = ',' + '\n' + indent;
            var properties = partial.join(separator);
            var final = "[" + '\n' + indent + properties + '\n' + stepback + "]";
        }
    }
    stack.pop();
    indent = stepback;
    return final;
}

// 24.3.3 JSON [ @@toStringTag ]

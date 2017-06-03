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

// 22.2.4 The TypedArray Constructors

Assert(Table50.__TypedArray__);

function $__TypedArray__(first) {
    if (arguments.length === 0) return $__TypedArray__$1.apply(this, arguments);
    else if (Type(first) !== 'Object') return $__TypedArray__$2.apply(this, arguments);
    else if ('TypedArrayName' in first) return $__TypedArray__$3.apply(this, arguments);
    else if ('ArrayBufferData' in first) return $__TypedArray__$5.apply(this, arguments);
    else return $__TypedArray__$4.apply(this, arguments);
}

// 22.2.4.1
function $__TypedArray__$1() {
    if (NewTarget === undefined) throw $TypeError();
    var constructorName = '__TypedArray__';
    return AllocateTypedArray(constructorName, NewTarget, "%__TypedArray__Prototype%", 0);
}


// 22.2.4.2
function $__TypedArray__$2(length) {
    Assert(Type(length) !== 'Object');
    if (NewTarget === undefined) throw $TypeError();
    if (length === undefined) throw $TypeError();
    var numberLength = ToNumber(length);
    var elementLength = ToLength(numberLength);
    if (SameValueZero(numberLength, elementLength) === false) throw $RangeError();
    var constructorName = '__TypedArray__';
    return AllocateTypedArray(constructorName, NewTarget, "%__TypedArray__Prototype%", elementLength);
}

// 22.2.4.3
function $__TypedArray__$3(typedArray) {
    Assert(Type(typedArray) === 'Object' && 'TypedArrayName' in typedArray);
    if (NewTarget === undefined) throw $TypeError();
    var constructorName = '__TypedArray__';
    var O = AllocateTypedArray(constructorName, NewTarget, "%__TypedArray__Prototype%");
    var srcArray = typedArray;
    var srcData = srcArray.ViewedArrayBuffer;
    if (IsDetachedBuffer(srcData) === true) throw $TypeError();
    var constructorName = O.TypedArrayName;
    var elementType = Table50[constructorName].ElementType;
    var elementLength = srcArray.ArrayLength;
    var srcName = srcArray.TypedArrayName;
    var srcType = Table50[srcName].ElementType;
    var srcElementSize = Table50[srcName].ElementSize;
    var srcByteOffset = srcArray.ByteOffset;
    var elementSize = Table50[constructorName].ElementSize;
    var byteLength = elementSize * elementLength;
    if (SameValue(elementType, srcType) === true) {
        var data = CloneArrayBuffer(srcData, srcByteOffset);
    } else {
        var bufferConstructor = SpeciesConstructor(srcData, currentRealm.Intrinsics['%ArrayBuffer%']);
        var data = AllocateArrayBuffer(bufferConstructor, byteLength);
        if (IsDetachedBuffer(srcData) === true) throw $TypeError();
        var srcByteIndex = srcByteOffset;
        var targetByteIndex = 0;
        var count = elementLength;
        while (count > 0) {
            var value = GetValueFromBuffer(srcData, srcByteIndex, srcType);
            SetValueInBuffer(data, targetByteIndex, elementType, value);
            srcByteIndex = srcByteIndex + srcElementSize;
            targetByteIndex = targetByteIndex + elementSize;
            count--;
        }
    }
    O.ViewedArrayBuffer = data;
    O.ByteLength = byteLength;
    O.ByteOffset = 0;
    O.ArrayLength = elementLength;
    return O;
}

// 22.2.4.4
function $__TypedArray__$4(object) {
    Assert(Type(object) === 'Object' && !('TypedArrayName' in object || 'ArrayBufferData' in object));
    if (NewTarget === undefined) throw $TypeError();
    var constructorName = '__TypedArray__';
    var O = AllocateTypedArray(constructorName, NewTarget, "%__TypedArray__Prototype%");
    var arrayLike = IterableToArrayLike(object);
    var len = ToLength(Get(arrayLike, "length"));
    AllocateTypedArrayBuffer(O, len);
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kValue = Get(arrayLike, Pk);
        _Set(O, Pk, kValue, true);
        k++;
    }
    return O;
}

// 22.2.4.5
function $__TypedArray__$5(buffer, byteOffset, length) {
    Assert(Type(buffer) === 'Object' && 'ArrayBufferData' in buffer);
    if (NewTarget === undefined) throw $TypeError();
    var constructorName = '__TypedArray__';
    var O = AllocateTypedArray(constructorName, NewTarget, "%__TypedArray__Prototype%");
    var constructorName = O.TypedArrayName;
    var elementSize = Table50[constructorName].ElementSize;
    var offset = ToInteger(byteOffset);
    if (offset < 0) throw $RangeError();
    if (offset === -0) var offset = +0;
    if (modulo(offset, elementSize) !== 0) throw $RangeError();
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    var bufferByteLength = buffer.ArrayBufferByteLength;
    if (length === undefined) {
        if (modulo(bufferByteLength, elementSize) !== 0) throw $RangeError();
        var newByteLength = bufferByteLength - offset;
        if (newByteLength < 0) throw $RangeError();
    } else {
        var newLength = ToLength(length);
        var newByteLength = newLength * elementSize;
        if (offset + newByteLength > bufferByteLength) throw $RangeError();
    }
    O.ViewedArrayBuffer = buffer;
    O.ByteLength = newByteLength;
    O.ByteOffset = offset;
    O.ArrayLength = newByteLength / elementSize;
    return O;
}

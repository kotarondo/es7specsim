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

// 6 ECMAScript Data Types and Values

const empty = { empty: true };

function Type(x) {
    switch (typeof x) {
        case 'undefined':
            return 'Undefined';
        case 'boolean':
            return 'Boolean';
        case 'number':
            return 'Number';
        case 'string':
            return 'String';
        case 'symbol':
            return 'Symbol';
    }
    if (x === null) return 'Null';
    if (Array.isArray(x) === true) return 'List';
    if (x instanceof OrdinaryObject) return 'Object';
    if (x instanceof ModuleNamespaceExoticObject) return 'Object';
    if (x instanceof ProxyExoticObject) return 'Object';
    if (x instanceof Completion) return 'Completion Record';
    if (x instanceof Reference) return 'Reference';
    if (x instanceof PropertyDescriptor) return 'Property Descriptor';
    if (x instanceof LexicalEnvironment) return 'Lexical Environment';
    if (x instanceof EnvironmentRecord) return 'Environment Record';
    if (x instanceof RealmRecord) return 'Realm Record';
    if (x instanceof PromiseCapability) return 'PromiseCapability';
    Assert(false);
}

// 6.1 ECMAScript Language Types

// 6.1.1 The Undefined Type
// 6.1.2 The Null Type
// 6.1.3 The Boolean Type
// 6.1.4 The String Type
// 6.1.5 The Symbol Type

function new_unique_symbol(desc) {
    if (desc === undefined) return Symbol();
    Assert(typeof desc === 'string');
    return Symbol('#' + desc);
}

function get_symbol_description(sym) {
    var m = /^Symbol\(#(.*)\)$/.exec(sym.toString());
    if (m === null) return undefined;
    return m[1];
}

// 6.1.5.1 Well-Known Symbols

const wellKnownSymbols = {
    '@@hasInstance': new_unique_symbol("Symbol.hasInstance"),
    '@@isConcatSpreadable': new_unique_symbol("Symbol.isConcatSpreadable"),
    '@@iterator': new_unique_symbol("Symbol.iterator"),
    '@@match': new_unique_symbol("Symbol.match"),
    '@@replace': new_unique_symbol("Symbol.replace"),
    '@@search': new_unique_symbol("Symbol.search"),
    '@@species': new_unique_symbol("Symbol.species"),
    '@@split': new_unique_symbol("Symbol.split"),
    '@@toPrimitive': new_unique_symbol("Symbol.toPrimitive"),
    '@@toStringTag': new_unique_symbol("Symbol.toStringTag"),
    '@@unscopables': new_unique_symbol("Symbol.unscopables"),
};

// 6.1.6 The Number Type
// 6.1.7 The Object Type
// 6.1.7.1 Property Attributes
// 6.1.7.2 Object Internal Methods and Internal Slots
// 6.1.7.3 Invariants of the Essential Internal Methods
// 6.1.7.4 Well-Known Intrinsic Objects

// 6.2 ECMAScript Specification Types
// 6.2.1 The List and Record Specification Types

function Record(like) {
    if (!this) {
        return new Record(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 6.2.2 The Completion Record Specification Type

function Completion(like) {
    if (!this) {
        return new Completion(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

define_method(Completion, 'is_an_abrupt_completion', function() {
    return (this.Type !== 'normal');
});

// 6.2.2.1
function NormalCompletion(argument) {
    return Completion({ Type: 'normal', Value: argument, Target: empty });
}

// 6.2.2.2 Implicit Completion Values
// 6.2.2.3 Throw an Exception

// 6.2.2.4 ReturnIfAbrupt

function resolveCompletion(c) {
    ReturnIfAbrupt(c);
    return c;
}

// 6.2.2.5
function UpdateEmpty(completionRecord, value) {
    Assert(!(completionRecord.Type === 'return' || completionRecord.Type === 'throw') || completionRecord.Value !== empty);
    if (completionRecord.Value !== empty) return Completion(completionRecord);
    return Completion({ Type: completionRecord.Type, Value: value, Target: completionRecord.Target });
}

// 6.2.3 The Reference Specification Type

function Reference(base, referenced_name, strict_reference_flag) {
    if (!this) {
        return new Reference(base, referenced_name, strict_reference_flag);
    }
    this.base = base;
    this.referenced_name = referenced_name;
    this.strict_reference_flag = strict_reference_flag;
}

function GetBase(V) {
    return V.base;
}

function GetReferencedName(V) {
    return V.referenced_name;
}

function IsStrictReference(V) {
    return V.strict_reference_flag;
}

function HasPrimitiveBase(V) {
    switch (typeof V.base) {
        case 'boolean':
        case 'string':
        case 'symbol':
        case 'number':
            return true;
    }
    return false;
}

function IsPropertyReference(V) {
    if (Type(V.base) === 'Object') return true;
    return HasPrimitiveBase(V);
}

function IsUnresolvableReference(V) {
    if (V.base === undefined) return true;
    return false;
}

function IsSuperReference(V) {
    if ('thisValue' in V) return true;
    return false;
}

// 6.2.3.1
function GetValue(V) {
    if (Type(V) !== 'Reference') return V;
    var base = GetBase(V);
    if (IsUnresolvableReference(V) === true) throw $ReferenceError();
    if (IsPropertyReference(V) === true) {
        if (HasPrimitiveBase(V) === true) {
            Assert(base !== null && base !== undefined);
            var base = ToObject(base);
        }
        return base.Get(GetReferencedName(V), GetThisValue(V));
    } else {
        Assert(Type(base) === 'Environment Record');
        return base.GetBindingValue(GetReferencedName(V), IsStrictReference(V));
    }
}

// 6.2.3.2
function PutValue(V, W) {
    if (Type(V) !== 'Reference') throw $ReferenceError();
    var base = V.base;
    if (IsUnresolvableReference(V) === true) {
        if (IsStrictReference(V) === true) {
            throw $ReferenceError();
        }
        var globalObj = GetGlobalObject();
        return _Set(globalObj, GetReferencedName(V), W, false);
    } else if (IsPropertyReference(V) === true) {
        if (HasPrimitiveBase(V) === true) {
            Assert(base !== null && base !== undefined);
            var base = ToObject(base);
        }
        var succeeded = base.Set(GetReferencedName(V), W, GetThisValue(V));
        if (succeeded === false && IsStrictReference(V) === true) throw $TypeError();
        return;
    } else {
        Assert(Type(base) === 'Environment Record');
        return base.SetMutableBinding(GetReferencedName(V), W, IsStrictReference(V));
    }
}

// 6.2.3.3
function GetThisValue(V) {
    Assert(IsPropertyReference(V) === true);
    if (IsSuperReference(V) === true) {
        return V.thisValue;
    }
    return GetBase(V);
}

// 6.2.3.4
function InitializeReferencedBinding(V, W) {
    Assert(Type(V) === 'Reference');
    Assert(IsUnresolvableReference(V) === false);
    var base = GetBase(V);
    Assert(Type(base) === 'Environment Record');
    return base.InitializeBinding(GetReferencedName(V), W);
}

// 6.2.4 The Property Descriptor Specification Type

function PropertyDescriptor(like) {
    if (!this) {
        return new PropertyDescriptor(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 6.2.4.1
function IsAccessorDescriptor(Desc) {
    if (Desc === undefined) return false;
    if (!('Get' in Desc) && !('Set' in Desc)) return false;
    return true;
}

// 6.2.4.2
function IsDataDescriptor(Desc) {
    if (Desc === undefined) return false;
    if (!('Value' in Desc) && !('Writable' in Desc)) return false;
    return true;
}

// 6.2.4.3
function IsGenericDescriptor(Desc) {
    if (Desc === undefined) return false;
    if (IsAccessorDescriptor(Desc) === false && IsDataDescriptor(Desc) === false) return true;
    return false;
}

// 6.2.4.4
function FromPropertyDescriptor(Desc) {
    if (Desc === undefined) return undefined;
    var obj = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    if ('Value' in Desc) {
        CreateDataProperty(obj, "value", Desc.Value);
    }
    if ('Writable' in Desc) {
        CreateDataProperty(obj, "writable", Desc.Writable);
    }
    if ('Get' in Desc) {
        CreateDataProperty(obj, "get", Desc.Get);
    }
    if ('Set' in Desc) {
        CreateDataProperty(obj, "set", Desc.Set);
    }
    if ('Enumerable' in Desc) {
        CreateDataProperty(obj, "enumerable", Desc.Enumerable);
    }
    if ('Configurable' in Desc) {
        CreateDataProperty(obj, "configurable", Desc.Configurable);
    }
    return obj;
}

// 6.2.4.5
function ToPropertyDescriptor(Obj) {
    if (Type(Obj) !== 'Object') throw $TypeError();
    var desc = PropertyDescriptor({});
    var hasEnumerable = HasProperty(Obj, "enumerable");
    if (hasEnumerable === true) {
        var _enum = ToBoolean(Get(Obj, "enumerable"));
        desc.Enumerable = _enum;
    }
    var hasConfigurable = HasProperty(Obj, "configurable");
    if (hasConfigurable === true) {
        var conf = ToBoolean(Get(Obj, "configurable"));
        desc.Configurable = conf;
    }
    var hasValue = HasProperty(Obj, "value");
    if (hasValue === true) {
        var value = Get(Obj, "value");
        desc.Value = value;
    }
    var hasWritable = HasProperty(Obj, "writable");
    if (hasWritable === true) {
        var writable = ToBoolean(Get(Obj, "writable"));
        desc.Writable = writable;
    }
    var hasGet = HasProperty(Obj, "get");
    if (hasGet === true) {
        var getter = Get(Obj, "get");
        if (IsCallable(getter) === false && getter !== undefined) throw $TypeError();
        desc.Get = getter;
    }
    var hasSet = HasProperty(Obj, "set");
    if (hasSet === true) {
        var setter = Get(Obj, "set");
        if (IsCallable(setter) === false && setter !== undefined) throw $TypeError();
        desc.Set = setter;
    }
    if ('Get' in desc || 'Set' in desc) {
        if ('Value' in desc || 'Writable' in desc) throw $TypeError();
    }
    return desc;
}

// 6.2.4.6
function CompletePropertyDescriptor(Desc) {
    Assert(Type(Desc) === 'Property Descriptor');
    var like = { Value: undefined, Writable: false, Get: undefined, Set: undefined, Enumerable: false, Configurable: false };
    if (IsGenericDescriptor(Desc) === true || IsDataDescriptor(Desc) === true) {
        if (!('Value' in Desc)) Desc.Value = like.Value;
        if (!('Writable' in Desc)) Desc.Writable = like.Writable;
    } else {
        if (!('Get' in Desc)) Desc.Get = like.Get;
        if (!('Set' in Desc)) Desc.Set = like.Set;
    }
    if (!('Enumerable' in Desc)) Desc.Enumerable = like.Enumerable;
    if (!('Configurable' in Desc)) Desc.Configurable = like.Configurable;
    return Desc;
}

// 6.2.5 The Lexical Environment and Environment Record Specification Types

// 6.2.6 Data Blocks

// 6.2.6.1
function CreateByteDataBlock(size) {
    Assert(size >= 0);
    try {
        var ab = new ArrayBuffer(size);
    } catch (e) {
        throw $RangeError();
    }
    var db = new DataView(new ArrayBuffer(size), 0, size);
    return db;
}

// 6.2.6.2
function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {
    Assert(fromBlock !== toBlock);
    Assert(fromIndex >= 0 && toIndex >= 0 && count >= 0);
    var fromSize = fromBlock.byteLength;
    Assert(fromIndex + count <= fromSize);
    var toSize = toBlock.byteLength;
    Assert(toIndex + count <= toSize);
    /*
    while (count > 0) {
        toBlock[toIndex] = fromBlock[fromIndex];
        toIndex++;
        fromIndex++;
        count--;
    }
	*/
    (new Uint8Array(toBlock.buffer)).set(new Uint8Array(fromBlock.buffer, fromIndex, count), toIndex);
    return empty;
}

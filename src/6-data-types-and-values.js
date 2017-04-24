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
    if (x.$type !== undefined) return x.$type;
    if (Array.isArray(x) === true) return 'List';
    if (x.length !== undefined) return 'Data Block';
    return 'Record';
}

// 6.1 ECMAScript Language Types

// 6.1.1 The Undefined Type
// 6.1.2 The Null Type
// 6.1.3 The Boolean Type
// 6.1.4 The String Type
// 6.1.5 The Symbol Type

// 6.1.5.1 Well-Known Symbols

const wellKnownSymbols = {
    '@@hasInstance': Symbol("Symbol.hasInstance"),
    '@@isConcatSpreadable': Symbol("Symbol.isConcatSpreadable"),
    '@@iterator': Symbol("Symbol.iterator"),
    '@@match': Symbol("Symbol.match"),
    '@@replace': Symbol("Symbol.replace"),
    '@@search': Symbol("Symbol.search"),
    '@@species': Symbol("Symbol.species"),
    '@@split': Symbol("Symbol.split"),
    '@@toPrimitive': Symbol("Symbol.toPrimitive"),
    '@@toStringTag': Symbol("Symbol.toStringTag"),
    '@@unscopables': Symbol("Symbol.unscopables"),
};

// 6.1.6 The Number Type
// 6.1.7 The Object Type

// 6.1.7.1 Property Attributes

/* TODO
Table 2: Attributes of a Data Property
Attribute Name	Value Domain	Description
[[Value]]	Any ECMAScript language type	The value retrieved by a get access of the property.
[[Writable]]	Boolean	If false, attempts by ECMAScript code to change the property's [[Value]] attribute using [[Set]] will not succeed.
[[Enumerable]]	Boolean	If true, the property will be enumerated by a for-in enumeration (see 13.7.5). Otherwise, the property is said to be non-enumerable.
[[Configurable]]	Boolean	If false, attempts to delete the property, change the property to be an accessor property, or change its attributes (other than [[Value]], or changing [[Writable]] to false) will fail.
An accessor property associates a key value with the attributes listed in Table 3.

Table 3: Attributes of an Accessor Property
Attribute Name	Value Domain	Description
[[Get]]	Object | Undefined	If the value is an Object it must be a function object. The function's [[Call]] internal method (Table 6) is called with an empty arguments list to retrieve the property value each time a get access of the property is performed.
[[Set]]	Object | Undefined	If the value is an Object it must be a function object. The function's [[Call]] internal method (Table 6) is called with an arguments list containing the assigned value as its sole argument each time a set access of the property is performed. The effect of a property's [[Set]] internal method may, but is not required to, have an effect on the value returned by subsequent calls to the property's [[Get]] internal method.
[[Enumerable]]	Boolean	If true, the property is to be enumerated by a for-in enumeration (see 13.7.5). Otherwise, the property is said to be non-enumerable.
[[Configurable]]	Boolean	If false, attempts to delete the property, change the property to be a data property, or change its attributes will fail.
If the initial values of a property's attributes are not explicitly specified by this specification, the default value defined in Table 4 is used.

Table 4: Default Attribute Values
Attribute Name	Default Value
[[Value]]	undefined
[[Get]]	undefined
[[Set]]	undefined
[[Writable]]	false
[[Enumerable]]	false
[[Configurable]]	false
*/

// 6.1.7.2 Object Internal Methods and Internal Slots

/* TODO
Table 5: Essential Internal Methods
Internal Method	Signature	Description
[[GetPrototypeOf]]	() → Object | Null	Determine the object that provides inherited properties for this object. A null value indicates that there are no inherited properties.
[[SetPrototypeOf]]	(Object | Null) → Boolean	Associate this object with another object that provides inherited properties. Passing null indicates that there are no inherited properties. Returns true indicating that the operation was completed successfully or false indicating that the operation was not successful.
[[IsExtensible]]	( ) → Boolean	Determine whether it is permitted to add additional properties to this object.
[[PreventExtensions]]	( ) → Boolean	Control whether new properties may be added to this object. Returns true if the operation was successful or false if the operation was unsuccessful.
[[GetOwnProperty]]	(propertyKey) → Undefined | Property Descriptor	Return a Property Descriptor for the own property of this object whose key is propertyKey, or undefined if no such property exists.
[[HasProperty]]	(propertyKey) → Boolean	Return a Boolean value indicating whether this object already has either an own or inherited property whose key is propertyKey.
[[Get]]	(propertyKey, Receiver) → any	Return the value of the property whose key is propertyKey from this object. If any ECMAScript code must be executed to retrieve the property value, Receiver is used as the this value when evaluating the code.
[[Set]]	(propertyKey, value, Receiver) → Boolean	Set the value of the property whose key is propertyKey to value. If any ECMAScript code must be executed to set the property value, Receiver is used as the this value when evaluating the code. Returns true if the property value was set or false if it could not be set.
[[Delete]]	(propertyKey) → Boolean	Remove the own property whose key is propertyKey from this object. Return false if the property was not deleted and is still present. Return true if the property was deleted or is not present.
[[DefineOwnProperty]]	(propertyKey, PropertyDescriptor) → Boolean	Create or alter the own property, whose key is propertyKey, to have the state described by PropertyDescriptor. Return true if that property was successfully created/updated or false if the property could not be created or updated.
[[OwnPropertyKeys]]	()→List of propertyKey	Return a List whose elements are all of the own property keys for the object.
Table 6 summarizes additional essential internal methods that are supported by objects that may be called as functions. A function object is an object that supports the [[Call]] internal methods. A constructor (also referred to as a constructor function) is a function object that supports the [[Construct]] internal method.

Table 6: Additional Essential Internal Methods of Function Objects
Internal Method	Signature	Description
[[Call]]	(any, a List of any) → any	Executes code associated with this object. Invoked via a function call expression. The arguments to the internal method are a this value and a list containing the arguments passed to the function by a call expression. Objects that implement this internal method are callable.
[[Construct]]	(a List of any, Object) → Object	Creates an object. Invoked via the new or super operators. The first argument to the internal method is a list containing the arguments of the operator. The second argument is the object to which the new operator was initially applied. Objects that implement this internal method are called constructors. A function object is not necessarily a constructor and such non-constructor function objects do not have a [[Construct]] internal method.
The semantics of the essential internal methods for ordinary objects and standard exotic objects are specified in clause 9. If any specified use of an internal method of an exotic object is not supported by an implementation, that usage must throw a TypeError exception when attempted.
*/

// 6.1.7.3 Invariants of the Essential Internal Methods
// 6.1.7.4 Well-Known Intrinsic Objects

// 6.2 ECMAScript Specification Types

// 6.2.1 The List and Record Specification Types

// 6.2.2 The Completion Record Specification Type

function Completion(like) {
    if (!this) {
        if (like instanceof Completion) return like;
        return new Completion(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

Completion.prototype.$type = 'Completion Record';

function ResolveCompletion(completion) {
    Assert(completion instanceof Completion);
    if (completion.type === 'throw') throw completion.Value;
    //TODO return/break/continue ???
    Assert(completion.type === 'normal');
    return completion.Value;
}

// 6.2.2.1 NormalCompletion
function NormalCompletion(argument) {
    return Completion({ Type: 'normal', Value: argument, Target: empty });
}

// 6.2.2.2 Implicit Completion Values
// 6.2.2.3 Throw an Exception
// 6.2.2.4 ReturnIfAbrupt

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

Reference.prototype.$type = 'Reference';

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

PropertyDescriptor.prototype.$type = 'Property Descriptor';

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
    if (Type(Obj) !== Object) throw $TypeError();
    var desc = new PropertyDescriptor({});
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
    var db = new Int8Array(size);
    return db;
}

// 6.2.6.2
function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {
    Assert(fromBlock !== toBlock);
    Assert(fromIndex >= 0 && toIndex >= 0 && count >= 0);
    var fromSize = fromBlock.length;
    Assert(fromIndex + count <= fromSize);
    var toSize = toBlock.length;
    Assert(toIndex + count <= toSize);
    while (count > 0) {
        toBlock[toIndex] = fromBlock[fromIndex];
        toIndex++;
        fromIndex++;
        count--;
        return empty;
    }
}

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

// 26 Reflection

// 26.1 The Reflect Object

// 26.1.1
function Reflect_apply(target, thisArgument, argumentsList) {
    if (IsCallable(target) === false) throw $TypeError();
    var args = CreateListFromArrayLike(argumentsList);
    throw new PendingTailCall(target, thisArgument, args); // PrepareForTailCall();
}

// 26.1.2
function Reflect_construct(target, argumentsList, newTarget) {
    if (IsConstructor(target) === false) throw $TypeError();
    if (arguments.length <= 2) var newTarget = target;
    else if (IsConstructor(newTarget) === false) throw $TypeError();
    var args = CreateListFromArrayLike(argumentsList);
    return Construct(target, args, newTarget);
}

// 26.1.3
function Reflect_defineProperty(target, propertyKey, attributes) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    var desc = ToPropertyDescriptor(attributes);
    return target.DefineOwnProperty(key, desc);
}

// 26.1.4
function Reflect_deleteProperty(target, propertyKey) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    return target.Delete(key);
}

// 26.1.5
function Reflect_get(target, propertyKey, receiver) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    if (arguments.length <= 2) {
        var receiver = target;
    }
    return target.Get(key, receiver);
}

// 26.1.6
function Reflect_getOwnPropertyDescriptor(target, propertyKey) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    var desc = target.GetOwnProperty(key);
    return FromPropertyDescriptor(desc);
}

// 26.1.7
function Reflect_getPrototypeOf(target) {
    if (Type(target) !== 'Object') throw $TypeError();
    return target.GetPrototypeOf();
}

// 26.1.8
function Reflect_has(target, propertyKey) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    return target.HasProperty(key);
}

// 26.1.9
function Reflect_isExtensible(target) {
    if (Type(target) !== 'Object') throw $TypeError();
    return target.IsExtensible();
}

// 26.1.10
function Reflect_ownKeys(target) {
    if (Type(target) !== 'Object') throw $TypeError();
    var keys = target.OwnPropertyKeys();
    return CreateArrayFromList(keys);
}

// 26.1.11
function Reflect_preventExtensions(target) {
    if (Type(target) !== 'Object') throw $TypeError();
    return target.PreventExtensions();
}

// 26.1.12
function Reflect_set(target, propertyKey, V, receiver) {
    if (Type(target) !== 'Object') throw $TypeError();
    var key = ToPropertyKey(propertyKey);
    if (arguments.length <= 3) {
        var receiver = target;
    }
    return target.Set(key, V, receiver);
}

// 26.1.13
function Reflect_setPrototypeOf(target, proto) {
    if (Type(target) !== 'Object') throw $TypeError();
    if (Type(proto) !== 'Object' && proto !== null) throw $TypeError();
    return target.SetPrototypeOf(proto);
}

// 26.2 Proxy Objects

// 26.2.1 The Proxy Constructor

// 26.2.1.1
function Proxy$(target, handler) {
    if (NewTarget === undefined) throw $TypeError();
    return ProxyCreate(target, handler);
}

// 26.2.2 Properties of the Proxy Constructor

// 26.2.2.1
function Proxy_revocable(target, handler) {
    var p = ProxyCreate(target, handler);
    var revoker = CreateBuiltinFunction(currentRealm, Proxy_revocation_function, currentRealm.Intrinsics['%FunctionPrototype%'], ['RevocableProxy']);
    revoker.RevocableProxy = p;
    revoker.DefineOwnProperty('length', PropertyDescriptor({ Value: 0, Writable: false, Enumerable: false, Configurable: true }));
    var result = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    CreateDataProperty(result, "proxy", p);
    CreateDataProperty(result, "revoke", revoker);
    return result;
}

// 26.2.2.1.1
function Proxy_revocation_function() {
    var F = active_function_object;
    var p = F.RevocableProxy;
    if (p === null) return undefined;
    F.RevocableProxy = null;
    Assert(p instanceof ProxyExoticObject);
    p.ProxyTarget = null;
    p.ProxyHandler = null;
    return undefined;
}

// 26.3 Module Namespace Objects

// 26.3.1@@toStringTag

// 26.3.2[ @@iterator ] ( )
function Module_Namespace_iterator() {
    var N = this;
    if (!(N instanceof ModuleNamespaceExoticObject)) throw $TypeError();
    var exports = N.Exports;
    return CreateListIterator(exports);
}

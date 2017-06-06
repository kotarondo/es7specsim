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

// 8 Executable Code and Execution Contexts

// 8.1
class LexicalEnvironment {}

// 8.1.1 Environment Records

class EnvironmentRecord {}

const ER_mutable = 1;
const ER_immutable = 2;
const ER_deletable = 4;
const ER_initialized = 8;
const ER_uninitialized = 16;
const ER_strict = 32;
const ER_indirect = 64;

// 8.1.1.1
class DeclarativeEnvironmentRecord extends EnvironmentRecord {

    constructor() {
        super();
        var envRec = this;
        envRec.attributes = Object.create(null);
        envRec.values = Object.create(null);
    }

    // 8.1.1.1.1
    HasBinding(N) {
        var envRec = this;
        if (envRec.attributes[N] !== undefined) return true;
        return false;
    }

    // 8.1.1.1.2
    CreateMutableBinding(N, D) {
        var envRec = this;
        Assert(envRec.attributes[N] === undefined);
        envRec.attributes[N] = ER_mutable | ER_uninitialized;
        if (D === true) envRec.attributes[N] |= ER_deletable;
        return empty;
    }

    // 8.1.1.1.3
    CreateImmutableBinding(N, S) {
        var envRec = this;
        Assert(envRec.attributes[N] === undefined);
        envRec.attributes[N] = ER_immutable | ER_uninitialized;
        if (S === true) envRec.attributes[N] |= ER_strict;
        return empty;
    }

    // 8.1.1.1.4
    InitializeBinding(N, V) {
        var envRec = this;
        Assert((envRec.attributes[N] & ER_uninitialized) !== 0);
        envRec.values[N] = V;
        envRec.attributes[N] &= ~ER_uninitialized;
        envRec.attributes[N] |= ER_initialized;
        return empty;
    }

    // 8.1.1.1.5
    SetMutableBinding(N, V, S) {
        var envRec = this;
        if (envRec.attributes[N] === undefined) {
            if (S === true) throw $ReferenceError();
            envRec.CreateMutableBinding(N, true);
            envRec.InitializeBinding(N, V);
            return empty;
        }
        if ((envRec.attributes[N] & ER_strict) !== 0) var S = true;
        if ((envRec.attributes[N] & ER_initialized) === 0) throw $ReferenceError();
        else if ((envRec.attributes[N] & ER_mutable) !== 0) envRec.values[N] = V;
        else if (S === true) throw $TypeError();
        return empty;
    }

    // 8.1.1.1.6
    GetBindingValue(N, S) {
        var envRec = this;
        Assert(envRec.attributes[N] !== undefined);
        if ((envRec.attributes[N] & ER_uninitialized) !== 0) throw $ReferenceError();
        return envRec.values[N];
    }

    // 8.1.1.1.7
    DeleteBinding(N) {
        var envRec = this;
        Assert(envRec.attributes[N] !== undefined);
        if ((envRec.attributes[N] & ER_deletable) === 0) return false;
        delete envRec.values[N];
        return true;
    }

    // 8.1.1.1.8
    HasThisBinding() {
        return false;
    }

    // 8.1.1.1.9
    HasSuperBinding() {
        return false;
    }

    // 8.1.1.1.10
    WithBaseObject() {
        return undefined;
    }
}

// 8.1.1.2
class ObjectEnvironmentRecord extends EnvironmentRecord {

    constructor(O) {
        super();
        this.binding_object = O;
        this.withEnvironment = false;
    }

    // 8.1.1.2.1
    HasBinding(N) {
        var envRec = this;
        var bindings = envRec.binding_object;
        var foundBinding = HasProperty(bindings, N);
        if (foundBinding === false) return false;
        if (envRec.withEnvironment === false) return true;
        var unscopables = Get(bindings, wellKnownSymbols['@@unscopables']);
        if (Type(unscopables) === 'Object') {
            var blocked = ToBoolean(Get(unscopables, N));
            if (blocked === true) return false;
        }
        return true;
    }

    // 8.1.1.2.2
    CreateMutableBinding(N, D) {
        var envRec = this;
        var bindings = envRec.binding_object;
        if (D === true) var configValue = true;
        else var configValue = false;
        return DefinePropertyOrThrow(bindings, N, PropertyDescriptor({
            Value: undefined,
            Writable: true,
            Enumerable: true,
            Configurable: configValue
        }));
    }

    // 8.1.1.2.3
    CreateImmutableBinding(N, S) {
        Assert(false);
    }

    // 8.1.1.2.4
    InitializeBinding(N, V) {
        var envRec = this;
        return envRec.SetMutableBinding(N, V, false);
    }

    // 8.1.1.2.5
    SetMutableBinding(N, V, S) {
        var envRec = this;
        var bindings = envRec.binding_object;
        return _Set(bindings, N, V, S);
    }

    // 8.1.1.2.6
    GetBindingValue(N, S) {
        var envRec = this;
        var bindings = envRec.binding_object;
        var value = HasProperty(bindings, N);
        if (value === false) {
            if (S === false) return undefined;
            else throw $ReferenceError();
        }
        return Get(bindings, N);
    }

    // 8.1.1.2.7
    DeleteBinding(N) {
        var envRec = this;
        var bindings = envRec.binding_object;
        return bindings.Delete(N);
    }

    // 8.1.1.2.8
    HasThisBinding() {
        return false;
    }

    // 8.1.1.2.9
    HasSuperBinding() {
        return false;
    }

    // 8.1.1.2.10
    WithBaseObject() {
        var envRec = this;
        if (envRec.withEnvironment === true) return envRec.binding_object;
        else return undefined;
    }
}

// 8.1.1.3
class FunctionEnvironmentRecord extends DeclarativeEnvironmentRecord {

    // 8.1.1.3.1
    BindThisValue(V) {
        var envRec = this;
        Assert(envRec.ThisBindingStatus !== "lexical");
        if (envRec.ThisBindingStatus === "initialized") throw $ReferenceError();
        envRec.ThisValue = V;
        envRec.ThisBindingStatus = "initialized";
        return V;
    }

    // 8.1.1.3.2
    HasThisBinding() {
        var envRec = this;
        if (envRec.ThisBindingStatus === "lexical") return false;
        else return true;
    }

    // 8.1.1.3.3
    HasSuperBinding() {
        var envRec = this;
        if (envRec.ThisBindingStatus === "lexical") return false;
        if (envRec.HomeObject === undefined) return false;
        else return true;
    }

    // 8.1.1.3.4
    GetThisBinding() {
        var envRec = this;
        Assert(envRec.ThisBindingStatus !== "lexical");
        if (envRec.ThisBindingStatus === "uninitialized") throw $ReferenceError();
        return envRec.ThisValue;
    }

    // 8.1.1.3.5
    GetSuperBase() {
        var envRec = this;
        var home = envRec.HomeObject;
        if (home === undefined) return undefined;
        Assert(Type(home) === 'Object');
        return home.GetPrototypeOf();
    }
}

// 8.1.1.4
class GlobalEnvironmentRecord extends EnvironmentRecord {

    // 8.1.1.4.1
    HasBinding(N) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) return true;
        var ObjRec = envRec.ObjectRecord;
        return ObjRec.HasBinding(N);
    }

    // 8.1.1.4.2
    CreateMutableBinding(N, D) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) throw $TypeError();
        return DclRec.CreateMutableBinding(N, D);
    }

    // 8.1.1.4.3
    CreateImmutableBinding(N, S) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) throw $TypeError();
        return DclRec.CreateImmutableBinding(N, S);
    }

    // 8.1.1.4.4
    InitializeBinding(N, V) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) {
            return DclRec.InitializeBinding(N, V);
        }
        var ObjRec = envRec.ObjectRecord;
        return ObjRec.InitializeBinding(N, V);
    }

    // 8.1.1.4.5
    SetMutableBinding(N, V, S) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) {
            return DclRec.SetMutableBinding(N, V, S);
        }
        var ObjRec = envRec.ObjectRecord;
        return ObjRec.SetMutableBinding(N, V, S);
    }

    // 8.1.1.4.6
    GetBindingValue(N, S) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) {
            return DclRec.GetBindingValue(N, S);
        }
        var ObjRec = envRec.ObjectRecord;
        return ObjRec.GetBindingValue(N, S);
    }

    // 8.1.1.4.7
    DeleteBinding(N) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        if (DclRec.HasBinding(N) === true) {
            return DclRec.DeleteBinding(N);
        }
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var existingProp = HasOwnProperty(globalObject, N);
        if (existingProp === true) {
            var status = ObjRec.DeleteBinding(N);
            if (status === true) {
                var varNames = envRec.VarNames;
                if (N.is_an_element_of(varNames)) varNames.remove(N);
            }
            return status;
        }
        return true;
    }

    // 8.1.1.4.8
    HasThisBinding() {
        return true;
    }

    // 8.1.1.4.9
    HasSuperBinding() {
        return false;
    }

    // 8.1.1.4.10
    WithBaseObject() {
        return undefined;
    }

    // 8.1.1.4.11
    GetThisBinding() {
        var envRec = this;
        return envRec.GlobalThisValue;
    }

    // 8.1.1.4.12
    HasVarDeclaration(N) {
        var envRec = this;
        var varDeclaredNames = envRec.VarNames;
        if (varDeclaredNames.contains(N)) return true;
        return false;
    }

    // 8.1.1.4.13
    HasLexicalDeclaration(N) {
        var envRec = this;
        var DclRec = envRec.DeclarativeRecord;
        return DclRec.HasBinding(N);
    }

    // 8.1.1.4.14
    HasRestrictedGlobalProperty(N) {
        var envRec = this;
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var existingProp = globalObject.GetOwnProperty(N);
        if (existingProp === undefined) return false;
        if (existingProp.Configurable === true) return false;
        return true;
    }

    // 8.1.1.4.15
    CanDeclareGlobalVar(N) {
        var envRec = this;
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var hasProperty = HasOwnProperty(globalObject, N);
        if (hasProperty === true) return true;
        return IsExtensible(globalObject);
    }

    // 8.1.1.4.16
    CanDeclareGlobalFunction(N) {
        var envRec = this;
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var existingProp = globalObject.GetOwnProperty(N);
        if (existingProp === undefined) return IsExtensible(globalObject);
        if (existingProp.Configurable === true) return true;
        if (IsDataDescriptor(existingProp) === true && existingProp.Writable === true && existingProp.Enumerable === true) return true;
        return false;
    }

    // 8.1.1.4.17
    CreateGlobalVarBinding(N, D) {
        var envRec = this;
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var hasProperty = HasOwnProperty(globalObject, N);
        var extensible = IsExtensible(globalObject);
        if (hasProperty === false && extensible === true) {
            ObjRec.CreateMutableBinding(N, D);
            ObjRec.InitializeBinding(N, undefined);
        }
        var varDeclaredNames = envRec.VarNames;
        if (!varDeclaredNames.contains(N)) {
            varDeclaredNames.push(N);
        }
        return empty;
    }

    // 8.1.1.4.18
    CreateGlobalFunctionBinding(N, V, D) {
        var envRec = this;
        var ObjRec = envRec.ObjectRecord;
        var globalObject = ObjRec.binding_object;
        var existingProp = globalObject.GetOwnProperty(N);
        if (existingProp === undefined || existingProp.Configurable === true) {
            var desc = PropertyDescriptor({ Value: V, Writable: true, Enumerable: true, Configurable: D });
        } else {
            var desc = PropertyDescriptor({ Value: V });
        }
        DefinePropertyOrThrow(globalObject, N, desc);
        _Set(globalObject, N, V, false);
        var varDeclaredNames = envRec.VarNames;
        if (!varDeclaredNames.contains(N)) {
            varDeclaredNames.push(N);
        }
        return empty;
    }
}

// 8.1.1.5
class ModuleEnvironmentRecord extends DeclarativeEnvironmentRecord {

    // 8.1.1.5.1
    GetBindingValue(N, S) {
        var envRec = this;
        Assert(envRec.attributes[N] !== undefined);
        if ((envRec.attributes[N] & ER_indirect) !== 0) {
            var M = envRec.values[N].M;
            var N2 = envRec.values[N].N2;
            var targetEnv = M.Environment;
            if (targetEnv === undefined) throw $ReferenceError();
            var targetER = targetEnv.EnvironmentRecord;
            return targetER.GetBindingValue(N2, S);
        }
        if ((envRec.attributes[N] & ER_uninitialized) !== 0) throw $ReferenceError();
        return envRec.values[N];
    }

    // 8.1.1.5.2
    DeleteBinding(N) {
        var envRec = this;
        if (envRec.attributes[N] === undefined) return true;
        return false;
    }

    // 8.1.1.5.3
    HasThisBinding() {
        return true;
    }

    // 8.1.1.5.4
    GetThisBinding() {
        return undefined;
    }

    // 8.1.1.5.5
    CreateImportBinding(N, M, N2) {
        var envRec = this;
        Assert(envRec.attributes[N] === undefined);
        Assert(Type(M) === 'Module Record');
        envRec.attributes[N] = ER_immutable | ER_indirect | ER_initialized;
        envRec.values[N] = { M, N2 };
        return empty;
    }
}

// 8.1.2 Lexical Environment Operations

// 8.1.2.1
function GetIdentifierReference(lex, name, strict) {
    if (lex === null) {
        return Reference(undefined, name, strict);
    }
    var envRec = lex.EnvironmentRecord;
    var exists = envRec.HasBinding(name);
    if (exists === true) {
        return Reference(envRec, name, strict);
    } else {
        var outer = lex.outer_lexical_environment;
        return GetIdentifierReference(outer, name, strict);
    }
}

// 8.1.2.2
function NewDeclarativeEnvironment(E) {
    var env = new LexicalEnvironment;
    var envRec = new DeclarativeEnvironmentRecord;
    env.EnvironmentRecord = envRec;
    env.outer_lexical_environment = E;
    return env;
}

// 8.1.2.3
function NewObjectEnvironment(O, E) {
    var env = new LexicalEnvironment;
    var envRec = new ObjectEnvironmentRecord(O);
    env.EnvironmentRecord = envRec;
    env.outer_lexical_environment = E;
    return env;
}

// 8.1.2.4
function NewFunctionEnvironment(F, newTarget) {
    Assert(F instanceof ECMAScriptFunctionObject);
    Assert(Type(newTarget) === 'Undefined' || Type(newTarget) === 'Object');
    var env = new LexicalEnvironment;
    var envRec = new FunctionEnvironmentRecord;
    envRec.FunctionObject = F;
    if (F.ThisMode === 'lexical') envRec.ThisBindingStatus = "lexical";
    else envRec.ThisBindingStatus = "uninitialized";
    var home = F.HomeObject;
    envRec.HomeObject = home;
    envRec.NewTarget = newTarget;
    env.EnvironmentRecord = envRec;
    env.outer_lexical_environment = F.Environment;
    return env;
}

// 8.1.2.5
function NewGlobalEnvironment(G, thisValue) {
    var env = new LexicalEnvironment;
    var objRec = new ObjectEnvironmentRecord(G);
    var dclRec = new DeclarativeEnvironmentRecord;
    var globalRec = new GlobalEnvironmentRecord;
    globalRec.ObjectRecord = objRec;
    globalRec.GlobalThisValue = thisValue;
    globalRec.DeclarativeRecord = dclRec;
    globalRec.VarNames = [];
    env.EnvironmentRecord = globalRec;
    env.outer_lexical_environment = null;
    return env;
}

// 8.1.2.6
function NewModuleEnvironment(E) {
    var env = new LexicalEnvironment;
    var envRec = new ModuleEnvironmentRecord;
    env.EnvironmentRecord = envRec;
    env.outer_lexical_environment = E;
    return env;
}

// 8.2 Realms
class RealmRecord {}

// 8.2.1
function CreateRealm() {
    var realmRec = new RealmRecord;
    CreateIntrinsics(realmRec);
    realmRec.GlobalObject = undefined;
    realmRec.GlobalEnv = undefined;
    realmRec.TemplateMap = [];
    return realmRec;
}

// from 17 ECMAScript Standard Built-in Objects

function intrinsic_property(realmRec, intrinsicName, P, V, options) {
    var intrinsics = realmRec.Intrinsics;
    var O = intrinsics[intrinsicName];
    if (options && options.attributes) {
        var a = options.attributes;
        O.DefineOwnProperty(P, PropertyDescriptor({ Value: V, Writable: a.Writable, Enumerable: a.Enumerable, Configurable: a.Configurable }));
    } else {
        O.DefineOwnProperty(P, PropertyDescriptor({ Value: V, Writable: true, Enumerable: false, Configurable: true }));
    }
}

function intrinsic_function(realmRec, intrinsicName, P, steps, length, options) {
    var name = (options && options.name) || P;
    var intrinsics = realmRec.Intrinsics;
    var V = CreateBuiltinFunction(realmRec, steps, intrinsics['%FunctionPrototype%']);
    V.DefineOwnProperty('name', PropertyDescriptor({ Value: name, Writable: false, Enumerable: false, Configurable: true }));
    V.DefineOwnProperty('length', PropertyDescriptor({ Value: length, Writable: false, Enumerable: false, Configurable: true }));
    if (intrinsicName) {
        var O = intrinsics[intrinsicName];
        if (options && options.attributes) {
            var a = options.attributes;
            O.DefineOwnProperty(P, PropertyDescriptor({ Value: V, Writable: a.Writable, Enumerable: a.Enumerable, Configurable: a.Configurable }));
        } else {
            O.DefineOwnProperty(P, PropertyDescriptor({ Value: V, Writable: true, Enumerable: false, Configurable: true }));
        }
    }
    return V;
}

function intrinsic_constructor(realmRec, name, steps, length, options) {
    var intrinsics = realmRec.Intrinsics;
    var proto = (options && options.proto) || intrinsics['%FunctionPrototype%'];
    var V = CreateBuiltinFunction(realmRec, steps, proto);
    define_method_direct(V, 'Construct', BuiltinFunctionObject_Construct);
    V.DefineOwnProperty('name', PropertyDescriptor({ Value: name, Writable: false, Enumerable: false, Configurable: true }));
    V.DefineOwnProperty('length', PropertyDescriptor({ Value: length, Writable: false, Enumerable: false, Configurable: true }));
    return V;
}

function intrinsic_accessor(realmRec, intrinsicName, P, get_steps, set_steps, options) {
    var name = (options && options.name) || P;
    var intrinsics = realmRec.Intrinsics;
    if (get_steps) {
        var getV = CreateBuiltinFunction(realmRec, get_steps, intrinsics['%FunctionPrototype%']);
        getV.DefineOwnProperty('name', PropertyDescriptor({ Value: 'get ' + name, Writable: false, Enumerable: false, Configurable: true }));
        getV.DefineOwnProperty('length', PropertyDescriptor({ Value: 0, Writable: false, Enumerable: false, Configurable: true }));
    }
    if (set_steps) {
        var setV = CreateBuiltinFunction(realmRec, set_steps, intrinsics['%FunctionPrototype%']);
        setV.DefineOwnProperty('name', PropertyDescriptor({ Value: 'set ' + name, Writable: false, Enumerable: false, Configurable: true }));
        setV.DefineOwnProperty('length', PropertyDescriptor({ Value: 1, Writable: false, Enumerable: false, Configurable: true }));
    }
    var O = intrinsics[intrinsicName];
    O.DefineOwnProperty(P, PropertyDescriptor({ Get: getV, Set: setV, Enumerable: false, Configurable: true }));
}

// 8.2.2
function CreateIntrinsics(realmRec) {
    var intrinsics = {};
    realmRec.Intrinsics = intrinsics;
    var objProto = ObjectCreate(null);
    intrinsics['%ObjectPrototype%'] = objProto;
    var throwerSteps = ThrowTypeError;
    var thrower = CreateBuiltinFunction(realmRec, throwerSteps, null);
    intrinsics['%ThrowTypeError%'] = thrower;
    var noSteps = function() {};
    var funcProto = CreateBuiltinFunction(realmRec, noSteps, objProto);
    intrinsics['%FunctionPrototype%'] = funcProto;
    thrower.SetPrototypeOf(funcProto);
    AddRestrictedFunctionProperties(funcProto, realmRec);

    thrower.DefineOwnProperty('length', PropertyDescriptor({ Value: 0, Writable: false, Enumerable: false, Configurable: false })); // 9.2.7.1
    thrower.Extensible = false; // 9.2.7.1

    intrinsics['%ArrayBuffer%'] =
        intrinsics['%ArrayBufferPrototype%'] =
        intrinsics['%BooleanPrototype%'] =
        intrinsics['%DataView%'] =
        intrinsics['%DataViewPrototype%'] =
        intrinsics['%Date%'] =
        intrinsics['%DatePrototype%'] =
        intrinsics['%Generator%'] =
        intrinsics['%GeneratorPrototype%'] =
        intrinsics['%IteratorPrototype%'] =
        intrinsics['%JSON%'] =
        intrinsics['%Map%'] =
        intrinsics['%MapIteratorPrototype%'] =
        intrinsics['%MapPrototype%'] =
        intrinsics['%Math%'] =
        intrinsics['%Number%'] =
        intrinsics['%NumberPrototype%'] =
        intrinsics['%ObjectPrototype%'] =
        intrinsics['%Promise%'] =
        intrinsics['%PromisePrototype%'] =
        intrinsics['%Proxy%'] =
        intrinsics['%Reflect%'] =
        intrinsics['%RegExp%'] =
        intrinsics['%RegExpPrototype%'] =
        intrinsics['%Set%'] =
        intrinsics['%SetIteratorPrototype%'] =
        intrinsics['%SetPrototype%'] =
        intrinsics['%String%'] =
        intrinsics['%StringIteratorPrototype%'] =
        intrinsics['%StringPrototype%'] =
        intrinsics['%WeakMap%'] =
        intrinsics['%WeakMapPrototype%'] =
        intrinsics['%WeakSet%'] =
        intrinsics['%WeakSetPrototype%'] = ObjectCreate(objProto);
    intrinsics['%GeneratorFunction%'] = CreateBuiltinFunction(realmRec, noSteps, objProto); //TODO


    intrinsics['%eval%'] = intrinsic_function(realmRec, null, 'eval', global_eval, 1); // 18.2.1
    intrinsics['%isFinite%'] = intrinsic_function(realmRec, null, 'isFinite', global_isFinite, 1); // 18.2.2
    intrinsics['%isNaN%'] = intrinsic_function(realmRec, null, 'isNaN', global_isNaN, 1); // 18.2.3
    intrinsics['%parseFloat%'] = intrinsic_function(realmRec, null, 'parseFloat', global_parseFloat, 1); // 18.2.4
    intrinsics['%parseInt%'] = intrinsic_function(realmRec, null, 'parseInt', global_parseInt, 1); // 18.2.5
    intrinsics['%decodeURI%'] = intrinsic_function(realmRec, null, 'decodeURI', global_decodeURI, 1); // 18.2.6.2
    intrinsics['%decodeURIComponent%'] = intrinsic_function(realmRec, null, 'decodeURIComponent', global_decodeURIComponent, 1); // 18.2.6.3
    intrinsics['%encodeURI%'] = intrinsic_function(realmRec, null, 'encodeURI', global_encodeURI, 1); // 18.2.6.4
    intrinsics['%encodeURIComponent%'] = intrinsic_function(realmRec, null, 'encodeURIComponent', global_encodeURIComponent, 1); // 18.2.6.5

    intrinsics['%Object%'] = intrinsic_constructor(realmRec, 'Object', $Object, 1); // 19.1.1.1
    intrinsic_function(realmRec, '%Object%', 'assign', Object_assign, 2); // 19.1.2.1
    intrinsic_function(realmRec, '%Object%', 'create', Object_create, 2); // 19.1.2.2
    intrinsic_function(realmRec, '%Object%', 'defineProperties', Object_defineProperties, 2); // 19.1.2.3
    intrinsic_function(realmRec, '%Object%', 'defineProperty', Object_defineProperty, 3); // 19.1.2.4
    intrinsic_function(realmRec, '%Object%', 'freeze', Object_freeze, 1); // 19.1.2.5
    intrinsic_function(realmRec, '%Object%', 'getOwnPropertyDescriptor', Object_getOwnPropertyDescriptor, 2); // 19.1.2.6
    intrinsic_function(realmRec, '%Object%', 'getOwnPropertyNames', Object_getOwnPropertyNames, 1); // 19.1.2.7
    intrinsic_function(realmRec, '%Object%', 'getOwnPropertySymbols', Object_getOwnPropertySymbols, 1); // 19.1.2.8
    intrinsic_function(realmRec, '%Object%', 'getPrototypeOf', Object_getPrototypeOf, 1); // 19.1.2.9
    intrinsic_function(realmRec, '%Object%', 'is', Object_is, 2); // 19.1.2.10
    intrinsic_function(realmRec, '%Object%', 'isExtensible', Object_isExtensible, 1); // 19.1.2.11
    intrinsic_function(realmRec, '%Object%', 'isFrozen', Object_isFrozen, 1); // 19.1.2.12
    intrinsic_function(realmRec, '%Object%', 'isSealed', Object_isSealed, 1); // 19.1.2.13
    intrinsic_function(realmRec, '%Object%', 'keys', Object_keys, 1); // 19.1.2.14
    intrinsic_function(realmRec, '%Object%', 'preventExtensions', Object_preventExtensions, 1); // 19.1.2.15
    intrinsic_property(realmRec, '%Object%', 'prototype', intrinsics['%ObjectPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.1.2.16
    intrinsic_function(realmRec, '%Object%', 'seal', Object_seal, 1); // 19.1.2.17
    intrinsic_function(realmRec, '%Object%', 'setPrototypeOf', Object_setPrototypeOf, 2); // 19.1.2.18
    define_method_direct(intrinsics['%ObjectPrototype%'], 'SetPrototypeOf', ImmutablePrototypeObject_SetPrototypeOf); // 19.1.3
    intrinsic_property(realmRec, '%ObjectPrototype%', 'constructor', intrinsics['%Object%']); // 19.1.3.1
    intrinsic_function(realmRec, '%ObjectPrototype%', 'hasOwnProperty', Object_prototype_hasOwnProperty, 1); // 19.1.3.2
    intrinsic_function(realmRec, '%ObjectPrototype%', 'isPrototypeOf', Object_prototype_isPrototypeOf, 1); // 19.1.3.3
    intrinsic_function(realmRec, '%ObjectPrototype%', 'propertyIsEnumerable', Object_prototype_propertyIsEnumerable, 1); // 19.1.3.4
    intrinsic_function(realmRec, '%ObjectPrototype%', 'toLocaleString', Object_prototype_toLocaleString, 0); // 19.1.3.5
    intrinsic_function(realmRec, '%ObjectPrototype%', 'toString', Object_prototype_toString, 0); // 19.1.3.6
    intrinsics['%ObjProto_toString%'] = Get(intrinsics['%ObjectPrototype%'], 'toString'); // 19.1.3.6
    intrinsic_function(realmRec, '%ObjectPrototype%', 'valueOf', Object_prototype_valueOf, 1); // 19.1.3.7
    intrinsics['%ObjProto_valueOf%'] = Get(intrinsics['%ObjectPrototype%'], 'valueOf'); // 19.1.3.7

    intrinsics['%Function%'] = intrinsic_constructor(realmRec, 'Function', $Function, 1); // 19.2.1.1
    intrinsic_property(realmRec, '%Function%', 'prototype', intrinsics['%FunctionPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.2.2.2
    intrinsic_property(realmRec, '%FunctionPrototype%', 'length', 0, { attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 19.2.3
    intrinsic_property(realmRec, '%FunctionPrototype%', 'name', '', { attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 19.2.3
    intrinsic_property(realmRec, '%FunctionPrototype%', 'constructor', intrinsics['%Function%']); // 19.2.3.4
    intrinsic_function(realmRec, '%FunctionPrototype%', wellKnownSymbols['@@hasInstance'], Function_prototype_hasInstance, 1, { name: '[Symbol.hasInstance]', attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.2.3.6

    intrinsics['%Boolean%'] = intrinsic_constructor(realmRec, 'Boolean', $Boolean, 1); // 19.3.1.1
    intrinsics['%BooleanPrototype%'] = ObjectCreate(intrinsics['%ObjectPrototype%'], ['BooleanData']); // 19.3.3
    intrinsics['%BooleanPrototype%'].BooleanData = false; // 19.3.3
    intrinsic_property(realmRec, '%Boolean%', 'prototype', intrinsics['%BooleanPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.3.2.1
    intrinsic_property(realmRec, '%BooleanPrototype%', 'constructor', intrinsics['%Boolean%']); // 19.3.3.2
    intrinsic_function(realmRec, '%BooleanPrototype%', 'toString', Boolean_prototype_toString, 0); // 19.3.3.3
    intrinsic_function(realmRec, '%BooleanPrototype%', 'valueOf', Boolean_prototype_valueOf, 0); // 19.3.3.4

    intrinsics['%Symbol%'] = intrinsic_constructor(realmRec, 'Symbol', $Symbol, 1); // 19.4.1.1
    intrinsics['%SymbolPrototype%'] = ObjectCreate(intrinsics['%ObjectPrototype%']); // 19.4.3
    intrinsic_function(realmRec, '%Symbol%', 'for', Symbol_for, 1); // 19.4.2.1
    intrinsic_property(realmRec, '%Symbol%', 'hasInstance', wellKnownSymbols['@@hasInstance'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.2
    intrinsic_property(realmRec, '%Symbol%', 'isConcatSpreadable', wellKnownSymbols['@@isConcatSpreadable'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.3
    intrinsic_property(realmRec, '%Symbol%', 'iterator', wellKnownSymbols['@@iterator'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.4
    intrinsic_function(realmRec, '%Symbol%', 'keyFor', Symbol_keyFor, 1); // 19.4.2.5
    intrinsic_property(realmRec, '%Symbol%', 'match', wellKnownSymbols['@@match'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.6
    intrinsic_property(realmRec, '%Symbol%', 'prototype', intrinsics['%SymbolPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.7
    intrinsic_property(realmRec, '%Symbol%', 'replace', wellKnownSymbols['@@replace'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.8
    intrinsic_property(realmRec, '%Symbol%', 'search', wellKnownSymbols['@@search'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.9
    intrinsic_property(realmRec, '%Symbol%', 'species', wellKnownSymbols['@@species'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.10
    intrinsic_property(realmRec, '%Symbol%', 'split', wellKnownSymbols['@@split'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.11
    intrinsic_property(realmRec, '%Symbol%', 'toPrimitive', wellKnownSymbols['@@toPrimitive'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.12
    intrinsic_property(realmRec, '%Symbol%', 'toStringTag', wellKnownSymbols['@@toStringTag'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.13
    intrinsic_property(realmRec, '%Symbol%', 'unscopables', wellKnownSymbols['@@unscopables'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.4.2.14
    intrinsic_property(realmRec, '%SymbolPrototype%', 'constructor', intrinsics['%Symbol%']); // 19.4.3.1
    intrinsic_function(realmRec, '%SymbolPrototype%', 'toString', Symbol_prototype_toString, 0); // 19.4.3.2
    intrinsic_function(realmRec, '%SymbolPrototype%', 'valueOf', Symbol_prototype_valueOf, 0); // 19.4.3.3
    intrinsic_function(realmRec, '%SymbolPrototype%', wellKnownSymbols['@@toPrimitive'], Symbol_prototype_toPrimitive, 1, { name: '[Symbol.toPrimitive]', attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 19.4.3.4
    intrinsic_property(realmRec, '%SymbolPrototype%', wellKnownSymbols['@@toStringTag'], "Symbol", { attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 19.4.3.4

    intrinsics['%Error%'] = intrinsic_constructor(realmRec, 'Error', $Error, 1); // 19.5.1.1
    intrinsics['%ErrorPrototype%'] = ObjectCreate(intrinsics['%ObjectPrototype%']); // 19.5.3
    intrinsic_property(realmRec, '%Error%', 'prototype', intrinsics['%ErrorPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.5.2.1
    intrinsic_property(realmRec, '%ErrorPrototype%', 'constructor', intrinsics['%Error%']); // 19.5.3.1
    intrinsic_property(realmRec, '%ErrorPrototype%', 'message', ''); // 19.5.3.2
    intrinsic_property(realmRec, '%ErrorPrototype%', 'name', "Error"); // 19.5.3.3
    for (var __NativeError__ of ['EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError']) {
        intrinsics['%' + __NativeError__ + '%'] = intrinsic_constructor(realmRec, __NativeError__, NativeError_constructors[__NativeError__], 1, { proto: intrinsics['%Error%'] }); // 19.5.6.1.1
        intrinsics['%' + __NativeError__ + 'Prototype%'] = ObjectCreate(intrinsics['%ErrorPrototype%']); // 19.5.6.3
        intrinsic_property(realmRec, '%' + __NativeError__ + '%', 'prototype', intrinsics['%' + __NativeError__ + 'Prototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 19.5.6.2.1
        intrinsic_property(realmRec, '%' + __NativeError__ + 'Prototype%', 'constructor', intrinsics['%' + __NativeError__ + '%']); // 19.5.6.3.1
        intrinsic_property(realmRec, '%' + __NativeError__ + 'Prototype%', 'message', ''); // 19.5.6.3.2
        intrinsic_property(realmRec, '%' + __NativeError__ + 'Prototype%', 'name', __NativeError__); // 19.5.6.3.3
    }

    //TODO

    intrinsics['%Array%'] = intrinsic_constructor(realmRec, 'Array', $Array, 1); // 22.1.1
    intrinsics['%ArrayPrototype%'] = ArrayCreate(0, intrinsics['%ObjectPrototype%']); // 22.1.3
    intrinsics['%ArrayIteratorPrototype%'] = ObjectCreate(intrinsics['%IteratorPrototype%']); // 22.1.5.2
    intrinsic_function(realmRec, '%Array%', 'from', Array_from, 1); // 22.1.2.1
    intrinsic_function(realmRec, '%Array%', 'isArray', Array_isArray, 1); // 22.1.2.2
    intrinsic_function(realmRec, '%Array%', 'of', Array_of, 0); // 22.1.2.3
    intrinsic_property(realmRec, '%Array%', 'prototype', intrinsics['%ArrayPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 22.1.2.4
    intrinsic_accessor(realmRec, '%Array%', wellKnownSymbols['@@species'], get_Array_species, undefined, { name: '[Symbol.species]' }); // 22.1.2.5
    intrinsic_function(realmRec, '%ArrayPrototype%', 'concat', Array_prototype_concat, 1); // 22.1.3.1
    intrinsic_property(realmRec, '%ArrayPrototype%', 'constructor', intrinsics['%Array%']); // 22.1.3.2
    intrinsic_function(realmRec, '%ArrayPrototype%', 'copyWithin', Array_prototype_copyWithin, 2); // 22.1.3.3
    intrinsic_function(realmRec, '%ArrayPrototype%', 'entries', Array_prototype_entries, 0); // 22.1.3.4
    intrinsic_function(realmRec, '%ArrayPrototype%', 'every', Array_prototype_every, 1); // 22.1.3.5
    intrinsic_function(realmRec, '%ArrayPrototype%', 'fill', Array_prototype_fill, 1); // 22.1.3.6
    intrinsic_function(realmRec, '%ArrayPrototype%', 'filter', Array_prototype_filter, 1); // 22.1.3.7
    intrinsic_function(realmRec, '%ArrayPrototype%', 'find', Array_prototype_find, 1); // 22.1.3.8
    intrinsic_function(realmRec, '%ArrayPrototype%', 'findIndex', Array_prototype_findIndex, 1); // 22.1.3.9
    intrinsic_function(realmRec, '%ArrayPrototype%', 'forEach', Array_prototype_forEach, 1); // 22.1.3.10
    intrinsic_function(realmRec, '%ArrayPrototype%', 'includes', Array_prototype_includes, 1); // 22.1.3.11
    intrinsic_function(realmRec, '%ArrayPrototype%', 'indexOf', Array_prototype_indexOf, 1); // 22.1.3.12
    intrinsic_function(realmRec, '%ArrayPrototype%', 'join', Array_prototype_join, 1); // 22.1.3.13
    intrinsic_function(realmRec, '%ArrayPrototype%', 'keys', Array_prototype_keys, 0); // 22.1.3.14
    intrinsic_function(realmRec, '%ArrayPrototype%', 'lastIndexOf', Array_prototype_lastIndexOf, 1); // 22.1.3.15
    intrinsic_function(realmRec, '%ArrayPrototype%', 'map', Array_prototype_map, 1); // 22.1.3.16
    intrinsic_function(realmRec, '%ArrayPrototype%', 'pop', Array_prototype_pop, 0); // 22.1.3.17
    intrinsic_function(realmRec, '%ArrayPrototype%', 'push', Array_prototype_push, 1); // 22.1.3.18
    intrinsic_function(realmRec, '%ArrayPrototype%', 'reduce', Array_prototype_reduce, 1); // 22.1.3.19
    intrinsic_function(realmRec, '%ArrayPrototype%', 'reduceRight', Array_prototype_reduceRight, 1); // 22.1.3.20
    intrinsic_function(realmRec, '%ArrayPrototype%', 'reverse', Array_prototype_reverse, 0); // 22.1.3.21
    intrinsic_function(realmRec, '%ArrayPrototype%', 'shift', Array_prototype_shift, 0); // 22.1.3.22
    intrinsic_function(realmRec, '%ArrayPrototype%', 'slice', Array_prototype_slice, 2); // 22.1.3.23
    intrinsic_function(realmRec, '%ArrayPrototype%', 'some', Array_prototype_some, 1); // 22.1.3.24
    intrinsic_function(realmRec, '%ArrayPrototype%', 'sort', Array_prototype_sort, 1); // 22.1.3.25
    intrinsic_function(realmRec, '%ArrayPrototype%', 'splice', Array_prototype_splice, 2); // 22.1.3.26
    intrinsic_function(realmRec, '%ArrayPrototype%', 'toLocaleString', Array_prototype_toLocaleString, 0); // 22.1.3.27
    intrinsic_function(realmRec, '%ArrayPrototype%', 'toString', Array_prototype_toString, 0); // 22.1.3.28
    intrinsic_function(realmRec, '%ArrayPrototype%', 'unshift', Array_prototype_unshift, 1); // 22.1.3.29
    intrinsic_function(realmRec, '%ArrayPrototype%', 'values', Array_prototype_values, 0); // 22.1.3.30
    intrinsics['%ArrayProto_values%'] = Get(intrinsics['%ArrayPrototype%'], 'values'); // 22.1.3.30
    intrinsic_property(realmRec, '%ArrayPrototype%', wellKnownSymbols['@@iterator'], intrinsics['%ArrayProto_values%']); // 22.1.3.31
    intrinsic_property(realmRec, '%ArrayPrototype%', wellKnownSymbols['@@unscopables'], create_Array_prototype_unscopables(), { attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 22.1.3.32
    intrinsic_function(realmRec, '%ArrayIteratorPrototype%', 'next', ArrayIteratorPrototype_next, 0); // 22.1.5.2.1
    intrinsic_property(realmRec, '%ArrayIteratorPrototype%', wellKnownSymbols['@@toStringTag'], "Array Iterator", { attributes: { Writable: false, Enumerable: false, Configurable: true } }); // 22.1.5.2.2

    intrinsics['%TypedArray%'] = intrinsic_constructor(realmRec, 'TypedArray', $TypedArray, 0); // 22.2.1.1
    intrinsics['%TypedArrayPrototype%'] = ObjectCreate(intrinsics['%ObjectPrototype%']); // 22.2.3
    intrinsic_function(realmRec, '%TypedArray%', 'from', TypedArray_from, 1); // 22.2.2.1
    intrinsic_function(realmRec, '%TypedArray%', 'of', TypedArray_of, 0); // 22.2.2.2
    intrinsic_property(realmRec, '%TypedArray%', 'prototype', intrinsics['%TypedArrayPrototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 22.2.2.3
    intrinsic_accessor(realmRec, '%TypedArray%', wellKnownSymbols['@@species'], get_TypedArray_species, undefined, { name: '[Symbol.species]' }); // 22.2.2.4
    intrinsic_accessor(realmRec, '%TypedArrayPrototype%', 'buffer', get_TypedArray_prototype_buffer); // 22.2.3.1
    intrinsic_accessor(realmRec, '%TypedArrayPrototype%', 'byteLength', get_TypedArray_prototype_byteLength); // 22.2.3.2
    intrinsic_accessor(realmRec, '%TypedArrayPrototype%', 'byteOffset', get_TypedArray_prototype_byteOffset); // 22.2.3.3
    intrinsic_property(realmRec, '%TypedArrayPrototype%', 'constructor', intrinsics['%TypedArray%']); // 22.2.3.4
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'copyWithin', TypedArray_prototype_copyWithin, 1); // 22.2.3.5
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'entries', TypedArray_prototype_entries, 0); // 22.2.3.6
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'every', TypedArray_prototype_every, 1); // 22.2.3.7
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'fill', TypedArray_prototype_fill, 1); // 22.2.3.8
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'filter', TypedArray_prototype_filter, 1); // 22.2.3.9
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'find', TypedArray_prototype_find, 1); // 22.2.3.10
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'findIndex', TypedArray_prototype_findIndex, 1); // 22.2.3.11
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'forEach', TypedArray_prototype_forEach, 1); // 22.2.3.12
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'indexOf', TypedArray_prototype_indexOf, 1); // 22.2.3.13
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'includes', TypedArray_prototype_includes, 1); // 22.2.3.14
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'join', TypedArray_prototype_join, 1); // 22.2.3.15
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'keys', TypedArray_prototype_keys, 0); // 22.2.3.16
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'lastIndexOf', TypedArray_prototype_lastIndexOf, 1) // 22.2.3.17
    intrinsic_accessor(realmRec, '%TypedArrayPrototype%', 'length', get_TypedArray_prototype_length); // 22.2.3.18
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'map', TypedArray_prototype_map, 1); // 22.2.3.19
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'reduce', TypedArray_prototype_reduce, 1); // 22.2.3.20
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'reduceRight', TypedArray_prototype_reduceRight, 1); // 22.2.3.21
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'reverse', TypedArray_prototype_reverse, 0); // 22.2.3.22
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'set', TypedArray_prototype_set, 1); // 22.2.3.23
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'slice', TypedArray_prototype_slice, 2); // 22.2.3.24
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'some', TypedArray_prototype_some, 1); // 22.2.3.25
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'sort', TypedArray_prototype_sort, 1); // 22.2.3.26
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'subarray', TypedArray_prototype_subarray, 2); // 22.2.3.27
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'toLocaleString', TypedArray_prototype_toLocaleString, 0); // 22.2.3.28
    intrinsic_property(realmRec, '%TypedArrayPrototype%', 'toString', Get(intrinsics['%ArrayPrototype%'], 'toString')); // 22.2.3.29
    intrinsic_function(realmRec, '%TypedArrayPrototype%', 'values', TypedArray_prototype_values, 0); // 22.2.3.30
    intrinsic_property(realmRec, '%TypedArrayPrototype%', wellKnownSymbols['@@iterator'], Get(intrinsics['%TypedArrayPrototype%'], 'values')); // 22.2.3.31
    intrinsic_accessor(realmRec, '%TypedArrayPrototype%', wellKnownSymbols['@@toStringTag'], get_TypedArray_prototype_toStringTag, undefined, { name: '[Symbol.toStringTag]' }); // 22.2.3.32
    for (var __TypedArray__ in Table50) {
        intrinsics['%' + __TypedArray__ + '%'] = intrinsic_constructor(realmRec, __TypedArray__, TypedArray_constructors[__TypedArray__], 3, { proto: intrinsics['%TypedArray%'] }); // 22.2.5
        intrinsics['%' + __TypedArray__ + 'Prototype%'] = ObjectCreate(intrinsics['%TypedArrayPrototype%']); // 22.2.6
        intrinsic_property(realmRec, '%' + __TypedArray__ + '%', 'BYTES_PER_ELEMENT', Table50[__TypedArray__].ElementSize, { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 22.2.5.1
        intrinsic_property(realmRec, '%' + __TypedArray__ + '%', 'prototype', intrinsics['%' + __TypedArray__ + 'Prototype%'], { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 22.2.5.2
        intrinsic_property(realmRec, '%' + __TypedArray__ + 'Prototype%', 'BYTES_PER_ELEMENT', Table50[__TypedArray__].ElementSize, { attributes: { Writable: false, Enumerable: false, Configurable: false } }); // 22.2.6.1
        intrinsic_property(realmRec, '%' + __TypedArray__ + 'Prototype%', 'constructor', intrinsics['%' + __TypedArray__ + '%']); // 22.2.6.2
    }

    //TODO

    return intrinsics;
}

// 8.2.3
function SetRealmGlobalObject(realmRec, globalObj, thisValue) {
    if (globalObj === undefined) {
        var intrinsics = realmRec.Intrinsics;
        var globalObj = ObjectCreate(intrinsics['%ObjectPrototype%']);
    }
    Assert(Type(globalObj) === 'Object');
    if (thisValue === undefined) var thisValue = globalObj;
    realmRec.GlobalObject = globalObj;
    var newGlobalEnv = NewGlobalEnvironment(globalObj, thisValue);
    realmRec.GlobalEnv = newGlobalEnv;
    return realmRec;
}

// 8.2.4
function SetDefaultGlobalBindings(realmRec) {
    var global = realmRec.GlobalObject;
    DefinePropertyOrThrow(global, 'Infinity', PropertyDescriptor({
        Value: +Infinity,
        Writable: false,
        Enumerable: false,
        Configurable: false
    })); // 18.1.1
    DefinePropertyOrThrow(global, 'NaN', PropertyDescriptor({
        Value: NaN,
        Writable: false,
        Enumerable: false,
        Configurable: false
    })); // 18.1.2
    DefinePropertyOrThrow(global, 'undefined', PropertyDescriptor({
        Value: undefined,
        Writable: false,
        Enumerable: false,
        Configurable: false
    })); // 18.1.3
    for (var name of ['eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'Array', 'ArrayBuffer', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Number', 'Object', 'Proxy', 'Promise', 'RangeError', 'ReferenceError', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'URIError', 'WeakMap', 'WeakSet', 'JSON', 'Math', 'Reflect', ]) {
        DefinePropertyOrThrow(global, name, PropertyDescriptor({
            Value: realmRec.Intrinsics['%' + name + '%'],
            Writable: true,
            Enumerable: false,
            Configurable: true
        }));
    }
    return global;
}

// 8.3
class ExecutionContext {}

const the_execution_context_stack = [];
var the_running_execution_context = undefined;
var active_function_object = undefined;
var currentRealm = undefined;

function push_onto_the_execution_context_stack(ctx) {
    the_execution_context_stack.push(ctx);
    the_running_execution_context = ctx;
    active_function_object = ctx.Function;
    currentRealm = ctx.Realm;
}

function remove_from_the_execution_context_stack(ctx) {
    Assert(the_running_execution_context === ctx);
    the_execution_context_stack.pop();
    var len = the_execution_context_stack.length;
    if (len === 0) {
        the_running_execution_context = undefined;
        active_function_object = undefined;
        currentRealm = undefined;
        return;
    }
    var ctx = the_execution_context_stack[len - 1];
    the_running_execution_context = ctx;
    active_function_object = ctx.Function;
    currentRealm = ctx.Realm;
}

// 8.3.1
function GetActiveScriptOrModule() {
    if (the_execution_context_stack.length === 0) return null;
    for (var i = the_execution_context_stack.length - 1; i >= 0; i--) {
        var ec = the_execution_context_stack[i];
        // clarify the specification
        // if (ec.Function && ec.Function.ScriptOrModule !== null) return ec.Function.ScriptOrModule;
        if (ec.ScriptOrModule !== null) return ec.ScriptOrModule;
    }
    return null;
    // clarify the specification
    // var ec = the_running_execution_context;
    // Assert(ec.ScriptOrModule !== null);
    // return ec.ScriptOrModule;
}

// 8.3.2
function ResolveBinding(name, env, strict) { //MODIFIED: strict argument added
    if (env === undefined) {
        var env = the_running_execution_context.LexicalEnvironment;
    }
    Assert(Type(env) === 'Lexical Environment');
    // moved to the argument.
    // if (the_code_matching_the_syntactic_production_that_is_being_evaluated_is_contained_in_strict_mode_code) var strict = true; else var strict = false;
    return GetIdentifierReference(env, name, strict);
}

// 8.3.3
function GetThisEnvironment() {
    var lex = the_running_execution_context.LexicalEnvironment;
    while (true) {
        var envRec = lex.EnvironmentRecord;
        var exists = envRec.HasThisBinding();
        if (exists === true) return envRec;
        var outer = lex.outer_lexical_environment;
        var lex = outer;
    }
}

// 8.3.4
function ResolveThisBinding() {
    var envRec = GetThisEnvironment();
    return envRec.GetThisBinding();
}

// 8.3.5
function GetNewTarget() {
    var envRec = GetThisEnvironment();
    Assert('NewTarget' in envRec);
    return envRec.NewTarget;
}

// 8.3.6
function GetGlobalObject() {
    var ctx = the_running_execution_context;
    Assert(currentRealm === ctx.Realm);
    return currentRealm.GlobalObject;
}

// 8.4 Jobs and Job Queues

const theJobQueue = {
    ScriptJobs: [],
    PromiseJobs: [],
};

// 8.4.1
function EnqueueJob(queueName, job, _arguments) {
    Assert(Type(queueName) === 'String');
    Assert(job instanceof Function);
    var callerContext = the_running_execution_context;
    var callerRealm = callerContext.Realm;
    var callerScriptOrModule = callerContext.ScriptOrModule;
    var pending = { Job: job, Arguments: _arguments, Realm: callerRealm, ScriptOrModule: callerScriptOrModule, HostDefined: undefined };
    // Perform any implementation or host environment defined processing of pending.
    theJobQueue[queueName].push(pending);
    return empty;
}

// 8.4.2
function NextJob(result) {
    if (result.is_an_abrupt_completion()) HostReportErrors([result.Value]);
    remove_from_the_execution_context_stack(the_running_execution_context);
    Assert(the_execution_context_stack.length === 0);
    if (theJobQueue.PromiseJobs.length > 0) {
        var nextQueue = theJobQueue.PromiseJobs;
    } else if (theJobQueue.ScriptJobs.length > 0) {
        var nextQueue = theJobQueue.ScriptJobs;
    } else {
        return empty;
    }
    var nextPending = nextQueue.shift();
    var newContext = new ExecutionContext;
    newContext.Function = null;
    newContext.Realm = nextPending.Realm;
    newContext.ScriptOrModule = nextPending.ScriptOrModule;
    push_onto_the_execution_context_stack(newContext);
    return nextPending.Job.apply(null, nextPending.Arguments); // we assume underlying TailCall works fine.
}

// 8.5
function InitializeHostDefinedRealm(entries, customize_global_object) { // MODIFIED: callback function added
    var realm = CreateRealm();
    var newContext = new ExecutionContext;
    newContext.Function = null;
    newContext.Realm = realm;
    newContext.ScriptOrModule = null;
    push_onto_the_execution_context_stack(newContext);
    var global = undefined; // implementation defined
    var thisValue = undefined; // implementation defined
    SetRealmGlobalObject(realm, global, thisValue);
    var globalObj = SetDefaultGlobalBindings(realm);
    if (customize_global_object) customize_global_object(realm, globalObj);
    for (var e of entries) {
        var sourceText = e.sourceText;
        var hostDefined = e.hostDefined;
        if (!e.isModule) {
            EnqueueJob("ScriptJobs", ScriptEvaluationJob, [sourceText, hostDefined]);
        } else {
            EnqueueJob("ScriptJobs", TopLevelModuleEvaluationJob, [sourceText, hostDefined]);
        }
    }
    return NextJob(NormalCompletion(undefined));
}

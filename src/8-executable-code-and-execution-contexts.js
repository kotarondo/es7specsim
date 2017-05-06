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
        return envRec.values[N] = V;
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

    /* TODO one by one
    Set fields of intrinsics with the values listed in Table 7 that have not already been handled above. The field names are the names listed in column one of the table. The value of each field === a new object value fully and recursively populated with property values as defined by the specification of each object in clauses 18-26. All object property values are newly created object values. All values that are built-in function objects are created by performing CreateBuiltinFunction(realmRec, <steps>, <prototype>, <slots>) where <steps> === the definition of that function provided by this specification, <prototype> === the specified value of the function's Prototype  internal slot and <slots> === a list of the names, if any, of the function's specified internal slots. The creation of the intrinsics and their properties must be ordered to avoid any dependencies upon objects that have not yet been created;

    Table 7: Well-known Intrinsic Objects
    Intrinsic Name	Global Name	ECMAScript Language Association
    %Array%	Array	The Array constructor (22.1.1)
    %ArrayBuffer%	ArrayBuffer	The ArrayBuffer constructor (24.1.2)
    %ArrayBufferPrototype%	ArrayBuffer.prototype	The initial value of the prototype data property of %ArrayBuffer%.
    %ArrayIteratorPrototype%		The prototype of Array iterator objects (22.1.5)
    %ArrayPrototype%	Array.prototype	The initial value of the prototype data property of %Array% (22.1.3)
    %ArrayProto_values%	Array.prototype.values	The initial value of the values data property of %ArrayPrototype% (22.1.3.30)
    %Boolean%	Boolean	The Boolean constructor (19.3.1)
    %BooleanPrototype%	Boolean.prototype	The initial value of the prototype data property of %Boolean% (19.3.3)
    %DataView%	DataView	The DataView constructor (24.2.2)
    %DataViewPrototype%	DataView.prototype	The initial value of the prototype data property of %DataView%
    %Date%	Date	The Date constructor (20.3.2)
    %DatePrototype%	Date.prototype	The initial value of the prototype data property of %Date%.
    %decodeURI%	decodeURI	The decodeURI function (18.2.6.2)
    %decodeURIComponent%	decodeURIComponent	The decodeURIComponent function (18.2.6.3)
    %encodeURI%	encodeURI	The encodeURI function (18.2.6.4)
    %encodeURIComponent%	encodeURIComponent	The encodeURIComponent function (18.2.6.5)
    %Error%	Error	The Error constructor (19.5.1)
    %ErrorPrototype%	Error.prototype	The initial value of the prototype data property of %Error%
    %eval%	eval	The eval function (18.2.1)
    %EvalError%	EvalError	The EvalError constructor (19.5.5.1)
    %EvalErrorPrototype%	EvalError.prototype	The initial value of the prototype property of %EvalError%
    %Float32Array%	Float32Array	The Float32Array constructor (22.2)
    %Float32ArrayPrototype%	Float32Array.prototype	The initial value of the prototype data property of %Float32Array%.
    %Float64Array%	Float64Array	The Float64Array constructor (22.2)
    %Float64ArrayPrototype%	Float64Array.prototype	The initial value of the prototype data property of %Float64Array%
    %Function%	Function	The Function constructor (19.2.1)
    %FunctionPrototype%	Function.prototype	The initial value of the prototype data property of %Function%
    %Generator%		The initial value of the prototype property of %GeneratorFunction%
    %GeneratorFunction%		The constructor of generator objects (25.2.1)
    %GeneratorPrototype%		The initial value of the prototype property of %Generator%
    %Int8Array%	Int8Array	The Int8Array constructor (22.2)
    %Int8ArrayPrototype%	Int8Array.prototype	The initial value of the prototype data property of %Int8Array%
    %Int16Array%	Int16Array	The Int16Array constructor (22.2)
    %Int16ArrayPrototype%	Int16Array.prototype	The initial value of the prototype data property of %Int16Array%
    %Int32Array%	Int32Array	The Int32Array constructor (22.2)
    %Int32ArrayPrototype%	Int32Array.prototype	The initial value of the prototype data property of %Int32Array%
    %isFinite%	isFinite	The isFinite function (18.2.2)
    %isNaN%	isNaN	The isNaN function (18.2.3)
    %IteratorPrototype%		An object that all standard built-in iterator objects indirectly inherit from
    %JSON%	JSON	The JSON object (24.3)
    %Map%	Map	The Map constructor (23.1.1)
    %MapIteratorPrototype%		The prototype of Map iterator objects (23.1.5)
    %MapPrototype%	Map.prototype	The initial value of the prototype data property of %Map%
    %Math%	Math	The Math object (20.2)
    %Number%	Number	The Number constructor (20.1.1)
    %NumberPrototype%	Number.prototype	The initial value of the prototype property of %Number%
    %Object%	Object	The Object constructor (19.1.1)
    %ObjectPrototype%	Object.prototype	The initial value of the prototype data property of %Object%. (19.1.3)
    %ObjProto_toString%	Object.prototype.toString	The initial value of the toString data property of %ObjectPrototype% (19.1.3.6)
    %ObjProto_valueOf%	Object.prototype.valueOf	The initial value of the valueOf data property of %ObjectPrototype% (19.1.3.7)
    %parseFloat%	parseFloat	The parseFloat function (18.2.4)
    %parseInt%	parseInt	The parseInt function (18.2.5)
    %Promise%	Promise	The Promise constructor (25.4.3)
    %PromisePrototype%	Promise.prototype	The initial value of the prototype data property of %Promise%
    %Proxy%	Proxy	The Proxy constructor (26.2.1)
    %RangeError%	RangeError	The RangeError constructor (19.5.5.2)
    %RangeErrorPrototype%	RangeError.prototype	The initial value of the prototype property of %RangeError%
    %ReferenceError%	ReferenceError	The ReferenceError constructor (19.5.5.3)
    %ReferenceErrorPrototype%	ReferenceError.prototype	The initial value of the prototype property of %ReferenceError%
    %Reflect%	Reflect	The Reflect object (26.1)
    %RegExp%	RegExp	The RegExp constructor (21.2.3)
    %RegExpPrototype%	RegExp.prototype	The initial value of the prototype data property of %RegExp%
    %Set%	Set	The Set constructor (23.2.1)
    %SetIteratorPrototype%		The prototype of Set iterator objects (23.2.5)
    %SetPrototype%	Set.prototype	The initial value of the prototype data property of %Set%
    %String%	String	The String constructor (21.1.1)
    %StringIteratorPrototype%		The prototype of String iterator objects (21.1.5)
    %StringPrototype%	String.prototype	The initial value of the prototype data property of %String%
    %Symbol%	Symbol	The Symbol constructor (19.4.1)
    %SymbolPrototype%	Symbol.prototype	The initial value of the prototype data property of %Symbol%. (19.4.3)
    %SyntaxError%	SyntaxError	The SyntaxError constructor (19.5.5.4)
    %SyntaxErrorPrototype%	SyntaxError.prototype	The initial value of the prototype property of %SyntaxError%
    %ThrowTypeError%		A function object that unconditionally throws a new instance of %TypeError%
    %TypedArray%		The super class of all typed Array constructors (22.2.1)
    %TypedArrayPrototype%		The initial value of the prototype property of %TypedArray%
    %TypeError%	TypeError	The TypeError constructor (19.5.5.5)
    %TypeErrorPrototype%	TypeError.prototype	The initial value of the prototype property of %TypeError%
    %Uint8Array%	Uint8Array	The Uint8Array constructor (22.2)
    %Uint8ArrayPrototype%	Uint8Array.prototype	The initial value of the prototype data property of %Uint8Array%
    %Uint8ClampedArray%	Uint8ClampedArray	The Uint8ClampedArray constructor (22.2)
    %Uint8ClampedArrayPrototype%	Uint8ClampedArray.prototype	The initial value of the prototype data property of %Uint8ClampedArray%
    %Uint16Array%	Uint16Array	The Uint16Array constructor (22.2)
    %Uint16ArrayPrototype%	Uint16Array.prototype	The initial value of the prototype data property of %Uint16Array%
    %Uint32Array%	Uint32Array	The Uint32Array constructor (22.2)
    %Uint32ArrayPrototype%	Uint32Array.prototype	The initial value of the prototype data property of %Uint32Array%
    %URIError%	URIError	The URIError constructor (19.5.5.6)
    %URIErrorPrototype%	URIError.prototype	The initial value of the prototype property of %URIError%
    %WeakMap%	WeakMap	The WeakMap constructor (23.3.1)
    %WeakMapPrototype%	WeakMap.prototype	The initial value of the prototype data property of %WeakMap%
    %WeakSet%	WeakSet	The WeakSet constructor (23.4.1)
    %WeakSetPrototype%	WeakSet.prototype	The initial value of the prototype data property of %WeakSet%
    */
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

    /*TODO list each global properties one by one

    For each property of the Global Object specified in clause 18, do
    var name be the String value of the property name;
    var desc be the fully populated data property descriptor for the property containing the specified attributes for the property. For properties listed in 18.2, 18.3, or 18.4 the value of the Value  attribute === the corresponding intrinsic object from realmRec;
    Perform ? DefinePropertyOrThrow(global, name, desc);
    */
    return global;
}

// 8.3
class ExecutionContext {}

const the_execution_context_stack = [];
var the_running_execution_context = undefined;
var activeFunction = undefined;
var currentRealm = undefined;

function push_onto_the_execution_context_stack(ctx) {
    the_execution_context_stack.push(ctx);
    the_running_execution_context = ctx;
    activeFunction = ctx.Function;
    currentRealm = ctx.Realm;
}

function remove_from_the_execution_context_stack(ctx) {
    Assert(the_running_execution_context === ctx);
    the_execution_context_stack.pop();
    var len = the_execution_context_stack.length;
    if (len === 0) {
        the_running_execution_context = undefined;
        activeFunction = undefined;
        currentRealm = undefined;
        return;
    }
    var ctx = the_execution_context_stack[len - 1];
    the_running_execution_context = ctx;
    activeFunction = ctx.Function;
    currentRealm = ctx.Realm;
}

// 8.3.1
function GetActiveScriptOrModule() {
    if (the_execution_context_stack.length === 0) return null;
    for (var i = the_execution_context_stack.length - 1; i >= 0; i--) {
        var ec = the_execution_context_stack[i];
        if (ec.Function.ScriptOrModule !== null) return ec.Function.ScriptOrModule;
    }
    var ec = the_running_execution_context;
    Assert(ec.ScriptOrModule !== null);
    return ec.ScriptOrModule;
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
    var currentRealm = ctx.Realm;
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
function NextJob(result) { // We assume Tail-Call-Optimization properly works in underlying virtual machine.
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
    return nextPending.Job.apply(null, nextPending.Arguments);
}

// 8.5
function InitializeHostDefinedRealm(entries) {
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
    // Create any implementation defined global object properties on globalObj.
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

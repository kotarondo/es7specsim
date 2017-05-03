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

// 9 Ordinary and Exotic Objects Behaviours

// 9.1 Ordinary Object Internal Methods and Internal Slots

class OrdinaryObject {}

// 9.1.1
OrdinaryObject.prototype.GetPrototypeOf = function() {
    var O = this;
    return OrdinaryGetPrototypeOf(O);
}

// 9.1.1.1
function OrdinaryGetPrototypeOf(O) {
    return O.Prototype;
}

// 9.1.2
OrdinaryObject.prototype.SetPrototypeOf = function(V) {
    var O = this;
    return OrdinarySetPrototypeOf(O, V);
}

// 9.1.2.1
function OrdinarySetPrototypeOf(O, V) {
    Assert(Type(V) === 'Object' || Type(V) === 'Null');
    var extensible = O.Extensible;
    var current = O.Prototype;
    if (SameValue(V, current) === true) return true;
    if (extensible === false) return false;
    var p = V;
    var done = false;
    while (done === false) {
        if (p === null) done = true;
        else if (SameValue(p, O) === true) return false;
        else {
            if (p.GetPrototypeOf !== OrdinaryObject.prototype.GetPrototypeOf) done = true;
            else p = p.Prototype;
        }
    }
    O.Prototype = V;
    return true;
}

// 9.1.3
OrdinaryObject.prototype.IsExtensible = function() {
    var O = this;
    return OrdinaryIsExtensible(O);
}

// 9.1.3.1
function OrdinaryIsExtensible(O) {
    return O.Extensible;
}

// 9.1.4
OrdinaryObject.prototype.PreventExtensions = function() {
    var O = this;
    return OrdinaryPreventExtensions(O);
}

// 9.1.4.1
function OrdinaryPreventExtensions(O) {
    O.Extensible = false;
    return true;
}

// 9.1.5
OrdinaryObject.prototype.GetOwnProperty = function(P) {
    var O = this;
    return OrdinaryGetOwnProperty(O, P);
}

// 9.1.5.1
function OrdinaryGetOwnProperty(O, P) {
    Assert(IsPropertyKey(P) === true);
    if (O.property[P] === undefined) return undefined;
    var D = PropertyDescriptor({});
    var X = O.property[P];
    if ('Value' in X) {
        D.Value = X.Value;
        D.Writable = X.Writable;
    } else {
        D.Get = X.Get;
        D.Set = X.Set;
    }
    D.Enumerable = X.Enumerable;
    D.Configurable = X.Configurable;
    return D;
}

// 9.1.6
OrdinaryObject.prototype.DefineOwnProperty = function(P, Desc) {
    var O = this;
    return OrdinaryDefineOwnProperty(O, P, Desc);
}

// 9.1.6.1
function OrdinaryDefineOwnProperty(O, P, Desc) {
    var current = O.GetOwnProperty(P);
    var extensible = O.Extensible;
    return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
}

// 9.1.6.2
function IsCompatiblePropertyDescriptor(Extensible, Desc, Current) {
    return ValidateAndApplyPropertyDescriptor(undefined, undefined, Extensible, Desc, Current);
}

// 9.1.6.3
function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
    Assert(O === undefined || IsPropertyKey(P) === true);
    if (current === undefined) {
        if (extensible === false) return false;
        Assert(extensible === true);
        if (IsGenericDescriptor(Desc) === true || IsDataDescriptor(Desc) === true) {
            if (O !== undefined) O.property[P] = {
                Value: 'Value' in Desc ? Desc.Value : undefined,
                Writable: 'Writable' in Desc ? Desc.Writable : false,
                Enumerable: 'Enumerable' in Desc ? Desc.Enumerable : false,
                Configurable: 'Configurable' in Desc ? Desc.Configurable : false,
            };
        } else {
            Assert(IsAccessorDescriptor(Desc) === true);
            if (O !== undefined) O.property[P] = {
                Get: 'Get' in Desc ? Desc.Get : undefined,
                Set: 'Set' in Desc ? Desc.Set : undefined,
                Enumerable: 'Enumerable' in Desc ? Desc.Enumerable : false,
                Configurable: 'Configurable' in Desc ? Desc.Configurable : false,
            };
        }
        return true;
    }
    if (!('Value' in Desc) && !('Writable' in Desc) &&
        !('Get' in Desc) && !('Set' in Desc) &&
        !('Enumerable' in Desc) && !('Configurable' in Desc)) return true;
    if ((!('Value' in Desc) || ('Value' in current && SameValue(Desc.Value, current.Value) === true)) &&
        (!('Writable' in Desc) || ('Writable' in current && SameValue(Desc.Writable, current.Writable) === true)) &&
        (!('Get' in Desc) || ('Get' in current && SameValue(Desc.Get, current.Get) === true)) &&
        (!('Set' in Desc) || ('Set' in current && SameValue(Desc.Set, current.Set) === true)) &&
        (!('Enumerable' in Desc) || ('Enumerable' in current && SameValue(Desc.Enumerable, current.Enumerable) === true)) &&
        (!('Configurable' in Desc) || ('Configurable' in current && SameValue(Desc.Configurable, current.Configurable) === true))) return true;
    if (current.Configurable === false) {
        if (Desc.Configurable === true) return false;
        if ('Enumerable' in Desc && current.Enumerable !== Desc.Enumerable) return false;
    }
    if (IsGenericDescriptor(Desc) === true);
    else if (IsDataDescriptor(current) !== IsDataDescriptor(Desc)) {
        if (current.Configurable === false) return false;
        if (IsDataDescriptor(current) === true) {
            if (O !== undefined) {
                var prop = O.property[P];
                O.property[P] = {
                    Get: undefined,
                    Set: undefined,
                    Enumerable: prop.Enumerable,
                    Configurable: prop.Configurable,
                };
            }
        } else {
            if (O !== undefined) {
                var prop = O.property[P];
                O.property[P] = {
                    Value: undefined,
                    Writable: false,
                    Enumerable: prop.Enumerable,
                    Configurable: prop.Configurable,
                };
            }
        }
    } else if (IsDataDescriptor(current) === true && IsDataDescriptor(Desc) === true) {
        if (current.Configurable === false) {
            if (current.Writable === false && Desc.Writable === true) return false;
            if (current.Writable === false) {
                if ('Value' in Desc && SameValue(Desc.Value, current.Value) === false) return false;
            }
        }
    } else {
        Assert(IsAccessorDescriptor(current) === true && IsAccessorDescriptor(Desc) === true);
        if (current.Configurable === false) {
            if ('Set' in Desc && SameValue(Desc.Set, current.Set) === false) return false;
            if ('Get' in Desc && SameValue(Desc.Get, current.Get) === false) return false;
        }
    }
    if (O !== undefined) {
        var prop = O.property[P];
        if ('Value' in Desc) prop.Value = Desc.Value;
        if ('Writable' in Desc) prop.Writable = Desc.Writable;
        if ('Get' in Desc) prop.Get = Desc.Get;
        if ('Set' in Desc) prop.Set = Desc.Set;
        if ('Enumerable' in Desc) prop.Enumerable = Desc.Enumerable;
        if ('Configurable' in Desc) prop.Configurable = Desc.Configurable;
    }
    return true;
}

// 9.1.7
OrdinaryObject.prototype.HasProperty = function(P) {
    var O = this;
    return OrdinaryHasProperty(O, P);
}

// 9.1.7.1
function OrdinaryHasProperty(O, P) {
    Assert(IsPropertyKey(P) === true);
    var hasOwn = O.GetOwnProperty(P);
    if (hasOwn !== undefined) return true;
    var parent = O.GetPrototypeOf();
    if (parent !== null) {
        return parent.HasProperty(P);
    }
    return false;
}

// 9.1.8
OrdinaryObject.prototype.Get = function(P, Receiver) {
    var O = this;
    return OrdinaryGet(O, P, Receiver);
}

// 9.1.8.1
function OrdinaryGet(O, P, Receiver) {
    Assert(IsPropertyKey(P) === true);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) {
        var parent = O.GetPrototypeOf();
        if (parent === null) return undefined;
        return parent.Get(P, Receiver);
    }
    if (IsDataDescriptor(desc) === true) return desc.Value;
    Assert(IsAccessorDescriptor(desc) === true);
    var getter = desc.Get;
    if (getter === undefined) return undefined;
    return Call(getter, Receiver);
}

// 9.1.9
OrdinaryObject.prototype.Set = function(P, V, Receiver) {
    var O = this;
    return OrdinarySet(O, P, V, Receiver);
}

// 9.1.9.1
function OrdinarySet(O, P, V, Receiver) {
    Assert(IsPropertyKey(P) === true);
    var ownDesc = O.GetOwnProperty(P);
    if (ownDesc === undefined) {
        var parent = O.GetPrototypeOf();
        if (parent !== null) {
            return parent.Set(P, V, Receiver);
        } else {
            var ownDesc = PropertyDescriptor({ Value: undefined, Writable: true, Enumerable: true, Configurable: true });
        }
    }
    if (IsDataDescriptor(ownDesc) === true) {
        if (ownDesc.Writable === false) return false;
        if (Type(Receiver) !== 'Object') return false;
        var existingDescriptor = Receiver.GetOwnProperty(P);
        if (existingDescriptor !== undefined) {
            if (IsAccessorDescriptor(existingDescriptor) === true) return false;
            if (existingDescriptor.Writable === false) return false;
            var valueDesc = PropertyDescriptor({ Value: V });
            return Receiver.DefineOwnProperty(P, valueDesc);
        } else {
            return CreateDataProperty(Receiver, P, V);
        }
    }
    Assert(IsAccessorDescriptor(ownDesc) === true);
    var setter = ownDesc.Set;
    if (setter === undefined) return false;
    Call(setter, Receiver, [V]);
    return true;
}

// 9.1.10
OrdinaryObject.prototype.Delete = function(P) {
    var O = this;
    return OrdinaryDelete(O, P);
}

// 9.1.10.1
function OrdinaryDelete(O, P) {
    Assert(IsPropertyKey(P) === true);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) return true;
    if (desc.Configurable === true) {
        delete O.property[P];
        return true;
    }
    return false;
}

// 9.1.11
OrdinaryObject.prototype.OwnPropertyKeys = function() {
    var O = this;
    return OrdinaryOwnPropertyKeys(O);
}

// 9.1.11.1
function OrdinaryOwnPropertyKeys(O) {
    // Here we rely on underlying virtual machine.
    // NOTICE: String&Symbol is in ascending chronological order of property creation
    var keys = Reflect.ownKeys(O.property);
    return keys;
}

// 9.1.12
function ObjectCreate(proto, internalSlotsList) {
    if (internalSlotsList === undefined) var internalSlotsList = [];
    var obj = new OrdinaryObject;
    for (var name of internalSlotsList) {
        obj[name] = undefined;
    }
    obj.Prototype = proto;
    obj.Extensible = true;
    return obj;
}

// 9.1.13
function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto, internalSlotsList) {
    var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
    return ObjectCreate(proto, internalSlotsList);
}

// 9.1.14
function GetPrototypeFromConstructor(constructor, intrinsicDefaultProto) {
    Assert(IsCallable(constructor) === true);
    var proto = Get(constructor, "prototype");
    if (Type(proto) !== 'Object') {
        var realm = GetFunctionRealm(constructor);
        var proto = realm.Intrinsics[intrinsicDefaultProto];
    }
    return proto;
}

// 9.2 ECMAScript Function Objects

class ECMAScriptFunctionObject extends OrdinaryObject {}

// 9.2.1
ECMAScriptFunctionObject.prototype.Call = function(thisArgument, argumentsList) {
    var F = this;
    Assert(F instanceof ECMAScriptFunctionObject);
    if (F.FunctionKind === "classConstructor") throw $TypeError();
    var callerContext = the_running_execution_context;
    var calleeContext = PrepareForOrdinaryCall(F, undefined);
    Assert(calleeContext === the_running_execution_context);
    OrdinaryCallBindThis(F, calleeContext, thisArgument);
    var result = concreteCompletion(OrdinaryCallEvaluateBody(F, argumentsList));
    remove_from_the_execution_context_stack(calleeContext);
    Assert(callerContext === the_running_execution_context);
    if (result.Type === 'return') return result.Value;
    ReturnIfAbrupt(result);
    return undefined;
}

// 9.2.1.1
function PrepareForOrdinaryCall(F, newTarget) {
    Assert(Type(newTarget) === 'Undefined' || Type(newTarget) === 'Object');
    var callerContext = the_running_execution_context;
    var calleeContext = new ExecutionContext;
    calleeContext.Function = F;
    var calleeRealm = F.Realm;
    calleeContext.Realm = calleeRealm;
    calleeContext.ScriptOrModule = F.ScriptOrModule;
    var localEnv = NewFunctionEnvironment(F, newTarget);
    calleeContext.LexicalEnvironment = localEnv;
    calleeContext.VariableEnvironment = localEnv;
    push_onto_the_execution_context_stack(calleeContext);
    Assert(calleeContext === the_running_execution_context);
    return calleeContext;
}

// 9.2.1.2
function OrdinaryCallBindThis(F, calleeContext, thisArgument) {
    var thisMode = F.ThisMode;
    if (thisMode === 'lexical') return;
    var calleeRealm = F.Realm;
    var localEnv = calleeContext.LexicalEnvironment;
    if (thisMode === 'strict') var thisValue = thisArgument;
    else {
        if (thisArgument === null || thisArgument === undefined) {
            var globalEnv = calleeRealm.GlobalEnv;
            var globalEnvRec = globalEnv.EnvironmentRecord;
            var thisValue = globalEnvRec.GlobalThisValue;
        } else {
            var thisValue = ToObject(thisArgument);
        }
    }
    var envRec = localEnv.EnvironmentRecord;
    return envRec.BindThisValue(thisValue);
}

// 9.2.1.3
function OrdinaryCallEvaluateBody(F, argumentsList) {
    FunctionDeclarationInstantiation(F, argumentsList);
    return F.ECMAScriptCode.EvaluateBody(F);
}

// 9.2.2
ECMAScriptFunctionObject.prototype.Construct = function(argumentsList, newTarget) {
    var F = this;
    Assert(F instanceof ECMAScriptFunctionObject);
    Assert(Type(newTarget) === 'Object');
    var callerContext = the_running_execution_context;
    var kind = F.ConstructorKind;
    if (kind === "base") {
        var thisArgument = OrdinaryCreateFromConstructor(newTarget, "%ObjectPrototype%");
    }
    var calleeContext = PrepareForOrdinaryCall(F, newTarget);
    Assert(calleeContext === the_running_execution_context);
    if (kind === "base") OrdinaryCallBindThis(F, calleeContext, thisArgument);
    var constructorEnv = calleeContext.LexicalEnvironment;
    var envRec = constructorEnv.EnvironmentRecord;
    var result = concreteCompletion(OrdinaryCallEvaluateBody(F, argumentsList));
    remove_from_the_execution_context_stack(calleeContext);
    Assert(callerContext === the_running_execution_context);
    if (result.Type === 'return') {
        if (Type(result.Value) === 'Object') return result.Value;
        if (kind === "base") return thisArgument;
        if (result.Value !== undefined) throw $TypeError();
    } else ReturnIfAbrupt(result);
    return envRec.GetThisBinding();
}

// 9.2.3
function FunctionAllocate(functionPrototype, strict, functionKind) {
    Assert(Type(functionPrototype) === 'Object');
    Assert(functionKind === "normal" || functionKind === "non-constructor" || functionKind === "generator");
    if (functionKind === "normal") var needsConstruct = true;
    else var needsConstruct = false;
    if (functionKind === "non-constructor") var functionKind = "normal";
    var F = new ECMAScriptFunctionObject;
    if (needsConstruct !== true) {
        F.Construct = undefined;
    }
    F.ConstructorKind = "base";
    F.Strict = strict;
    F.FunctionKind = functionKind;
    F.Prototype = functionPrototype;
    F.Extensible = true;
    F.Realm = currentRealm;
    return F;
}

// 9.2.4
function FunctionInitialize(F, kind, ParameterList, Body, Scope) {
    var len = ParameterList.ExpectedArgumentCount;
    DefinePropertyOrThrow(F, "length", PropertyDescriptor({ Value: len, Writable: false, Enumerable: false, Configurable: true }));
    var Strict = F.Strict;
    F.Environment = Scope;
    F.FormalParameters = ParameterList;
    F.ECMAScriptCode = Body;
    F.ScriptOrModule = GetActiveScriptOrModule();
    if (kind === 'Arrow') F.ThisMode = 'lexical';
    else if (Strict === true) F.ThisMode = 'strict';
    else F.ThisMode = 'global';
    return F;
}

// 9.2.5
function FunctionCreate(kind, ParameterList, Body, Scope, Strict, prototype) {
    if (prototype === undefined) {
        var prototype = currentRealm.Intrinsics['%FunctionPrototype%'];
    }
    if (kind !== 'Normal') var allocKind = "non-constructor";
    else var allocKind = "normal";
    var F = FunctionAllocate(prototype, Strict, allocKind);
    return FunctionInitialize(F, kind, ParameterList, Body, Scope);
}

// 9.2.6
function GeneratorFunctionCreate(kind, ParameterList, Body, Scope, Strict) {
    var functionPrototype = currentRealm.Intrinsics['%Generator%'];
    var F = FunctionAllocate(functionPrototype, Strict, "generator");
    return FunctionInitialize(F, kind, ParameterList, Body, Scope);
}

// 9.2.7
function AddRestrictedFunctionProperties(F, realm) {
    Assert(realm.Intrinsics['%ThrowTypeError%'] !== undefined);
    var thrower = realm.Intrinsics['%ThrowTypeError%'];
    DefinePropertyOrThrow(F, "caller", PropertyDescriptor({ Get: thrower, Set: thrower, Enumerable: false, Configurable: true }));
    return DefinePropertyOrThrow(F, "arguments", PropertyDescriptor({ Get: thrower, Set: thrower, Enumerable: false, Configurable: true }));
}

// 9.2.7.1
function ThrowTypeError() {
    throw $TypeError();
}

//TODO The value of the Extensible internal slot of a %ThrowTypeError% function === false;
//TODO The length property of a %ThrowTypeError% function has the attributes { Writable: false, Enumerable: false, Configurable: false };

// 9.2.8
function MakeConstructor(F, writablePrototype, prototype) {
    Assert(F instanceof ECMAScriptFunctionObject);
    Assert(F.Construct !== undefined);
    if (writablePrototype === undefined) var writablePrototype = true;
    if (prototype === undefined) {
        var prototype = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
        DefinePropertyOrThrow(prototype, "constructor", PropertyDescriptor({ Value: F, Writable: writablePrototype, Enumerable: false, Configurable: true }));
    }
    DefinePropertyOrThrow(F, "prototype", PropertyDescriptor({ Value: prototype, Writable: writablePrototype, Enumerable: false, Configurable: false }));
}

// 9.2.9
function MakeClassConstructor(F) {
    Assert(F instanceof ECMAScriptFunctionObject);
    Assert(F.FunctionKind === "normal");
    F.FunctionKind = "classConstructor";
}

// 9.2.10
function MakeMethod(F, homeObject) {
    Assert(F instanceof ECMAScriptFunctionObject);
    Assert(Type(homeObject) === 'Object');
    F.HomeObject = homeObject;
}

// 9.2.11
function SetFunctionName(F, name, prefix) {
    Assert(Type(name) === 'Symbol' || Type(name) === 'String');
    Assert(prefix === undefined || Type(prefix) === 'String');
    if (Type(name) === 'Symbol') {
        var description = get_symbol_description(name);
        if (description === undefined) var name = '';
        else var name = "[" + description + "]";
    }
    if (prefix !== undefined) {
        var name = prefix + ' ' + name;
    }
    return DefinePropertyOrThrow(F, "name", PropertyDescriptor({ Value: name, Writable: false, Enumerable: false, Configurable: true }));
}

// 9.2.12
function FunctionDeclarationInstantiation(func, argumentsList) {
    var calleeContext = the_running_execution_context;
    var env = calleeContext.LexicalEnvironment;
    var envRec = env.EnvironmentRecord;
    var code = func.ECMAScriptCode;
    var strict = func.Strict;
    var formals = func.FormalParameters;
    var parameterNames = formals.BoundNames();
    if (parameterNames.contains_any_duplicate_entries()) var hasDuplicates = true;
    else var hasDuplicates = false;
    var simpleParameterList = formals.IsSimpleParameterList();
    var hasParameterExpressions = formals.ContainsExpression();
    var varNames = code.VarDeclaredNames();
    var varDeclarations = code.VarScopedDeclarations();
    var lexicalNames = code.LexicallyDeclaredNames();
    var functionNames = [];
    var functionsToInitialize = [];
    for (var d of varDeclarations.slice().reverse()) {
        if (!(d instanceof VariableDeclaration) || !(d instanceof ForBinding)) {
            Assert(d instanceof FunctionDeclaration || d instanceof GeneratorDeclaration);
            var fn = d.BoundNames()[0];
            if (!fn.is_an_element_of(functionNames)) {
                functionNames.unshift(fn);
                functionsToInitialize.unshift(d);
            }
        }
    }
    var argumentsObjectNeeded = true;
    if (func.ThisMode === 'lexical') {
        var argumentsObjectNeeded = false;
    } else if ("arguments".is_an_element_of(parameterNames)) {
        var argumentsObjectNeeded = false;
    } else if (hasParameterExpressions === false) {
        if ("arguments".is_an_element_of(functionNames) || "arguments".is_an_element_of(lexicalNames)) {
            var argumentsObjectNeeded = false;
        }
    }
    for (var paramName of parameterNames) {
        var alreadyDeclared = envRec.HasBinding(paramName);
        if (alreadyDeclared === false) {
            envRec.CreateMutableBinding(paramName, false);
            if (hasDuplicates === true) {
                envRec.InitializeBinding(paramName, undefined);
            }
        }
    }
    if (argumentsObjectNeeded === true) {
        if (strict === true || simpleParameterList === false) {
            var ao = CreateUnmappedArgumentsObject(argumentsList);
        } else {
            var ao = CreateMappedArgumentsObject(func, formals, argumentsList, envRec);
        }
        if (strict === true) {
            envRec.CreateImmutableBinding("arguments", false);
        } else {
            envRec.CreateMutableBinding("arguments", false);
        }
        envRec.InitializeBinding("arguments", ao);
        parameterNames.push("arguments");
    }
    var iteratorRecord = Record({ Iterator: CreateListIterator(argumentsList), Done: false });
    if (hasDuplicates === true) {
        formals.IteratorBindingInitialization(iteratorRecord, undefined);
    } else {
        formals.IteratorBindingInitialization(iteratorRecord, env);
    }
    if (hasParameterExpressions === false) {
        var instantiatedVarNames = parameterNames.slice();
        for (var n of varNames) {
            if (!n.is_an_element_of(instantiatedVarNames)) {
                instantiatedVarNames.push(n);
                envRec.CreateMutableBinding(n, false);
                envRec.InitializeBinding(n, undefined);
            }
        }
        var varEnv = env;
        var varEnvRec = envRec;
    } else {
        var varEnv = NewDeclarativeEnvironment(env);
        var varEnvRec = varEnv.EnvironmentRecord;
        calleeContext.VariableEnvironment = varEnv;
        var instantiatedVarNames = [];
        for (var n of varNames) {
            if (!n.is_an_element_of(instantiatedVarNames)) {
                instantiatedVarNames.push(n);
                varEnvRec.CreateMutableBinding(n, false);
                if (!n.is_an_element_of(parameterNames) || n.is_an_element_of(functionNames)) var initialValue = undefined;
                else
                    var initialValue = envRec.GetBindingValue(n, false);
                varEnvRec.InitializeBinding(n, initialValue);
            }
        }
    }
    // TODO NOTE: Annex B.3.3.1 adds additional steps at this point.
    if (strict === false) {
        var lexEnv = NewDeclarativeEnvironment(varEnv);
    } else var lexEnv = varEnv;
    var lexEnvRec = lexEnv.EnvironmentRecord;
    calleeContext.LexicalEnvironment = lexEnv;
    var lexDeclarations = code.LexicallyScopedDeclarations();
    for (var d of lexDeclarations) {
        for (var dn of d.BoundNames()) {
            if (d.IsConstantDeclaration() === true) {
                lexEnvRec.CreateImmutableBinding(dn, true);
            } else {
                lexEnvRec.CreateMutableBinding(dn, false);
            }
        }
    }
    for (var f of functionsToInitialize) {
        var fn = f.BoundNames()[0];
        var fo = f.InstantiateFunctionObject(lexEnv);
        varEnvRec.SetMutableBinding(fn, fo, false);
    }
    return empty;
}

// 9.3 Built-in Function Objects

class BuiltinFunctionObject extends OrdinaryObject {}

var NewTarget;

// 9.3.1
BuiltinFunctionObject.prototype.Call = function(thisArgument, argumentsList) {
    var F = this;
    var callerContext = the_running_execution_context;
    var calleeContext = new ExecutionContext;
    calleeContext.Function = F;
    var calleeRealm = F.Realm;
    calleeContext.Realm = calleeRealm;
    calleeContext.ScriptOrModule = F.ScriptOrModule;
    push_onto_the_execution_context_stack(calleeContext);
    Assert(calleeContext === the_running_execution_context);
    try {
        NewTarget = undefined;
        var result = F.steps.apply(thisArgument, argumentsList);
    } finally {
        remove_from_the_execution_context_stack(calleeContext);
        Assert(callerContext === the_running_execution_context);
    }
    return result;
}

// 9.3.2
BuiltinFunctionObject.prototype.Construct = function(argumentsList, newTarget) {
    var F = this;
    var callerContext = the_running_execution_context;
    var calleeContext = new ExecutionContext;
    calleeContext.Function = F;
    var calleeRealm = F.Realm;
    calleeContext.Realm = calleeRealm;
    calleeContext.ScriptOrModule = F.ScriptOrModule;
    push_onto_the_execution_context_stack(calleeContext);
    Assert(calleeContext === the_running_execution_context);
    try {
        NewTarget = newTarget;
        var result = F.steps.apply(null, argumentsList);
    } finally {
        remove_from_the_execution_context_stack(calleeContext);
        Assert(callerContext === the_running_execution_context);
    }
    return result;
}

// 9.3.3
function CreateBuiltinFunction(realm, steps, prototype, internalSlotsList) {
    if (internalSlotsList === undefined) var internalSlotsList = [];
    Assert(Type(realm) === 'Realm Record');
    Assert(steps instanceof Function);
    var func = new BuiltinFunctionObject;
    func.steps = steps;
    for (var name of internalSlotsList) {
        func[name] = undefined;
    }
    func.Realm = realm;
    func.Prototype = prototype;
    func.Extensible = true;
    func.ScriptOrModule = null;
    return func;
}

// 9.4 Built-in Exotic Object Internal Methods and Slots

// 9.4.1 Bound Function Exotic Objects

class BoundFunctionExoticObject extends OrdinaryObject {}

// 9.4.1.1
BoundFunctionExoticObject.prototype.Call = function(thisArgument, argumentsList) {
    var F = this;
    var target = F.BoundTargetFunction;
    var boundThis = F.BoundThis;
    var boundArgs = F.BoundArguments;
    var args = boundArgs.concat(argumentsList);
    return Call(target, boundThis, args);
}

// 9.4.1.2
BoundFunctionExoticObject.prototype.Construct = function(argumentsList, newTarget) {
    var F = this;
    var target = F.BoundTargetFunction;
    Assert(target.Construct);
    var boundArgs = F.BoundArguments;
    var args = boundArgs.concat(argumentsList);
    if (SameValue(F, newTarget) === true) var newTarget = target;
    return Construct(target, args, newTarget);
}

// 9.4.1.3
function BoundFunctionCreate(targetFunction, boundThis, boundArgs) {
    Assert(Type(targetFunction) === 'Object');
    var proto = targetFunction.GetPrototypeOf();
    var obj = new BoundFunctionExoticObject;
    if (!targetFunction.Construct) {
        obj.Construct = undefined;
    }
    obj.Prototype = proto;
    obj.Extensible = true;
    obj.BoundTargetFunction = targetFunction;
    obj.BoundThis = boundThis;
    obj.BoundArguments = boundArgs;
    return obj;
}

// 9.4.2 Array Exotic Objects

class ArrayExoticObject extends OrdinaryObject {}

function is_an_array_index(P) {
    return (ToString(ToUint32(P)) === P && ToUint32(P) !== 0xffffffff);
}

// 9.4.2.1
ArrayExoticObject.prototype.DefineOwnProperty = function(P, Desc) {
    var A = this;
    Assert(IsPropertyKey(P) === true);
    if (P === "length") {
        return ArraySetLength(A, Desc);
    } else if (is_an_array_index(P)) {
        var oldLenDesc = OrdinaryGetOwnProperty(A, "length");
        Assert('Value' in oldLenDesc);
        var oldLen = oldLenDesc.Value;
        var index = ToUint32(P);
        if (index >= oldLen && oldLenDesc.Writable === false) return false;
        var succeeded = OrdinaryDefineOwnProperty(A, P, Desc);
        if (succeeded === false) return false;
        if (index >= oldLen) {
            oldLenDesc.Value = index + 1;
            var succeeded = OrdinaryDefineOwnProperty(A, "length", oldLenDesc);
            Assert(succeeded === true);
        }
        return true;
    }
    return OrdinaryDefineOwnProperty(A, P, Desc);
}

// 9.4.2.2
function ArrayCreate(length, proto) {
    Assert(IsInteger(length) && length >= 0);
    if (length === -0) var length = +0;
    if (length > 0xffffffff) throw $RangeError();
    if (proto === undefined) var proto = currentRealm.Intrinsics['%ArrayPrototype%'];
    var A = new ArrayExoticObject;
    A.Prototype = proto;
    A.Extensible = true;
    OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor({ Value: length, Writable: true, Enumerable: false, Configurable: false }));
    return A;
}

// 9.4.2.3
function ArraySpeciesCreate(originalArray, length) {
    Assert(IsInteger(length) && length >= 0);
    if (length === -0) var length = +0;
    var C = undefined;
    var isArray = IsArray(originalArray);
    if (isArray === true) {
        var C = Get(originalArray, "constructor");
        if (IsConstructor(C) === true) {
            var thisRealm = currentRealm;
            var realmC = GetFunctionRealm(C);
            if (thisRealm !== realmC) {
                if (SameValue(C, realmC.Intrinsics['%Array%']) === true) var C = undefined;
            }
        }
        if (Type(C) === 'Object') {
            var C = Get(C, wellKnownSymbols['@@species']);
            if (C === null) var C = undefined;
        }
    }
    if (C === undefined) return ArrayCreate(length);
    if (IsConstructor(C) === false) throw $TypeError();
    return Construct(C, [length]);
}

// 9.4.2.4
function ArraySetLength(A, Desc) {
    if (!('Value' in Desc)) {
        return OrdinaryDefineOwnProperty(A, "length", Desc);
    }
    var newLenDesc = new PropertyDescriptor(Desc);
    var newLen = ToUint32(Desc.Value);
    var numberLen = ToNumber(Desc.Value);
    if (newLen !== numberLen) throw $RangeError();
    newLenDesc.Value = newLen;
    var oldLenDesc = OrdinaryGetOwnProperty(A, "length");
    Assert('Value' in oldLenDesc);
    var oldLen = oldLenDesc.Value;
    if (newLen >= oldLen) {
        return OrdinaryDefineOwnProperty(A, "length", newLenDesc);
    }
    if (oldLenDesc.Writable === false) return false;
    if (!('Writable' in newLenDesc.Writable) || newLenDesc.Writable === true) var newWritable = true;
    else {
        var newWritable = false;
        newLenDesc.Writable = true;
    }
    var succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
    if (succeeded === false) return false;
    while (newLen < oldLen) {
        oldLen = oldLen - 1;
        var deleteSucceeded = A.Delete(ToString(oldLen));
        if (deleteSucceeded === false) {
            newLenDesc.Value = oldLen + 1;
            if (newWritable === false) newLenDesc.Writable = false;
            var succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
            return false;
        }
    }
    if (newWritable === false) {
        return OrdinaryDefineOwnProperty(A, "length", PropertyDescriptor({ Writable: false }));
    }
    return true;
}

// 9.4.3 String Exotic Objects

class StringExoticObject extends OrdinaryObject {}

// 9.4.3.1
StringExoticObject.prototype.GetOwnProperty = function(P) {
    var S = this;
    Assert(IsPropertyKey(P) === true);
    var desc = OrdinaryGetOwnProperty(S, P);
    if (desc !== undefined) return desc;
    if (Type(P) !== 'String') return undefined;
    var index = CanonicalNumericIndexString(P);
    if (index === undefined) return undefined;
    if (IsInteger(index) === false) return undefined;
    if (is_negative_zero(index)) return undefined;
    var str = S.StringData;
    var len = str.length;
    if (index < 0 || len <= index) return undefined;
    var resultStr = str[index];
    return PropertyDescriptor({ Value: resultStr, Writable: false, Enumerable: true, Configurable: false });
}

// 9.4.3.2
StringExoticObject.prototype.OwnPropertyKeys = function() {
    var O = this;
    var keys = [];
    var str = O.StringData;
    var len = str.length;
    for (var i = 0; i < len; i++) {
        keys.push(ToString(i));
    }
    // Here we rely on underlying virtual machine.
    var otherKeys = Reflect.ownKeys(O.property).filter(function(P) {
        return !keys.includes(P);
    });
    return keys.concat(otherKeys);
}

// 9.4.3.3
function StringCreate(value, prototype) {
    Assert(Type(value) === 'String');
    var S = new StringExoticObject;
    S.StringData = value;
    S.Prototype = prototype;
    S.Extensible = true;
    var length = value.length;
    DefinePropertyOrThrow(S, "length", PropertyDescriptor({ Value: length, Writable: false, Enumerable: false, Configurable: false }));
    return S;
}

// 9.4.4 Arguments Exotic Objects

class ArgumentsExoticObject extends OrdinaryObject {}

// 9.4.4.1
ArgumentsExoticObject.prototype.GetOwnProperty = function(P) {
    var args = this;
    var desc = OrdinaryGetOwnProperty(args, P);
    if (desc === undefined) return desc;
    var map = args.ParameterMap;
    var isMapped = HasOwnProperty(map, P);
    if (isMapped === true) {
        desc.Value = Get(map, P);
    }
    /* If an implementation does not provide a built-in caller property for argument exotic objects then step 7 of this algorithm must be skipped.
    if (IsDataDescriptor(desc) === true && P === "caller" &&
        desc.Value instanceof ECMAScriptFunctionObject && desc.Value.Strict) throw $TypeError();
    */
    return desc;
}

// 9.4.4.2
ArgumentsExoticObject.prototype.DefineOwnProperty = function(P, Desc) {
    var args = this;
    var map = args.ParameterMap;
    var isMapped = HasOwnProperty(map, P);
    var newArgDesc = Desc;
    if (isMapped === true && IsDataDescriptor(Desc) === true) {
        if (!('Value' in Desc) && 'Writable' in Desc && Desc.Writable === false) {
            var newArgDesc = new PropertyDescriptor(Desc);
            newArgDesc.Value = Get(map, P);
        }
    }
    var allowed = OrdinaryDefineOwnProperty(args, P, newArgDesc);
    if (allowed === false) return false;
    if (isMapped === true) {
        if (IsAccessorDescriptor(Desc) === true) {
            map.Delete(P);
        } else {
            if ('Value' in Desc) {
                var setStatus = Set(map, P, Desc.Value, false);
                Assert(setStatus === true);
            }
            if ('Writable' in Desc && Desc.Writable === false) {
                map.Delete(P);
            }
        }
    }
    return true;
}

// 9.4.4.3
ArgumentsExoticObject.prototype.Get = function(P, Receiver) {
    var args = this;
    var map = args.ParameterMap;
    var isMapped = HasOwnProperty(map, P);
    if (isMapped === false) {
        return OrdinaryGet(args, P, Receiver);
    } else {
        return Get(map, P);
    }
}

// 9.4.4.4
ArgumentsExoticObject.prototype.Set = function(P, V, Receiver) {
    var args = this;
    if (SameValue(args, Receiver) === false) {
        var isMapped = false;
    } else {
        var map = args.ParameterMap;
        var isMapped = HasOwnProperty(map, P);
    }
    if (isMapped === true) {
        var setStatus = Set(map, P, V, false);
        Assert(setStatus === true);
    }
    return OrdinarySet(args, P, V, Receiver);
}

// 9.4.4.5
ArgumentsExoticObject.prototype.HasProperty = function(P) {
    var args = this;
    /* If an implementation does not provide a built-in caller property for argument exotic objects then step 2 of this algorithm must be skipped.
    if (P === "caller") {
        var desc = OrdinaryGetOwnProperty(args, P);
        if (IsDataDescriptor(desc) === true) return true;
    }
    */
    return OrdinaryHasProperty(args, P);
}

// 9.4.4.6
ArgumentsExoticObject.prototype.Delete = function(P) {
    var args = this;
    var map = args.ParameterMap;
    var isMapped = HasOwnProperty(map, P);
    var result = OrdinaryDelete(args, P);
    if (result === true && isMapped === true) {
        map.Delete(P);
    }
    return result;
}

// 9.4.4.7
function CreateUnmappedArgumentsObject(argumentsList) {
    var len = argumentsList.length;
    var obj = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%'], ['ParameterMap']);
    obj.ParameterMap = undefined;
    DefinePropertyOrThrow(obj, "length", PropertyDescriptor({ Value: len, Writable: true, Enumerable: false, Configurable: true }));
    var index = 0;
    while (index < len) {
        var val = argumentsList[index];
        CreateDataProperty(obj, ToString(index), val);
        var index = index + 1;
    }
    DefinePropertyOrThrow(obj, wellKnownSymbols['@@iterator'], PropertyDescriptor({ Value: currentRealm.Intrinsics['%ArrayProto_values%'], Writable: true, Enumerable: false, Configurable: true }));
    DefinePropertyOrThrow(obj, "callee", PropertyDescriptor({ Get: currentRealm.Intrinsics['%ThrowTypeError%'], Set: currentRealm.Intrinsics['%ThrowTypeError%'], Enumerable: false, Configurable: false }));
    DefinePropertyOrThrow(obj, "caller", PropertyDescriptor({ Get: currentRealm.Intrinsics['%ThrowTypeError%'], Set: currentRealm.Intrinsics['%ThrowTypeError%'], Enumerable: false, Configurable: false }));
    return obj;
}

// 9.4.4.8
function CreateMappedArgumentsObject(func, formals, argumentsList, env) {
    var len = argumentsList.length;
    var obj = new ArgumentsExoticObject;
    obj.Prototype = currentRealm.Intrinsics['%ObjectPrototype%'];
    obj.Extensible = true;
    var map = ObjectCreate(null);
    obj.ParameterMap = map;
    var parameterNames = formals.BoundNames();
    var numberOfParameters = parameterNames.length;
    var index = 0;
    while (index < len) {
        var val = argumentsList[index];
        CreateDataProperty(obj, ToString(index), val);
        var index = index + 1;
    }
    DefinePropertyOrThrow(obj, "length", PropertyDescriptor({ Value: len, Writable: true, Enumerable: false, Configurable: true }));
    var mappedNames = [];
    var index = numberOfParameters - 1;
    while (index >= 0) {
        var name = parameterNames[index];
        if (!name.is_an_element_of(mappedNames)) {
            mappedNames.push(name);
            if (index < len) {
                var g = MakeArgGetter(name, env);
                var p = MakeArgSetter(name, env);
                map.DefineOwnProperty(ToString(index), PropertyDescriptor({ Set: p, Get: g, Enumerable: false, Configurable: true }));
            }
        }
        var index = index - 1;
    }
    DefinePropertyOrThrow(obj, wellKnwonSymbols['@@iterator'], PropertyDescriptor({ Value: currentRealm.Intrinsics['%ArrayProto_values%'], Writable: true, Enumerable: false, Configurable: true }));
    DefinePropertyOrThrow(obj, "callee", PropertyDescriptor({ Value: func, Writable: true, Enumerable: false, Configurable: true }));
    return obj;
}

// 9.4.4.8.1
function MakeArgGetter(name, env) {
    var realm = currentRealm;
    var steps = function() {
        var f = getter;
        var name = f.Name;
        var env = f.Env;
        return env.GetBindingValue(name, false);
    };
    var getter = CreateBuiltinFunction(realm, steps, currentRealm.Intrinsics['%FunctionPrototype%'], ['Name', 'Env']);
    getter.Name = name;
    getter.Env = env;
    return getter;
}

// 9.4.4.8.2
function MakeArgSetter(name, env) {
    var realm = currentRealm;
    var steps = function() {
        var f = setter;
        var name = f.Name;
        var env = f.Env;
        return env.SetMutableBinding(name, value, false);
    };
    var setter = CreateBuiltinFunction(realm, steps, currentRealm.Intrinsics['%FunctionPrototype%'], ['Name', 'Env']);
    setter.Name = name;
    setter.Env = env;
    return setter;
}

// 9.4.5 Integer Indexed Exotic Objects

class IntegerIndexedExoticObject extends OrdinaryObject {}

// 9.4.5.1
IntegerIndexedExoticObject.prototype.GetOwnProperty = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    Assert('ViewedArrayBuffer' in O);
    if (Type(P) === 'String') {
        var numericIndex = CanonicalNumericIndexString(P);
        if (numericIndex !== undefined) {
            var value = IntegerIndexedElementGet(O, numericIndex);
            if (value === undefined) return undefined;
            return PropertyDescriptor({ Value: value, Writable: true, Enumerable: true, Configurable: false });
        }
    }
    return OrdinaryGetOwnProperty(O, P);
}

// 9.4.5.2
IntegerIndexedExoticObject.prototype.HasProperty = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    Assert('ViewedArrayBuffer' in O);
    if (Type(P) === 'String') {
        var numericIndex = CanonicalNumericIndexString(P);
        if (numericIndex !== undefined) {
            var buffer = O.ViewedArrayBuffer;
            if (IsDetachedBuffer(buffer) === true) throw $TypeError();
            if (IsInteger(numericIndex) === false) return false;
            if (is_negative_zero(numericIndex)) return false;
            if (numericIndex < 0) return false;
            if (numericIndex >= O.ArrayLength) return false;
            return true;
        }
    }
    return OrdinaryHasProperty(O, P);
}

// 9.4.5.3
IntegerIndexedExoticObject.prototype.DefineOwnProperty = function(P, Desc) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    Assert('ViewedArrayBuffer' in O);
    if (Type(P) === 'String') {
        var numericIndex = CanonicalNumericIndexString(P);
        if (numericIndex !== undefined) {
            if (IsInteger(numericIndex) === false) return false;
            var intIndex = numericIndex;
            if (is_negative_zero(intIndex)) return false;
            if (intIndex < 0) return false;
            var length = O.ArrayLength;
            if (intIndex >= length) return false;
            if (IsAccessorDescriptor(Desc) === true) return false;
            if ('Configurable' in Desc && Desc.Configurable === true) return false;
            if ('Enumerable' in Desc && Desc.Enumerable === false) return false;
            if ('Writable' in Desc && Desc.Writable === false) return false;
            if ('Value' in Desc) {
                var value = Desc.Value;
                return IntegerIndexedElementSet(O, intIndex, value);
            }
            return true;
        }
    }
    return OrdinaryDefineOwnProperty(O, P, Desc);
}

// 9.4.5.4
IntegerIndexedExoticObject.prototype.Get = function(P, Receiver) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    if (Type(P) === 'String') {
        var numericIndex = CanonicalNumericIndexString(P);
        if (numericIndex !== undefined) {
            return IntegerIndexedElementGet(O, numericIndex);
        }
    }
    return OrdinaryGet(O, P, Receiver);
}

// 9.4.5.5
IntegerIndexedExoticObject.prototype.Set = function(P, V, Receiver) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    if (Type(P) === 'String') {
        var numericIndex = CanonicalNumericIndexString(P);
        if (numericIndex !== undefined) {
            return IntegerIndexedElementSet(O, numericIndex, V);
        }
    }
    return OrdinarySet(O, P, V, Receiver);
}

// 9.4.5.6
IntegerIndexedExoticObject.prototype.OwnPropertyKeys = function() {
    var O = this;
    var keys = [];
    Assert('ViewedArrayBuffer' in O && 'ArrayLength' in O && 'ByteOffset' in O && 'TypedArrayName' in O);
    var len = O.ArrayLength;
    for (var i = 0; i < len; i++) {
        keys.push(ToString(i));
    }
    // Here we rely on underlying virtual machine.
    var otherKeys = Reflect.ownKeys(O.property).filter(function(P) {
        return !keys.includes(P);
    });
    return keys;
}

// 9.4.5.7
function IntegerIndexedObjectCreate(prototype, internalSlotsList) {
    Assert(internalSlotsList.contains('ViewedArrayBuffer') && internalSlotsList.contains('ArrayLength') && internalSlotsList.contains('ByteOffset') && internalSlotsList.contains('TypedArrayName'));
    var A = new IntegerIndexedExoticObject;
    for (var name of internalSlotsList) {
        A[name] = undefined;
    }
    A.Prototype = prototype;
    A.Extensible = true;
    return A;
}

// 9.4.5.8
function IntegerIndexedElementGet(O, index) {
    Assert(Type(index) === 'Number');
    Assert('ViewedArrayBuffer' in O && 'ArrayLength' in O && 'ByteOffset' in O && 'TypedArrayName' in O);
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    if (IsInteger(index) === false) return undefined;
    if (is_negative_zero(index)) return undefined;
    var length = O.ArrayLength;
    if (index < 0 || index >= length) return undefined;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = Table50[arrayTypeName].ElementSize; //TODO table50
    var indexedPosition = (index * elementSize) + offset;
    var elementType = Table50[arrayTypeName].ElementType; //TODO table50
    return GetValueFromBuffer(buffer, indexedPosition, elementType);
}

// 9.4.5.9
function IntegerIndexedElementSet(O, index, value) {
    Assert(Type(index) === 'Number');
    Assert('ViewedArrayBuffer' in O && 'ArrayLength' in O && 'ByteOffset' in O && 'TypedArrayName' in O);
    var numValue = ToNumber(value);
    var buffer = O.ViewedArrayBuffer;
    if (IsDetachedBuffer(buffer) === true) throw $TypeError();
    if (IsInteger(index) === false) return false;
    if (is_negative_zero(index)) return false;
    var length = O.ArrayLength;
    if (index < 0 || index >= length) return false;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = Table50[arrayTypeName].ElementSize; //TODO table50
    var indexedPosition = (index * elementSize) + offset;
    var elementType = Table50[arrayTypeName].ElementType; //TODO table50
    SetValueInBuffer(buffer, indexedPosition, elementType, numValue);
    return true;
}

// 9.4.6 Module Namespace Exotic Objects

class ModuleNamespaceExoticObject {}

// 9.4.6.1
ModuleNamespaceExoticObject.prototype.GetPrototypeOf = function() {
    var O = this;
    return null;
}

// 9.4.6.2
ModuleNamespaceExoticObject.prototype.SetPrototypeOf = function(V) {
    var O = this;
    Assert(Type(V) === 'Object' || Type(V) === 'Null');
    return false;
}

// 9.4.6.3
ModuleNamespaceExoticObject.prototype.IsExtensible = function() {
    var O = this;
    return false;
}

// 9.4.6.4
ModuleNamespaceExoticObject.prototype.PreventExtensions = function() {
    var O = this;
    return true;
}

// 9.4.6.5
ModuleNamespaceExoticObject.prototype.GetOwnProperty = function(P) {
    var O = this;
    if (Type(P) === 'Symbol') return OrdinaryGetOwnProperty(O, P);
    var exports = O.Exports;
    if (!P.is_an_element_of(exports)) return undefined;
    var value = O.Get(P, O);
    return PropertyDescriptor({ Value: value, Writable: true, Enumerable: true, Configurable: false });
}

// 9.4.6.6
ModuleNamespaceExoticObject.prototype.DefineOwnProperty = function(P, Desc) {
    var O = this;
    return false;
}

// 9.4.6.7
ModuleNamespaceExoticObject.prototype.HasProperty = function(P) {
    var O = this;
    if (Type(P) === 'Symbol') return OrdinaryHasProperty(O, P);
    var exports = O.Exports;
    if (P.is_an_element_of(exports)) return true;
    return false;
}

// 9.4.6.8
ModuleNamespaceExoticObject.prototype.Get = function(P, Receiver) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    if (Type(P) === 'Symbol') {
        return OrdinaryGet(O, P, Receiver);
    }
    var exports = O.Exports;
    if (!P.is_an_element_of(exports)) return undefined;
    var m = O.Module;
    var binding = m.ResolveExport(P, [], []);
    Assert(binding !== null && binding !== "ambiguous");
    var targetModule = binding.Module;
    Assert(targetModule !== undefined);
    var targetEnv = targetModule.Environment;
    if (targetEnv === undefined) throw $ReferenceError();
    var targetEnvRec = targetEnv.EnvironmentRecord;
    return targetEnvRec.GetBindingValue(binding.BindingName, true);
}

// 9.4.6.9
ModuleNamespaceExoticObject.prototype.Set = function(P, V, Receiver) {
    var O = this;
    return false;
}

// 9.4.6.10
ModuleNamespaceExoticObject.prototype.Delete = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var exports = O.Exports;
    if (P.is_an_element_of(exports)) return false;
    return true;
}

// 9.4.6.11
ModuleNamespaceExoticObject.prototype.OwnPropertyKeys = function() {
    var O = this;
    var exports = O.Exports.slice();
    var symbolKeys = OrdinaryOwnPropertyKeys(O);
    exports.append(symbolKeys);
    return exports;
}

// 9.4.6.12
function ModuleNamespaceCreate(module, exports) {
    Assert(Type(module) === 'Module Record');
    Assert(module.Namespace === undefined);
    Assert(exports.every(elem => Type(elem) === 'String'));
    var M = new ModuleNamespaceExoticObject;
    M.Module = module;
    M.Exports = exports;
    //TODO Create own properties of M corresponding to the definitions in 26.3;
    module.Namespace = M;
    return M;
}

// 9.4.7 Immutable Prototype Exotic Objects

class ImmutablePrototypeObject extends OrdinaryObject {}

// 9.4.7.1
ImmutablePrototypeObject.prototype.SetPrototypeOf = function(V) {
    var O = this;
    Assert(Type(V) === 'Object' || Type(V) === 'Null');
    var current = O.Prototype;
    if (SameValue(V, current) === true) return true;
    return false;
}

// 9.5 Proxy Object Internal Methods and Internal Slots

class ProxyExoticObject {}

// 9.5.1
ProxyExoticObject.prototype.GetPrototypeOf = function() {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "getPrototypeOf");
    if (trap === undefined) {
        return target.GetPrototypeOf();
    }
    var handlerProto = Call(trap, handler, [target]);
    if (Type(handlerProto) !== 'Object' && Type(handlerProto) !== 'Null') throw $TypeError();
    var extensibleTarget = IsExtensible(target);
    if (extensibleTarget === true) return handlerProto;
    var targetProto = target.GetPrototypeOf();
    if (SameValue(handlerProto, targetProto) === false) throw $TypeError();
    return handlerProto;
}

// 9.5.2
ProxyExoticObject.prototype.SetPrototypeOf = function(V) {
    var O = this;
    Assert(Type(V) === 'Object' || Type(V) === 'Null');
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "setPrototypeOf");
    if (trap === undefined) {
        return target.SetPrototypeOf(V);
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target, V]));
    if (booleanTrapResult === false) return false;
    var extensibleTarget = IsExtensible(target);
    if (extensibleTarget === true) return true;
    var targetProto = target.GetPrototypeOf();
    if (SameValue(V, targetProto) === false) throw $TypeError();
    return true;
}

// 9.5.3
ProxyExoticObject.prototype.IsExtensible = function() {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "isExtensible");
    if (trap === undefined) {
        return target.IsExtensible();
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target]));
    var targetResult = target.IsExtensible();
    if (SameValue(booleanTrapResult, targetResult) === false) throw $TypeError();
    return booleanTrapResult;
}

// 9.5.4
ProxyExoticObject.prototype.PreventExtensions = function() {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "preventExtensions");
    if (trap === undefined) {
        return target.PreventExtensions();
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target]));
    if (booleanTrapResult === true) {
        var targetIsExtensible = target.IsExtensible();
        if (targetIsExtensible === true) throw $TypeError();
    }
    return booleanTrapResult;
}

// 9.5.5
ProxyExoticObject.prototype.GetOwnProperty = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "getOwnPropertyDescriptor");
    if (trap === undefined) {
        return target.GetOwnProperty(P);
    }
    var trapResultObj = Call(trap, handler, [target, P]);
    if (Type(trapResultObj) !== 'Object' && Type(trapResultObj) !== 'Undefined') throw $TypeError();
    var targetDesc = target.GetOwnProperty(P);
    if (trapResultObj === undefined) {
        if (targetDesc === undefined) return undefined;
        if (targetDesc.Configurable === false) throw $TypeError();
        var extensibleTarget = IsExtensible(target);
        Assert(Type(extensibleTarget) === 'Boolean');
        if (extensibleTarget === false) throw $TypeError();
        return undefined;
    }
    var extensibleTarget = IsExtensible(target);
    var resultDesc = ToPropertyDescriptor(trapResultObj);
    CompletePropertyDescriptor(resultDesc);
    var valid = IsCompatiblePropertyDescriptor(extensibleTarget, resultDesc, targetDesc);
    if (valid === false) throw $TypeError();
    if (resultDesc.Configurable === false) {
        if (targetDesc === undefined || targetDesc.Configurable === true) {
            throw $TypeError();
        }
    }
    return resultDesc;
}

// 9.5.6
ProxyExoticObject.prototype.DefineOwnProperty = function(P, Desc) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "defineProperty");
    if (trap === undefined) {
        return target.DefineOwnProperty(P, Desc);
    }
    var descObj = FromPropertyDescriptor(Desc);
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target, P, descObj]));
    if (booleanTrapResult === false) return false;
    var targetDesc = target.GetOwnProperty(P);
    var extensibleTarget = IsExtensible(target);
    if ('Configurable' in Desc && Desc.Configurable === false) {
        var settingConfigFalse = true;
    } else var settingConfigFalse = false;
    if (targetDesc === undefined) {
        if (extensibleTarget === false) throw $TypeError();
        if (settingConfigFalse === true) throw $TypeError();
    } else {
        if (IsCompatiblePropertyDescriptor(extensibleTarget, Desc, targetDesc) === false) throw $TypeError();
        if (settingConfigFalse === true && targetDesc.Configurable === true) throw $TypeError();
    }
    return true;
}

// 9.5.7
ProxyExoticObject.prototype.HasProperty = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "has");
    if (trap === undefined) {
        return target.HasProperty(P);
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target, P]));
    if (booleanTrapResult === false) {
        var targetDesc = target.GetOwnProperty(P);
        if (targetDesc !== undefined) {
            if (targetDesc.Configurable === false) throw $TypeError();
            var extensibleTarget = IsExtensible(target);
            if (extensibleTarget === false) throw $TypeError();
        }
    }
    return booleanTrapResult;
}

// 9.5.8
ProxyExoticObject.prototype.Get = function(P, Receiver) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "get");
    if (trap === undefined) {
        return target.Get(P, Receiver);
    }
    var trapResult = Call(trap, handler, [target, P, Receiver]);
    var targetDesc = target.GetOwnProperty(P);
    if (targetDesc !== undefined) {
        if (IsDataDescriptor(targetDesc) === true && targetDesc.Configurable === false && targetDesc.Writable === false) {
            if (SameValue(trapResult, targetDesc.Value) === false) throw $TypeError();
        }
        if (IsAccessorDescriptor(targetDesc) === true && targetDesc.Configurable === false && targetDesc.Get === undefined) {
            if (trapResult !== undefined) throw $TypeError();
        }
    }
    return trapResult;
}

// 9.5.9
ProxyExoticObject.prototype.Set = function(P, V, Receiver) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "set");
    if (trap === undefined) {
        return target.Set(P, V, Receiver);
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target, P, V, Receiver]));
    if (booleanTrapResult === false) return false;
    var targetDesc = target.GetOwnProperty(P);
    if (targetDesc !== undefined) {
        if (IsDataDescriptor(targetDesc) === true && targetDesc.Configurable === false && targetDesc.Writable === false) {
            if (SameValue(V, targetDesc.Value) === false) throw $TypeError();
        }
        if (IsAccessorDescriptor(targetDesc) === true && targetDesc.Configurable === false) {
            if (targetDesc.Set === undefined) throw $TypeError();
        }
    }
    return true;
}

// 9.5.10
ProxyExoticObject.prototype.Delete = function(P) {
    var O = this;
    Assert(IsPropertyKey(P) === true);
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "deleteProperty");
    if (trap === undefined) {
        return target.Delete(P);
    }
    var booleanTrapResult = ToBoolean(Call(trap, handler, [target, P]));
    if (booleanTrapResult === false) return false;
    var targetDesc = target.GetOwnProperty(P);
    if (targetDesc === undefined) return true;
    if (targetDesc.Configurable === false) throw $TypeError();
    return true;
}

// 9.5.11
ProxyExoticObject.prototype.OwnPropertyKeys = function() {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "ownKeys");
    if (trap === undefined) {
        return target.OwnPropertyKeys();
    }
    var trapResultArray = Call(trap, handler, [target]);
    var trapResult = CreateListFromArrayLike(trapResultArray, ['String', 'Symbol']);
    var extensibleTarget = IsExtensible(target);
    var targetKeys = target.OwnPropertyKeys();
    Assert(targetKeys.every(elem => Type(elem) === 'String' || Type(elem) === 'Symbol'));
    var targetConfigurableKeys = [];
    var targetNonconfigurableKeys = [];
    for (var key of targetKeys) {
        var desc = target.GetOwnProperty(key);
        if (desc !== undefined && desc.Configurable === false) {
            targetNonconfigurableKeys.push(key);
        } else {
            targetConfigurableKeys.push(key);
        }
    }
    if (extensibleTarget === true && targetNonconfigurableKeys === empty) {
        return trapResult;
    }
    var uncheckedResultKeys = trapResult.slice();
    for (var key of targetNonconfigurableKeys) {
        if (!key.is_an_element_of(uncheckedResultKeys)) throw $TypeError();
        uncheckedResultKeys.remove(key); //TODO clarify whether remove a key || remove every key?
    }
    if (extensibleTarget === true) return trapResult;
    for (var key of targetConfigurableKeys) {
        if (!key.is_an_element_of(uncheckedResultKeys)) throw $TypeError();
        uncheckedResultKeys.remove(key); //TODO clarify whether remove a key || remove every key?
    }
    if (uncheckedResultKeys !== empty) throw $TypeError();
    return trapResult;
}

// 9.5.12
ProxyExoticObject.prototype.Call = function(thisArgument, argumentsList) {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "apply");
    if (trap === undefined) {
        return Call(target, thisArgument, argumentsList);
    }
    var argArray = CreateArrayFromList(argumentsList);
    return Call(trap, handler, [target, thisArgument, argArray]);
}

// 9.5.13
ProxyExoticObject.prototype.Construct = function(argumentsList, newTarget) {
    var O = this;
    var handler = O.ProxyHandler;
    if (handler === null) throw $TypeError();
    Assert(Type(handler) === 'Object');
    var target = O.ProxyTarget;
    var trap = GetMethod(handler, "construct");
    if (trap === undefined) {
        Assert(target.Construct);
        return Construct(target, argumentsList, newTarget);
    }
    var argArray = CreateArrayFromList(argumentsList);
    var newObj = Call(trap, handler, [target, argArray, newTarget]);
    if (Type(newObj) !== 'Object') throw $TypeError();
    return newObj;
}

// 9.5.14
function ProxyCreate(target, handler) {
    if (Type(target) !== 'Object') throw $TypeError();
    if (target instanceof ProxyExoticObject && target.ProxyHandler === null) throw $TypeError();
    if (Type(handler) !== 'Object') throw $TypeError();
    if (handler instanceof ProxyExoticObject && handler.ProxyHandler === null) throw $TypeError();
    var P = new ProxyExoticObject;
    if (IsCallable(target) !== true) {
        P.Call = undefined;
        P.Construct = undefined;
    }
    if (!target.Construct) {
        P.Construct = undefined;
    }
    P.ProxyTarget = target;
    P.ProxyHandler = handler;
    return P;
}

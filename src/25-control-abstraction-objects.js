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

// 25 Control Abstraction Objects

// 25.1 Iteration

// 25.1.1 Common Iteration Interfaces

// 25.1.1.1 The Iterable Interface

// 25.1.1.2 The Iterator Interface

// 25.1.1.3 The IteratorResult Interface

// 25.1.2 The %IteratorPrototype% Object

// 25.1.2.1 %IteratorPrototype% [ @@iterator ] ( )
function IteratorPrototype_iterator() {
    return this;
}

// 25.2 GeneratorFunction Objects

// 25.2.1 The GeneratorFunction Constructor

// 25.2.1.1
function GeneratorFunction$() {
    var C = active_function_object;
    var args = arguments;
    return CreateDynamicFunction(C, NewTarget, "generator", args);
}

// 25.2.2 Properties of the GeneratorFunction Constructor

// 25.2.2.1 GeneratorFunction.length

// 25.2.2.2 GeneratorFunction.prototype

// 25.2.3 Properties of the GeneratorFunction Prototype Object

// 25.2.3.1 GeneratorFunction.prototype.constructor

// 25.2.3.2 GeneratorFunction.prototype.prototype

// 25.2.3.3 GeneratorFunction.prototype [ @@toStringTag ]

// 25.2.4 GeneratorFunction Instances

// 25.2.4.1 length

// 25.2.4.2 name

// 25.2.4.3 prototype

// 25.3 Generator Objects

// 25.3.1 Properties of Generator Prototype

// 25.3.1.1 Generator.prototype.constructor

// 25.3.1.2
function Generator_prototype_next(value) {
    var g = this;
    return GeneratorResume(g, value);
}

// 25.3.1.3
function Generator_prototype_return(value) {
    var g = this;
    var C = Completion({ Type: 'return', Value: value, Target: empty });
    return GeneratorResumeAbrupt(g, C);
}

// 25.3.1.4
function Generator_prototype_throw(exception) {
    var g = this;
    var C = Completion({ Type: 'throw', Value: exception, Target: empty });
    return GeneratorResumeAbrupt(g, C);
}

// 25.3.1.5 Generator.prototype [ @@toStringTag ]

// 25.3.2 Properties of Generator Instances

// 25.3.3 Generator Abstract Operations

// 25.3.3.1
function GeneratorStart(generator, generatorBody) {
    Assert(generator.GeneratorState === undefined);
    var genContext = running_execution_context;
    genContext.Generator = generator;
    genContext.code_evaluation_state = function*() {
        /* TODO compiled code */
        var result = concreteCompletion(generatorBody.EvaluateBody());
        remove_from_execution_context_stack(genContext);
        generator.GeneratorState = "completed";
        if (result.Type === 'normal') var resultValue = undefined;
        else if (result.Type === 'return') var resultValue = result.Value;
        else return result;
        return NormalCompletion(CreateIterResultObject(resultValue, true));
    }();
    generator.GeneratorContext = genContext;
    generator.GeneratorState = "suspendedStart";
    return undefined;
}

// 25.3.3.2
function GeneratorValidate(generator) {
    if (Type(generator) !== 'Object') throw $TypeError();
    if (!('GeneratorState' in generator)) throw $TypeError();
    Assert('GeneratorContext' in generator);
    var state = generator.GeneratorState;
    if (state === "executing") throw $TypeError();
    return state;
}

// 25.3.3.3
function GeneratorResume(generator, value) {
    var state = GeneratorValidate(generator);
    if (state === "completed") return CreateIterResultObject(undefined, true);
    Assert(state === "suspendedStart" || state === "suspendedYield");
    var genContext = generator.GeneratorContext;
    var methodContext = running_execution_context;
    generator.GeneratorState = "executing";
    push_onto_execution_context_stack(genContext);
    Assert(genContext === running_execution_context);
    var result = genContext.code_evaluation_state.next(NormalCompletion(value)).value;
    Assert(methodContext === running_execution_context);
    return resolveCompletion(result);
}

// 25.3.3.4
function GeneratorResumeAbrupt(generator, abruptCompletion) {
    var state = GeneratorValidate(generator);
    if (state === "suspendedStart") {
        generator.GeneratorState = "completed";
        var state = "completed";
    }
    if (state === "completed") {
        if (abruptCompletion.Type === 'return') {
            return CreateIterResultObject(abruptCompletion.Value, true);
        }
        return resolveCompletion(abruptCompletion);
    }
    Assert(state === "suspendedYield");
    var genContext = generator.GeneratorContext;
    var methodContext = running_execution_context;
    generator.GeneratorState = "executing";
    push_onto_execution_context_stack(genContext);
    Assert(genContext === running_execution_context);
    var result = genContext.code_evaluation_state.next(abruptCompletion).value;
    Assert(methodContext === running_execution_context);
    return resolveCompletion(result);
}

// 25.3.3.5
function GeneratorYield(iterNextObj) {
    /* TODO compiled code
    var genContext = running_execution_context;
    var generator = genContext.Generator ;
    generator.GeneratorState= "suspendedYield";
    remove_from_execution_context_stack(genContext);
    var resumptionValue = yield NormalCompletion(iterNextObj);
    Assert(genContext === running_execution_context);
    return resolveCompletion(resumptionValue);
    */
}

// 25.4 Promise Objects

// 25.4.1 Promise Abstract Operations

// 25.4.1.1 PromiseCapability Records

function PromiseCapability(like) {
    if (!this) {
        return new PromiseCapability(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 25.4.1.1.1 IfAbruptRejectPromise ( value, capability )

// 25.4.1.2 PromiseReaction Records

function PromiseReaction(like) {
    if (!this) {
        return new PromiseReaction(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 25.4.1.3
function CreateResolvingFunctions(promise) {
    var alreadyResolved = Record({ Value: false });
    var resolve = CreateBuiltinFunction(currentRealm, promise_resolve, currentRealm.Intrinsics['%FunctionPrototype%'], ['Promise', 'AlreadyResolved']);
    resolve.DefineOwnProperty('length', PropertyDescriptor({ Value: 1, Writable: false, Enumerable: false, Configurable: true }));
    resolve.Promise = promise;
    resolve.AlreadyResolved = alreadyResolved;
    var reject = CreateBuiltinFunction(currentRealm, promise_reject, currentRealm.Intrinsics['%FunctionPrototype%'], ['Promise', 'AlreadyResolved']);
    reject.DefineOwnProperty('length', PropertyDescriptor({ Value: 1, Writable: false, Enumerable: false, Configurable: true }));
    reject.Promise = promise;
    reject.AlreadyResolved = alreadyResolved;
    return Record({ Resolve: resolve, Reject: reject });
}

// 25.4.1.3.1
function promise_reject(reason) {
    var F = active_function_object;
    Assert('Promise' in F && Type(F.Promise) === 'Object');
    var promise = F.Promise;
    var alreadyResolved = F.AlreadyResolved;
    if (alreadyResolved.Value === true) return undefined;
    alreadyResolved.Value = true;
    return RejectPromise(promise, reason);
}

// 25.4.1.3.2
function promise_resolve(resolution) {
    var F = active_function_object;
    Assert('Promise' in F && Type(F.Promise) === 'Object');
    var promise = F.Promise;
    var alreadyResolved = F.AlreadyResolved;
    if (alreadyResolved.Value === true) return undefined;
    alreadyResolved.Value = true;
    if (SameValue(resolution, promise) === true) {
        var selfResolutionError = $TypeError();
        return RejectPromise(promise, selfResolutionError);
    }
    if (Type(resolution) !== 'Object') {
        return FulfillPromise(promise, resolution);
    }
    var then = concreteCompletion(Get(resolution, "then"));
    if (then.is_an_abrupt_completion()) {
        return RejectPromise(promise, then.Value);
    }
    var thenAction = then.Value;
    if (IsCallable(thenAction) === false) {
        return FulfillPromise(promise, resolution);
    }
    EnqueueJob("PromiseJobs", PromiseResolveThenableJob, [promise, resolution, thenAction]);
    return undefined;
}

// 25.4.1.4
function FulfillPromise(promise, value) {
    Assert(promise.PromiseState === "pending");
    var reactions = promise.PromiseFulfillReactions;
    promise.PromiseResult = value;
    promise.PromiseFulfillReactions = undefined;
    promise.PromiseRejectReactions = undefined;
    promise.PromiseState = "fulfilled";
    return TriggerPromiseReactions(reactions, value);
}

// 25.4.1.5
function NewPromiseCapability(C) {
    if (IsConstructor(C) === false) throw $TypeError();
    var promiseCapability = PromiseCapability({ Promise: undefined, Resolve: undefined, Reject: undefined });
    var executor = CreateBuiltinFunction(currentRealm, GetCapabilitiesExecutor, currentRealm.Intrinsics['%FunctionPrototype%'], ['Capability']);
    executor.DefineOwnProperty('length', PropertyDescriptor({ Value: 2, Writable: false, Enumerable: false, Configurable: true }));
    executor.Capability = promiseCapability;
    var promise = Construct(C, [executor]);
    if (IsCallable(promiseCapability.Resolve) === false) throw $TypeError();
    if (IsCallable(promiseCapability.Reject) === false) throw $TypeError();
    promiseCapability.Promise = promise;
    return promiseCapability;
}

// 25.4.1.5.1
function GetCapabilitiesExecutor(resolve, reject) {
    var F = active_function_object;
    Assert('Capability' in F && Type(F.Capability) === 'PromiseCapability');
    var promiseCapability = F.Capability;
    if (promiseCapability.Resolve !== undefined) throw $TypeError();
    if (promiseCapability.Reject !== undefined) throw $TypeError();
    promiseCapability.Resolve = resolve;
    promiseCapability.Reject = reject;
    return undefined;
}

// 25.4.1.6
function IsPromise(x) {
    if (Type(x) !== 'Object') return false;
    if (!('PromiseState' in x)) return false;
    return true;
}

// 25.4.1.7
function RejectPromise(promise, reason) {
    Assert(promise.PromiseState === "pending");
    var reactions = promise.PromiseRejectReactions;
    promise.PromiseResult = reason;
    promise.PromiseFulfillReactions = undefined;
    promise.PromiseRejectReactions = undefined;
    promise.PromiseState = "rejected";
    if (promise.PromiseIsHandled === false) HostPromiseRejectionTracker(promise, "reject");
    return TriggerPromiseReactions(reactions, reason);
}

// 25.4.1.8
function TriggerPromiseReactions(reactions, argument) {
    for (var reaction of reactions) {
        EnqueueJob("PromiseJobs", PromiseReactionJob, [reaction, argument]);
    }
    return undefined;
}

// 25.4.1.9
var HostPromiseRejectionTracker = function(promise, operation) {
    // implementation-defined
};

// 25.4.2 Promise Jobs

// 25.4.2.1
function PromiseReactionJob(reaction, argument) {
    Assert(reaction instanceof PromiseReaction);
    var promiseCapability = reaction.Capabilities;
    var handler = reaction.Handler;
    if (handler === "Identity") {
        var handlerResult = NormalCompletion(argument);
    } else if (handler === "Thrower") {
        var handlerResult = Completion({ Type: 'throw', Value: argument, Target: empty });
    } else {
        var handlerResult = concreteCompletion(Call(handler, undefined, [argument]));
    }
    if (handlerResult.is_an_abrupt_completion()) {
        var status = Call(promiseCapability.Reject, undefined, [handlerResult.Value]);
        return NextJob(status);
    }
    var status = Call(promiseCapability.Resolve, undefined, [handlerResult.Value]);
    return NextJob(status);
}

// 25.4.2.2
function PromiseResolveThenableJob(promiseToResolve, thenable, then) {
    var resolvingFunctions = CreateResolvingFunctions(promiseToResolve);
    var thenCallResult = concreteCompletion(Call(then, thenable, [resolvingFunctions.Resolve, resolvingFunctions.Reject]));
    if (thenCallResult.is_an_abrupt_completion()) {
        var status = concreteCompletion(Call(resolvingFunctions.Reject, undefined, [thenCallResult.Value]));
        return NextJob(status);
    }
    return NextJob(thenCallResult);
}

// 25.4.3 The Promise Constructor

// 25.4.3.1
function Promise$(executor) {
    if (NewTarget === undefined) throw $TypeError();
    if (IsCallable(executor) === false) throw $TypeError();
    var promise = OrdinaryCreateFromConstructor(NewTarget, "%PromisePrototype%", ['PromiseState', 'PromiseResult', 'PromiseFulfillReactions', 'PromiseRejectReactions', 'PromiseIsHandled']);
    promise.PromiseState = "pending";
    promise.PromiseFulfillReactions = [];
    promise.PromiseRejectReactions = [];
    promise.PromiseIsHandled = false;
    var resolvingFunctions = CreateResolvingFunctions(promise);
    var completion = concreteCompletion(Call(executor, undefined, [resolvingFunctions.Resolve, resolvingFunctions.Reject]));
    if (completion.is_an_abrupt_completion()) {
        Call(resolvingFunctions.Reject, undefined, [completion.Value]);
    }
    return promise;
}

// 25.4.4 Properties of the Promise Constructor

// 25.4.4.1
function Promise_all(iterable) {
    var C = this;
    if (Type(C) !== 'Object') throw $TypeError();
    var promiseCapability = NewPromiseCapability(C);
    var iterator = concreteCompletion(GetIterator(iterable));
    IfAbruptRejectPromise(iterator, promiseCapability);
    var iteratorRecord = Record({ Iterator: iterator, Done: false });
    var result = concreteCompletion(PerformPromiseAll(iteratorRecord, C, promiseCapability));
    if (result.is_an_abrupt_completion()) {
        if (iteratorRecord.Done === false) var result = concreteCompletion(IteratorClose(iterator, result));
        IfAbruptRejectPromise(result, promiseCapability);
        return result;
    }
    return resolveCompletion(result);
}

// 25.4.4.1.1
function PerformPromiseAll(iteratorRecord, constructor, resultCapability) {
    var values = [];
    var remainingElementsCount = Record({ Value: 1 });
    var index = 0;
    while (true) {
        var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
        if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
        ReturnIfAbrupt(next);
        if (next === false) {
            iteratorRecord.Done = true;
            remainingElementsCount.Value = remainingElementsCount.Value - 1;
            if (remainingElementsCount.Value === 0) {
                var valuesArray = CreateArrayFromList(values);
                Call(resultCapability.Resolve, undefined, [valuesArray]);
            }
            return resultCapability.Promise;
        }
        var nextValue = concreteCompletion(IteratorValue(next));
        if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
        ReturnIfAbrupt(nextValue);
        values.push(undefined);
        var nextPromise = Invoke(constructor, "resolve", [nextValue]);
        var resolveElement = CreateBuiltinFunction(currentRealm, Promise_all_resolve_element, currentRealm.Intrinsics['%FunctionPrototype%'], ['Index', 'Values', 'Capabilities', 'RemainingElements', 'AlreadyCalled']);
        resolveElement.DefineOwnProperty('length', PropertyDescriptor({ Value: 1, Writable: false, Enumerable: false, Configurable: true }));
        resolveElement.AlreadyCalled = Record({ Value: false });
        resolveElement.Index = index;
        resolveElement.Values = values;
        resolveElement.Capabilities = resultCapability;
        resolveElement.RemainingElements = remainingElementsCount;
        remainingElementsCount.Value = remainingElementsCount.Value + 1;
        Invoke(nextPromise, "then", [resolveElement, resultCapability.Reject]);
        index = index + 1;
    }
}

// 25.4.4.1.2 Promise.all Resolve Element Functions
function Promise_all_resolve_element(x) {
    var F = active_function_object;
    var alreadyCalled = F.AlreadyCalled;
    if (alreadyCalled.Value === true) return undefined;
    alreadyCalled.Value = true;
    var index = F.Index;
    var values = F.Values;
    var promiseCapability = F.Capabilities;
    var remainingElementsCount = F.RemainingElements;
    values[index] = x;
    remainingElementsCount.Value = remainingElementsCount.Value - 1;
    if (remainingElementsCount.Value === 0) {
        var valuesArray = CreateArrayFromList(values);
        return Call(promiseCapability.Resolve, undefined, [valuesArray]);
    }
    return undefined;
}

// 25.4.4.2 Promise.prototype

// 25.4.4.3
function Promise_race(iterable) {
    var C = this;
    if (Type(C) !== 'Object') throw $TypeError();
    var promiseCapability = NewPromiseCapability(C);
    var iterator = concreteCompletion(GetIterator(iterable));
    IfAbruptRejectPromise(iterator, promiseCapability);
    var iteratorRecord = Record({ Iterator: iterator, Done: false });
    var result = concreteCompletion(PerformPromiseRace(iteratorRecord, promiseCapability, C));
    if (result.is_an_abrupt_completion()) {
        if (iteratorRecord.Done === false) var result = concreteCompletion(IteratorClose(iterator, result));
        IfAbruptRejectPromise(result, promiseCapability);
        return result;
    }
    return resolveCompletion(result);
}

// 25.4.4.3.1
function PerformPromiseRace(iteratorRecord, promiseCapability, C) {
    while (true) {
        var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
        if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
        ReturnIfAbrupt(next);
        if (next === false) {
            iteratorRecord.Done = true;
            return promiseCapability.Promise;
        }
        var nextValue = concreteCompletion(IteratorValue(next));
        if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
        ReturnIfAbrupt(nextValue);
        var nextPromise = Invoke(C, "resolve", [nextValue]);
        Invoke(nextPromise, "then", [promiseCapability.Resolve, promiseCapability.Reject]);
    }
}

// 25.4.4.4
function Promise_reject(r) {
    var C = this;
    if (Type(C) !== 'Object') throw $TypeError();
    var promiseCapability = NewPromiseCapability(C);
    Call(promiseCapability.Reject, undefined, [r]);
    return promiseCapability.Promise;
}

// 25.4.4.5
function Promise_resolve(x) {
    var C = this;
    if (Type(C) !== 'Object') throw $TypeError();
    if (IsPromise(x) === true) {
        var xConstructor = Get(x, "constructor");
        if (SameValue(xConstructor, C) === true) return x;
    }
    var promiseCapability = NewPromiseCapability(C);
    Call(promiseCapability.Resolve, undefined, [x]);
    return promiseCapability.Promise;
}

// 25.4.4.6 get Promise [ @@species ]
function get_Promise_species() {
    return this;
}

// 25.4.5 Properties of the Promise Prototype Object

// 25.4.5.1
function Promise_prototype_catch(onRejected) {
    var promise = this;
    return Invoke(promise, "then", [undefined, onRejected]);
}

// 25.4.5.2 Promise.prototype.constructor

// 25.4.5.3
function Promise_prototype_then(onFulfilled, onRejected) {
    var promise = this;
    if (IsPromise(promise) === false) throw $TypeError();
    var C = SpeciesConstructor(promise, currentRealm.Intrinsics['%Promise%']);
    var resultCapability = NewPromiseCapability(C);
    return PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability);
}

// 25.4.5.3.1
function PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability) {
    Assert(IsPromise(promise) === true);
    Assert(resultCapability instanceof PromiseCapability);
    if (IsCallable(onFulfilled) === false) {
        var onFulfilled = "Identity";
    }
    if (IsCallable(onRejected) === false) {
        var onRejected = "Thrower";
    }
    var fulfillReaction = PromiseReaction({ Capabilities: resultCapability, Handler: onFulfilled });
    var rejectReaction = PromiseReaction({ Capabilities: resultCapability, Handler: onRejected });
    if (promise.PromiseState === "pending") {
        promise.PromiseFulfillReactions.push(fulfillReaction);
        promise.PromiseRejectReactions.push(rejectReaction);
    } else if (promise.PromiseState === "fulfilled") {
        var value = promise.PromiseResult;
        EnqueueJob("PromiseJobs", PromiseReactionJob, [fulfillReaction, value]);
    } else {
        Assert(promise.PromiseState === "rejected");
        var reason = promise.PromiseResult;
        if (promise.PromiseIsHandled === false) HostPromiseRejectionTracker(promise, "handle");
        EnqueueJob("PromiseJobs", PromiseReactionJob, [rejectReaction, reason]);
    }
    promise.PromiseIsHandled = true;
    return resultCapability.Promise;
}

// 25.4.5.4 Promise.prototype [ @@toStringTag ]

// 25.4.6 Properties of Promise Instances

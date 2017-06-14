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

class GeneratorCompilerContext {
    constructor() {
        this.maxvar = 0;
        this.literals = [];
        this.codes = [];
    }

    createGenerator() {
        // var g = new GeneratorFunction('literals', this.codes.join('\n'));
        var g = eval('(function*(literals){' + this.codes.join('\n') + '})');
        return g(this.literals);
    }

    literal(value) {
        this.literals.push(value);
        return 'literals[' + (this.literals.length - 1) + ']';
    }

    * allocVars() {
        while (true) {
            yield this.allocVar();
        }
    }
    allocVar() {
        return 'v' + (this.maxvar++);
    }

    code(text) {
        this.codes.push(text);
    }
    _(text) {
        var r = this.allocVar();
        this.code(`var ${r} = ${text};`);
        return r;
    }
    Assert(expr) {
        this.code(`Assert(${expr});`);
    }
    GetValue(ref) {
        return this._(`GetValue(${ref})`);
    }
    Evaluation(nt) {
        return this._(`${this.literal(nt)}.Evaluation()`);
    }
    ResolveBinding(name, env, strict) {
        return this._(`ResolveBinding(${name}, ${env}, ${strict})`);
    }
    InitializeReferencedBinding(V, W) {
        return this._(`InitializeReferencedBinding(${V}, ${W})`);
    }
    GetV(V, P) {
        return this._(`GetV(${V}, ${P})`);
    }
    PutValue(V, W) {
        return this._(`PutValue(${V}, ${W})`);
    }
    CreateDataProperty(O, P, V) {
        return this._(`CreateDataProperty(${O}, ${P}, ${V})`);
    }
    RequireObjectCoercible(argument) {
        return this._(`RequireObjectCoercible(${argument})`);
    }
    ToPropertyKey(argument) {
        return this._(`ToPropertyKey(${argument})`);
    }
    Reference(base, referenced_name, strict_reference_flag) {
        return this._(`Reference(${base}, ${referenced_name}, ${strict_reference_flag})`);
    }
    InitializeBoundName(name, value, environment, strict) {
        return this._(`InitializeBoundName(${name}, ${value}, ${environment}, ${strict})`);
    }
    Construct(F, argumentsList, newTarget) {
        return this._(`Construct(${F}, ${argumentsList}, ${newTarget})`);
    }
    Call(F, V, argumentsList) {
        return this._(`Call(${F}, ${V}, ${argumentsList})`);
    }
    ToObject(argument) {
        return this._(`ToObject(${argument})`);
    }
    ToBoolean(argument) {
        return this._(`ToBoolean(${argument})`);
    }
    ToString(argument) {
        return this._(`ToString(${argument})`);
    }
    GetIterator(obj, method) {
        return this._(`GetIterator(${obj}, ${method})`);
    }
    CreateIterResultObject(value, done) {
        return this._(`CreateIterResultObject(${value}, ${done})`);
    }
}

// 14.1.18
Runtime_Semantics('compileEvaluateBody', [

    'FunctionBody: FunctionStatementList',
    function(ctx) {
        this.FunctionStatementList.compileEvaluation(ctx);
    },
]);

// 14.1.21
Runtime_Semantics('compileEvaluation', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    function(ctx) {},

    'FunctionExpression: function ( FormalParameters ) { FunctionBody }',
    'FunctionExpression: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function(ctx) {
        return ctx.Evaluation(this);
    },

    'FunctionStatementList: [empty]',
    function(ctx) {},
]);

// 14.2.16
Runtime_Semantics('compileEvaluation', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function(ctx) {
        return ctx.Evaluation(this);
    },
]);

// 14.3.8
Runtime_Semantics('compileDefineMethod', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(ctx, object, functionPrototype) {
        throw Error('not yet implemented'); // TODO
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = running_execution_context.LexicalEnvironment;
        if (functionPrototype !== undefined) var kind = 'Normal';
        else var kind = 'Method';
        var closure = FunctionCreate(kind, this.StrictFormalParameters, this.FunctionBody, scope, strict, functionPrototype);
        MakeMethod(closure, object);
        return Record({ Key: propKey, Closure: closure });
    },
]);

// 14.3.9
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var methodDef = this.DefineMethod(object);
        SetFunctionName(methodDef.Closure, methodDef.Key);
        var desc = PropertyDescriptor({ Value: methodDef.Closure, Writable: true, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, methodDef.Key, desc);
    },

    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = running_execution_context.LexicalEnvironment;
        var formalParameterList = Production['FormalParameters: [empty]']([]);
        var closure = FunctionCreate('Method', formalParameterList, this.FunctionBody, scope, strict);
        MakeMethod(closure, object);
        SetFunctionName(closure, propKey, "get");
        var desc = PropertyDescriptor({ Get: closure, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, propKey, desc);
    },

    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = running_execution_context.LexicalEnvironment;
        var closure = FunctionCreate('Method', this.PropertySetParameterList, this.FunctionBody, scope, strict);
        MakeMethod(closure, object);
        SetFunctionName(closure, propKey, "set");
        var desc = PropertyDescriptor({ Set: closure, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, propKey, desc);
    },
]);

// 14.4.13
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var scope = running_execution_context.LexicalEnvironment;
        var closure = GeneratorFunctionCreate('Method', this.StrictFormalParameters, this.GeneratorBody, scope, strict);
        MakeMethod(closure, object);
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        SetFunctionName(closure, propKey);
        var desc = PropertyDescriptor({ Value: closure, Writable: true, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, propKey, desc);
    },
]);

// 14.4.14
Runtime_Semantics('compileEvaluation', [

    'GeneratorExpression: function * ( FormalParameters ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function(ctx) {
        return ctx.Evaluation(this);
    },

    'YieldExpression: yield',
    function(ctx) {
        return compileGeneratorYield(ctx, ctx.CreateIterResultObject(undefined, false));
    },

    'YieldExpression: yield AssignmentExpression',
    function(ctx) {
        var exprRef = this.AssignmentExpression.compileEvaluation(ctx);
        var value = ctx.GetValue(exprRef);
        return compileGeneratorYield(ctx, ctx.CreateIterResultObject(value, false));
    },

    'YieldExpression: yield * AssignmentExpression',
    function(ctx) {
        var exprRef = this.AssignmentExpression.compileEvaluation(ctx);
        var r = ctx.allocVar();
        ctx.code(`
        var value = GetValue(${exprRef});
        var iterator = GetIterator(value);
        var received = NormalCompletion(undefined);
        while (true) {
            if (received.Type === 'normal') {
                var innerResult = IteratorNext(iterator, received.Value);
                var done = IteratorComplete(innerResult);
                if (done === true) {
                    var ${r} = IteratorValue(innerResult);
                    break;
                }
        `);

        var received = compileConcreteCompletion(compileGeneratorYield(ctx, 'innerResult'));
        ctx.code(`var received = ${received};`);
        ctx.code(`
            } else if (received.Type === 'throw') {
                var _throw = GetMethod(iterator, "throw");
                if (_throw !== undefined) {
                    var innerResult = Call(_throw, iterator, [received.Value]);
                    if (Type(innerResult) !== 'Object') throw $TypeError();
                    var done = IteratorComplete(innerResult);
                    if (done === true) {
                        return IteratorValue(innerResult);
                    }
        `);

        var received = compileConcreteCompletion(compileGeneratorYield(ctx, 'innerResult'));
        ctx.code(`var received = ${received};`);
        ctx.code(`
                } else {
                    IteratorClose(iterator, Completion({ Type: 'normal', Value: empty, Target: empty }));
                    throw $TypeError();
                }
            } else {
                Assert(received.Type === 'return');
                var _return = GetMethod(iterator, "return");
                if (_return === undefined) return resolveCompletion(received);
                var innerReturnResult = Call(_return, iterator, [received.Value]);
                if (Type(innerReturnResult) !== 'Object') throw $TypeError();
                var done = IteratorComplete(innerReturnResult);
                if (done === true) {
                    var value = IteratorValue(innerReturnResult);
                    throw Completion({ Type: 'return', Value: value, Target: empty });
                }
        `);

        var received = compileConcreteCompletion(compileGeneratorYield(ctx, 'innerReturnResult'));
        ctx.code(`var received = ${received};`);
        ctx.code(`
            }
        }
        `);
        return r;
    },
]);

// 14.5.14
Runtime_Semantics('compileClassDefinitionEvaluation', [

    'ClassTail: ClassHeritage[opt] { ClassBody[opt] }',
    function(ctx, className) {
        throw Error('not yet implemented'); // TODO
        var lex = running_execution_context.LexicalEnvironment;
        var classScope = NewDeclarativeEnvironment(lex);
        var classScopeEnvRec = classScope.EnvironmentRecord;
        if (className !== undefined) {
            classScopeEnvRec.CreateImmutableBinding(className, true);
        }
        if (!this.ClassHeritage) {
            var protoParent = currentRealm.Intrinsics['%ObjectPrototype%'];
            var constructorParent = currentRealm.Intrinsics['%FunctionPrototype%'];
        } else {
            var currentContext = running_execution_context;
            running_execution_context.LexicalEnvironment = classScope;
            try {
                var superclassRef = this.ClassHeritage.compileEvaluation(ctx);
                var superclass = GetValue(superclassRef); // clarify the specification
            } finally {
                Assert(currentContext === running_execution_context);
                running_execution_context.LexicalEnvironment = lex;
            }
            if (superclass === null) {
                var protoParent = null;
                var constructorParent = currentRealm.Intrinsics['%FunctionPrototype%'];
            } else if (IsConstructor(superclass) === false) throw $TypeError();
            else {
                var protoParent = Get(superclass, "prototype");
                if (Type(protoParent) !== 'Object' && Type(protoParent) !== 'Null') throw $TypeError();
                var constructorParent = superclass;
            }
        }
        var proto = ObjectCreate(protoParent);
        if (!this.ClassBody) var constructor = empty;
        else var constructor = this.ClassBody.ConstructorMethod();
        if (constructor === empty) {
            if (this.ClassHeritage) {
                setParsingText('constructor(... args){ super (...args);}');
                constructor = parseMethodDefinition();
            } else {
                setParsingText('constructor( ){ }');
                constructor = parseMethodDefinition();
            }
        }
        running_execution_context.LexicalEnvironment = classScope;
        var constructorInfo = constructor.DefineMethod(proto, constructorParent);
        var F = constructorInfo.Closure;
        if (this.ClassHeritage) F.ConstructorKind = "derived";
        MakeConstructor(F, false, proto);
        MakeClassConstructor(F);
        CreateMethodProperty(proto, "constructor", F);
        if (!this.ClassBody) var methods = [];
        else var methods = this.ClassBody.NonConstructorMethodDefinitions();
        for (var m of methods) {
            if (m.IsStatic() === false) {
                var status = compileConcreteCompletion(m.PropertyDefinitionEvaluation(proto, false));
            } else {
                var status = compileConcreteCompletion(m.PropertyDefinitionEvaluation(F, false));
            }
            if (status.is_an_abrupt_completion()) {
                running_execution_context.LexicalEnvironment = lex;
                return resolveCompletion(status);
            }
        }
        running_execution_context.LexicalEnvironment = lex;
        if (className !== undefined) {
            classScopeEnvRec.InitializeBinding(className, F);
        }
        return F;
    },
]);

// 14.5.15
Runtime_Semantics('compileBindingClassDeclarationEvaluation', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var className = this.BindingIdentifier.StringValue();
        var value = this.ClassTail.ClassDefinitionEvaluation(className);
        var hasNameProperty = HasOwnProperty(value, "name");
        if (hasNameProperty === false) SetFunctionName(value, className);
        var env = running_execution_context.LexicalEnvironment;
        InitializeBoundName(className, value, env);
        return value;
    },

    'ClassDeclaration: class ClassTail',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.ClassTail.ClassDefinitionEvaluation(undefined);
    },
]);

// 14.5.16
Runtime_Semantics('compileEvaluation', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function(ctx) {
        if (!this.Contains('YieldExpression')) {
            return ctx.Evaluation(this);
        }
        throw Error('not yet implemented'); // TODO
        var status = this.BindingClassDeclarationEvaluation();
        return empty;
    },

    'ClassExpression: class BindingIdentifier[opt] ClassTail',
    function(ctx) {
        if (!this.Contains('YieldExpression')) {
            return ctx.Evaluation(this);
        }
        throw Error('not yet implemented'); // TODO
        if (!this.BindingIdentifier) var className = undefined;
        else var className = this.BindingIdentifier.StringValue();
        var value = this.ClassTail.ClassDefinitionEvaluation(className);
        if (className !== undefined) {
            var hasNameProperty = HasOwnProperty(value, "name");
            if (hasNameProperty === false) {
                SetFunctionName(value, className);
            }
        }
        return value;
    },
]);

// 13.1.7
Runtime_Semantics('compileLabelledEvaluation', [

    'BreakableStatement: IterationStatement',
    function(ctx, labelSet) {
        var stmtResult = compileConcreteCompletion(this.IterationStatement.compileLabelledEvaluation(ctx, labelSet));
        ctx.code(`
        if (${stmtResult}.Type === 'break') {
            if (${stmtResult}.Target === empty) {
                if (${stmtResult}.Value === empty) var ${stmtResult} = NormalCompletion(undefined);
                else var ${stmtResult} = NormalCompletion(${stmtResult}.Value);
            }
        }
        resolveCompletion(${stmtResult});
        `);
    },

    'BreakableStatement: SwitchStatement',
    function(ctx, labelSet) {
        var stmtResult = compileConcreteCompletion(this.SwitchStatement.compileEvaluation(ctx));
        ctx.code(`
        if (${stmtResult}.Type === 'break') {
            if (${stmtResult}.Target === empty) {
                if (${stmtResult}.Value === empty) var ${stmtResult} = NormalCompletion(undefined);
                else var ${stmtResult} = NormalCompletion(${stmtResult}.Value);
            }
        }
        resolveCompletion(${stmtResult});
        `);
    },
]);

// 13.1.8
Runtime_Semantics('compileEvaluation', [

    'HoistableDeclaration: GeneratorDeclaration',
    function(ctx) {},

    'HoistableDeclaration: FunctionDeclaration',
    function(ctx) {
        this.FunctionDeclaration.compileEvaluation(ctx);
    },

    'BreakableStatement: IterationStatement',
    'BreakableStatement: SwitchStatement',
    function(ctx) {
        var newLabelSet = [];
        this.compileLabelledEvaluation(ctx, newLabelSet);
    },
]);

// 13.2.13
Runtime_Semantics('compileEvaluation', [

    'Block: { }',
    function(ctx) {},

    'Block: { StatementList }',
    function(ctx) {
        var [currentContext, oldEnv, blockEnv] = ctx.allocVars();
        ctx.code(`
        var ${currentContext} = running_execution_context;
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${blockEnv} = NewDeclarativeEnvironment(${oldEnv});
        BlockDeclarationInstantiation(${ctx.literal(this.StatementList)}, ${blockEnv});
        running_execution_context.LexicalEnvironment = ${blockEnv};
        `);
        var blockValue = compileConcreteCompletion(this.StatementList.compileEvaluation(ctx));
        ctx.code(`
        Assert(${currentContext} === running_execution_context);
        running_execution_context.LexicalEnvironment = ${oldEnv};
        resolveCompletion(${blockValue});
        `);
    },

    'StatementList: StatementList StatementListItem',
    function(ctx) {
        this.StatementList.compileEvaluation(ctx);
        this.StatementListItem.compileEvaluation(ctx);
    },
]);

// 13.3.1.4
Runtime_Semantics('compileEvaluation', [

    'LexicalDeclaration: LetOrConst BindingList ;',
    function(ctx) {
        this.BindingList.compileEvaluation(ctx);
    },

    'BindingList: BindingList , LexicalBinding',
    function(ctx) {
        this.BindingList.compileEvaluation(ctx);
        this.LexicalBinding.compileEvaluation(ctx);
    },

    'LexicalBinding: BindingIdentifier',
    function(ctx) {
        var lhs = ctx.ResolveBinding(this.BindingIdentifier.StringValue().quote(), undefined, this.strict);
        ctx.InitializeReferencedBinding(lhs, undefined);
    },

    'LexicalBinding: BindingIdentifier Initializer',
    function(ctx) {
        var bindingId = this.BindingIdentifier.StringValue().quote();
        var lhs = ctx.ResolveBinding(bindingId, undefined, this.strict);
        var rhs = this.Initializer.compileEvaluation(ctx);
        var value = ctx.GetValue(rhs);
        if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
            ctx.code(`
            var hasNameProperty = HasOwnProperty(${value}, "name");
            if (hasNameProperty === false) SetFunctionName(${value}, ${bindingId});
            `);
        }
        ctx.InitializeReferencedBinding(lhs, value);
    },

    'LexicalBinding: BindingPattern Initializer',
    function(ctx) {
        var rhs = this.Initializer.compilerEvaluation(ctx);
        var value = ctx.GetValue(rhs);
        var env = ctx._(`running_execution_context.LexicalEnvironment`);
        this.BindingPattern.compileBindingInitialization(ctx, value, env);
    },
]);

// 13.3.2.4
Runtime_Semantics('compileEvaluation', [

    'VariableStatement: var VariableDeclarationList ;',
    function(ctx) {
        this.VariableDeclarationList.compileEvaluation(ctx);
    },

    'VariableDeclarationList: VariableDeclarationList , VariableDeclaration',
    function(ctx) {
        this.VariableDeclarationList.compileEvaluation(ctx);
        this.VariableDeclaration.compileEvaluation(ctx);
    },

    'VariableDeclaration: BindingIdentifier',
    function(ctx) {},

    'VariableDeclaration: BindingIdentifier Initializer',
    function(ctx) {
        var bindingId = this.BindingIdentifier.StringValue().quote();
        var lhs = ctx.ResolveBinding(bindingId, undefined, this.strict);
        var rhs = this.Initializer.compileEvaluation(ctx);
        var value = ctx.GetValue(rhs);
        if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
            ctx.code(`
            var hasNameProperty = HasOwnProperty(${value}, "name");
            if (hasNameProperty === false) SetFunctionName(${value}, ${bindingId});
            `);
        }
        ctx.PutValue(lhs, value);
    },

    'VariableDeclaration: BindingPattern Initializer',
    function(ctx) {
        var rhs = this.Initializer.compileEvaluation(ctx);
        var rval = ctx.GetValue(rhs);
        this.BindingPattern.compileBindingInitialization(ctx, rval, undefined);
    },
]);

// 13.3.3.5
Runtime_Semantics('compileBindingInitialization', [

    'BindingPattern: ObjectBindingPattern',
    function(ctx, value, environment) {
        if (!this.Contains('YieldExpression')) { //TODO
            ctx.code(`
            ${ctx.literal(this)}.BindingInitialization(${value}, ${environment});
            `);
            return;
        }
        ctx.RequireObjectCoercible(value);
        this.ObjectBindingPattern.compileBindingInitialization(ctx, value, environment);
    },

    'BindingPattern: ArrayBindingPattern',
    function(ctx, value, environment) {
        if (!this.Contains('YieldExpression')) { //TODO
            ctx.code(`
            ${ctx.literal(this)}.BindingInitialization(${value}, ${environment});
            `);
            return;
        }
        throw Error('not yet implemented'); // TODO
        var iterator = ctx.GetIterator(value);
        var iteratorRecord = ctx._(`Record({ Iterator: ${iterator}, Done: false })`);
        var result = compileConcreteCompletion(this.ArrayBindingPattern.IteratorBindingInitialization(iteratorRecord, environment));
        if (iteratorRecord.Done === false) return IteratorClose(iterator, result);
        return resolveCompletion(result);
    },

    'ObjectBindingPattern: { }',
    function(ctx, value, environment) {},

    'BindingPropertyList: BindingPropertyList , BindingProperty',
    function(ctx, value, environment) {
        throw Error('not yet implemented'); // TODO
        var status = this.BindingPropertyList.BindingInitialization(value, environment);
        return this.BindingProperty.BindingInitialization(value, environment);
    },

    'BindingProperty: SingleNameBinding',
    function(ctx, value, environment) {
        throw Error('not yet implemented'); // TODO
        var name = this.SingleNameBinding.BoundNames()[0];
        return this.SingleNameBinding.KeyedBindingInitialization(value, environment, name);
    },

    'BindingProperty: PropertyName : BindingElement',
    function(ctx, value, environment) {
        throw Error('not yet implemented'); // TODO
        var P = this.PropertyName.compileEvaluation(ctx);
        return this.BindingElement.KeyedBindingInitialization(value, environment, P);
    },
]);

// 13.3.3.6
Runtime_Semantics('compileIteratorBindingInitialization', [

    'ArrayBindingPattern: [ ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return empty;
    },

    'ArrayBindingPattern: [ Elision ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'ArrayBindingPattern: [ Elision[opt] BindingRestElement ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        if (this.Elision) {
            var status = this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        }
        return this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement ]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        if (this.Elision) {
            var status = this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        }
        return this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElementList: BindingElisionElement',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.BindingElisionElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElementList: BindingElementList , BindingElisionElement',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.BindingElisionElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElisionElement: BindingElement',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElisionElement: Elision BindingElement',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var status = this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        return this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElement: SingleNameBinding',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        return this.SingleNameBinding.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId, environment, this.strict);
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var v = concreteCompletion(IteratorValue(next));
                if (v.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(v);
            }
        }
        if (iteratorRecord.Done === true) var v = undefined;
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = GetValue(defaultValue);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                var hasNameProperty = HasOwnProperty(v, "name");
                if (hasNameProperty === false) SetFunctionName(v, bindingId);
            }
        }
        if (environment === undefined) return PutValue(lhs, v);
        return InitializeReferencedBinding(lhs, v);
    },

    'BindingElement: BindingPattern Initializer[opt]',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var v = concreteCompletion(IteratorValue(next));
                if (v.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(v);
            }
        }
        if (iteratorRecord.Done === true) var v = undefined;
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = GetValue(defaultValue);
        }
        return this.BindingPattern.BindingInitialization(v, environment);
    },

    'BindingRestElement: ... BindingIdentifier',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var lhs = ResolveBinding(this.BindingIdentifier.StringValue(), environment, this.strict);
        var A = ArrayCreate(0);
        var n = 0;
        while (true) {
            if (iteratorRecord.Done === false) {
                var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
                if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(next);
                if (next === false) iteratorRecord.Done = true;
            }
            if (iteratorRecord.Done === true) {
                if (environment === undefined) return PutValue(lhs, A);
                return InitializeReferencedBinding(lhs, A);
            }
            var nextValue = concreteCompletion(IteratorValue(next));
            if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(nextValue);
            var status = ctx.CreateDataProperty(A, ToString(n).quote(), nextValue);
            Assert(status === true);
            n++;
        }
    },

    'BindingRestElement: ... BindingPattern',
    function(ctx, iteratorRecord, environment) {
        throw Error('not yet implemented'); // TODO
        var A = ArrayCreate(0);
        var n = 0;
        while (true) {
            if (iteratorRecord.Done === false) {
                var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
                if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(next);
                if (next === false) iteratorRecord.Done = true;
            }
            if (iteratorRecord.Done === true) {
                return this.BindingPattern.BindingInitialization(A, environment);
            }
            var nextValue = concreteCompletion(IteratorValue(next));
            if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(nextValue);
            var status = ctx.CreateDataProperty(A, ToString(n).quote(), nextValue);
            Assert(status === true);
            n++;
        }
    },
]);

// 13.3.3.7
Runtime_Semantics('compileKeyedBindingInitialization', [

    'BindingElement: BindingPattern Initializer[opt]',
    function(ctx, value, environment, propertyName) {
        throw Error('not yet implemented'); // TODO
        var v = GetV(value, propertyName);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = GetValue(defaultValue);
        }
        return this.BindingPattern.BindingInitialization(v, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(ctx, value, environment, propertyName) {
        throw Error('not yet implemented'); // TODO
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId, environment, this.strict);
        var v = GetV(value, propertyName);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = GetValue(defaultValue);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                var hasNameProperty = HasOwnProperty(v, "name");
                if (hasNameProperty === false) SetFunctionName(v, bindingId);
            }
        }
        if (environment === undefined) return PutValue(lhs, v);
        return InitializeReferencedBinding(lhs, v);
    },
]);

// 13.4.1
Runtime_Semantics('compileEvaluation', [

    'EmptyStatement: ;',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return empty;
    },
]);

// 13.5.1
Runtime_Semantics('compileEvaluation', [

    'ExpressionStatement: Expression ;',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        return ctx.GetValue(exprRef);
    },
]);

// 13.6.7
Runtime_Semantics('compileEvaluation', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ToBoolean(GetValue(exprRef));
        if (exprValue === true) {
            var stmtCompletion = compileConcreteCompletion(this.Statement1.compileEvaluation(ctx));
        } else {
            var stmtCompletion = compileConcreteCompletion(this.Statement2.compileEvaluation(ctx));
        }
        return resolveCompletion(UpdateEmpty(stmtCompletion, undefined));
    },

    'IfStatement: if ( Expression ) Statement',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ToBoolean(GetValue(exprRef));
        if (exprValue === false) {
            return undefined;
        } else {
            var stmtCompletion = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
            return resolveCompletion(UpdateEmpty(stmtCompletion, undefined));
        }
    },
]);

// 13.7.2.6
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var V = undefined;
        while (true) {
            var stmt = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
            if (LoopContinues(stmt, labelSet) === false) return resolveCompletion(UpdateEmpty(stmt, V));
            if (stmt.Value !== empty) var V = stmt.Value;
            var exprRef = this.Expression.compileEvaluation(ctx);
            var exprValue = GetValue(exprRef);
            if (ToBoolean(exprValue) === false) return V;
        }
    },
]);

// 13.7.3.6
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: while ( Expression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var V = undefined;
        while (true) {
            var exprRef = this.Expression.compileEvaluation(ctx);
            var exprValue = GetValue(exprRef);
            if (ToBoolean(exprValue) === false) return V;
            var stmt = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
            if (LoopContinues(stmt, labelSet) === false) return resolveCompletion(UpdateEmpty(stmt, V));
            if (stmt.Value !== empty) var V = stmt.Value;
        }
    },
]);

// 13.7.4.7
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        if (this.Expression1) {
            var exprRef = this.Expression1.compileEvaluation(ctx);
            GetValue(exprRef);
        }
        return ForBodyEvaluation(this.Expression2, this.Expression3, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var varDcl = this.VariableDeclarationList.compileEvaluation(ctx);
        return ForBodyEvaluation(this.Expression1, this.Expression2, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var oldEnv = running_execution_context.LexicalEnvironment;
        var loopEnv = NewDeclarativeEnvironment(oldEnv);
        var loopEnvRec = loopEnv.EnvironmentRecord;
        var isConst = this.LexicalDeclaration.IsConstantDeclaration();
        var boundNames = this.LexicalDeclaration.BoundNames();
        for (var dn of boundNames) {
            if (isConst === true) {
                loopEnvRec.CreateImmutableBinding(dn, true);
            } else {
                loopEnvRec.CreateMutableBinding(dn, false);
            }
        }
        running_execution_context.LexicalEnvironment = loopEnv;
        var forDcl = compileConcreteCompletion(this.LexicalDeclaration.compileEvaluation(ctx));
        if (forDcl.is_an_abrupt_completion()) {
            running_execution_context.LexicalEnvironment = oldEnv;
            return resolveCompletion(forDcl);
        }
        if (isConst === false) var perIterationLets = boundNames;
        else var perIterationLets = [];
        var bodyResult = compileConcreteCompletion(ForBodyEvaluation(this.Expression1, this.Expression2, this.Statement, perIterationLets, labelSet));
        running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(bodyResult);
    },
]);

// 13.7.4.8
function compileForBodyEvaluation(ctx, test, increment, stmt, perIterationBindings, labelSet) {
    throw Error('not yet implemented'); // TODO
    var V = undefined;
    CreatePerIterationEnvironment(perIterationBindings);
    while (true) {
        if (test) {
            var testRef = test.compileEvaluation(ctx);
            var testValue = GetValue(testRef);
            if (ToBoolean(testValue) === false) return V;
        }
        var result = compileConcreteCompletion(stmt.compileEvaluation(ctx));
        if (LoopContinues(result, labelSet) === false) return resolveCompletion(UpdateEmpty(result, V));
        if (result.Value !== empty) var V = result.Value;
        CreatePerIterationEnvironment(perIterationBindings);
        if (increment) {
            var incRef = increment.compileEvaluation(ctx);
            GetValue(incRef);
        }
    }
}

// 13.7.5.9
Runtime_Semantics('compileBindingInitialization', [

    'ForDeclaration: LetOrConst ForBinding',
    function(ctx, value, environment) {
        throw Error('not yet implemented'); // TODO
        return this.ForBinding.BindingInitialization(value, environment);
    },
]);

// 13.7.5.10
Runtime_Semantics('compileBindingInstantiation', [

    'ForDeclaration: LetOrConst ForBinding',
    function(ctx, environment) {
        throw Error('not yet implemented'); // TODO
        var envRec = environment.EnvironmentRecord;
        Assert(envRec instanceof DeclarativeEnvironmentRecord);
        for (var name of this.ForBinding.BoundNames()) {
            if (this.LetOrConst.IsConstantDeclaration() === true) {
                envRec.CreateImmutableBinding(name, true);
            } else {
                envRec.CreateMutableBinding(name, false);
            }
        }
    },
]);

// 13.7.5.11
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation([], this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation([], this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation(this.ForDeclaration.BoundNames(), this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },

    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation([], this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation([], this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var keyResult = ForIn_OfHeadEvaluation(this.ForDeclaration.BoundNames(), this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },
]);

// 13.7.5.12
function compileForIn_OfHeadEvaluation(ctx, TDZnames, expr, iterationKind) {
    throw Error('not yet implemented'); // TODO
    var currentContext = running_execution_context;
    var oldEnv = running_execution_context.LexicalEnvironment;
    if (TDZnames.length > 0) {
        Assert(!TDZnames.contains_any_duplicate_entries());
        var TDZ = NewDeclarativeEnvironment(oldEnv);
        var TDZEnvRec = TDZ.EnvironmentRecord;
        for (var name of TDZnames) {
            TDZEnvRec.CreateMutableBinding(name, false);
        }
        running_execution_context.LexicalEnvironment = TDZ;
    }
    try {
        var exprRef = expr.compileEvaluation(ctx);
    } finally {
        Assert(currentContext === running_execution_context);
        running_execution_context.LexicalEnvironment = oldEnv;
    }
    var exprValue = GetValue(exprRef);
    if (iterationKind === 'enumerate') {
        if (exprValue === null || exprValue === undefined) {
            throw Completion({ Type: 'break', Value: empty, Target: empty });
        }
        var obj = ToObject(exprValue);
        return EnumerateObjectProperties(obj);
    } else {
        Assert(iterationKind === 'iterate');
        return GetIterator(exprValue);
    }
}

// 13.7.5.13
function compileForIn_OfBodyEvaluation(ctx, lhs, stmt, iterator, lhsKind, labelSet) {
    throw Error('not yet implemented'); // TODO
    var oldEnv = running_execution_context.LexicalEnvironment;
    var V = undefined;
    var destructuring = lhs.IsDestructuring();
    if (destructuring === true && lhsKind === 'assignment') {
        Assert(lhs.is('LeftHandSideExpression'));
        var assignmentPattern = lhs.AssignmentPattern;
    }
    while (true) {
        var nextResult = IteratorStep(iterator);
        if (nextResult === false) return V;
        var nextValue = IteratorValue(nextResult);
        if (lhsKind === 'assignment' || lhsKind === 'varBinding') {
            if (destructuring === false) {
                var lhsRef = compileConcreteCompletion(lhs.compileEvaluation(ctx));
            }
        } else {
            Assert(lhsKind === 'lexicalBinding');
            Assert(lhs.is('ForDeclaration'));
            var iterationEnv = NewDeclarativeEnvironment(oldEnv);
            lhs.BindingInstantiation(iterationEnv);
            running_execution_context.LexicalEnvironment = iterationEnv;
            if (destructuring === false) {
                Assert(lhs.BoundNames().length === 1);
                var lhsName = lhs.BoundNames()[0];
                var lhsRef = NormalCompletion(ResolveBinding(lhsName, undefined, lhs.strict));
            }
        }
        if (destructuring === false) {
            if (lhsRef.is_an_abrupt_completion()) {
                var status = lhsRef;
            } else if (lhsKind === 'lexicalBinding') {
                var status = concreteCompletion(InitializeReferencedBinding(lhsRef.Value, nextValue));
            } else {
                var status = concreteCompletion(PutValue(lhsRef.Value, nextValue));
            }
        } else {
            if (lhsKind === 'assignment') {
                var status = compileConcreteCompletion(assignmentPattern.DestructuringAssignmentEvaluation(nextValue));
            } else if (lhsKind === 'varBinding') {
                Assert(lhs.is('ForBinding'));
                var status = compileConcreteCompletion(lhs.BindingInitialization(nextValue, undefined));
            } else {
                Assert(lhsKind === 'lexicalBinding');
                Assert(lhs.is('ForDeclaration'));
                var status = compileConcreteCompletion(lhs.BindingInitialization(nextValue, iterationEnv));
            }
        }
        if (status.is_an_abrupt_completion()) {
            running_execution_context.LexicalEnvironment = oldEnv;
            return IteratorClose(iterator, status);
        }
        var result = compileConcreteCompletion(stmt.compileEvaluation(ctx));
        running_execution_context.LexicalEnvironment = oldEnv;
        if (LoopContinues(result, labelSet) === false) return IteratorClose(iterator, UpdateEmpty(result, V));
        if (result.Value !== empty) var V = result.Value;
    }
}

// 13.7.5.14
Runtime_Semantics('compileEvaluation', [

    'ForBinding: BindingIdentifier',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var bindingId = this.BindingIdentifier.StringValue();
        return ResolveBinding(bindingId, undefined, this.strict);
    },
]);

// 13.8.3
Runtime_Semantics('compileEvaluation', [

    'ContinueStatement: continue ;',
    function(ctx) {
        ctx.code(`
        throw Completion({ Type: 'continue', Value: empty, Target: empty });
        `);
    },

    'ContinueStatement: continue LabelIdentifier ;',
    function(ctx) {
        var label = this.LabelIdentifier.StringValue().quote();
        ctx.code(`
        throw Completion({ Type: 'continue', Value: empty, Target: ${label} });
        `);
    },
]);

// 13.9.3
Runtime_Semantics('compileEvaluation', [

    'BreakStatement: break ;',
    function(ctx) {
        ctx.code(`
        throw Completion({ Type: 'break', Value: empty, Target: empty });
        `);
    },

    'BreakStatement: break LabelIdentifier ;',
    function(ctx) {
        var label = this.LabelIdentifier.StringValue().quote();
        ctx.code(`
        throw Completion({ Type: 'break', Value: empty, Target: ${label} });
        `);
    },
]);

// 13.10.1
Runtime_Semantics('compileEvaluation', [

    'ReturnStatement: return ;',
    function(ctx) {
        ctx.code(`
        throw Completion({ Type: 'return', Value: undefined, Target: empty });
        `);
    },

    'ReturnStatement: return Expression ;',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ctx.GetValue(exprRef);
        ctx.code(`
        throw Completion({ Type: 'return', Value: ${exprValue}, Target: empty });
        `);
    },
]);

// 13.11.7
Runtime_Semantics('compileEvaluation', [

    'WithStatement: with ( Expression ) Statement',
    function(ctx) {
        var val = this.Expression.compileEvaluation(ctx);
        var obj = ctx.ToObject(ctx.GetValue(val));
        var [oldEnv, newEnv] = ctx.allocVars();
        ctx.code(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${newEnv} = NewObjectEnvironment(${obj}, ${oldEnv});
        ${newEnv}.EnvironmentRecord.withEnvironment = true;
        running_execution_context.LexicalEnvironment = ${newEnv};
        `)
        var C = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
        ctx.code(`
        running_execution_context.LexicalEnvironment = ${oldEnv};
        resolveCompletion(${C});
        `)
    },
]);

// 13.12.9
Runtime_Semantics('compileCaseBlockEvaluation', [

    'CaseBlock: { }',
    function(ctx, input) {
        throw Error('not yet implemented'); // TODO
        return undefined;
    },

    'CaseBlock: { CaseClauses }',
    function(ctx, input) {
        throw Error('not yet implemented'); // TODO
        var V = undefined;
        var A = listCaseClauses(this.CaseClauses);
        var found = false;
        for (var C of A) {
            if (found === false) {
                var clauseSelector = compileConcreteCompletion(C.CaseSelectorEvaluation(ctx));
                ReturnIfAbrupt(clauseSelector);
                var found = (input === clauseSelector);
            }
            if (found === true) {
                var R = compileConcreteCompletion(C.compileEvaluation(ctx));
                if (R.Value !== empty) var V = R.Value;
                if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
            }
        }
        return V;
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(ctx, input) {
        throw Error('not yet implemented'); // TODO
        var V = undefined;
        var A = listCaseClauses(this.CaseClauses1)
        var found = false;
        for (var C of A) {
            if (found === false) {
                var clauseSelector = compileConcreteCompletion(C.CaseSelectorEvaluation(ctx));
                ReturnIfAbrupt(clauseSelector);
                var found = (input === clauseSelector);
            }
            if (found === true) {
                var R = compileConcreteCompletion(C.compileEvaluation(ctx));
                if (R.Value !== empty) var V = R.Value;
                if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
            }
        }
        var foundInB = false;
        var B = listCaseClauses(this.CaseClauses2);
        if (found === false) {
            for (var C of B) {
                if (foundInB === false) {
                    var clauseSelector = compileConcreteCompletion(C.CaseSelectorEvaluation(ctx));
                    ReturnIfAbrupt(clauseSelector);
                    var foundInB = (input === clauseSelector);
                }
                if (foundInB === true) {
                    var R = compileConcreteCompletion(C.compileEvaluation(ctx));
                    if (R.Value !== empty) var V = R.Value;
                    if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
                }
            }
        }
        if (foundInB === true) return V;
        var R = compileConcreteCompletion(this.DefaultClause.compileEvaluation(ctx));
        if (R.Value !== empty) var V = R.Value;
        if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
        for (var C of B) {
            var R = compileConcreteCompletion(C.compileEvaluation(ctx));
            if (R.Value !== empty) var V = R.Value;
            if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
        }
        return V;
    },
]);

// 13.12.10
Runtime_Semantics('compileCaseSelectorEvaluation', [

    'CaseClause: case Expression : StatementList[opt]',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var exprRef = this.Expression.compileEvaluation(ctx);
        return GetValue(exprRef);
    },
]);

// 13.12.11
Runtime_Semantics('compileEvaluation', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var exprRef = this.Expression.compileEvaluation(ctx);
        var switchValue = GetValue(exprRef);
        var oldEnv = running_execution_context.LexicalEnvironment;
        var blockEnv = NewDeclarativeEnvironment(oldEnv);
        BlockDeclarationInstantiation(this.CaseBlock, blockEnv);
        running_execution_context.LexicalEnvironment = blockEnv;
        var R = compileConcreteCompletion(this.CaseBlock.CaseBlockEvaluation(switchValue));
        running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(R);
    },

    'CaseClause: case Expression :',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return empty;
    },

    'CaseClause: case Expression : StatementList',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.StatementList.compileEvaluation(ctx);
    },

    'DefaultClause: default :',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return empty;
    },

    'DefaultClause: default : StatementList',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.StatementList.compileEvaluation(ctx);
    },
]);

// 13.13.14
Runtime_Semantics('compileLabelledEvaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        var label = this.LabelIdentifier.StringValue();
        labelSet.push(label);
        var stmtResult = compileConcreteCompletion(this.LabelledItem.compileLabelledEvaluation(ctx, labelSet));
        if (stmtResult.Type === 'break' && SameValue(stmtResult.Target, label) === true) {
            var stmtResult = NormalCompletion(stmtResult.Value);
        }
        return resolveCompletion(stmtResult);
    },

    'LabelledItem: Statement',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        if (this.Statement.is('LabelledStatement') || this.Statement.is('BreakableStatement')) {
            return this.Statement.compileLabelledEvaluation(ctx, labelSet);
        } else {
            return this.Statement.compileEvaluation(ctx);
        }
    },

    'LabelledItem: FunctionDeclaration',
    function(ctx, labelSet) {
        throw Error('not yet implemented'); // TODO
        return this.FunctionDeclaration.compileEvaluation(ctx);
    },
]);

// 13.13.15
Runtime_Semantics('compileEvaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var newLabelSet = [];
        return this.compileLabelledEvaluation(ctx, newLabelSet);
    },
]);

// 13.14.1
Runtime_Semantics('compileEvaluation', [

    'ThrowStatement: throw Expression ;',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ctx.GetValue(exprRef);
        ctx.code(`
        throw Completion({ Type: 'throw', Value: ${exprValue}, Target: empty });
        `);
    },
]);

// 13.15.7
Runtime_Semantics('compileCatchClauseEvaluation', [

    'Catch: catch ( CatchParameter ) Block',
    function(ctx, thrownValue) {
        var [oldEnv, catchEnv, catchEnvRec] = ctx.allocVars();
        ctx.code(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${catchEnv} = NewDeclarativeEnvironment(${oldEnv});
        var ${catchEnvRec} = ${catchEnv}.EnvironmentRecord;
        `);
        for (var argName of this.CatchParameter.BoundNames()) {
            ctx.code(`
            ${catchEnvRec}.CreateMutableBinding(${argName.quote()}, false);
            `);
        }
        ctx.code(`
        running_execution_context.LexicalEnvironment = ${catchEnv};
        `);
        var status = compileConcreteCompletion(this.CatchParameter.compileBindingInitialization(ctx, thrownValue, catchEnv));
        ctx.code(`
        if (${status}.is_an_abrupt_completion()) {
            running_execution_context.LexicalEnvironment = ${oldEnv};
            resolveCompletion(${status});
        }else{
        `);
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        ctx.code(`
            running_execution_context.LexicalEnvironment = ${oldEnv};
            resolveCompletion(${B});
        }
        `);
    },
]);

// 13.15.8
Runtime_Semantics('compileEvaluation', [

    'TryStatement: try Block Catch',
    function(ctx) {
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        ctx.code(`
        if (${B}.Type === 'throw'){
        `);
        var V = ctx._(`${B}.Value`);
        var C = compileConcreteCompletion(this.Catch.compileCatchClauseEvaluation(ctx, V));
        ctx.code(`
        } else var ${C} = ${B};
        resolveCompletion(${C});
        `);
    },

    'TryStatement: try Block Finally',
    function(ctx) {
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        var F = compileConcreteCompletion(this.Finally.compileEvaluation(ctx));
        ctx.code(`
        if (${F}.Type === 'normal') var ${F} = ${B};
        resolveCompletion(${F});
        `);
    },

    'TryStatement: try Block Catch Finally',
    function(ctx) {
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        ctx.code(`
        if (${B}.Type === 'throw'){
        `);
        var V = ctx._(`${B}.Value`);
        var C = compileConcreteCompletion(this.Catch.compileCatchClauseEvaluation(ctx, V));
        ctx.code(`
        } else var ${C} = ${B};
        `);
        var F = compileConcreteCompletion(this.Finally.compileEvaluation(ctx));
        ctx.code(`
        if (${F}.Type === 'normal') var ${F} = ${C};
        resolveCompletion(${F});
        `);
    },
]);

// 13.16.1
Runtime_Semantics('compileEvaluation', [

    'DebuggerStatement: debugger ;',
    function(ctx) {
        ctx.code(`
        debugger;
        `);
    },
]);

// 12.1.5
Runtime_Semantics('compileBindingInitialization', [

    'BindingIdentifier: Identifier',
    function(ctx, value, environment) {
        var name = this.Identifier.StringValue().quote();
        return ctx.InitializeBoundName(name, value, environment, this.strict);
    },

    'BindingIdentifier: yield',
    function(ctx, value, environment) {
        return ctx.InitializeBoundName("yield".quote(), value, environment, this.strict);
    },
]);

// 12.1.6
Runtime_Semantics('compileEvaluation', [

    'IdentifierReference: Identifier',
    function(ctx) {
        return ctx.ResolveBinding(this.Identifier.StringValue().quote(), undefined, this.strict);
    },

    'IdentifierReference: yield',
    function(ctx) {
        return ctx.ResolveBinding("yield".quote(), undefined, this.strict);
    },
]);

// 12.2.2.1
Runtime_Semantics('compileEvaluation', [

    'PrimaryExpression: this',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return ResolveThisBinding();
    },
]);

// 12.2.4.1
Runtime_Semantics('compileEvaluation', [

    'Literal: NullLiteral',
    function(ctx) {
        return 'null';
    },

    'Literal: BooleanLiteral',
    function(ctx) {
        if (this.BooleanLiteral.is('BooleanLiteral:: false')) return false;
        if (this.BooleanLiteral.is('BooleanLiteral:: true')) return true;
        return Assert(false);
    },

    'Literal: NumericLiteral',
    function(ctx) {
        return this.NumericLiteral.MV();
    },

    'Literal: StringLiteral',
    function(ctx) {
        return this.StringLiteral.StringValue().quote();
    },
]);

// 12.2.5.2
Runtime_Semantics('compileArrayAccumulation', [

    'ElementList: Elision[opt] AssignmentExpression',
    function(ctx, array, nextIndex) {
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        var initResult = this.AssignmentExpression.compileEvaluation(ctx);
        var initValue = ctx.GetValue(initResult);
        var created = ctx._(`CreateDataProperty(${array}, ToString(ToUint32(${nextIndex} + ${padding})), ${initValue})`);
        ctx.Assert(`${created} === true`);
        return ctx._(`${nextIndex} + ${padding} + 1`);
    },

    'ElementList: Elision[opt] SpreadElement',
    function(ctx, array, nextIndex) {
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        return this.SpreadElement.compileArrayAccumulation(ctx, array, ctx._(`${nextIndex} + ${padding}`));
    },

    'ElementList: ElementList , Elision[opt] AssignmentExpression',
    function(ctx, array, nextIndex) {
        throw Error('not yet implemented'); // TODO
        var postIndex = this.ElementList.compileArrayAccumulation(ctx, array, nextIndex);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        var initResult = this.AssignmentExpression.compileEvaluation(ctx);
        var initValue = ctx.GetValue(initResult);
        var created = ctx._(`CreateDataProperty(${array}, ToString(ToUint32(${postIndex} + ${padding})), ${initValue})`);
        ctx.Assert(`${created} === true`);
        return ctx._(`${postIndex} + ${padding} + 1`);
    },

    'ElementList: ElementList , Elision[opt] SpreadElement',
    function(ctx, array, nextIndex) {
        throw Error('not yet implemented'); // TODO
        var postIndex = this.ElementList.compileArrayAccumulation(ctx, array, nextIndex);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        return this.SpreadElement.compileArrayAccumulation(ctx, array, ctx._(`${postIndex} + ${padding}`));
    },

    'SpreadElement: ... AssignmentExpression',
    function(ctx, array, nextIndex) {
        var spreadRef = this.AssignmentExpression.compileEvaluation(ctx);
        var spreadObj = ctx.GetValue(spreadRef);
        var iterator = ctx.GetIterator(spreadObj);
        var nextIndex = ctx._(`${nextIndex}`);
        ctx.code(`
        while (true) {
            var next = IteratorStep(${iterator});
            if (next === false) break;
            var nextValue = IteratorValue(next);
            var status = CreateDataProperty(${array}, ToString(ToUint32(${nextIndex})), nextValue);
            Assert(status === true);
            var ${nextIndex} = ${nextIndex} + 1;
        }
        `);
        return nextIndex;
    },
]);

// 12.2.5.3
Runtime_Semantics('compileEvaluation', [

    'ArrayLiteral: [ Elision[opt] ]',
    function(ctx) {
        return ctx.Evaluation(this);
    },

    'ArrayLiteral: [ ElementList ]',
    function(ctx) {
        var array = ctx._(`ArrayCreate(0)`);
        var len = this.ElementList.compileArrayAccumulation(ctx, array, 0);
        ctx.code(`_Set(${array}, "length", ToUint32(${len}), false);`);
        return array;
    },

    'ArrayLiteral: [ ElementList , Elision[opt] ]',
    function(ctx) {
        var array = ctx._(`ArrayCreate(0)`);
        var len = this.ElementList.compileArrayAccumulation(ctx, array, 0);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        ctx.code(`_Set(${array}, "length", ToUint32(${padding}+${len}), false);`);
        return array;
    },
]);

// 12.2.6.8
Runtime_Semantics('compileEvaluation', [

    'ObjectLiteral: { }',
    function(ctx) {
        return ctx._(`ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%'])`);
    },

    'ObjectLiteral: { PropertyDefinitionList }',
    'ObjectLiteral: { PropertyDefinitionList , }',
    function(ctx) {
        if (!this.Contains('YieldExpression')) { //TODO
            return ctx.Evaluation(this);
        }
        throw Error('not yet implemented'); // TODO
        var obj = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
        var status = this.PropertyDefinitionList.compilePropertyDefinitionEvaluation(ctx, obj, true);
        return obj;
    },

    'LiteralPropertyName: IdentifierName',
    function(ctx) {
        return this.IdentifierName.StringValue().quote();
    },

    'LiteralPropertyName: StringLiteral',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.StringLiteral.SV();
    },

    'LiteralPropertyName: NumericLiteral',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var nbr = this.NumericLiteral.MV();
        return ToString(nbr);
    },

    'ComputedPropertyName: [ AssignmentExpression ]',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var exprValue = this.AssignmentExpression.compileEvaluation(ctx);
        var propName = GetValue(exprValue);
        return ToPropertyKey(propName);
    },
]);

// 12.2.6.9
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var status = this.PropertyDefinitionList.PropertyDefinitionEvaluation(object, enumerable);
        return this.PropertyDefinition.PropertyDefinitionEvaluation(object, enumerable);
    },

    'PropertyDefinition: IdentifierReference',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propName = this.IdentifierReference.StringValue();
        var exprValue = this.IdentifierReference.compileEvaluation(ctx);
        var propValue = GetValue(exprValue);
        Assert(enumerable === true);
        return CreateDataPropertyOrThrow(object, propName, propValue);
    },

    'PropertyDefinition: PropertyName : AssignmentExpression',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propKey = this.PropertyName.compileEvaluation(ctx);
        var exprValueRef = this.AssignmentExpression.compileEvaluation(ctx);
        var propValue = GetValue(exprValueRef);
        if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true) {
            var hasNameProperty = HasOwnProperty(propValue, "name");
            if (hasNameProperty === false) SetFunctionName(propValue, propKey);
        }
        Assert(enumerable === true);
        return CreateDataPropertyOrThrow(object, propKey, propValue);
    },
]);

// 12.2.8.2
Runtime_Semantics('compileEvaluation', [

    'PrimaryExpression: RegularExpressionLiteral',
    function(ctx) {
        var pattern = this.RegularExpressionLiteral.BodyText();
        var flags = this.RegularExpressionLiteral.FlagText();
        return ctx._(`RegExpCreate(${pattern.quote()}, ${flags.quote()})`);
    },
]);

// 12.2.9.2
Runtime_Semantics('compileArgumentListEvaluation', [

    'TemplateLiteral: NoSubstitutionTemplate',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var templateLiteral = this;
        var siteObj = GetTemplateObject(templateLiteral);
        return [siteObj];
    },

    'TemplateLiteral: TemplateHead Expression TemplateSpans',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var templateLiteral = this;
        var siteObj = GetTemplateObject(templateLiteral);
        var firstSub = this.Expression.compileEvaluation(ctx);
        var firstSub = GetValue(firstSub); // EcmaScript8
        var restSub = this.TemplateSpans.SubstitutionEvaluation();
        Assert(Type(restSub) === 'List');
        return [siteObj, firstSub].concat(restSub);
    },
]);

// 12.2.9.4
Runtime_Semantics('compileSubstitutionEvaluation', [

    'TemplateSpans: TemplateTail',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return [];
    },

    'TemplateSpans: TemplateMiddleList TemplateTail',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.TemplateMiddleList.SubstitutionEvaluation();
    },

    'TemplateMiddleList: TemplateMiddle Expression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var sub = this.Expression.compileEvaluation(ctx);
        var sub = GetValue(sub); // EcmaScript8
        return [sub];
    },

    'TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var preceding = this.TemplateMiddleList.SubstitutionEvaluation();
        var next = this.Expression.compileEvaluation(ctx);
        var next = GetValue(next); // EcmaScript8
        preceding.push(next);
        return preceding;
    },
]);

// 12.2.9.5
Runtime_Semantics('compileEvaluation', [

    'TemplateLiteral: NoSubstitutionTemplate',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return this.NoSubstitutionTemplate.TV();
    },

    'TemplateLiteral: TemplateHead Expression TemplateSpans',
    function(ctx) {
        var head = this.TemplateHead.TV().quote();
        var sub = this.Expression.compileEvaluation(ctx);
        var sub = ctx.GetValue(sub);
        var middle = ctx.ToString(sub);
        var tail = this.TemplateSpans.compileEvaluation(ctx);
        return ctx._(`${head} + ${middle} + ${tail}`);
    },

    'TemplateSpans: TemplateTail',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var tail = this.TemplateTail.TV();
        return tail;
    },

    'TemplateSpans: TemplateMiddleList TemplateTail',
    function(ctx) {
        var head = this.TemplateMiddleList.compileEvaluation(ctx);
        var tail = this.TemplateTail.TV().quote();
        return ctx._(`${head} + ${tail}`);
    },

    'TemplateMiddleList: TemplateMiddle Expression',
    function(ctx) {
        var head = this.TemplateMiddle.TV().quote();
        var sub = this.Expression.compileEvaluation(ctx);
        var sub = ctx.GetValue(sub);
        var middle = ctx.ToString(sub);
        return ctx._(`${head} + ${middle}`);
    },

    'TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var rest = this.TemplateMiddleList.compileEvaluation(ctx);
        var middle = this.TemplateMiddle.TV();
        var sub = this.Expression.compileEvaluation(ctx);
        var sub = GetValue(sub); // clarify the specification
        var last = ToString(sub);
        return rest + middle + last;
    },
]);

// 12.2.10.4
Runtime_Semantics('compileEvaluation', [

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function(ctx) {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        return expr.compileEvaluation(ctx);
    },

    'ParenthesizedExpression: ( Expression )',
    function(ctx) {
        return this.Expression.compileEvaluation(ctx);
    },
]);

// 12.3.2.1
Runtime_Semantics('compileEvaluation', [

    'MemberExpression: MemberExpression [ Expression ]',
    function(ctx) {
        var baseReference = this.MemberExpression.compileEvaluation(ctx);
        var baseValue = ctx.GetValue(baseReference);
        var propertyNameReference = this.Expression.compileEvaluation(ctx);
        var propertyNameValue = ctx.GetValue(propertyNameReference);
        var bv = ctx.RequireObjectCoercible(baseValue);
        var propertyKey = ctx.ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return ctx.Reference(bv, propertyKey, strict);
    },

    'MemberExpression: MemberExpression . IdentifierName',
    function(ctx) {
        var baseReference = this.MemberExpression.compileEvaluation(ctx);
        var baseValue = ctx.GetValue(baseReference);
        var bv = ctx.RequireObjectCoercible(baseValue);
        var propertyNameString = this.IdentifierName.StringValue().quote();
        if (this.strict) var strict = true;
        else var strict = false;
        return ctx.Reference(bv, propertyNameString, strict);
    },

    'CallExpression: CallExpression [ Expression ]',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var baseReference = this.CallExpression.compileEvaluation(ctx);
        var baseValue = GetValue(baseReference);
        var propertyNameReference = this.Expression.compileEvaluation(ctx);
        var propertyNameValue = GetValue(propertyNameReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyKey = ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyKey, strict);
    },

    'CallExpression: CallExpression . IdentifierName',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var baseReference = this.CallExpression.compileEvaluation(ctx);
        var baseValue = GetValue(baseReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyNameString = this.IdentifierName.StringValue();
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyNameString, strict);
    },
]);

// 12.3.3.1
Runtime_Semantics('compileEvaluation', [

    'NewExpression: new NewExpression',
    function(ctx) {
        return compileEvaluateNew(ctx, this.NewExpression, empty);
    },

    'MemberExpression: new MemberExpression Arguments',
    function(ctx) {
        return compileEvaluateNew(ctx, this.MemberExpression, this.Arguments);
    },
]);

// 12.3.3.1.1
function compileEvaluateNew(ctx, constructProduction, _arguments) {
    Assert(constructProduction.is('NewExpression') || constructProduction.is('MemberExpression'));
    Assert(_arguments === empty || _arguments.is('Arguments'));
    var ref = constructProduction.compileEvaluation(ctx);
    var constructor = ctx.GetValue(ref);
    if (_arguments === empty) var argList = ctx._(`[]`);
    else {
        var argList = _arguments.compileArgumentListEvaluation(ctx);
    }
    ctx.code(`
    if (IsConstructor(${constructor}) === false) throw $TypeError();
    `);
    return ctx.Construct(constructor, argList);
}

// 12.3.4.1
Runtime_Semantics('compileEvaluation', [

    'CallExpression: MemberExpression Arguments',
    function(ctx) {
        var ref = this.MemberExpression.compileEvaluation(ctx);
        var func = ctx.GetValue(ref);
        var thisValue = ctx.allocVar();
        /* TODO
                if (Type(${ref}) === 'Reference' && IsPropertyReference(${ref}) === false && GetReferencedName(${ref}) === "eval") {
                    if (SameValue(${func}, currentRealm.Intrinsics['%eval%']) === true) {
                        var argList = this.Arguments.compileArgumentListEvaluation(ctx); //TODO
                        if (argList.length === 0) return undefined;
                        var evalText = argList[0];
                        if (${this.strict}) var strictCaller = true;
                        else var strictCaller = false;
                        var evalRealm = currentRealm;
                        return PerformEval(evalText, evalRealm, strictCaller, true); //TODO
                    }
                }
        */
        ctx.code(`
        if (Type(${ref}) === 'Reference') {
            if (IsPropertyReference(${ref}) === true) {
                var ${thisValue} = GetThisValue(${ref});
            } else {
                var refEnv = GetBase(${ref});
                var ${thisValue} = refEnv.WithBaseObject();
            }
        } else {
            var ${thisValue} = undefined;
        }
        `);
        return compileEvaluateDirectCall(ctx, func, thisValue, this.Arguments); // not tail call for generator function
    },

    'CallExpression: CallExpression Arguments',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var ref = this.CallExpression.compileEvaluation(ctx);
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(ref, this.Arguments, tailCall);
    },
]);

// 12.3.4.3
function compileEvaluateDirectCall(ctx, func, thisValue, _arguments) {
    var argList = _arguments.compileArgumentListEvaluation(ctx);
    ctx.code(`
    if (Type(${func}) !== 'Object') throw $TypeError();
    if (IsCallable(${func}) === false) throw $TypeError();
    `);
    var result = ctx.Call(func, thisValue, argList);
    ctx.Assert(`Type(${result}).is_an_element_of(['Undefined', 'Boolean', 'Number', 'String', 'Symbol', 'Null', 'Object'])`);
    return result;
}

// 12.3.5.1
Runtime_Semantics('compileEvaluation', [

    'SuperProperty: super [ Expression ]',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var propertyNameReference = this.Expression.compileEvaluation(ctx);
        var propertyNameValue = GetValue(propertyNameReference);
        var propertyKey = ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return MakeSuperPropertyReference(propertyKey, strict);
    },

    'SuperProperty: super . IdentifierName',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var propertyKey = this.IdentifierName.StringValue();
        if (this.strict) var strict = true;
        else var strict = false;
        return MakeSuperPropertyReference(propertyKey, strict);
    },

    'SuperCall: super Arguments',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var newTarget = GetNewTarget();
        if (newTarget === undefined) throw $ReferenceError();
        var func = GetSuperConstructor();
        var argList = this.Arguments.compileArgumentListEvaluation(ctx);
        var result = Construct(func, argList, newTarget);
        var thisER = GetThisEnvironment();
        return thisER.BindThisValue(result);
    },
]);

// 12.3.6.1
Runtime_Semantics('compileArgumentListEvaluation', [

    'Arguments: ( )',
    function(ctx) {
        return ctx._(`[]`);
    },

    'ArgumentList: AssignmentExpression',
    function(ctx) {
        var ref = this.AssignmentExpression.compileEvaluation(ctx);
        var arg = ctx.GetValue(ref);
        return ctx._(`[${arg}]`);
    },

    'ArgumentList: ... AssignmentExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var spreadRef = this.AssignmentExpression.compileEvaluation(ctx);
        var spreadObj = ctx.GetValue(spreadRef);
        var iterator = ctx.GetIterator(spreadObj);
        var list = [];
        while (true) {
            var next = IteratorStep(iterator);
            if (next === false) return list;
            var nextArg = IteratorValue(next);
            list.push(nextArg);
        }
    },

    'ArgumentList: ArgumentList , AssignmentExpression',
    function(ctx) {
        var precedingArgs = this.ArgumentList.compileArgumentListEvaluation(ctx);
        var ref = this.AssignmentExpression.compileEvaluation(ctx);
        var arg = ctx.GetValue(ref);
        ctx.code(`${precedingArgs}.push(${arg});`);
        return precedingArgs;
    },

    'ArgumentList: ArgumentList , ... AssignmentExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var precedingArgs = this.ArgumentList.compileArgumentListEvaluation(ctx);
        var spreadRef = this.AssignmentExpression.compileEvaluation(ctx);
        var iterator = GetIterator(GetValue(spreadRef));
        while (true) {
            var next = IteratorStep(iterator);
            if (next === false) return precedingArgs;
            var nextArg = IteratorValue(next);
            precedingArgs.push(nextArg);
        }
    },

]);

// 12.3.7.1
Runtime_Semantics('compileEvaluation', [

    'MemberExpression: MemberExpression TemplateLiteral',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var tagRef = this.MemberExpression.compileEvaluation(ctx);
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(tagRef, this.TemplateLiteral, tailCall);
    },

    'CallExpression: CallExpression TemplateLiteral',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var tagRef = this.CallExpression.compileEvaluation(ctx);
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(tagRef, this.TemplateLiteral, tailCall);
    },
]);

// 12.3.8.1
Runtime_Semantics('compileEvaluation', [

    'NewTarget: new . target',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        return GetNewTarget();
    },
]);

// 12.4.4.1
Runtime_Semantics('compileEvaluation', [

    'UpdateExpression: LeftHandSideExpression ++',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lhs = this.LeftHandSideExpression.compileEvaluation(ctx);
        var oldValue = ToNumber(GetValue(lhs));
        var newValue = oldValue + 1;
        PutValue(lhs, newValue);
        return oldValue;
    },
]);

// 12.4.5.1
Runtime_Semantics('compileEvaluation', [

    'UpdateExpression: LeftHandSideExpression --',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lhs = this.LeftHandSideExpression.compileEvaluation(ctx);
        var oldValue = ToNumber(GetValue(lhs));
        var newValue = oldValue - 1;
        PutValue(lhs, newValue);
        return oldValue;
    },
]);

// 12.4.6.1
Runtime_Semantics('compileEvaluation', [

    'UpdateExpression: ++ UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        var oldValue = ToNumber(GetValue(expr));
        var newValue = oldValue + 1;
        PutValue(expr, newValue);
        return newValue;
    },
]);

// 12.4.7.1
Runtime_Semantics('compileEvaluation', [

    'UpdateExpression: -- UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        var oldValue = ToNumber(GetValue(expr));
        var newValue = oldValue - 1;
        PutValue(expr, newValue);
        return newValue;
    },
]);

// 12.5.3.2
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: delete UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var ref = this.UnaryExpression.compileEvaluation(ctx);
        if (Type(ref) !== 'Reference') return true;
        if (IsUnresolvableReference(ref) === true) {
            Assert(IsStrictReference(ref) === false);
            return true;
        }
        if (IsPropertyReference(ref) === true) {
            if (IsSuperReference(ref) === true) throw $ReferenceError();
            var baseObj = ToObject(GetBase(ref));
            var deleteStatus = baseObj.Delete(GetReferencedName(ref));
            if (deleteStatus === false && IsStrictReference(ref) === true) throw $TypeError();
            return deleteStatus;
        } else {
            var bindings = GetBase(ref);
            return bindings.DeleteBinding(GetReferencedName(ref));
        }
    },
]);

// 12.5.4.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: void UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        GetValue(expr);
        return undefined;
    },
]);

// 12.5.5.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: typeof UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var val = this.UnaryExpression.compileEvaluation(ctx);
        if (Type(val) === 'Reference') {
            if (IsUnresolvableReference(val) === true) return "undefined";
        }
        var val = GetValue(val);
        switch (Type(val)) {
            case 'Undefined':
                return "undefined";
            case 'Null':
                return "object";
            case 'Boolean':
                return "boolean";
            case 'Number':
                return "number";
            case 'String':
                return "string";
            case 'Symbol':
                return "symbol";
            case 'Object':
                if (val.Call) return "function";
                return "object";
        }
        return Assert(false);
    }
]);

// 12.5.6.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: + UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        return ToNumber(GetValue(expr));
    },
]);

// 12.5.7.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: - UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        var oldValue = ToNumber(GetValue(expr));
        if (Number.isNaN(oldValue)) return NaN;
        return -oldValue;
    },
]);

// 12.5.8.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: ~ UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        var oldValue = ToInt32(GetValue(expr));
        return ~oldValue;
    },

]);

// 12.5.9.1
Runtime_Semantics('compileEvaluation', [

    'UnaryExpression: ! UnaryExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        var oldValue = ToBoolean(GetValue(expr));
        if (oldValue === true) return false;
        return true;
    },

]);

// 12.6.3
Runtime_Semantics('compileEvaluation', [

    'ExponentiationExpression: UpdateExpression ** ExponentiationExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var left = this.UpdateExpression.compileEvaluation(ctx);
        var leftValue = GetValue(left);
        var right = this.ExponentiationExpression.compileEvaluation(ctx);
        var rightValue = GetValue(right);
        var base = ToNumber(leftValue);
        var exponent = ToNumber(rightValue);
        return Math.pow(base, exponent);
    },
]);

// 12.7.3
Runtime_Semantics('compileEvaluation', [

    'MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var left = this.MultiplicativeExpression.compileEvaluation(ctx);
        var leftValue = GetValue(left);
        var right = this.ExponentiationExpression.compileEvaluation(ctx);
        var rightValue = GetValue(right);
        var lnum = ToNumber(leftValue);
        var rnum = ToNumber(rightValue);
        if (this.MultiplicativeOperator.is('MultiplicativeOperator: *')) {
            return lnum * rnum;
        }
        if (this.MultiplicativeOperator.is('MultiplicativeOperator: /')) {
            return lnum / rnum;
        }
        if (this.MultiplicativeOperator.is('MultiplicativeOperator: %')) {
            return lnum % rnum;
        }
        return Assert(false);
    },
]);

// 12.8.3.1
Runtime_Semantics('compileEvaluation', [

    'AdditiveExpression: AdditiveExpression + MultiplicativeExpression',
    function(ctx) {
        var lref = this.AdditiveExpression.compileEvaluation(ctx);
        var lval = ctx.GetValue(lref);
        var rref = this.MultiplicativeExpression.compileEvaluation(ctx);
        var rval = ctx.GetValue(rref);
        var r = ctx.allocVar();
        ctx.code(`
        var lprim = ToPrimitive(${lval});
        var rprim = ToPrimitive(${rval});
        if (Type(lprim) === 'String' || Type(rprim) === 'String') {
            var lstr = ToString(lprim);
            var rstr = ToString(rprim);
            var ${r} = lstr + rstr;
        } else {
            var lnum = ToNumber(lprim);
            var rnum = ToNumber(rprim);
            var ${r} = lnum + rnum;
        }
        `);
        return r;
    },
]);

// 12.8.4.1
Runtime_Semantics('compileEvaluation', [

    'AdditiveExpression: AdditiveExpression - MultiplicativeExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.AdditiveExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.MultiplicativeExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToNumber(lval);
        var rnum = ToNumber(rval);
        return lnum - rnum;
    },
]);

// 12.9.3.1
Runtime_Semantics('compileEvaluation', [

    'ShiftExpression: ShiftExpression << AdditiveExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.ShiftExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum << shiftCount;
    },
]);

// 12.9.4.1
Runtime_Semantics('compileEvaluation', [

    'ShiftExpression: ShiftExpression >> AdditiveExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.ShiftExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum >> shiftCount;
    },
]);

// 12.9.5.1
Runtime_Semantics('compileEvaluation', [

    'ShiftExpression: ShiftExpression >>> AdditiveExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.ShiftExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToUint32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum >>> shiftCount;
    },
]);

// 12.10.3
Runtime_Semantics('compileEvaluation', [

    'RelationalExpression: RelationalExpression < ShiftExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(lval, rval);
        if (r === undefined) return false;
        else return r;
    },

    'RelationalExpression: RelationalExpression > ShiftExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(rval, lval, false);
        if (r === undefined) return false;
        else return r;
    },

    'RelationalExpression: RelationalExpression <= ShiftExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(rval, lval, false);
        if (r === true || r === undefined) return false;
        else return true;
    },

    'RelationalExpression: RelationalExpression >= ShiftExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(lval, rval);
        if (r === true || r === undefined) return false;
        else return true;
    },

    'RelationalExpression: RelationalExpression instanceof ShiftExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        return InstanceofOperator(lval, rval);
    },

    'RelationalExpression: RelationalExpression in ShiftExpression',
    function(ctx) {
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = ctx.GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = ctx.GetValue(rref);
        var r = ctx.allocVar();
        ctx.code(`
        if (Type(${rval}) !== 'Object') throw $TypeError();
        var ${r} = HasProperty(${rval}, ToPropertyKey(${lval}));
        `);
        return r;
    },
]);

// 12.11.3
Runtime_Semantics('compileEvaluation', [

    'EqualityExpression: EqualityExpression == RelationalExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.EqualityExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        return AbstractEqualityComparison(rval, lval);
    },

    'EqualityExpression: EqualityExpression != RelationalExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.EqualityExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = AbstractEqualityComparison(rval, lval);
        if (r === true) return false;
        else return true;
    },

    'EqualityExpression: EqualityExpression === RelationalExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.EqualityExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        return StrictEqualityComparison(rval, lval);
    },

    'EqualityExpression: EqualityExpression !== RelationalExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.EqualityExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var r = StrictEqualityComparison(rval, lval);
        if (r === true) return false;
        else return true;
    },
]);

// 12.12.3
Runtime_Semantics('compileEvaluation', [

    'BitwiseANDExpression: BitwiseANDExpression & EqualityExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.BitwiseANDExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.EqualityExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum & rnum;
    },

    'BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.BitwiseXORExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.BitwiseANDExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum ^ rnum;
    },

    'BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.BitwiseORExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var rref = this.BitwiseXORExpression.compileEvaluation(ctx);
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum | rnum;
    },
]);

// 12.13.3
Runtime_Semantics('compileEvaluation', [

    'LogicalANDExpression: LogicalANDExpression && BitwiseORExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.LogicalANDExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var lbool = ToBoolean(lval);
        if (lbool === false) return lval;
        var rref = this.BitwiseORExpression.compileEvaluation(ctx);
        return GetValue(rref);
    },

    'LogicalORExpression: LogicalORExpression || LogicalANDExpression',
    function(ctx) {
        throw Error('not yet implemented'); // TODO
        var lref = this.LogicalORExpression.compileEvaluation(ctx);
        var lval = GetValue(lref);
        var lbool = ToBoolean(lval);
        if (lbool === true) return lval;
        var rref = this.LogicalANDExpression.compileEvaluation(ctx);
        return GetValue(rref);
    },
]);

// 12.14.3
Runtime_Semantics('compileEvaluation', [

    'ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression',
    function(ctx) {
        var lref = this.LogicalORExpression.compileEvaluation(ctx);
        var lval = ctx.ToBoolean(ctx.GetValue(lref));
        var r = ctx.allocVar();
        ctx.code(`
        if (${lval} === true) {
        `);
        var trueRef = this.AssignmentExpression1.compileEvaluation(ctx);
        ctx.code(`
            var ${r} = GetValue(${trueRef});
        } else {
        `);
        var falseRef = this.AssignmentExpression2.compileEvaluation(ctx);
        ctx.code(`
            var ${r} = GetValue(${falseRef});
        }
        `);
        return r;
    },
]);

// 12.15.4
Runtime_Semantics('compileEvaluation', [

    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    function(ctx) {
        if (!(this.LeftHandSideExpression.is('ObjectLiteral') || this.LeftHandSideExpression.is('ArrayLiteral'))) {
            var lref = this.LeftHandSideExpression.compileEvaluation(ctx);
            var rref = this.AssignmentExpression.compileEvaluation(ctx);
            var rval = ctx.GetValue(rref);
            if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true && this.LeftHandSideExpression.IsIdentifierRef() === true) {
                ctx.code(`
                var hasNameProperty = HasOwnProperty(${rval}, "name");
                if (hasNameProperty === false) SetFunctionName(${rval}, GetReferencedName(${lref}));
                `);
            }
            ctx.PutValue(lref, rval);
            return rval;
        }
        var assignmentPattern = this.LeftHandSideExpression.AssignmentPattern;
        var rref = this.AssignmentExpression.compileEvaluation(ctx);
        var rval = ctx.GetValue(rref);
        assignmentPattern.compileDestructuringAssignmentEvaluation(ctx, rval);
        return rval;
    },

    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    function(ctx) {
        var lref = this.LeftHandSideExpression.compileEvaluation(ctx);
        var lval = ctx.GetValue(lref);
        var rref = this.AssignmentExpression.compileEvaluation(ctx);
        var rval = ctx.GetValue(rref);
        var r = ctx.allocVar();
        if (this.AssignmentOperator.is('AssignmentOperator: *=')) {
            ctx.code(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum * rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: /=')) {
            ctx.code(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum / rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: %=')) {
            ctx.code(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum % rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: +=')) {
            ctx.code(`
            var lprim = ToPrimitive(${lval});
            var rprim = ToPrimitive(${rval});
            if (Type(lprim) === 'String' || Type(rprim) === 'String') {
                var lstr = ToString(lprim);
                var rstr = ToString(rprim);
                var ${r} = lstr + rstr;
            } else {
                var lnum = ToNumber(lprim);
                var rnum = ToNumber(rprim);
                var ${r} = lnum + rnum;
            }
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: -=')) {
            ctx.code(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum - rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: <<=')) {
            ctx.code(`
            var lnum = ToInt32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum << shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: >>=')) {
            ctx.code(`
            var lnum = ToInt32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum >> shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: >>>=')) {
            ctx.code(`
            var lnum = ToUint32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum >>> shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: &=')) {
            ctx.code(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum & rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: |=')) {
            ctx.code(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum | rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: ^=')) {
            ctx.code(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum ^ rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: **=')) {
            ctx.code(`
            var base = ToNumber(${lval});
            var exponent = ToNumber(${rval});
            var ${r} = Math.pow(base, exponent);
            `);
        } else {
            Assert(false);
        }
        ctx.PutValue(lref, r);
        return r;
    },
]);

// 12.15.5.2
Runtime_Semantics('compileDestructuringAssignmentEvaluation', [

    'ObjectAssignmentPattern: { }',
    function(ctx, value) {
        throw Error('not yet implemented'); // TODO
        ctx.code(`${ctx.literal(this)}.DestructuringAssignmentEvaluation(${value});`);
    },

    'ObjectAssignmentPattern: { AssignmentPropertyList }',
    'ObjectAssignmentPattern: { AssignmentPropertyList , }',
    function(ctx, value) {
        ctx.RequireObjectCoercible(value);
        this.AssignmentPropertyList.compileDestructuringAssignmentEvaluation(ctx, value);
    },

    'ArrayAssignmentPattern: [ ]',
    'ArrayAssignmentPattern: [ Elision ]',
    function(ctx, value) {
        throw Error('not yet implemented'); // TODO
        ctx.code(`${ctx.literal(this)}.DestructuringAssignmentEvaluation(${value});`);
    },

    'ArrayAssignmentPattern: [ Elision[opt] AssignmentRestElement ]',
    function(ctx, value) {
        var iterator = ctx.GetIterator(value);
        var iteratorRecord = ctx._(`Record({ Iterator: ${iterator}, Done: false })`);
        if (this.Elision) {
            var status = compileConcreteCompletion(this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
            ctx.code(`
            if (${status}.is_an_abrupt_completion()) {
                if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status});
                else resolveCompletion(${status});
                Assert(false);
            }
            `);
        }
        var result = compileConcreteCompletion(this.AssignmentRestElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.code(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${result});
        else resolveCompletion(${result});
        `);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList ]',
    function(ctx, value) {
        var iterator = ctx.GetIterator(value);
        var iteratorRecord = ctx._(`Record({ Iterator: ${iterator}, Done: false })`);
        var result = compileConcreteCompletion(this.AssignmentElementList.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.code(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${result});
        else resolveCompletion(${result});
        `);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList , Elision[opt] AssignmentRestElement[opt] ]',
    function(ctx, value) {
        var iterator = ctx.GetIterator(value);
        var iteratorRecord = ctx._(`Record({ Iterator: ${iterator}, Done: false })`);
        var status = compileConcreteCompletion(this.AssignmentElementList.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.code(`
        if (${status}.is_an_abrupt_completion()) {
            if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status});
            else resolveCompletion(${status});
            Assert(false);
        }
        `);
        if (this.Elision) {
            var status = compileConcreteCompletion(this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
            ctx.code(`
            if (${status}.is_an_abrupt_completion()) {
                if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status});
                else resolveCompletion(${status});
                Assert(false);
            }
            `);
        }
        if (this.AssignmentRestElement) {
            var status = compileConcreteCompletion(this.AssignmentRestElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        }
        ctx.code(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status});
        else resolveCompletion(${status});
        `);
    },

    'AssignmentPropertyList: AssignmentPropertyList , AssignmentProperty',
    function(ctx, value) {
        throw Error('not yet implemented'); // TODO
        this.AssignmentPropertyList.compileDestructuringAssignmentEvaluation(ctx, value);
        this.AssignmentProperty.compileDestructuringAssignmentEvaluation(ctx, value);
    },

    'AssignmentProperty: IdentifierReference Initializer[opt]',
    function(ctx, value) {
        var P = this.IdentifierReference.StringValue().quote();
        var lref = ctx.ResolveBinding(P, undefined, this.strict);
        var v = ctx.GetV(value, P);
        if (this.Initializer) {
            ctx.code(`
            if( ${v} === undefined) {
            `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.code(`
            var ${v} = GetValue(${defaultValue});
            `);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                ctx.code(`
                var hasNameProperty = HasOwnProperty(${v}, "name");
                if (hasNameProperty === false) SetFunctionName(${v}, ${P});
                `);
            }
            ctx.code(`
            }
            `);
        }
        ctx.PutValue(lref, v);
    },

    'AssignmentProperty: PropertyName : AssignmentElement',
    function(ctx, value) {
        var name = this.PropertyName.compileEvaluation(ctx);
        this.AssignmentElement.compileKeyedDestructuringAssignmentEvaluation(ctx, value, name);
    },
]);

// 12.15.5.3
Runtime_Semantics('compileIteratorDestructuringAssignmentEvaluation', [

    'AssignmentElementList: AssignmentElisionElement',
    function(ctx, iteratorRecord) {
        this.AssignmentElisionElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'AssignmentElementList: AssignmentElementList , AssignmentElisionElement',
    function(ctx, iteratorRecord) {
        throw Error('not yet implemented'); // TODO
        this.AssignmentElementList.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        this.AssignmentElisionElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'AssignmentElisionElement: AssignmentElement',
    function(ctx, iteratorRecord) {
        this.AssignmentElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'AssignmentElisionElement: Elision AssignmentElement',
    function(ctx, iteratorRecord) {
        throw Error('not yet implemented'); // TODO
        this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        this.AssignmentElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'Elision: ,',
    function(ctx, iteratorRecord) {
        throw Error('not yet implemented'); // TODO
        ctx.code(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
        }
        `);
    },

    'Elision: Elision ,',
    function(ctx, iteratorRecord) {
        throw Error('not yet implemented'); // TODO
        this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        ctx.code(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
        }
        `);
    },

    'AssignmentElement: DestructuringAssignmentTarget Initializer[opt]',
    function(ctx, iteratorRecord) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.compileEvaluation(ctx);
        }
        var value = ctx.allocVar();
        ctx.code(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
            else {
                var value = concreteCompletion(IteratorValue(next));
                var ${value} = value;
                if (${value}.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(${value});
            }
        }
        if (${iteratorRecord}.Done === true) var ${value} = undefined;
        `);
        if (this.Initializer) {
            ctx.code(`
            if(${value} === undefined) {
            `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = ctx.GetValue(defaultValue);
            ctx.code(`
            } else var ${v} = ${value};
            `);
        } else var v = value;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var nestedAssignmentPattern = this.DestructuringAssignmentTarget.LeftHandSideExpression.AssignmentPattern;
            nestedAssignmentPattern.compileDestructuringAssignmentEvaluation(ctx, v);
            return;
        }
        if (this.Initializer && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            ctx.code(`
            if(${value} === undefined ){
                var hasNameProperty = HasOwnProperty(${v}, "name");
                if (hasNameProperty === false) SetFunctionName(${v}, GetReferencedName(${lref}));
            }
            `);
        }
        ctx.PutValue(lref, v);
    },

    'AssignmentRestElement: ... DestructuringAssignmentTarget',
    function(ctx, iteratorRecord) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.compileEvaluation(ctx);
        }
        var A = ctx.allocVar();
        ctx.code(`
        var ${A} = ArrayCreate(0);
        var n = 0;
        while (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
            else {
                var nextValue = concreteCompletion(IteratorValue(next));
                if (nextValue.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(nextValue);
                var status = CreateDataProperty(${A}, ToString(n), nextValue);
                Assert(status === true);
                n++;
            }
        }
        `);
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            ctx.PutValue(lref, A);
            return;
        }
        var nestedAssignmentPattern = this.DestructuringAssignmentTarget.LeftHandSideExpression.AssignmentPattern;
        nestedAssignmentPattern.compileDestructuringAssignmentEvaluation(ctx, A);
    },

]);

// 12.15.5.4
Runtime_Semantics('compileKeyedDestructuringAssignmentEvaluation', [

    'AssignmentElement: DestructuringAssignmentTarget Initializer[opt]',
    function(ctx, value, propertyName) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.compileEvaluation(ctx);
        }
        var v = ctx.GetV(value, propertyName);
        if (this.Initializer) {
            ctx.code(`
            if( ${v} === undefined) {
            `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var rhsValue = ctx.GetValue(defaultValue);
            ctx.code(`
            } else var ${rhsValue} = ${v};
            `);
        } else var rhsValue = v;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var assignmentPattern = this.DestructuringAssignmentTarget.LeftHandSideExpression.AssignmentPattern;
            assignmentPattern.compileDestructuringAssignmentEvaluation(ctx, rhsValue);
            return;
        }
        if (this.Initializer && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            ctx.code(`
            if( ${v} === undefined) {
                var hasNameProperty = HasOwnProperty(${rhsValue}, "name");
                if (hasNameProperty === false) SetFunctionName(${rhsValue}, GetReferencedName(${lref}));
            }
            `);
        }
        ctx.PutValue(lref, rhsValue);
    },
]);

// 12.16.3
Runtime_Semantics('compileEvaluation', [

    'Expression: Expression , AssignmentExpression',
    function(ctx) {
        var lref = this.Expression.compileEvaluation(ctx);
        ctx.GetValue(lref);
        var rref = this.AssignmentExpression.compileEvaluation(ctx);
        return ctx.GetValue(rref);
    },
]);

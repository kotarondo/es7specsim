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
        var text = `(function*(literals){
            try{
                ${this.codes.join('\n')}
            } catch(e) {
                console.log(e); // for debug
            }
        })`;
        try {
            var g = eval(text);
        } catch (e) {
            console.log(text); // for debug
            console.log(e); // for debug
        }
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

    $(text) {
        this.codes.push(text);
    }
    _(text) {
        var r = this.allocVar();
        this.$(`var ${r} = ${text};`);
        return r;
    }
    Assert(expr) {
        this.$(`Assert(${expr});`);
    }
    GetValue(ref) {
        return this._(`GetValue(${ref})`);
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
    CreateDataPropertyOrThrow(O, P, V) {
        return this._(`CreateDataPropertyOrThrow(${O}, ${P}, ${V})`);
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
    ToNumber(argument) {
        return this._(`ToNumber(${argument})`);
    }
    GetIterator(obj, method) {
        return this._(`GetIterator(${obj}, ${method})`);
    }
    CreateIterResultObject(value, done) {
        return this._(`CreateIterResultObject(${value}, ${done})`);
    }
    NewDeclarativeEnvironment(E) {
        return this._(`NewDeclarativeEnvironment(${E})`);
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
        return ctx._(`${ctx.literal(this)}.Evaluation()`);
    },

    'FunctionStatementList: [empty]',
    function(ctx) {},
]);

// 14.2.16
Runtime_Semantics('compileEvaluation', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function(ctx) {
        return this._(`${ctx.literal(this)}.Evaluation()`);
    },
]);

// 14.3.8
Runtime_Semantics('compileDefineMethod', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(ctx, object, functionPrototype) {
        var _this = ctx.literal(this);
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        ctx.$(`
        var scope = running_execution_context.LexicalEnvironment;
        if (${functionPrototype} !== undefined) var kind = 'Normal';
        else var kind = 'Method';
        var closure = FunctionCreate(kind, ${_this}.StrictFormalParameters, ${_this}.FunctionBody, scope, ${strict}, ${functionPrototype});
        MakeMethod(closure, ${object});
        `);
        return ctx._(`Record({ Key: ${propKey}, Closure: closure })`);
    },
]);

// 14.3.9
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(ctx, object, enumerable) {
        var methodDef = this.compileDefineMethod(ctx, object);
        ctx.$(`
        SetFunctionName(${methodDef}.Closure, ${methodDef}.Key);
        var desc = PropertyDescriptor({ Value: ${methodDef}.Closure, Writable: true, Enumerable: ${enumerable}, Configurable: true });
        DefinePropertyOrThrow(${object}, ${methodDef}.Key, desc);
        `);
    },

    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    function(ctx, object, enumerable) {
        var _this = ctx.literal(this);
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        ctx.$(`
        var scope = running_execution_context.LexicalEnvironment;
        var formalParameterList = Production['FormalParameters: [empty]']([]);
        var closure = FunctionCreate('Method', formalParameterList, ${_this}.FunctionBody, scope, ${strict});
        MakeMethod(closure, ${object});
        SetFunctionName(closure, ${propKey}, "get");
        var desc = PropertyDescriptor({ Get: closure, Enumerable: ${enumerable}, Configurable: true });
        DefinePropertyOrThrow(${object}, ${propKey}, desc);
        `);
    },

    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function(ctx, object, enumerable) {
        var _this = ctx.literal(this);
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        ctx.$(`
        var scope = running_execution_context.LexicalEnvironment;
        var closure = FunctionCreate('Method', ${_this}.PropertySetParameterList, ${_this}.FunctionBody, scope, ${strict});
        MakeMethod(closure, ${object});
        SetFunctionName(closure, ${propKey}, "set");
        var desc = PropertyDescriptor({ Set: closure, Enumerable: ${enumerable}, Configurable: true });
        DefinePropertyOrThrow(${object}, ${propKey}, desc);
        `);
    },
]);

// 14.4.13
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function(ctx, object, enumerable) {
        var _this = ctx.literal(this);
        var propKey = this.PropertyName.compileEvaluation(ctx);
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        ctx.$(`
        var scope = running_execution_context.LexicalEnvironment;
        var closure = GeneratorFunctionCreate('Method', ${_this}.StrictFormalParameters, ${_this}.GeneratorBody, scope, ${strict});
        MakeMethod(closure, ${object});
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        SetFunctionName(closure, ${propKey});
        var desc = PropertyDescriptor({ Value: closure, Writable: true, Enumerable: ${enumerable}, Configurable: true });
        DefinePropertyOrThrow(${object}, ${propKey}, desc);
        `);
    },
]);

// 14.4.14
Runtime_Semantics('compileEvaluation', [

    'GeneratorExpression: function * ( FormalParameters ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function(ctx) {
        return ctx._(`${ctx.literal(this)}.Evaluation()`);
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
        ctx.$(`
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
        ctx.$(`
                var received = ${received};
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
        ctx.$(`
                var received = ${received};
                } else {
                    IteratorClose(iterator, Completion({ Type: 'normal', Value: empty, Target: empty }));
                    throw $TypeError();
                }
            } else {
                Assert(received.Type === 'return');
                var _return = GetMethod(iterator, "return");
                if (_return === undefined) resolveCompletion(received); // always abrupt
                var innerReturnResult = Call(_return, iterator, [received.Value]);
                if (Type(innerReturnResult) !== 'Object') throw $TypeError();
                var done = IteratorComplete(innerReturnResult);
                if (done === true) {
                    var value = IteratorValue(innerReturnResult);
                    throw Completion({ Type: 'return', Value: value, Target: empty });
                }
        `);

        var received = compileConcreteCompletion(compileGeneratorYield(ctx, 'innerReturnResult'));
        ctx.$(`
                var received = ${received};
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
        var [lex, classScope, classScopeEnvRec, currentContext, proto, F] = ctx.allocVars();
        ctx.$(`
        var ${lex} = running_execution_context.LexicalEnvironment;
        var ${classScope} = NewDeclarativeEnvironment(${lex});
        var ${classScopeEnvRec} = ${classScope}.EnvironmentRecord;
        `);
        if (className !== undefined) {
            ctx.$(`
            ${classScopeEnvRec}.CreateImmutableBinding(${className}, true);
            `);
        }
        if (!this.ClassHeritage) {
            ctx.$(`
            var protoParent = currentRealm.Intrinsics['%ObjectPrototype%'];
            var constructorParent = currentRealm.Intrinsics['%FunctionPrototype%'];
            `);
        } else {
            ctx.$(`
            var ${currentContext} = running_execution_context;
            running_execution_context.LexicalEnvironment = ${classScope};
            `);
            var superclass = compileConcreteCompletion(ctx, ctx.GetValue(this.ClassHeritage.compileEvaluation(ctx)));
            ctx.$(`
            Assert(${currentContext} === running_execution_context);
            running_execution_context.LexicalEnvironment = ${lex};
            ReturnIfAbrupt(${superclass});
            if (${superclass} === null) {
                var protoParent = null;
                var constructorParent = currentRealm.Intrinsics['%FunctionPrototype%'];
            } else if (IsConstructor(${superclass}) === false) throw $TypeError();
            else {
                var protoParent = Get(${superclass}, "prototype");
                if (Type(protoParent) !== 'Object' && Type(protoParent) !== 'Null') throw $TypeError();
                var constructorParent = ${superclass};
            }
            `);
        }
        ctx.$(`
        var ${proto} = ObjectCreate(protoParent);
        `);
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
        ctx.$(`
        running_execution_context.LexicalEnvironment = ${classScope};
        var constructorInfo = ${ctx.literal(constructor)}.DefineMethod(${proto}, constructorParent);
        var ${F} = constructorInfo.Closure;
        `);
        if (this.ClassHeritage) ctx.$(`${F}.ConstructorKind = "derived";`);
        ctx.$(`
        MakeConstructor(${F}, false, ${proto});
        MakeClassConstructor(${F});
        CreateMethodProperty(${proto}, "constructor", ${F});
        `);
        if (!this.ClassBody) var methods = [];
        else var methods = this.ClassBody.NonConstructorMethodDefinitions();
        for (var m of methods) {
            if (m.IsStatic() === false) {
                var status = compileConcreteCompletion(m.compilePropertyDefinitionEvaluation(ctx, proto, false));
            } else {
                var status = compileConcreteCompletion(m.compilePropertyDefinitionEvaluation(ctx, F, false));
            }
            ctx.$(`
            if (${status}.is_an_abrupt_completion()) {
                running_execution_context.LexicalEnvironment = ${lex};
                resolveCompletion(${status}); // always abrupt
            }
            `);
        }
        ctx.$(`running_execution_context.LexicalEnvironment = ${lex};`);
        if (className !== undefined) {
            ctx.$(`${classScopeEnvRec}.InitializeBinding(${className}, ${F});`);
        }
        return F;
    },
]);

// 14.5.15
Runtime_Semantics('compileBindingClassDeclarationEvaluation', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function(ctx) {
        var className = this.BindingIdentifier.StringValue().quote();
        var value = this.ClassTail.compileClassDefinitionEvaluation(ctx, className);
        ctx.$(`
        var hasNameProperty = HasOwnProperty(${value}, "name");
        if (hasNameProperty === false) SetFunctionName(${value}, ${className});
        var env = running_execution_context.LexicalEnvironment;
        InitializeBoundName(${className}, ${value}, env);
        `);
        return value;
    },

    'ClassDeclaration: class ClassTail',
    function(ctx) {
        return this.ClassTail.compileClassDefinitionEvaluation(ctx, undefined);
    },
]);

// 14.5.16
Runtime_Semantics('compileEvaluation', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function(ctx) {
        return this.compileBindingClassDeclarationEvaluation(ctx);
    },

    'ClassExpression: class BindingIdentifier[opt] ClassTail',
    function(ctx) {
        if (!this.BindingIdentifier) var className = undefined;
        else var className = this.BindingIdentifier.StringValue().quote();
        var value = this.ClassTail.compileClassDefinitionEvaluation(ctx, className);
        if (className !== undefined) {
            ctx.$(`
            var hasNameProperty = HasOwnProperty(${value}, "name");
            if (hasNameProperty === false) {
                SetFunctionName(${value}, ${className});
            }
            `);
        }
        return value;
    },
]);

// 13.1.7
Runtime_Semantics('compileLabelledEvaluation', [

    'BreakableStatement: IterationStatement',
    function(ctx, labelSet) {
        var stmtResult = compileConcreteCompletion(this.IterationStatement.compileLabelledEvaluation(ctx, labelSet));
        ctx.$(`
        if (${stmtResult}.Type === 'break') {
            if (${stmtResult}.Target === empty) {
                var ${stmtResult} = NormalCompletion(undefined);
            }
        }
        resolveCompletion(${stmtResult});
        `);
    },

    'BreakableStatement: SwitchStatement',
    function(ctx, labelSet) {
        var stmtResult = compileConcreteCompletion(this.SwitchStatement.compileEvaluation(ctx));
        ctx.$(`
        if (${stmtResult}.Type === 'break') {
            if (${stmtResult}.Target === empty) {
                ${stmtResult} = NormalCompletion(undefined);
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
        var newLabelSet = `[]`;
        this.compileLabelledEvaluation(ctx, newLabelSet);
    },
]);

// 13.2.13
Runtime_Semantics('compileEvaluation', [

    'Block: { }',
    function(ctx) {},

    'Block: { StatementList }',
    function(ctx) {
        var _this = ctx.literal(this);
        var [currentContext, oldEnv, blockEnv] = ctx.allocVars();
        ctx.$(`
        var ${currentContext} = running_execution_context;
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${blockEnv} = NewDeclarativeEnvironment(${oldEnv});
        BlockDeclarationInstantiation(${_this}.StatementList, ${blockEnv});
        running_execution_context.LexicalEnvironment = ${blockEnv};
        `);
        var blockValue = compileConcreteCompletion(this.StatementList.compileEvaluation(ctx));
        ctx.$(`
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
            ctx.$(`
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
            ctx.$(`
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
        ctx.RequireObjectCoercible(value);
        this.ObjectBindingPattern.compileBindingInitialization(ctx, value, environment);
    },

    'BindingPattern: ArrayBindingPattern',
    function(ctx, value, environment) {
        var [iterator, iteratorRecord] = ctx.allocVars();
        ctx.$(`
        var ${iterator} = GetIterator(${value});
        var ${iteratorRecord} = Record({ Iterator: ${iterator}, Done: false });
        `);
        var result = compileConcreteCompletion(this.ArrayBindingPattern.compileIteratorBindingInitialization(ctx, iteratorRecord, environment));
        ctx.$(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${result});
        else resolveCompletion(${result});
        `);
    },

    'ObjectBindingPattern: { }',
    function(ctx, value, environment) {},

    'BindingPropertyList: BindingPropertyList , BindingProperty',
    function(ctx, value, environment) {
        this.BindingPropertyList.compileBindingInitialization(ctx, value, environment);
        this.BindingProperty.compileBindingInitialization(ctx, value, environment);
    },

    'BindingProperty: SingleNameBinding',
    function(ctx, value, environment) {
        var name = this.SingleNameBinding.BoundNames()[0].quote();
        this.SingleNameBinding.compileKeyedBindingInitialization(ctx, value, environment, name);
    },

    'BindingProperty: PropertyName : BindingElement',
    function(ctx, value, environment) {
        var P = this.PropertyName.compileEvaluation(ctx);
        this.BindingElement.compileKeyedBindingInitialization(ctx, value, environment, P);
    },
]);

// 13.3.3.6
Runtime_Semantics('compileIteratorBindingInitialization', [

    'ArrayBindingPattern: [ ]',
    'ArrayBindingPattern: [ Elision ]',
    function(ctx, iteratorRecord, environment) {
        this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'ArrayBindingPattern: [ Elision[opt] BindingRestElement ]',
    function(ctx, iteratorRecord, environment) {
        if (this.Elision) {
            this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        }
        this.BindingRestElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList ]',
    function(ctx, iteratorRecord, environment) {
        this.BindingElementList.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , ]',
    function(ctx, iteratorRecord, environment) {
        this.BindingElementList.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision ]',
    function(ctx, iteratorRecord, environment) {
        this.BindingElementList.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
        this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement ]',
    function(ctx, iteratorRecord, environment) {
        this.BindingElementList.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
        if (this.Elision) {
            this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        }
        this.BindingRestElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'BindingElementList: BindingElisionElement',
    function(ctx, iteratorRecord, environment) {
        this.BindingElisionElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'BindingElementList: BindingElementList , BindingElisionElement',
    function(ctx, iteratorRecord, environment) {
        this.BindingElementList.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
        this.BindingElisionElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'BindingElisionElement: BindingElement',
    function(ctx, iteratorRecord, environment) {
        this.BindingElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'BindingElisionElement: Elision BindingElement',
    function(ctx, iteratorRecord, environment) {
        this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord);
        this.BindingElement.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'BindingElement: SingleNameBinding',
    function(ctx, iteratorRecord, environment) {
        this.SingleNameBinding.compileIteratorBindingInitialization(ctx, iteratorRecord, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(ctx, iteratorRecord, environment) {
        var v = ctx.allocVar();
        var bindingId = this.BindingIdentifier.StringValue().quote();
        var lhs = ctx.ResolveBinding(bindingId, environment, this.strict);
        ctx.$(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
            else {
                var ${v} = concreteCompletion(IteratorValue(next));
                if (${v}.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(${v});
            }
        }
        if (${iteratorRecord}.Done === true) var ${v} = undefined;
        `);
        if (this.Initializer) {
            ctx.$(` if(${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.$(`var ${v} = GetValue(${defaultValue});`);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                ctx.$(`
                var hasNameProperty = HasOwnProperty(${v}, "name");
                if (hasNameProperty === false) SetFunctionName(${v}, ${bindingId});
                `);
            }
            ctx.$(` } `);
        }
        ctx.$(`
        if (${environment} === undefined) PutValue(${lhs}, ${v});
        else InitializeReferencedBinding(${lhs}, ${v});
        `);
    },

    'BindingElement: BindingPattern Initializer[opt]',
    function(ctx, iteratorRecord, environment) {
        var v = ctx.allocVar();
        ctx.$(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
            else {
                var ${v} = concreteCompletion(IteratorValue(next));
                if (${v}.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(${v});
            }
        }
        if (${iteratorRecord}.Done === true) var ${v} = undefined;
        `);
        if (this.Initializer) {
            ctx.$(` if(${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.$(`var ${v} = GetValue(${defaultValue});`);
            ctx.$(` } `);
        }
        this.BindingPattern.compileBindingInitialization(ctx, v, environment);
    },

    'BindingRestElement: ... BindingIdentifier',
    function(ctx, iteratorRecord, environment) {
        return ctx._(`${ctx.literal(this)}.IteratorBindingInitialization(${iteratorRecord}, ${environment})`);
    },

    'BindingRestElement: ... BindingPattern',
    function(ctx, iteratorRecord, environment) {
        var A = ctx._(`ArrayCreate(0)`);
        ctx.$(`
        var n = 0;
        while (true) {
            if (${iteratorRecord}.Done === false) {
                var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
                if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(next);
                if (next === false) ${iteratorRecord}.Done = true;
            }
            if (${iteratorRecord}.Done === true) {
                break;
            }
            var nextValue = concreteCompletion(IteratorValue(next));
            if (nextValue.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(nextValue);
            var status = CreateDataProperty(${A}, ToString(n), nextValue);
            Assert(status === true);
            n++;
        }
        `);
        this.BindingPattern.compileBindingInitialization(ctx, A, environment);
    },
]);

// 13.3.3.7
Runtime_Semantics('compileKeyedBindingInitialization', [

    'BindingElement: BindingPattern Initializer[opt]',
    function(ctx, value, environment, propertyName) {
        var v = ctx.GetV(value, propertyName);
        if (this.Initializer) {
            ctx.$(` if(${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.$(`var ${v} = GetValue(${defaultValue});`);
            ctx.$(` } `);
        }
        this.BindingPattern.compileBindingInitialization(ctx, v, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(ctx, value, environment, propertyName) {
        var bindingId = this.BindingIdentifier.StringValue().quote();
        var lhs = ctx.ResolveBinding(bindingId, environment, this.strict);
        var v = ctx.GetV(value, propertyName);
        if (this.Initializer) {
            ctx.$(` if(${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.$(`var ${v} = GetValue(${defaultValue});`);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                ctx.$(`
                var hasNameProperty = HasOwnProperty(${v}, "name");
                if (hasNameProperty === false) SetFunctionName(${v}, ${bindingId});
                `);
            }
            ctx.$(` } `);
        }
        ctx.$(`
        if (${environment} === undefined) PutValue(${lhs}, ${v});
        else InitializeReferencedBinding(${lhs}, ${v});
        `);
    },
]);

// 13.4.1
Runtime_Semantics('compileEvaluation', [

    'EmptyStatement: ;',
    function(ctx) {},
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
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ctx.ToBoolean(ctx.GetValue(exprRef));
        ctx.$(` if (${exprValue} === true) { `);
        this.Statement1.compileEvaluation(ctx);
        ctx.$(` } else { `);
        this.Statement2.compileEvaluation(ctx);
        ctx.$(` } `);
    },

    'IfStatement: if ( Expression ) Statement',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ctx.ToBoolean(ctx.GetValue(exprRef));
        ctx.$(` if (${exprValue} !== false) { `);
        this.Statement.compileEvaluation(ctx);
        ctx.$(` } `);
    },
]);

// 13.7.2.6
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(ctx, labelSet) {
        ctx.$(` while (true) { `);
        var stmt = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
        ctx.$(`
            if (LoopContinues(${stmt}, ${labelSet}) === false) resolveCompletion(${stmt}); // always abrupt
        `);
        var exprRef = this.Expression.compileEvaluation(ctx);
        ctx.$(`
            var exprValue = GetValue(${exprRef});
            if (ToBoolean(exprValue) === false) break;
        `);
        ctx.$(` } `);
    },
]);

// 13.7.3.6
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: while ( Expression ) Statement',
    function(ctx, labelSet) {
        ctx.$(` while (true) { `);
        var exprRef = this.Expression.compileEvaluation(ctx);
        ctx.$(`
            var exprValue = GetValue(${exprRef});
            if (ToBoolean(exprValue) === false) break;
        `);
        var stmt = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
        ctx.$(`
            if (LoopContinues(${stmt}, ${labelSet}) === false) resolveCompletion(${stmt}); // always abrupt
        `);
        ctx.$(` } `);
    },
]);

// 13.7.4.7
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        if (this.Expression1) {
            var exprRef = this.Expression1.compileEvaluation(ctx);
            ctx.GetValue(exprRef);
        }
        compileForBodyEvaluation(ctx, this.Expression2, this.Expression3, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        var varDcl = this.VariableDeclarationList.compileEvaluation(ctx);
        compileForBodyEvaluation(ctx, this.Expression1, this.Expression2, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(ctx, labelSet) {
        var [oldEnv, loopEnv, loopEnvRec] = ctx.allocVars();
        ctx.$(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${loopEnv} = NewDeclarativeEnvironment(${oldEnv});
        var ${loopEnvRec} = ${loopEnv}.EnvironmentRecord;
        `);
        var isConst = this.LexicalDeclaration.IsConstantDeclaration();
        var boundNames = this.LexicalDeclaration.BoundNames();
        for (var dn of boundNames) {
            if (isConst === true) {
                ctx.$(`${loopEnvRec}.CreateImmutableBinding(${dn.quote()}, true);`);
            } else {
                ctx.$(`${loopEnvRec}.CreateMutableBinding(${dn.quote()}, false);`);
            }
        }
        ctx.$(`running_execution_context.LexicalEnvironment = ${loopEnv};`);
        var forDcl = compileConcreteCompletion(this.LexicalDeclaration.compileEvaluation(ctx));
        ctx.$(`
        if (${forDcl}.is_an_abrupt_completion()) {
            running_execution_context.LexicalEnvironment = ${oldEnv};
            resolveCompletion(${forDcl}); // always abrupt
        }
        `);
        if (isConst === false) var perIterationLets = boundNames;
        else var perIterationLets = [];
        var bodyResult = compileConcreteCompletion(compileForBodyEvaluation(ctx, this.Expression1, this.Expression2, this.Statement, perIterationLets, labelSet));
        ctx.$(`
        running_execution_context.LexicalEnvironment = ${oldEnv};
        resolveCompletion(${bodyResult});
        `);
    },
]);

// 13.7.4.8
function compileForBodyEvaluation(ctx, test, increment, stmt, perIterationBindings, labelSet) {
    var perIterationBindings = ctx.literal(perIterationBindings);
    ctx.$(`
    CreatePerIterationEnvironment(${perIterationBindings});
    `);
    ctx.$(` while (true) { `);
    if (test) {
        var testRef = test.compileEvaluation(ctx);
        ctx.$(`
        var testValue = GetValue(${testRef});
        if (ToBoolean(testValue) === false) break;
        `);
    }
    var result = compileConcreteCompletion(stmt.compileEvaluation(ctx));
    ctx.$(`
    if (LoopContinues(${result}, ${labelSet}) === false) resolveCompletion(${result}); // always abrupt
    CreatePerIterationEnvironment(${perIterationBindings});
    `);
    if (increment) {
        var incRef = increment.compileEvaluation(ctx);
        ctx.GetValue(incRef);
    }
    ctx.$(` } `);
}

// 13.7.5.9
Runtime_Semantics('compileBindingInitialization', [

    'ForDeclaration: LetOrConst ForBinding',
    function(ctx, value, environment) {
        this.ForBinding.compileBindingInitialization(ctx, value, environment);
    },
]);

// 13.7.5.10
Runtime_Semantics('compileBindingInstantiation', [

    'ForDeclaration: LetOrConst ForBinding',
    function(ctx, environment) {
        return ctx._(`${ctx.literal(this)}.BindingInstantiation(${environment})`);
    },
]);

// 13.7.5.11
Runtime_Semantics('compileLabelledEvaluation', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, [], this.Expression, 'enumerate');
        compileForIn_OfBodyEvaluation(ctx, this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, [], this.Expression, 'enumerate');
        compileForIn_OfBodyEvaluation(ctx, this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, this.ForDeclaration.BoundNames(), this.Expression, 'enumerate');
        compileForIn_OfBodyEvaluation(ctx, this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },

    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, [], this.AssignmentExpression, 'iterate');
        compileForIn_OfBodyEvaluation(ctx, this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, [], this.AssignmentExpression, 'iterate');
        compileForIn_OfBodyEvaluation(ctx, this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(ctx, labelSet) {
        var keyResult = compileForIn_OfHeadEvaluation(ctx, this.ForDeclaration.BoundNames(), this.AssignmentExpression, 'iterate');
        compileForIn_OfBodyEvaluation(ctx, this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },
]);

// 13.7.5.12
function compileForIn_OfHeadEvaluation(ctx, TDZnames, expr, iterationKind) {
    var currentContext = ctx._(`running_execution_context`);
    var oldEnv = ctx._(`running_execution_context.LexicalEnvironment`);
    if (TDZnames.length > 0) {
        Assert(!TDZnames.contains_any_duplicate_entries());
        var TDZ = ctx.NewDeclarativeEnvironment(oldEnv);
        var TDZEnvRec = ctx._(`${TDZ}.EnvironmentRecord`);
        for (var name of TDZnames) {
            ctx.$(`${TDZEnvRec}.CreateMutableBinding(${name.quote()}, false);`);
        }
        ctx.$(`running_execution_context.LexicalEnvironment = ${TDZ};`);
    }
    var exprRef = compileConcreteCompletion(expr.compileEvaluation(ctx));
    ctx.$(`
    Assert(${currentContext} === running_execution_context);
    running_execution_context.LexicalEnvironment = ${oldEnv};
    ReturnIfAbrupt(${exprRef});
    `);
    var exprValue = ctx.GetValue(exprRef);
    if (iterationKind === 'enumerate') {
        ctx.$(`
        if (${exprValue} === null || ${exprValue} === undefined) {
            throw Completion({ Type: 'break', Value: empty, Target: empty });
        }
        `);
        var obj = ctx.ToObject(exprValue);
        return ctx._(`EnumerateObjectProperties(${obj})`);
    } else {
        Assert(iterationKind === 'iterate');
        return ctx.GetIterator(exprValue);
    }
}

// 13.7.5.13
function compileForIn_OfBodyEvaluation(ctx, lhs, stmt, iterator, lhsKind, labelSet) {
    var oldEnv = ctx._(`running_execution_context.LexicalEnvironment`);
    var destructuring = lhs.IsDestructuring();
    if (destructuring === true && lhsKind === 'assignment') {
        Assert(lhs.is('LeftHandSideExpression'));
        var assignmentPattern = lhs.AssignmentPattern;
    }
    ctx.$(` while (true) { `);
    var nextValue = ctx.allocVar();
    ctx.$(`
        var nextResult = IteratorStep(${iterator});
        if (nextResult === false) break;
        var ${nextValue} = IteratorValue(nextResult);
    `);
    if (lhsKind === 'assignment' || lhsKind === 'varBinding') {
        if (destructuring === false) {
            var lhsRef = compileConcreteCompletion(lhs.compileEvaluation(ctx));
        }
    } else {
        Assert(lhsKind === 'lexicalBinding');
        Assert(lhs.is('ForDeclaration'));
        var iterationEnv = ctx.NewDeclarativeEnvironment(oldEnv);
        lhs.compileBindingInstantiation(ctx, iterationEnv);
        ctx.$(`running_execution_context.LexicalEnvironment = ${iterationEnv};`);
        if (destructuring === false) {
            Assert(lhs.BoundNames().length === 1);
            var lhsName = lhs.BoundNames()[0];
            var lhsRef = ctx._(`NormalCompletion(ResolveBinding(${lhsName.quote()}, undefined, ${lhs.strict}))`);
        }
    }
    if (destructuring === false) {
        var status = ctx.allocVar();
        ctx.$(`
        if (${lhsRef}.is_an_abrupt_completion()) {
            var ${status} = ${lhsRef};
        } else {
        `);
        if (lhsKind === 'lexicalBinding') {
            ctx.$(`
            var ${status} = concreteCompletion(InitializeReferencedBinding(${lhsRef}.Value, ${nextValue}));
            `);
        } else {
            ctx.$(`
            var ${status} = concreteCompletion(PutValue(${lhsRef}.Value, ${nextValue}));
            `);
        }
        ctx.$(` } `);
    } else {
        if (lhsKind === 'assignment') {
            var status = compileConcreteCompletion(assignmentPattern.compileDestructuringAssignmentEvaluation(ctx, nextValue));
        } else if (lhsKind === 'varBinding') {
            Assert(lhs.is('ForBinding'));
            var status = compileConcreteCompletion(lhs.compileBindingInitialization(ctx, nextValue, undefined));
        } else {
            Assert(lhsKind === 'lexicalBinding');
            Assert(lhs.is('ForDeclaration'));
            var status = compileConcreteCompletion(lhs.compileBindingInitialization(ctx, nextValue, iterationEnv));
        }
    }
    ctx.$(`
    if (${status}.is_an_abrupt_completion()) {
        running_execution_context.LexicalEnvironment = ${oldEnv};
        return IteratorClose(iterator, ${status});
    }
    `);
    var result = compileConcreteCompletion(stmt.compileEvaluation(ctx));
    ctx.$(`
    running_execution_context.LexicalEnvironment = ${oldEnv};
    if (LoopContinues(${result}, ${labelSet}) === false) IteratorClose(${iterator}, ${result}); // always abrupt
    `);
    ctx.$(` } `); // end of while
}

// 13.7.5.14
Runtime_Semantics('compileEvaluation', [

    'ForBinding: BindingIdentifier',
    function(ctx) {
        var bindingId = this.BindingIdentifier.StringValue().quote();
        return ctx.ResolveBinding(bindingId, undefined, this.strict);
    },
]);

// 13.8.3
Runtime_Semantics('compileEvaluation', [

    'ContinueStatement: continue ;',
    function(ctx) {
        ctx.$(`
        throw Completion({ Type: 'continue', Value: empty, Target: empty });
        `);
    },

    'ContinueStatement: continue LabelIdentifier ;',
    function(ctx) {
        var label = this.LabelIdentifier.StringValue().quote();
        ctx.$(`
        throw Completion({ Type: 'continue', Value: empty, Target: ${label} });
        `);
    },
]);

// 13.9.3
Runtime_Semantics('compileEvaluation', [

    'BreakStatement: break ;',
    function(ctx) {
        ctx.$(`
        throw Completion({ Type: 'break', Value: empty, Target: empty });
        `);
    },

    'BreakStatement: break LabelIdentifier ;',
    function(ctx) {
        var label = this.LabelIdentifier.StringValue().quote();
        ctx.$(`
        throw Completion({ Type: 'break', Value: empty, Target: ${label} });
        `);
    },
]);

// 13.10.1
Runtime_Semantics('compileEvaluation', [

    'ReturnStatement: return ;',
    function(ctx) {
        ctx.$(`
        throw Completion({ Type: 'return', Value: undefined, Target: empty });
        `);
    },

    'ReturnStatement: return Expression ;',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        var exprValue = ctx.GetValue(exprRef);
        ctx.$(`
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
        ctx.$(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${newEnv} = NewObjectEnvironment(${obj}, ${oldEnv});
        ${newEnv}.EnvironmentRecord.withEnvironment = true;
        running_execution_context.LexicalEnvironment = ${newEnv};
        `)
        var C = compileConcreteCompletion(this.Statement.compileEvaluation(ctx));
        ctx.$(`
        running_execution_context.LexicalEnvironment = ${oldEnv};
        resolveCompletion(${C});
        `)
    },
]);

// 13.12.9
Runtime_Semantics('compileCaseBlockEvaluation', [

    'CaseBlock: { }',
    function(ctx, input) {},

    'CaseBlock: { CaseClauses }',
    function(ctx, input) {
        var A = listCaseClauses(this.CaseClauses);
        var found = ctx._(false);
        for (var C of A) {
            ctx.$(` if (${found} === false) { `);
            var clauseSelector = C.compileCaseSelectorEvaluation(ctx);
            ctx.$(`var ${found} = (${input} === ${clauseSelector});`);
            ctx.$(` } `);
            ctx.$(` if (${found} === true) { `);
            C.compileEvaluation(ctx);
            ctx.$(` } `);
        }
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(ctx, input) {
        var A = listCaseClauses(this.CaseClauses1)
        var found = ctx._(false);
        for (var C of A) {
            ctx.$(` if (${found} === false) { `);
            var clauseSelector = C.compileCaseSelectorEvaluation(ctx);
            ctx.$(`var ${found} = (${input} === ${clauseSelector});`);
            ctx.$(` } `);
            ctx.$(` if (${found} === true) { `);
            C.compileEvaluation(ctx);
            ctx.$(` } `);
        }
        var foundInB = ctx._(false);
        var B = listCaseClauses(this.CaseClauses2);
        ctx.$(` if (${found} === false) { `);
        for (var C of B) {
            ctx.$(` if (${foundInB} === false) { `);
            var clauseSelector = C.compileCaseSelectorEvaluation(ctx);
            ctx.$(`var ${foundInB} = (${input} === ${clauseSelector});`);
            ctx.$(` } `);
            ctx.$(` if (${foundInB} === true) { `);
            C.compileEvaluation(ctx);
            ctx.$(` } `);
        }
        ctx.$(` } `);
        ctx.$(` if (${foundInB} !== true){ `);
        this.DefaultClause.compileEvaluation(ctx);
        for (var C of B) {
            C.compileEvaluation(ctx);
        }
        ctx.$(` } `);
    },
]);

// 13.12.10
Runtime_Semantics('compileCaseSelectorEvaluation', [

    'CaseClause: case Expression : StatementList[opt]',
    function(ctx) {
        var exprRef = this.Expression.compileEvaluation(ctx);
        return ctx.GetValue(exprRef);
    },
]);

// 13.12.11
Runtime_Semantics('compileEvaluation', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(ctx) {
        var _this = ctx.literal(this);
        var [oldEnv, blockEnv] = ctx.allocVars();
        var exprRef = this.Expression.compileEvaluation(ctx);
        var switchValue = ctx.GetValue(exprRef);
        ctx.$(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${blockEnv} = NewDeclarativeEnvironment(${oldEnv});
        BlockDeclarationInstantiation(${_this}.CaseBlock, ${blockEnv});
        running_execution_context.LexicalEnvironment = ${blockEnv};
        `);
        var R = compileConcreteCompletion(ctx, this.CaseBlock.compileCaseBlockEvaluation(ctx, switchValue));
        ctx.$(`
        running_execution_context.LexicalEnvironment = ${oldEnv};
        resolveCompletion(${R});
        `);
    },

    'CaseClause: case Expression :',
    function(ctx) {},

    'CaseClause: case Expression : StatementList',
    function(ctx) {
        this.StatementList.compileEvaluation(ctx);
    },

    'DefaultClause: default :',
    function(ctx) {},

    'DefaultClause: default : StatementList',
    function(ctx) {
        this.StatementList.compileEvaluation(ctx);
    },
]);

// 13.13.14
Runtime_Semantics('compileLabelledEvaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(ctx, labelSet) {
        var label = this.LabelIdentifier.StringValue();
        labelSet.push(label);
        var stmtResult = compileConcreteCompletion(ctx, this.LabelledItem.compileLabelledEvaluation(ctx, labelSet));
        ctx.$(`
        if (${stmtResult}.Type === 'break' && SameValue(${stmtResult}.Target, ${label.quote()}) === true) {
            var ${stmtResult} = NormalCompletion(${stmtResult}.Value);
        }
        resolveCompletion(${stmtResult});
        `);
    },

    'LabelledItem: Statement',
    function(ctx, labelSet) {
        if (this.Statement.is('LabelledStatement') || this.Statement.is('BreakableStatement')) {
            if (this.Statement.is('BreakableStatement')) {
                var labelSet = ctx.literal(labelSet);
            }
            return this.Statement.compileLabelledEvaluation(ctx, labelSet);
        } else {
            return this.Statement.compileEvaluation(ctx);
        }
    },

    'LabelledItem: FunctionDeclaration',
    function(ctx, labelSet) {
        return this.FunctionDeclaration.compileEvaluation(ctx);
    },
]);

// 13.13.15
Runtime_Semantics('compileEvaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(ctx) {
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
        ctx.$(`
        throw Completion({ Type: 'throw', Value: ${exprValue}, Target: empty });
        `);
    },
]);

// 13.15.7
Runtime_Semantics('compileCatchClauseEvaluation', [

    'Catch: catch ( CatchParameter ) Block',
    function(ctx, thrownValue) {
        var [oldEnv, catchEnv, catchEnvRec] = ctx.allocVars();
        ctx.$(`
        var ${oldEnv} = running_execution_context.LexicalEnvironment;
        var ${catchEnv} = NewDeclarativeEnvironment(${oldEnv});
        var ${catchEnvRec} = ${catchEnv}.EnvironmentRecord;
        `);
        for (var argName of this.CatchParameter.BoundNames()) {
            ctx.$(`
            ${catchEnvRec}.CreateMutableBinding(${argName.quote()}, false);
            `);
        }
        ctx.$(`
        running_execution_context.LexicalEnvironment = ${catchEnv};
        `);
        var status = compileConcreteCompletion(this.CatchParameter.compileBindingInitialization(ctx, thrownValue, catchEnv));
        ctx.$(`
        if (${status}.is_an_abrupt_completion()) {
            running_execution_context.LexicalEnvironment = ${oldEnv};
            resolveCompletion(${status}); // always abrupt
        }else{
        `);
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        ctx.$(`
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
        ctx.$(`
        if (${B}.Type === 'throw'){
        `);
        var V = ctx._(`${B}.Value`);
        var C = compileConcreteCompletion(this.Catch.compileCatchClauseEvaluation(ctx, V));
        ctx.$(`
        } else var ${C} = ${B};
        resolveCompletion(${C});
        `);
    },

    'TryStatement: try Block Finally',
    function(ctx) {
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        var F = compileConcreteCompletion(this.Finally.compileEvaluation(ctx));
        ctx.$(`
        if (${F}.Type === 'normal') var ${F} = ${B};
        resolveCompletion(${F});
        `);
    },

    'TryStatement: try Block Catch Finally',
    function(ctx) {
        var B = compileConcreteCompletion(this.Block.compileEvaluation(ctx));
        ctx.$(`
        if (${B}.Type === 'throw'){
        `);
        var V = ctx._(`${B}.Value`);
        var C = compileConcreteCompletion(this.Catch.compileCatchClauseEvaluation(ctx, V));
        ctx.$(`
        } else var ${C} = ${B};
        `);
        var F = compileConcreteCompletion(this.Finally.compileEvaluation(ctx));
        ctx.$(`
        if (${F}.Type === 'normal') var ${F} = ${C};
        resolveCompletion(${F});
        `);
    },
]);

// 13.16.1
Runtime_Semantics('compileEvaluation', [

    'DebuggerStatement: debugger ;',
    function(ctx) {
        ctx.$(`debugger;`);
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
        return ctx._(`ResolveThisBinding()`);
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
        return ctx._(this.StringLiteral.StringValue().quote());
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
        ctx.$(`
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
        return ctx._(`${ctx.literal(this)}.Evaluation()`);
    },

    'ArrayLiteral: [ ElementList ]',
    function(ctx) {
        var array = ctx._(`ArrayCreate(0)`);
        var len = this.ElementList.compileArrayAccumulation(ctx, array, 0);
        ctx.$(`_Set(${array}, "length", ToUint32(${len}), false);`);
        return array;
    },

    'ArrayLiteral: [ ElementList , Elision[opt] ]',
    function(ctx) {
        var array = ctx._(`ArrayCreate(0)`);
        var len = this.ElementList.compileArrayAccumulation(ctx, array, 0);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        ctx.$(`_Set(${array}, "length", ToUint32(${padding}+${len}), false);`);
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
        var obj = ctx._(`ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%'])`);
        this.PropertyDefinitionList.compilePropertyDefinitionEvaluation(ctx, obj, true);
        return obj;
    },

    'LiteralPropertyName: IdentifierName',
    function(ctx) {
        return ctx._(this.IdentifierName.StringValue().quote());
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
        var exprValue = this.AssignmentExpression.compileEvaluation(ctx);
        var propName = ctx.GetValue(exprValue);
        return ctx.ToPropertyKey(propName);
    },
]);

// 12.2.6.9
Runtime_Semantics('compilePropertyDefinitionEvaluation', [

    'PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition',
    function(ctx, object, enumerable) {
        this.PropertyDefinitionList.compilePropertyDefinitionEvaluation(ctx, object, enumerable);
        this.PropertyDefinition.compilePropertyDefinitionEvaluation(ctx, object, enumerable);
    },

    'PropertyDefinition: IdentifierReference',
    function(ctx, object, enumerable) {
        throw Error('not yet implemented'); // TODO
        var propName = this.IdentifierReference.StringValue().quote();
        var exprValue = this.IdentifierReference.compileEvaluation(ctx);
        var propValue = ctx.GetValue(exprValue);
        ctx.Assert(`${enumerable} === true`);
        ctx.CreateDataPropertyOrThrow(object, propName, propValue);
    },

    'PropertyDefinition: PropertyName : AssignmentExpression',
    function(ctx, object, enumerable) {
        var propKey = this.PropertyName.compileEvaluation(ctx);
        var exprValueRef = this.AssignmentExpression.compileEvaluation(ctx);
        var propValue = ctx.GetValue(exprValueRef);
        if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true) {
            ctx.$(`
            var hasNameProperty = HasOwnProperty(${propValue}, "name");
            if (hasNameProperty === false) SetFunctionName(${propValue}, ${propKey});
            `);
        }
        ctx.Assert(`${enumerable} === true`);
        ctx.CreateDataPropertyOrThrow(object, propKey, propValue);
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
    if (_arguments === empty) var argList = `[]`;
    else {
        var argList = _arguments.compileArgumentListEvaluation(ctx);
    }
    ctx.$(`
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
        ctx.$(`
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
    ctx.$(`
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
        var propertyKey = this.IdentifierName.StringValue().quote();
        if (this.strict) var strict = true;
        else var strict = false;
        return ctx._(`MakeSuperPropertyReference(${propertyKey}, ${strict})`);
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
        ctx.$(`${precedingArgs}.push(${arg});`);
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
        var lhs = this.LeftHandSideExpression.compileEvaluation(ctx);
        var r = ctx.allocVar();
        ctx.$(`
        var oldValue = ToNumber(GetValue(${lhs}));
        var newValue = oldValue + 1;
        PutValue(${lhs}, newValue);
        var ${r} = oldValue;
        `);
        return r;
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
        var expr = this.UnaryExpression.compileEvaluation(ctx);
        return ctx.ToNumber(ctx.GetValue(expr));
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
        ctx.$(`
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
        var lref = this.RelationalExpression.compileEvaluation(ctx);
        var lval = ctx.GetValue(lref);
        var rref = this.ShiftExpression.compileEvaluation(ctx);
        var rval = ctx.GetValue(rref);
        var r = ctx.allocVar();
        ctx.$(`
        var ${r} = AbstractRelationalComparison(${lval}, ${rval});
        if (${r} === undefined) ${r} = false;
        `);
        return r;
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
        ctx.$(`
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
        ctx.$(` if (${lval} === true) { `);
        var trueRef = this.AssignmentExpression1.compileEvaluation(ctx);
        ctx.$(`var ${r} = GetValue(${trueRef});`);
        ctx.$(` } else { `);
        var falseRef = this.AssignmentExpression2.compileEvaluation(ctx);
        ctx.$(`var ${r} = GetValue(${falseRef});`);
        ctx.$(` } `);
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
                ctx.$(`
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
            ctx.$(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum * rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: /=')) {
            ctx.$(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum / rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: %=')) {
            ctx.$(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum % rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: +=')) {
            ctx.$(`
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
            ctx.$(`
            var lnum = ToNumber(${lval});
            var rnum = ToNumber(${rval});
            var ${r} = lnum - rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: <<=')) {
            ctx.$(`
            var lnum = ToInt32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum << shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: >>=')) {
            ctx.$(`
            var lnum = ToInt32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum >> shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: >>>=')) {
            ctx.$(`
            var lnum = ToUint32(${lval});
            var rnum = ToUint32(${rval});
            var shiftCount = rnum & 0x1F;
            var ${r} = lnum >>> shiftCount;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: &=')) {
            ctx.$(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum & rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: |=')) {
            ctx.$(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum | rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: ^=')) {
            ctx.$(`
            var lnum = ToInt32(${lval});
            var rnum = ToInt32(${rval});
            var ${r} = lnum ^ rnum;
            `);
        } else if (this.AssignmentOperator.is('AssignmentOperator: **=')) {
            ctx.$(`
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
        ctx.$(`${ctx.literal(this)}.DestructuringAssignmentEvaluation(${value});`);
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
        ctx.$(`${ctx.literal(this)}.DestructuringAssignmentEvaluation(${value});`);
    },

    'ArrayAssignmentPattern: [ Elision[opt] AssignmentRestElement ]',
    function(ctx, value) {
        var [iterator, iteratorRecord] = ctx.allocVars();
        ctx.$(`
        var ${iterator} = GetIterator(${value});
        var ${iteratorRecord} = Record({ Iterator: ${iterator}, Done: false });
        `);
        if (this.Elision) {
            var status = compileConcreteCompletion(this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
            ctx.$(`
            if (${status}.is_an_abrupt_completion()) {
                if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status}); // always abrupt
                else resolveCompletion(${status}); // always abrupt
            }
            `);
        }
        var result = compileConcreteCompletion(this.AssignmentRestElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.$(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${result});
        else resolveCompletion(${result});
        `);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList ]',
    function(ctx, value) {
        var [iterator, iteratorRecord] = ctx.allocVars();
        ctx.$(`
        var ${iterator} = GetIterator(${value});
        var ${iteratorRecord} = Record({ Iterator: ${iterator}, Done: false });
        `);
        var result = compileConcreteCompletion(this.AssignmentElementList.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.$(`
        if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${result});
        else resolveCompletion(${result});
        `);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList , Elision[opt] AssignmentRestElement[opt] ]',
    function(ctx, value) {
        var [iterator, iteratorRecord] = ctx.allocVars();
        ctx.$(`
        var ${iterator} = GetIterator(${value});
        var ${iteratorRecord} = Record({ Iterator: ${iterator}, Done: false });
        `);
        var status = compileConcreteCompletion(this.AssignmentElementList.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        ctx.$(`
        if (${status}.is_an_abrupt_completion()) {
            if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status}); // always abrupt
            else resolveCompletion(${status}); // always abrupt
        }
        `);
        if (this.Elision) {
            var status = compileConcreteCompletion(this.Elision.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
            ctx.$(`
            if (${status}.is_an_abrupt_completion()) {
                if (${iteratorRecord}.Done === false) IteratorClose(${iterator}, ${status}); // always abrupt
                else resolveCompletion(${status}); // always abrupt
            }
            `);
        }
        if (this.AssignmentRestElement) {
            var status = compileConcreteCompletion(this.AssignmentRestElement.compileIteratorDestructuringAssignmentEvaluation(ctx, iteratorRecord));
        }
        ctx.$(`
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
            ctx.$(` if( ${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            ctx.$(`var ${v} = GetValue(${defaultValue});`);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                ctx.$(`
                var hasNameProperty = HasOwnProperty(${v}, "name");
                if (hasNameProperty === false) SetFunctionName(${v}, ${P});
                `);
            }
            ctx.$(` } `);
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
    'Elision: Elision ,',
    function(ctx, iteratorRecord) {
        ctx.$(`${ctx.literal(this)}.IteratorDestructuringAssignmentEvaluation(${iteratorRecord});`);
    },

    'AssignmentElement: DestructuringAssignmentTarget Initializer[opt]',
    function(ctx, iteratorRecord) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.compileEvaluation(ctx);
        }
        var value = ctx.allocVar();
        ctx.$(`
        if (${iteratorRecord}.Done === false) {
            var next = concreteCompletion(IteratorStep(${iteratorRecord}.Iterator));
            if (next.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
            ReturnIfAbrupt(next);
            if (next === false) ${iteratorRecord}.Done = true;
            else {
                var ${value} = concreteCompletion(IteratorValue(next));
                if (${value}.is_an_abrupt_completion()) ${iteratorRecord}.Done = true;
                ReturnIfAbrupt(${value});
            }
        }
        if (${iteratorRecord}.Done === true) var ${value} = undefined;
        `);
        if (this.Initializer) {
            ctx.$(` if(${value} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var v = ctx.GetValue(defaultValue);
            ctx.$(` } else var ${v} = ${value}; `);
        } else var v = value;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var nestedAssignmentPattern = this.DestructuringAssignmentTarget.LeftHandSideExpression.AssignmentPattern;
            nestedAssignmentPattern.compileDestructuringAssignmentEvaluation(ctx, v);
            return;
        }
        if (this.Initializer && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            ctx.$(`
            if(${value} === undefined){
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
        var A = ctx._(`ArrayCreate(0)`);
        ctx.$(`
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
            ctx.$(` if( ${v} === undefined) { `);
            var defaultValue = this.Initializer.compileEvaluation(ctx);
            var rhsValue = ctx.GetValue(defaultValue);
            ctx.$(` } else var ${rhsValue} = ${v}; `);
        } else var rhsValue = v;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var assignmentPattern = this.DestructuringAssignmentTarget.LeftHandSideExpression.AssignmentPattern;
            assignmentPattern.compileDestructuringAssignmentEvaluation(ctx, rhsValue);
            return;
        }
        if (this.Initializer && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            ctx.$(`
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

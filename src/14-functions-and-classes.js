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

// 14 ECMAScript Language: Functions and Classes

// 14.1 Function Definitions

Syntax([
    'FunctionDeclaration[Yield,Default]: function BindingIdentifier[?Yield] ( FormalParameters ) { FunctionBody }',
    'FunctionDeclaration[Yield,Default]:[+Default] function ( FormalParameters ) { FunctionBody }',
    'FunctionExpression: function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }',
    'StrictFormalParameters[Yield]: FormalParameters[?Yield]',
    'FormalParameters[Yield]: [empty]',
    'FormalParameters[Yield]: FormalParameterList[?Yield]',
    'FormalParameterList[Yield]: FunctionRestParameter[?Yield]',
    'FormalParameterList[Yield]: FormalsList[?Yield]',
    'FormalParameterList[Yield]: FormalsList[?Yield] , FunctionRestParameter[?Yield]',
    'FormalsList[Yield]: FormalParameter[?Yield]',
    'FormalsList[Yield]: FormalsList[?Yield] , FormalParameter[?Yield]',
    'FunctionRestParameter[Yield]: BindingRestElement[?Yield]',
    'FormalParameter[Yield]: BindingElement[?Yield]',
    'FunctionBody[Yield]: FunctionStatementList[?Yield]',
    'FunctionStatementList[Yield]: StatementList[?Yield,Return][opt]',
]);

// 14.1.1 Directive Prologues and the Use Strict Directive

function isDirectivePrologue(nt) {
    Assert(nt.is('StatementList'));
    var list = nt.resolve('StatementList');
    var stmt = list.StatementListItem.resolve('ExpressionStatement');
    if (!stmt) return false;
    var str = stmt.Expression.resolve('StringLiteral');
    if (!str) return false;
    if (!list.StatementList) return true;
    return isDirectivePrologue(list.StatementList);
}

function containsUseStrictDirective(nt) {
    Assert(nt.is('StatementList'));
    var list = nt.resolve('StatementList');
    var stmt = list.StatementListItem.resolve('ExpressionStatement');
    if (stmt) {
        var str = stmt.Expression.resolve('StringLiteral');
        if (str && str.SV() === 'use strict' && !str.Contains('EscapeSequence') && !str.Contains('LineContinuation')) {
            if (!list.StatementList) return true;
            if (isDirectivePrologue(list.StatementList)) return true;
        }
    }
    if (!list.StatementList) return false;
    return containsUseStrictDirective(list.StatementList);
}

// 14.1.2
Static_Semantics('Early Errors', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    'FunctionExpression: function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }',
    function() {
        if (this.FunctionBody.strict) {
            var nt = Production['StrictFormalParameters: FormalParameters'](this.FormalParameters);
            nt.strict = true;
            nt.apply_early_error_rules();
            if (this.BindingIdentifier.StringValue() === 'eval' || this.BindingIdentifier.StringValue() === 'arguments') throw EarlySyntaxError();
        }
        if (this.FunctionBody.ContainsUseStrict() === true && this.FormalParameters.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.FormalParameters.BoundNames().also_occurs_in(this.FunctionBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
        if (this.FormalParameters.Contains('SuperProperty') === true) throw EarlySyntaxError();
        if (this.FunctionBody.Contains('SuperProperty') === true) throw EarlySyntaxError();
        if (this.FormalParameters.Contains('SuperCall') === true) throw EarlySyntaxError();
        if (this.FunctionBody.Contains('SuperCall') === true) throw EarlySyntaxError();
    },

    'StrictFormalParameters: FormalParameters',
    function() {
        if (this.FormalParameters.BoundNames().contains_any_duplicate_elements()) throw EarlySyntaxError();
    },

    'FormalParameters: FormalParameterList',
    function() {
        if (this.FormalParameterList.IsSimpleParameterList() === false && this.FormalParameterList.BoundNames().contains_any_duplicate_elements()) throw EarlySyntaxError();
    },

    'FunctionBody: FunctionStatementList',
    function() {
        if (this.FunctionStatementList.LexicallyDeclaredNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
        if (this.FunctionStatementList.LexicallyDeclaredNames().also_occurs_in(this.FunctionStatementList.VarDeclaredNames())) throw EarlySyntaxError();
        if (this.FunctionStatementList.ContainsDuplicateLabels([]) === true) throw EarlySyntaxError();
        if (this.FunctionStatementList.ContainsUndefinedBreakTarget([]) === true) throw EarlySyntaxError();
        if (this.FunctionStatementList.ContainsUndefinedContinueTarget([], []) === true) throw EarlySyntaxError();
    },
]);

Static_Semantics('ContainsDuplicateLabels', [

    'FunctionStatementList: [empty]',
    function(labelSet) {
        return false; // TODO clarify the specification
    },
]);

Static_Semantics('ContainsUndefinedBreakTarget', [

    'FunctionStatementList: [empty]',
    function(labelSet) {
        return false; // TODO clarify the specification
    },
]);

Static_Semantics('ContainsUndefinedContinueTarget', [

    'FunctionStatementList: [empty]',
    function(iterationSet, labelSet) {
        return false; // TODO clarify the specification
    },
]);

// 14.1.3
Static_Semantics('BoundNames', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    function() {
        return ["*default*"];
    },

    'FormalParameters: [empty]',
    function() {
        return [];
    },

    'FormalParameterList: FormalsList , FunctionRestParameter',
    function() {
        var names = this.FormalsList.BoundNames();
        names.append_elements_of(this.FunctionRestParameter.BoundNames());
        return names;
    },

    'FormalsList: FormalsList , FormalParameter',
    function() {
        var names = this.FormalsList.BoundNames();
        names.append_elements_of(this.FormalParameter.BoundNames());
        return names;
    },
]);

// 14.1.4
Static_Semantics('Contains', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    'FunctionExpression: function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }',
    function(symbol) {
        return false;
    },
]);

// 14.1.5
Static_Semantics('ContainsExpression', [

    'FormalParameters: [empty]',
    function() {
        return false;
    },

    'FormalParameterList: FunctionRestParameter',
    function() {
        return this.FunctionRestParameter.ContainsExpression();
    },

    'FormalParameterList: FormalsList , FunctionRestParameter',
    function() {
        if (this.FormalsList.ContainsExpression() === true) return true;
        return this.FunctionRestParameter.ContainsExpression();
    },

    'FormalsList: FormalsList , FormalParameter',
    function() {
        if (this.FormalsList.ContainsExpression() === true) return true;
        return this.FormalParameter.ContainsExpression();
    },
]);

// 14.1.6
Static_Semantics('ContainsUseStrict', [

    'FunctionBody: FunctionStatementList',
    function() {
        if (this.is('FunctionStatementList: [empty]')) return false;
        if (containsUseStrictDirective(this)) return true;
        else return false;
    },
]);

// 14.1.7
Static_Semantics('ExpectedArgumentCount', [

    'FormalParameters: [empty]',
    function() {
        return 0;
    },

    'FormalParameterList: FunctionRestParameter',
    function() {
        return 0;
    },

    'FormalParameterList: FormalsList , FunctionRestParameter',
    function() {
        return this.FormalsList.ExpectedArgumentCount();
    },

    'FormalsList: FormalParameter',
    function() {
        if (this.FormalParameter.HasInitializer() === true) return 0;
        return 1;
    },

    'FormalsList: FormalsList , FormalParameter',
    function() {
        var count = this.FormalsList.ExpectedArgumentCount();
        if (this.FormalsList.HasInitializer() === true || this.FormalParameter.HasInitializer() === true) return count;
        return count + 1;
    },
]);

// 14.1.8
Static_Semantics('HasInitializer', [

    'FormalsList: FormalsList , FormalParameter',
    function() {
        if (this.FormalsList.HasInitializer() === true) return true;
        return this.FormalParameter.HasInitializer();
    },
]);

// 14.1.9
Static_Semantics('HasName', [

    'FunctionExpression: function ( FormalParameters ) { FunctionBody }',
    function() {
        return false;
    },

    'FunctionExpression: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function() {
        return true;
    },
]);

// 14.1.10
function IsAnonymousFunctionDefinition(production) {
    if (production.IsFunctionDefinition() === false) return false;
    var hasName = production.HasName();
    if (hasName === true) return false;
    return true;
}

// 14.1.11
Static_Semantics('IsConstantDeclaration', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    function() {
        return false;
    },
]);

// 14.1.12
Static_Semantics('IsFunctionDefinition', [

    'FunctionExpression: function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }',
    function() {
        return true;
    },
]);

// 14.1.13
Static_Semantics('IsSimpleParameterList', [

    'FormalParameters: [empty]',
    function() {
        return true;
    },

    'FormalParameterList: FunctionRestParameter',
    function() {
        return false;
    },

    'FormalParameterList: FormalsList , FunctionRestParameter',
    function() {
        return false;
    },

    'FormalsList: FormalsList , FormalParameter',
    function() {
        if (this.FormalsList.IsSimpleParameterList() === false) return false;
        return this.FormalParameter.IsSimpleParameterList();
    },

    'FormalParameter: BindingElement',
    function() {
        return this.BindingElement.IsSimpleParameterList();
    },
]);

// 14.1.14
Static_Semantics('LexicallyDeclaredNames', [

    'FunctionStatementList: [empty]',
    function() {
        return [];
    },

    'FunctionStatementList: StatementList',
    function() {
        return this.StatementList.TopLevelLexicallyDeclaredNames();
    },
]);

// 14.1.15
Static_Semantics('LexicallyScopedDeclarations', [

    'FunctionStatementList: [empty]',
    function() {
        return [];
    },

    'FunctionStatementList: StatementList',
    function() {
        return this.StatementList.TopLevelLexicallyScopedDeclarations();
    },
]);

// 14.1.16
Static_Semantics('VarDeclaredNames', [

    'FunctionStatementList: [empty]',
    function() {
        return [];
    },

    'FunctionStatementList: StatementList',
    function() {
        return this.StatementList.TopLevelVarDeclaredNames();
    },
]);

// 14.1.17
Static_Semantics('VarScopedDeclarations', [

    'FunctionStatementList: [empty]',
    function() {
        return [];
    },

    'FunctionStatementList: StatementList',
    function() {
        return this.StatementList.TopLevelVarScopedDeclarations();
    },
]);

// 14.1.18
Runtime_Semantics('EvaluateBody', [

    'FunctionBody: FunctionStatementList',
    function(functionObject) {
        return this.FunctionStatementList.Evaluation();
    },
]);

// 14.1.19
Runtime_Semantics('IteratorBindingInitialization', [

    'FormalParameters: [empty]',
    function(iteratorRecord, environment) {
        return empty;
    },

    'FormalParameterList: FormalsList , FunctionRestParameter',
    function(iteratorRecord, environment) {
        var restIndex = this.FormalsList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.FunctionRestParameter.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'FormalsList: FormalsList , FormalParameter',
    function(iteratorRecord, environment) {
        var status = this.FormalsList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.FormalParameter.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'FormalParameter: BindingElement',
    function(iteratorRecord, environment) {
        if (this.BindingElement.ContainsExpression() === false) return this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
        var currentContext = the_running_execution_context;
        var originalEnv = currentContext.VariableEnvironment;
        Assert(currentContext.VariableEnvironment === currentContext.LexicalEnvironment);
        Assert(environment === originalEnv);
        var paramVarEnv = NewDeclarativeEnvironment(originalEnv);
        currentContext.VariableEnvironment = paramVarEnv;
        currentContext.LexicalEnvironment = paramVarEnv;
        try {
            var result = this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
        } finally {
            currentContext.VariableEnvironment = originalEnv;
            currentContext.LexicalEnvironment = originalEnv;
        }
        return result;
    },

    'FunctionRestParameter: BindingRestElement',
    function(iteratorRecord, environment) {
        if (this.BindingRestElement.ContainsExpression() === false) return this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
        var currentContext = the_running_execution_context;
        var originalEnv = currentContext.VariableEnvironment;
        Assert(currentContext.VariableEnvironment === currentContext.LexicalEnvironment);
        Assert(environment === originalEnv);
        var paramVarEnv = NewDeclarativeEnvironment(originalEnv);
        currentContext.VariableEnvironment = paramVarEnv;
        currentContext.LexicalEnvironment = paramVarEnv;
        try {
            var result = this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
        } finally {
            currentContext.VariableEnvironment = originalEnv;
            currentContext.LexicalEnvironment = originalEnv;
        }
        return result;
    },
]);

// 14.1.20
Runtime_Semantics('InstantiateFunctionObject', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function(scope) {
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var name = this.BindingIdentifier.StringValue();
        var F = FunctionCreate('Normal', this.FormalParameters, this.FunctionBody, scope, strict);
        MakeConstructor(F);
        SetFunctionName(F, name);
        return F;
    },

    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    function(scope) {
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var F = FunctionCreate('Normal', this.FormalParameters, this.FunctionBody, scope, strict);
        MakeConstructor(F);
        SetFunctionName(F, "default");
        return F;
    },
]);

// 14.1.21
Runtime_Semantics('Evaluation', [

    'FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function() {
        return empty;
    },

    'FunctionDeclaration: function ( FormalParameters ) { FunctionBody }',
    function() {
        return empty;
    },

    'FunctionExpression: function ( FormalParameters ) { FunctionBody }',
    function() {
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var closure = FunctionCreate('Normal', this.FormalParameters, this.FunctionBody, scope, strict);
        MakeConstructor(closure);
        return closure;
    },

    'FunctionExpression: function BindingIdentifier ( FormalParameters ) { FunctionBody }',
    function() {
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var funcEnv = NewDeclarativeEnvironment(scope);
        var envRec = funcEnv.EnvironmentRecord;
        var name = this.BindingIdentifier.StringValue();
        envRec.CreateImmutableBinding(name, false);
        var closure = FunctionCreate('Normal', this.FormalParameters, this.FunctionBody, funcEnv, strict);
        MakeConstructor(closure);
        SetFunctionName(closure, name);
        envRec.InitializeBinding(name, closure);
        return closure;
    },

    'FunctionStatementList: [empty]',
    function() {
        return undefined;
    },
]);

// 14.2 Arrow Function Definitions

Syntax([
    'ArrowFunction[In,Yield]: ArrowParameters[?Yield] => ConciseBody[?In]',
    'ArrowParameters[Yield]: BindingIdentifier[?Yield]',
    'ArrowParameters[Yield]: CoverParenthesizedExpressionAndArrowParameterList[?Yield]',
    'ConciseBody[In]: AssignmentExpression[?In]',
    'ConciseBody[In]: { FunctionBody }',
]);

Syntax([
    'ArrowFormalParameters[Yield]: ( StrictFormalParameters[?Yield] )',
]);

// 14.2.1
Static_Semantics('Early Errors', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function() {
        if (this.ArrowParameters.Contains('YieldExpression') === true) throw EarlySyntaxError();
        if (this.ConciseBody.ContainsUseStrict() === true && this.ArrowParameters.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.ArrowParameters.BoundNames().also_occurs_in(this.ConciseBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
    },

    'ArrowParameters: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        // moved into the parser.
        this.CoverParenthesizedExpressionAndArrowParameterList.CoveredFormalsList().apply_early_error_rules();
    },
]);

// 14.2.2
Static_Semantics('BoundNames', [

    'ArrowParameters: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var formals = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredFormalsList();
        return formals.BoundNames();
    },
]);

// 14.2.3
Static_Semantics('Contains', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function(symbol) {
        if (!symbol.is_an_element_of(['NewTarget', 'SuperProperty', 'SuperCall', 'super', 'this'])) return false;
        if (this.ArrowParameters.Contains(symbol) === true) return true;
        return this.ConciseBody.Contains(symbol);
    },

    'ArrowParameters: CoverParenthesizedExpressionAndArrowParameterList',
    function(symbol) {
        var formals = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredFormalsList();
        return formals.Contains(symbol);
    },
]);

// 14.2.4
Static_Semantics('ContainsExpression', [

    'ArrowParameters: BindingIdentifier',
    function() {
        return false;
    },
]);

// 14.2.5
Static_Semantics('ContainsUseStrict', [

    'ConciseBody: AssignmentExpression',
    function() {
        return false;
    },
]);

// 14.2.6
Static_Semantics('ExpectedArgumentCount', [

    'ArrowParameters: BindingIdentifier',
    function() {
        return 1;
    },
]);

// 14.2.7
Static_Semantics('HasName', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function() {
        return false;
    },
]);

// 14.2.8
Static_Semantics('IsSimpleParameterList', [

    'ArrowParameters: BindingIdentifier',
    function() {
        return true;
    },

    'ArrowParameters: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var formals = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredFormalsList();
        return formals.IsSimpleParameterList();
    },
]);

// 14.2.9
Static_Semantics('CoveredFormalsList', [

    'ArrowParameters: BindingIdentifier',
    function() {
        return this;
    },

    'CoverParenthesizedExpressionAndArrowParameterList: ( Expression )',
    'CoverParenthesizedExpressionAndArrowParameterList: ( )',
    'CoverParenthesizedExpressionAndArrowParameterList: ( ... BindingIdentifier )',
    'CoverParenthesizedExpressionAndArrowParameterList: ( ... BindingPattern )',
    'CoverParenthesizedExpressionAndArrowParameterList: ( Expression , ... BindingIdentifier )',
    'CoverParenthesizedExpressionAndArrowParameterList: ( Expression , ... BindingPattern )',
    function() {
        // moved into the parser.
        return this.ArrowFormalParameters;
    },
]);

// 14.2.10
Static_Semantics('LexicallyDeclaredNames', [

    'ConciseBody: AssignmentExpression',
    function() {
        return [];
    },
]);

// 14.2.11
Static_Semantics('LexicallyScopedDeclarations', [

    'ConciseBody: AssignmentExpression',
    function() {
        return [];
    },
]);

// 14.2.12
Static_Semantics('VarDeclaredNames', [

    'ConciseBody: AssignmentExpression',
    function() {
        return [];
    },
]);

// 14.2.13
Static_Semantics('VarScopedDeclarations', [

    'ConciseBody: AssignmentExpression',
    function() {
        return [];
    },
]);

// 14.2.14
Runtime_Semantics('IteratorBindingInitialization', [

    'ArrowParameters: BindingIdentifier',
    function(iteratorRecord, environment) {
        Assert(iteratorRecord.Done === false);
        var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
        if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
        ReturnIfAbrupt(next);
        next = resolveCompletion(next);
        if (next === false) iteratorRecord.Done = true;
        else {
            var v = concreteCompletion(IteratorValue(next));
            if (v.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(v);
            v = resolveCompletion(v);
        }
        if (iteratorRecord.Done === true) var v = undefined;
        return this.BindingIdentifier.BindingInitialization(v, environment);
    },
]);

// 14.2.15
Runtime_Semantics('EvaluateBody', [

    'ConciseBody: AssignmentExpression',
    function(functionObject) {
        var exprRef = this.AssignmentExpression.Evaluation();
        var exprValue = GetValue(exprRef);
        throw Completion({ Type: 'return', Value: exprValue, Target: empty });
    },
]);

// 14.2.16
Runtime_Semantics('Evaluation', [

    'ArrowFunction: ArrowParameters => ConciseBody',
    function() {
        if (this.ConciseBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var parameters = this.ArrowParameters.CoveredFormalsList();
        var closure = FunctionCreate('Arrow', parameters, this.ConciseBody, scope, strict);
        return closure;
    },
]);

// 14.3 Method Definitions

Syntax([
    'MethodDefinition[Yield]: PropertyName[?Yield] ( StrictFormalParameters ) { FunctionBody }',
    'MethodDefinition[Yield]: GeneratorMethod[?Yield]',
    'MethodDefinition[Yield]: get PropertyName[?Yield] ( ) { FunctionBody }',
    'MethodDefinition[Yield]: set PropertyName[?Yield] ( PropertySetParameterList ) { FunctionBody }',
    'PropertySetParameterList: FormalParameter',
]);

// 14.3.1
Static_Semantics('Early Errors', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function() {
        if (this.FunctionBody.ContainsUseStrict() === true && this.StrictFormalParameters.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.StrictFormalParameters.BoundNames().also_occurs_in(this.FunctionBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
    },

    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function() {
        if (this.PropertySetParameterList.BoundNames().contains_any_duplicate_elements()) throw EarlySyntaxError();
        if (this.FunctionBody.ContainsUseStrict() === true && this.PropertySetParameterList.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.PropertySetParameterList.BoundNames().also_occurs_in(this.FunctionBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
    },
]);

// 14.3.2
Static_Semantics('ComputedPropertyContains', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function(symbol) {
        return this.PropertyName.ComputedPropertyContains(symbol);
    },
]);

// 14.3.3
Static_Semantics('ExpectedArgumentCount', [

    'PropertySetParameterList: FormalParameter',
    function() {
        if (this.FormalParameter.HasInitializer() === true) return 0;
        return 1;
    },
]);

// 14.3.4
Static_Semantics('HasComputedPropertyKey', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function() {
        return this.PropertyName.IsComputedPropertyKey();
    },
]);

// 14.3.5
Static_Semantics('HasDirectSuper', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function() {
        if (this.StrictFormalParameters.Contains('SuperCall') === true) return true;
        return this.FunctionBody.Contains('SuperCall');
    },

    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    function() {
        return this.FunctionBody.Contains('SuperCall');
    },

    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function() {
        if (this.PropertySetParameterList.Contains('SuperCall') === true) return true;
        return this.FunctionBody.Contains('SuperCall');
    },
]);

// 14.3.6
Static_Semantics('PropName', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function() {
        return this.PropertyName.PropName();
    },
]);

// 14.3.7
Static_Semantics('SpecialMethod', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function() {
        return false;
    },

    'MethodDefinition: GeneratorMethod',
    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function() {
        return true;
    },
]);

// 14.3.8
Runtime_Semantics('DefineMethod', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(object, functionPrototype) {
        var propKey = this.PropertyName.Evaluation();
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        if (functionPrototype !== undefined) var kind = 'Normal';
        else var kind = 'Method';
        var closure = FunctionCreate(kind, this.StrictFormalParameters, this.FunctionBody, scope, strict, functionPrototype);
        MakeMethod(closure, object);
        return Record({ Key: propKey, Closure: closure });
    },
]);

// 14.3.9
Runtime_Semantics('PropertyDefinitionEvaluation', [

    'MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }',
    function(object, enumerable) {
        var methodDef = this.DefineMethod(object);
        SetFunctionName(methodDef.Closure, methodDef.Key);
        var desc = PropertyDescriptor({ Value: methodDef.Closure, Writable: true, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, methodDef.Key, desc);
    },

    'MethodDefinition: get PropertyName ( ) { FunctionBody }',
    function(object, enumerable) {
        var propKey = this.PropertyName.Evaluation();
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var formalParameterList = Production['FormalParameters: [empty]']([]);
        var closure = FunctionCreate('Method', formalParameterList, this.FunctionBody, scope, strict);
        MakeMethod(closure, object);
        SetFunctionName(closure, propKey, "get");
        var desc = PropertyDescriptor({ Get: closure, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, propKey, desc);
    },

    'MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }',
    function(object, enumerable) {
        var propKey = this.PropertyName.Evaluation();
        if (this.FunctionBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var closure = FunctionCreate('Method', this.PropertySetParameterList, this.FunctionBody, scope, strict);
        MakeMethod(closure, object);
        SetFunctionName(closure, propKey, "set");
        var desc = PropertyDescriptor({ Set: closure, Enumerable: enumerable, Configurable: true });
        return DefinePropertyOrThrow(object, propKey, desc);
    },
]);

// 14.4 Generator Function Definitions

Syntax([
    'GeneratorMethod[Yield]: * PropertyName[?Yield] ( StrictFormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorDeclaration[Yield,Default]: function * BindingIdentifier[?Yield] ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorDeclaration[Yield,Default]:[+Default] function * ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier[Yield][opt] ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorBody: FunctionBody[Yield]',
    'YieldExpression[In]: yield',
    'YieldExpression[In]: yield AssignmentExpression[?In,Yield]',
    'YieldExpression[In]: yield * AssignmentExpression[?In,Yield]',
]);

// 14.4.1
Static_Semantics('Early Errors', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function() {
        if (this.GeneratorMethod.HasDirectSuper() === true) throw EarlySyntaxError();
        if (this.StrictFormalParameters.Contains('YieldExpression') === true) throw EarlySyntaxError();
        if (this.GeneratorBody.ContainsUseStrict() === true && this.StrictFormalParameters.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.StrictFormalParameters.BoundNames().also_occurs_in(this.GeneratorBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
    },

    'GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    'GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier[opt] ( FormalParameters ) { GeneratorBody }',
    function() {
        if (this.GeneratorBody.strict) {
            var nt = Production['StrictFormalParameters: FormalParameters'](this.FormalParameters);
            nt.strict = true;
            nt.apply_early_error_rules();
            if (this.BindingIdentifier.StringValue() === 'eval' || this.BindingIdentifier.StringValue() === 'arguments') throw EarlySyntaxError();
        }
        if (this.GeneratorBody.ContainsUseStrict() === true && this.FormalParameters.IsSimpleParameterList() === false) throw EarlySyntaxError();
        if (this.FormalParameters.BoundNames().also_occurs_in(this.GeneratorBody.LexicallyDeclaredNames())) throw EarlySyntaxError();
        if (this.FormalParameters.Contains('YieldExpression') === true) throw EarlySyntaxError();
        if (this.FormalParameters.Contains('SuperProperty') === true) throw EarlySyntaxError();
        if (this.GeneratorBody.Contains('SuperProperty') === true) throw EarlySyntaxError();
        if (this.FormalParameters.Contains('SuperCall') === true) throw EarlySyntaxError();
        if (this.GeneratorBody.Contains('SuperCall') === true) throw EarlySyntaxError();
    },
]);

// 14.4.2
Static_Semantics('BoundNames', [

    'GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }',
    function() {
        return ["*default*"];
    },
]);

// 14.4.3
Static_Semantics('ComputedPropertyContains', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function(symbol) {
        return this.PropertyName.ComputedPropertyContains(symbol);
    },
]);

// 14.4.4
Static_Semantics('Contains', [

    'GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    'GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier[opt] ( FormalParameters ) { GeneratorBody }',
    function(symbol) {
        return false;
    },
]);

// 14.4.5
Static_Semantics('HasComputedPropertyKey', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function() {
        return this.PropertyName.IsComputedPropertyKey();
    },
]);

// 14.4.6
Static_Semantics('HasDirectSuper', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function() {
        if (this.StrictFormalParameters.Contains('SuperCall') === true) return true;
        return this.GeneratorBody.Contains('SuperCall');
    },
]);

// 14.4.7
Static_Semantics('HasName', [

    'GeneratorExpression: function * ( FormalParameters ) { GeneratorBody }',
    function() {
        return false;
    },

    'GeneratorExpression: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function() {
        return true;
    },
]);

// 14.4.8
Static_Semantics('IsConstantDeclaration', [

    'GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    'GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }',
    function() {
        return false;
    },
]);

// 14.4.9
Static_Semantics('IsFunctionDefinition', [

    'GeneratorExpression: function * BindingIdentifier[opt] ( FormalParameters ) { GeneratorBody }',
    function() {
        return true;
    },
]);

// 14.4.10
Static_Semantics('PropName', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function() {
        return this.PropertyName.PropName();
    },
]);

// 14.4.11
Runtime_Semantics('EvaluateBody', [

    'GeneratorBody: FunctionBody',
    function(functionObject) {
        var G = OrdinaryCreateFromConstructor(functionObject, currentRealm.Intrinsics["%GeneratorPrototype%"], ['GeneratorState', 'GeneratorContext']);
        GeneratorStart(G, this.FunctionBody);
        throw Completion({ Type: 'return', Value: G, Target: empty });
    },
]);

// 14.4.12
Runtime_Semantics('InstantiateFunctionObject', [

    'GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function(scope) {
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var name = this.BindingIdentifier.StringValue();
        var F = GeneratorFunctionCreate('Normal', this.FormalParameters, this.GeneratorBody, scope, strict);
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(F, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        SetFunctionName(F, name);
        return F;
    },

    'GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }',
    function(scope) {
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var F = GeneratorFunctionCreate('Normal', this.FormalParameters, this.GeneratorBody, scope, strict);
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(F, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        SetFunctionName(F, "default");
        return F;
    },
]);

// 14.4.13
Runtime_Semantics('PropertyDefinitionEvaluation', [

    'GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }',
    function(object, enumerable) {
        var propKey = this.PropertyName.Evaluation();
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
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
Runtime_Semantics('Evaluation', [

    'GeneratorExpression: function * ( FormalParameters ) { GeneratorBody }',
    function() {
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var closure = GeneratorFunctionCreate('Normal', this.FormalParameters, this.GeneratorBody, scope, strict);
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        return closure;
    },

    'GeneratorExpression: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }',
    function() {
        if (this.GeneratorBody.strict) var strict = true;
        else var strict = false;
        var scope = the_running_execution_context.LexicalEnvironment;
        var funcEnv = NewDeclarativeEnvironment(scope);
        var envRec = funcEnv.EnvironmentRecord;
        var name = this.BindingIdentifier.StringValue();
        envRec.CreateImmutableBinding(name, false);
        var closure = GeneratorFunctionCreate('Normal', this.FormalParameters, this.GeneratorBody, funcEnv, strict);
        var prototype = ObjectCreate(currentRealm.Intrinsics['%GeneratorPrototype%']);
        DefinePropertyOrThrow(closure, "prototype", PropertyDescriptor({ Value: prototype, Writable: true, Enumerable: false, Configurable: false }));
        SetFunctionName(closure, name);
        envRec.InitializeBinding(name, closure);
        return closure;
    },

    'YieldExpression: yield',
    function() {
        return GeneratorYield(CreateIterResultObject(undefined, false));
    },

    'YieldExpression: yield AssignmentExpression',
    function() {
        var exprRef = this.AssignmentExpression.Evaluation();
        var value = GetValue(exprRef);
        return GeneratorYield(CreateIterResultObject(value, false));
    },

    'YieldExpression: yield * AssignmentExpression',
    function() {
        var exprRef = this.AssignmentExpression.Evaluation();
        var value = GetValue(exprRef);
        var iterator = GetIterator(value);
        var received = NormalCompletion(undefined);
        while (true) {
            if (received.Type === 'normal') {
                var innerResult = IteratorNext(iterator, received.Value);
                var done = IteratorComplete(innerResult);
                if (done === true) {
                    return IteratorValue(innerResult);
                }
                var received = concreteCompletion(GeneratorYield(innerResult));
            } else if (received.Type === 'throw') {
                var _throw = GetMethod(iterator, "throw");
                if (_throw !== undefined) {
                    var innerResult = Call(_throw, iterator, [received.Value]);
                    if (Type(innerResult) !== 'Object') throw $TypeError();
                    var done = IteratorComplete(innerResult);
                    if (done === true) {
                        return IteratorValue(innerResult);
                    }
                    var received = concreteCompletion(GeneratorYield(innerResult));
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
                var received = concreteCompletion(GeneratorYield(innerReturnResult));
            }
        }
    },
]);

// 14.5 Class Definitions

Syntax([
    'ClassDeclaration[Yield,Default]: class BindingIdentifier[?Yield] ClassTail[?Yield]',
    'ClassDeclaration[Yield,Default]:[+Default] class ClassTail[?Yield]',
    'ClassExpression[Yield]: class BindingIdentifier[?Yield][opt] ClassTail[?Yield]',
    'ClassTail[Yield]: ClassHeritage[?Yield][opt] { ClassBody[?Yield][opt] }',
    'ClassHeritage[Yield]: extends LeftHandSideExpression[?Yield]',
    'ClassBody[Yield]: ClassElementList[?Yield]',
    'ClassElementList[Yield]: ClassElement[?Yield]',
    'ClassElementList[Yield]: ClassElementList[?Yield] ClassElement[?Yield]',
    'ClassElement[Yield]: MethodDefinition[?Yield]',
    'ClassElement[Yield]: static MethodDefinition[?Yield]',
    'ClassElement[Yield]: ;',
]);

// 14.5.1
Static_Semantics('Early Errors', [

    'ClassTail: ClassHeritage[opt] { ClassBody }',
    function() {
        if (this.ClassHeritage) {
            var constructor = this.ClassBody.ConstructorMethod();
            if (constructor === empty) return;
            if (constructor.HasDirectSuper() === true) throw EarlySyntaxError();
        }
    },

    'ClassBody: ClassElementList',
    function() {
        if (this.ClassElementList.PrototypePropertyNameList().contains_more_than_one_occurrence_of("constructor")) throw EarlySyntaxError();
    },

    'ClassElement: MethodDefinition',
    function() {
        if (this.MethodDefinition.PropName() !== "constructor" && this.MethodDefinition.HasDirectSuper() === true) throw EarlySyntaxError();
        if (this.MethodDefinition.PropName() === "constructor" && this.MethodDefinition.SpecialMethod() === true) throw EarlySyntaxError();
    },

    'ClassElement: static MethodDefinition',
    function() {
        if (this.MethodDefinition.HasDirectSuper() === true) throw EarlySyntaxError();
        if (this.MethodDefinition.PropName() === "prototype") throw EarlySyntaxError();
    },
]);

// 14.5.2
Static_Semantics('BoundNames', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'ClassDeclaration: class ClassTail',
    function() {
        return ["*default*"];
    },
]);

// 14.5.3
Static_Semantics('ConstructorMethod', [

    'ClassElementList: ClassElement',
    function() {
        if (this.ClassElement.is('ClassElement: ;')) return empty;
        if (this.ClassElement.IsStatic() === true) return empty;
        if (this.ClassElement.PropName() !== "constructor") return empty;
        return this.ClassElement;
    },

    'ClassElementList: ClassElementList ClassElement',
    function() {
        var head = this.ClassElementList.ConstructorMethod();
        if (head !== empty) return head;
        if (this.ClassElement.is('ClassElement: ;')) return empty;
        if (this.ClassElement.IsStatic() === true) return empty;
        if (this.ClassElement.PropName() !== "constructor") return empty;
        return this.ClassElement;
    },
]);

// 14.5.4
Static_Semantics('Contains', [

    'ClassTail: ClassHeritage[opt] { ClassBody }',
    function(symbol) {
        if (symbol === 'ClassBody') return true;
        if (symbol === 'ClassHeritage') {
            if (this.ClassHeritage) return true;
            else return false;
        }
        var inHeritage = this.ClassHeritage.Contains(symbol);
        if (inHeritage === true) return true;
        return this.ClassBody.ComputedPropertyContains(symbol);
    },
]);

// 14.5.5
Static_Semantics('ComputedPropertyContains', [

    'ClassElementList: ClassElementList ClassElement',
    function(symbol) {
        var inList = this.ClassElementList.ComputedPropertyContains(symbol);
        if (inList === true) return true;
        return this.ClassElement.ComputedPropertyContains(symbol);
    },

    'ClassElement: MethodDefinition',
    function(symbol) {
        return this.MethodDefinition.ComputedPropertyContains(symbol);
    },

    'ClassElement: static MethodDefinition',
    function(symbol) {
        return this.MethodDefinition.ComputedPropertyContains(symbol);
    },

    'ClassElement: ;',
    function() {
        return false;
    },
]);

// 14.5.6
Static_Semantics('HasName', [

    'ClassExpression: class ClassTail',
    function() {
        return false;
    },

    'ClassExpression: class BindingIdentifier ClassTail',
    function() {
        return true;
    },
]);

// 14.5.7
Static_Semantics('IsConstantDeclaration', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    'ClassDeclaration: class ClassTail',
    function() {
        return false;
    },
]);

// 14.5.8
Static_Semantics('IsFunctionDefinition', [

    'ClassExpression: class BindingIdentifier[opt] ClassTail',
    function() {
        return true;
    },
]);

// 14.5.9
Static_Semantics('IsStatic', [

    'ClassElement: MethodDefinition',
    function() {
        return false;
    },

    'ClassElement: static MethodDefinition',
    function() {
        return true;
    },

    'ClassElement: ;',
    function() {
        return false;
    },
]);

// 14.5.10
Static_Semantics('NonConstructorMethodDefinitions', [

    'ClassElementList: ClassElement',
    function() {
        if (this.ClassElement.is('ClassElement: ;')) return [];
        if (this.ClassElement.IsStatic() === false && this.ClassElement.PropName() === "constructor") return [];
        return [this.ClassElement];
    },

    'ClassElementList: ClassElementList ClassElement',
    function() {
        var list = this.ClassElementList.NonConstructorMethodDefinitions();
        if (this.ClassElement.is('ClassElement: ;')) return list;
        if (this.ClassElement.IsStatic() === false && this.ClassElement.PropName() === "constructor") return list;
        list.push(this.ClassElement);
        return list;
    },
]);

// 14.5.11
Static_Semantics('PrototypePropertyNameList', [

    'ClassElementList: ClassElement',
    function() {
        if (this.ClassElement.PropName() === empty) return [];
        if (this.ClassElement.IsStatic() === true) return [];
        return [this.ClassElement.PropName()];
    },

    'ClassElementList: ClassElementList ClassElement',
    function() {
        var list = this.ClassElementList.PrototypePropertyNameList();
        if (this.ClassElement.PropName() === empty) return list;
        if (this.ClassElement.IsStatic() === true) return list;
        list.push(this.ClassElement.PropName());
        return list;
    },
]);

// 14.5.12
Static_Semantics('PropName', [

    'ClassElement: ;',
    function() {
        return empty;
    },
]);

// 14.5.13
Static_Semantics('StaticPropertyNameList', [

    'ClassElementList: ClassElement',
    function() {
        if (this.ClassElement.PropName() === empty) return [];
        if (this.ClassElement.IsStatic() === false) return [];
        return [this.ClassElement.PropName()];
    },

    'ClassElementList: ClassElementList ClassElement',
    function() {
        var list = this.ClassElementList.StaticPropertyNameList();
        if (this.ClassElement.PropName() === empty) return list;
        if (this.ClassElement.IsStatic() === false) return list;
        list.push(this.ClassElement.PropName());
        return list;
    },
]);

// 14.5.14
Runtime_Semantics('ClassDefinitionEvaluation', [

    'ClassTail: ClassHeritage[opt] { ClassBody[opt] }',
    function(className) {
        var lex = the_running_execution_context.LexicalEnvironment;
        var classScope = NewDeclarativeEnvironment(lex);
        var classScopeEnvRec = classScope.EnvironmentRecord;
        if (className !== undefined) {
            classScopeEnvRec.CreateImmutableBinding(className, true);
        }
        if (!this.ClassHeritage) {
            var protoParent = currentRealm.Intrinsics['%ObjectPrototype%'];
            var constructorParent = currentRealm.Intrinsics['%FunctionPrototype%'];
        } else {
            the_running_execution_context.LexicalEnvironment = classScope;
            try {
                var superclassRef = this.ClassHeritage.Evaluation();
                var superclass = GetValue(superclassRef); //TODO clarify the specification
            } finally {
                the_running_execution_context.LexicalEnvironment = lex;
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
        the_running_execution_context.LexicalEnvironment = classScope;
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
                var status = concreteCompletion(m.PropertyDefinitionEvaluation(proto, false));
            } else {
                var status = concreteCompletion(m.PropertyDefinitionEvaluation(F, false));
            }
            if (status.is_an_abrupt_completion()) {
                the_running_execution_context.LexicalEnvironment = lex;
                return resolveCompletion(status);
            }
        }
        the_running_execution_context.LexicalEnvironment = lex;
        if (className !== undefined) {
            classScopeEnvRec.InitializeBinding(className, F);
        }
        return F;
    },
]);

// 14.5.15
Runtime_Semantics('BindingClassDeclarationEvaluation', [

    'ClassDeclaration: class BindingIdentifier ClassTail',
    function() {
        var className = this.BindingIdentifier.StringValue();
        var value = this.ClassTail.ClassDefinitionEvaluation(className);
        var hasNameProperty = HasOwnProperty(value, "name");
        if (hasNameProperty === false) SetFunctionName(value, className);
        var env = the_running_execution_context.LexicalEnvironment;
        InitializeBoundName(className, value, env, true); //MODIFIED: strict arugument === true
        return value;
    },

    'ClassDeclaration: class ClassTail',
    function() {
        return this.ClassTail.ClassDefinitionEvaluation(undefined);
    },
]);

// 14.5.16
Runtime_Semantics('Evaluation', [

    'ClassDeclaration: class BindingIdentifier[opt] ClassTail',
    function() {
        var status = this.BindingClassDeclarationEvaluation();
        return empty;
    },

    'ClassExpression: class BindingIdentifier ClassTail',
    function() {
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

// 14.6 Tail Position Calls

// 14.6.1
function IsInTailPosition(nonterminal) {
    Assert(nonterminal instanceof ParsedGrammarProduction);
    if (!nonterminal.strict) return false;
    if (!nonterminal.is_contained_within('FunctionBody', 'ConciseBody')) return false;
    var body = nonterminal.most_closely_contains('FunctionBody', 'ConciseBody');
    if (body.nested.is('GeneratorBody')) return false;
    return body.HasProductionInTailPosition(nonterminal);
}

// 14.6.2
Static_Semantics('HasProductionInTailPosition', [

    // 14.6.2.1 Statement Rules

    'ConciseBody: AssignmentExpression',
    function(nonterminal) {
        return this.AssignmentExpression.HasProductionInTailPosition(nonterminal);
    },

    'StatementList: StatementList StatementListItem',
    function(nonterminal) {
        var has = this.StatementList.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        return this.StatementListItem.HasProductionInTailPosition(nonterminal);
    },

    'FunctionStatementList: [empty]',
    'StatementListItem: Declaration',
    'Statement: VariableStatement',
    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: ContinueStatement',
    'Statement: BreakStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    'Block: { }',
    'ReturnStatement: return ;',
    'LabelledItem: FunctionDeclaration',
    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    'CaseBlock: { }',
    function(nonterminal) {
        return false;
    },

    'IfStatement: if ( Expression ) Statement else Statement',
    function(nonterminal) {
        var has = this.Statement1.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        return this.Statement2.HasProductionInTailPosition(nonterminal);
    },

    'IfStatement: if ( Expression ) Statement',
    'IterationStatement: do Statement while ( Expression ) ;',
    'IterationStatement: while ( Expression ) Statement',
    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    'WithStatement: with ( Expression ) Statement',
    function(nonterminal) {
        return this.Statement.HasProductionInTailPosition(nonterminal);
    },

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(nonterminal) {
        return this.LabelledItem.HasProductionInTailPosition(nonterminal);
    },

    'ReturnStatement: return Expression ;',
    function(nonterminal) {
        return this.Expression.HasProductionInTailPosition(nonterminal);
    },

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(nonterminal) {
        return this.CaseBlock.HasProductionInTailPosition(nonterminal);
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(nonterminal) {
        var has = false;
        if (this.CaseClauses1) var has = this.CaseClauses1.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        var has = this.DefaultClause.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        if (this.CaseClauses2) var has = this.CaseClauses2.HasProductionInTailPosition(nonterminal);
        return has;
    },

    'CaseClauses: CaseClauses CaseClause',
    function(nonterminal) {
        var has = this.CaseClauses.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        return this.CaseClause.HasProductionInTailPosition(nonterminal);
    },

    'CaseClause: case Expression : StatementList[opt]',
    'DefaultClause: default : StatementList[opt]',
    function(nonterminal) {
        if (this.StatementList) return this.StatementList.HasProductionInTailPosition(nonterminal);
        return false;
    },

    'TryStatement: try Block Catch',
    function(nonterminal) {
        return this.Catch.HasProductionInTailPosition(nonterminal);
    },

    'TryStatement: try Block Finally',
    'TryStatement: try Block Catch Finally',
    function(nonterminal) {
        return this.Finally.HasProductionInTailPosition(nonterminal);
    },

    'Catch: catch ( CatchParameter ) Block',
    function(nonterminal) {
        return this.Block.HasProductionInTailPosition(nonterminal);
    },

    // 14.6.2.2 Expression Rules

    'AssignmentExpression: YieldExpression',
    'AssignmentExpression: ArrowFunction',
    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    'BitwiseANDExpression: BitwiseANDExpression & EqualityExpression',
    'BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression',
    'BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression',
    'EqualityExpression: EqualityExpression == RelationalExpression',
    'EqualityExpression: EqualityExpression != RelationalExpression',
    'EqualityExpression: EqualityExpression === RelationalExpression',
    'EqualityExpression: EqualityExpression !== RelationalExpression',
    'RelationalExpression: RelationalExpression < ShiftExpression',
    'RelationalExpression: RelationalExpression > ShiftExpression',
    'RelationalExpression: RelationalExpression <= ShiftExpression',
    'RelationalExpression: RelationalExpression >= ShiftExpression',
    'RelationalExpression: RelationalExpression instanceof ShiftExpression',
    'RelationalExpression: RelationalExpression in ShiftExpression',
    'ShiftExpression: ShiftExpression << AdditiveExpression',
    'ShiftExpression: ShiftExpression >> AdditiveExpression',
    'ShiftExpression: ShiftExpression >>> AdditiveExpression',
    'AdditiveExpression: AdditiveExpression + MultiplicativeExpression',
    'AdditiveExpression: AdditiveExpression - MultiplicativeExpression',
    'MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression',
    'ExponentiationExpression: UpdateExpression ** ExponentiationExpression',
    'UpdateExpression: LeftHandSideExpression ++',
    'UpdateExpression: LeftHandSideExpression --',
    'UpdateExpression: ++ UnaryExpression',
    'UpdateExpression: -- UnaryExpression',
    'UnaryExpression: delete UnaryExpression',
    'UnaryExpression: void UnaryExpression',
    'UnaryExpression: typeof UnaryExpression',
    'UnaryExpression: + UnaryExpression',
    'UnaryExpression: - UnaryExpression',
    'UnaryExpression: ~ UnaryExpression',
    'UnaryExpression: ! UnaryExpression',
    'CallExpression: SuperCall',
    'CallExpression: CallExpression [ Expression ]',
    'CallExpression: CallExpression . IdentifierName',
    'NewExpression: new NewExpression',
    'MemberExpression: MemberExpression [ Expression ]',
    'MemberExpression: MemberExpression . IdentifierName',
    'MemberExpression: SuperProperty',
    'MemberExpression: MetaProperty',
    'MemberExpression: new MemberExpression Arguments',
    'PrimaryExpression: this',
    'PrimaryExpression: IdentifierReference',
    'PrimaryExpression: Literal',
    'PrimaryExpression: ArrayLiteral',
    'PrimaryExpression: ObjectLiteral',
    'PrimaryExpression: FunctionExpression',
    'PrimaryExpression: ClassExpression',
    'PrimaryExpression: GeneratorExpression',
    'PrimaryExpression: RegularExpressionLiteral',
    'PrimaryExpression: TemplateLiteral',
    function(nonterminal) {
        return false;
    },

    'Expression: AssignmentExpression',
    'Expression: Expression , AssignmentExpression',
    function(nonterminal) {
        return this.AssignmentExpression.HasProductionInTailPosition(nonterminal);
    },

    'ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression',
    function(nonterminal) {
        var has = this.AssignmentExpression1.HasProductionInTailPosition(nonterminal);
        if (has === true) return true;
        return this.AssignmentExpression2.HasProductionInTailPosition(nonterminal);
    },

    'LogicalANDExpression: LogicalANDExpression && BitwiseORExpression',
    function(nonterminal) {
        return this.BitwiseORExpression.HasProductionInTailPosition(nonterminal);
    },

    'LogicalORExpression: LogicalORExpression || LogicalANDExpression',
    function(nonterminal) {
        return this.LogicalANDExpression.HasProductionInTailPosition(nonterminal);
    },

    'CallExpression: MemberExpression Arguments',
    'CallExpression: CallExpression Arguments',
    'CallExpression: CallExpression TemplateLiteral',
    function(nonterminal) {
        if (this === nonterminal) return true;
        return false;
    },

    'MemberExpression: MemberExpression TemplateLiteral',
    function(nonterminal) {
        if (this === nonterminal) return true;
        return false;
    },

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function(nonterminal) {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        return expr.HasProductionInTailPosition(nonterminal);
    },

    'ParenthesizedExpression: ( Expression )',
    function(nonterminal) {
        return this.Expression.HasProductionInTailPosition(nonterminal);
    },
]);

// 14.6.3
function PrepareForTailCall() {
    var leafContext = the_running_execution_context;
    remove_from_the_execution_context_stack(leafContext);
}

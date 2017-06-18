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

// 14.1 Function Definitions
/*
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
*/

function parseFunctionDeclaration(Yield, Default) {
    consumeToken('function');
    if (peekToken() !== '(') {
        var name = parseBindingIdentifier(Yield);
        consumeToken('(');
        var param = parseFormalParameters(!'Yield');
        consumeToken(')');
        consumeToken('{');
        var body = parseFunctionBody(!'Yield');
        consumeToken('}');
        return Production['FunctionDeclaration: function BindingIdentifier ( FormalParameters ) { FunctionBody }'](name, param, body);
    }
    if (!Default) throw EarlySyntaxError();
    consumeToken('(');
    var param = parseFormalParameters(!'Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseFunctionBody(!'Yield');
    consumeToken('}');
    return Production['FunctionDeclaration: function ( FormalParameters ) { FunctionBody }'](param, body);
}

function parseFunctionExpression() {
    consumeToken('function');
    if (peekToken() !== '(') {
        var name = parseBindingIdentifier(!'Yield');
    } else {
        var name = null;
    }
    consumeToken('(');
    var param = parseFormalParameters(!'Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseFunctionBody(!'Yield');
    consumeToken('}');
    return Production['FunctionExpression: function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }'](name, param, body);

}

function parseStrictFormalParameters(Yield) {
    var nt = parseFormalParameters(Yield);
    return Production['StrictFormalParameters: FormalParameters'](nt);
}

function parseFormalParameters(Yield) {
    if (peekToken() === ')' || peekToken() === '') {
        return Production['FormalParameters: [empty]']();
    }
    var nt = parseFormalParameterList(Yield);
    return Production['FormalParameters: FormalParameterList'](nt);
}

function parseFormalParameterList(Yield) {
    if (peekToken() === '...') {
        var nt = parseFunctionRestParameter(Yield);
        return Production['FormalParameterList: FunctionRestParameter'](nt);
    }
    var nt = parseFormalParameter(Yield);
    var list = Production['FormalsList: FormalParameter'](nt);
    while (peekToken() === ',') {
        consumeToken(',');
        if (peekToken() === '...') {
            var nt = parseFunctionRestParameter(Yield);
            return Production['FormalParameterList: FormalsList , FunctionRestParameter'](list, nt);
        }
        var nt = parseFormalParameter(Yield);
        var list = Production['FormalsList: FormalsList , FormalParameter'](list, nt);
    }
    return Production['FormalParameterList: FormalsList'](list);
}

function parseFunctionRestParameter(Yield) {
    var nt = parseBindingRestElement(Yield);
    return Production['FunctionRestParameter: BindingRestElement'](nt);
}

function parseFormalParameter(Yield) {
    var nt = parseBindingElement(Yield);
    return Production['FormalParameter: BindingElement'](nt);
}

function parseFunctionBody(Yield) {
    var nt = parseFunctionStatementList(Yield);
    return Production['FunctionBody: FunctionStatementList'](nt);
}

function parseFunctionStatementList(Yield) {
    var nt = parseStatementList_opt(Yield, 'Return');
    return Production['FunctionStatementList: StatementList[opt]'](nt);
}

// 14.2 Arrow Function Definitions
/*
    'ArrowFunction[In,Yield]: ArrowParameters[?Yield] => ConciseBody[?In]',
    'ArrowParameters[Yield]: BindingIdentifier[?Yield]',
    'ArrowParameters[Yield]: CoverParenthesizedExpressionAndArrowParameterList[?Yield]',
    'ConciseBody[In]: AssignmentExpression[?In]',
    'ConciseBody[In]: { FunctionBody }',
    'ArrowFormalParameters[Yield]: ( StrictFormalParameters[?Yield] )',
*/

function parseArrowFunction_after_ArrowParameters(nt, In, Yield) {
    if (peekTokenIsLineSeparated()) {
        throw EarlySyntaxError();
    }
    consumeToken('=>');
    var body = parseConciseBody(In);
    return Production['ArrowFunction: ArrowParameters => ConciseBody'](nt, body);
}

function parseConciseBody(In) {
    if (peekToken() !== '{') {
        var nt = parseAssignmentExpression(In);
        return Production['ConciseBody: AssignmentExpression'](nt);
    }
    consumeToken('{');
    var nt = parseFunctionBody(!'Yield');
    consumeToken('}');
    return Production['ConciseBody: { FunctionBody }'](nt);
}

function parseArrowFormalParameters(Yield) {
    consumeToken('(');
    var nt = parseStrictFormalParameters(Yield);
    consumeToken(')');
    return Production['ArrowFormalParameters: ( StrictFormalParameters )'](nt);
}

// 14.3 Method Definitions
/*
    'MethodDefinition[Yield]: PropertyName[?Yield] ( StrictFormalParameters ) { FunctionBody }',
    'MethodDefinition[Yield]: GeneratorMethod[?Yield]',
    'MethodDefinition[Yield]: get PropertyName[?Yield] ( ) { FunctionBody }',
    'MethodDefinition[Yield]: set PropertyName[?Yield] ( PropertySetParameterList ) { FunctionBody }',
    'PropertySetParameterList: FormalParameter',
*/

function parseMethodDefinition(Yield) {
    switch (peekToken()) {
        case 'get':
            if (peekToken(1) === '(') break;
            consumeToken('get');
            var name = parsePropertyName(Yield);
            consumeToken('(');
            consumeToken(')');
            consumeToken('{');
            var body = parseFunctionBody(!'Yield');
            consumeToken('}');
            return Production['MethodDefinition: get PropertyName ( ) { FunctionBody }'](name, body);
        case 'set':
            if (peekToken(1) === '(') break;
            consumeToken('set');
            var name = parsePropertyName(Yield);
            consumeToken('(');
            var param = parsePropertySetParameterList();
            consumeToken(')');
            consumeToken('{');
            var body = parseFunctionBody(!'Yield');
            consumeToken('}');
            return Production['MethodDefinition: set PropertyName ( PropertySetParameterList ) { FunctionBody }'](name, param, body);
        case '*':
            skipSeparators();
            var pos = parsingPosition;
            var nt = parseGeneratorMethod(Yield);
            nt.text = sourceText.substring(pos, parsingPosition);
            return Production['MethodDefinition: GeneratorMethod'](nt);
    }
    var name = parsePropertyName(Yield);
    return parseMethodDefinition_after_PropertyName(name, Yield);
}

function parseMethodDefinition_after_PropertyName(name, Yield) {
    consumeToken('(');
    var param = parseStrictFormalParameters(!'Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseFunctionBody(!'Yield');
    consumeToken('}');
    return Production['MethodDefinition: PropertyName ( StrictFormalParameters ) { FunctionBody }'](name, param, body);
}

function parsePropertySetParameterList() {
    var nt = parseFormalParameter(!'Yield');
    return Production['PropertySetParameterList: FormalParameter'](nt);

}

// 14.4 Generator Function Definitions
/*
    'GeneratorMethod[Yield]: * PropertyName[?Yield] ( StrictFormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorDeclaration[Yield,Default]: function * BindingIdentifier[?Yield] ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorDeclaration[Yield,Default]:[+Default] function * ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorExpression: function * BindingIdentifier[Yield][opt] ( FormalParameters[Yield] ) { GeneratorBody }',
    'GeneratorBody: FunctionBody[Yield]',
    'YieldExpression[In]: yield',
    'YieldExpression[In]: yield AssignmentExpression[?In,Yield]',
    'YieldExpression[In]: yield * AssignmentExpression[?In,Yield]',
*/

function parseGeneratorMethod(Yield) {
    consumeToken('*');
    var name = parsePropertyName(Yield);
    consumeToken('(');
    var param = parseStrictFormalParameters('Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseGeneratorBody();
    consumeToken('}');
    return Production['GeneratorMethod: * PropertyName ( StrictFormalParameters ) { GeneratorBody }'](name, param, body);
}

function parseGeneratorDeclaration(Yield, Default) {
    consumeToken('function');
    consumeToken('*');
    if (peekToken() !== '(') {
        var name = parseBindingIdentifier(Yield);
        consumeToken('(');
        var param = parseFormalParameters('Yield');
        consumeToken(')');
        consumeToken('{');
        var body = parseGeneratorBody();
        consumeToken('}');
        return Production['GeneratorDeclaration: function * BindingIdentifier ( FormalParameters ) { GeneratorBody }'](name, param, body);
    }
    if (!Default) throw EarlySyntaxError();
    consumeToken('(');
    var param = parseFormalParameters('Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseGeneratorBody();
    consumeToken('}');
    return Production['GeneratorDeclaration: function * ( FormalParameters ) { GeneratorBody }'](param, body);
}

function parseGeneratorExpression() {
    consumeToken('function');
    consumeToken('*');
    if (peekToken() !== '(') {
        var name = parseBindingIdentifier('Yield');
    } else {
        var name = null;
    }
    consumeToken('(');
    var param = parseFormalParameters('Yield');
    consumeToken(')');
    consumeToken('{');
    var body = parseGeneratorBody();
    consumeToken('}');
    return Production['GeneratorExpression: function * BindingIdentifier[opt] ( FormalParameters ) { GeneratorBody }'](name, param, body);
}

function parseGeneratorBody() {
    var nt = parseFunctionBody('Yield');
    return Production['GeneratorBody: FunctionBody'](nt);
}

function parseYieldExpression(In) {
    consumeToken('yield');
    if (peekTokenIsLineSeparated()) {
        return Production['YieldExpression: yield']();
    }
    switch (peekToken()) {
        case ')':
        case ']':
        case '}':
        case ',':
        case ';':
        case ':':
            return Production['YieldExpression: yield']();
        case '*':
            consumeToken('*');
            var nt = parseAssignmentExpression(In, 'Yield');
            return Production['YieldExpression: yield * AssignmentExpression'](nt);

    }
    var nt = parseAssignmentExpression(In, 'Yield');
    return Production['YieldExpression: yield AssignmentExpression'](nt);
}

// 14.5 Class Definitions
/*
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
*/

function parseClassDeclaration(Yield, Default) {
    consumeToken('class');
    if (peekToken() !== 'extends' && peekToken() !== '{') {
        var name = parseBindingIdentifier(Yield);
        var tail = parseClassTail(Yield);
        return Production['ClassDeclaration: class BindingIdentifier ClassTail'](name, tail);
    }
    if (!Default) throw EarlySyntaxError();
    var tail = parseClassTail(Yield);
    return Production['ClassDeclaration: class ClassTail'](tail);
}

function parseClassExpression(Yield, Default) {
    consumeToken('class');
    if (peekToken() !== 'extends' && peekToken() !== '{') {
        var name = parseBindingIdentifier(Yield);
    } else {
        var name = null;
    }
    var tail = parseClassTail(Yield);
    return Production['ClassExpression: class BindingIdentifier[opt] ClassTail'](name, tail);
}

function parseClassTail(Yield) {
    var nt = parseClassHeritage_opt(Yield);
    consumeToken('{');
    var body = parseClassBody_opt(Yield);
    consumeToken('}');
    return Production['ClassTail: ClassHeritage[opt] { ClassBody[opt] }'](nt, body);

}

function parseClassHeritage_opt(Yield) {
    if (peekToken() !== 'extends') return null;
    consumeToken('extends');
    var nt = parseLeftHandSideExpression(Yield);
    return Production['ClassHeritage: extends LeftHandSideExpression'](nt);
}

function parseClassBody_opt(Yield) {
    if (peekToken() === '}') return null;
    var nt = parseClassElementList(Yield);
    return Production['ClassBody: ClassElementList'](nt);
}

function parseClassElementList(Yield) {
    var nt = parseClassElement(Yield);
    var list = Production['ClassElementList: ClassElement'](nt);
    while (peekToken() !== '}') {
        var nt = parseClassElement(Yield);
        var list = Production['ClassElementList: ClassElementList ClassElement'](list, nt);
    }
    return list;
}

function parseClassElement(Yield) {
    if (peekToken() === ';') {
        consumeToken(';');
        return Production['ClassElement: ;']();
    }
    if (peekToken() === 'static') {
        consumeToken('static');
        skipSeparators();
        var pos = parsingPosition;
        var nt = parseMethodDefinition(Yield);
        nt.text = sourceText.substring(pos, parsingPosition);
        return Production['ClassElement: static MethodDefinition'](nt);
    }
    skipSeparators();
    var pos = parsingPosition;
    var nt = parseMethodDefinition(Yield);
    nt.text = sourceText.substring(pos, parsingPosition);
    return Production['ClassElement: MethodDefinition'](nt);
}

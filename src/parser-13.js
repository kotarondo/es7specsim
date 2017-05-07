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

// 13 ECMAScript Language: Statements and Declarations
/*
    'Statement[Yield,Return]: BlockStatement[?Yield,?Return]',
    'Statement[Yield,Return]: VariableStatement[?Yield]',
    'Statement[Yield,Return]: EmptyStatement',
    'Statement[Yield,Return]: ExpressionStatement[?Yield]',
    'Statement[Yield,Return]: IfStatement[?Yield,?Return]',
    'Statement[Yield,Return]: BreakableStatement[?Yield,?Return]',
    'Statement[Yield,Return]: ContinueStatement[?Yield]',
    'Statement[Yield,Return]: BreakStatement[?Yield]',
    'Statement[Yield,Return]:[+Return] ReturnStatement[?Yield]',
    'Statement[Yield,Return]: WithStatement[?Yield,?Return]',
    'Statement[Yield,Return]: LabelledStatement[?Yield,?Return]',
    'Statement[Yield,Return]: ThrowStatement[?Yield]',
    'Statement[Yield,Return]: TryStatement[?Yield,?Return]',
    'Statement[Yield,Return]: DebuggerStatement',
    'Declaration[Yield]: HoistableDeclaration[?Yield]',
    'Declaration[Yield]: ClassDeclaration[?Yield]',
    'Declaration[Yield]: LexicalDeclaration[In,?Yield]',
    'HoistableDeclaration[Yield,Default]: FunctionDeclaration[?Yield,?Default]',
    'HoistableDeclaration[Yield,Default]: GeneratorDeclaration[?Yield,?Default]',
    'BreakableStatement[Yield,Return]: IterationStatement[?Yield,?Return]',
    'BreakableStatement[Yield,Return]: SwitchStatement[?Yield,?Return]',
*/

function parseStatement(Yield, Return) {
    switch (peekToken()) {
        case '{':
            var nt = parseBlockStatement(Yield, Return);
            return Production['Statement: BlockStatement'](nt);
        case 'var':
            var nt = parseVariableStatement(Yield);
            return Production['Statement: VariableStatement'](nt);
        case ';':
            var nt = parseEmptyStatement();
            return Production['Statement: EmptyStatement'](nt);
        case 'if':
            var nt = parseIfStatement(Yield, Return);
            return Production['Statement: IfStatement'](nt);
        case 'do':
        case 'while':
        case 'for':
        case 'switch':
            var nt = parseBreakableStatement(Yield, Return);
            return Production['Statement: BreakableStatement'](nt);
        case 'continue':
            var nt = parseContinueStatement(Yield);
            return Production['Statement: ContinueStatement'](nt);
        case 'break':
            var nt = parseBreakStatement(Yield);
            return Production['Statement: BreakStatement'](nt);
        case 'return':
            if (!Return) break;
            var nt = parseReturnStatement(Yield);
            return Production['Statement: ReturnStatement'](nt);
        case 'with':
            var nt = parseWithStatement(Yield, Return);
            return Production['Statement: WithStatement'](nt);
        case 'throw':
            var nt = parseThrowStatement(Yield);
            return Production['Statement: ThrowStatement'](nt);
        case 'try':
            var nt = parseTryStatement(Yield, Return);
            return Production['Statement: TryStatement'](nt);
        case 'debugger':
            var nt = parseDebuggerStatement();
            return Production['Statement: DebuggerStatement'](nt);
    }
    if (peekTokenIsIdentifierName() && peekToken(1) === ':') {
        var nt = parseLabelledStatement(Yield, Return);
        return Production['Statement: LabelledStatement'](nt);
    }
    var nt = parseExpressionStatement(Yield);
    return Production['Statement: ExpressionStatement'](nt);
}

function parseDeclaration(Yield) {
    switch (peekToken()) {
        case 'function':
            var nt = parseHoistableDeclaration(Yield);
            return Production['Declaration: HoistableDeclaration'](nt);
        case 'class':
            var nt = parseClassDeclaration(Yield);
            return Production['Declaration: ClassDeclaration'](nt);
        case 'let':
        case 'const':
            var nt = parseLexicalDeclaration('In', Yield);
            return Production['Declaration: LexicalDeclaration'](nt);
    }
    throw EarlySyntaxError();
}

function parseHoistableDeclaration(Yield, Default) {
    if (peekToken(1) === '*') {
        var nt = parseGeneratorDeclaration(Yield, Default);
        return Production['HoistableDeclaration: GeneratorDeclaration'](nt);
    }
    var nt = parseFunctionDeclaration(Yield, Default);
    return Production['HoistableDeclaration: FunctionDeclaration'](nt);
}

function parseBreakableStatement(Yield, Return) {
    if (peekToken() === 'switch') {
        var nt = parseSwitchStatement(Yield, Return);
        return Production['BreakableStatement: SwitchStatement'](nt);
    }
    var nt = parseIterationStatement(Yield, Return);
    return Production['BreakableStatement: IterationStatement'](nt);
}

// 13.2 Block
/*
    'BlockStatement[Yield,Return]: Block[?Yield,?Return]',
    'Block[Yield,Return]: { StatementList[?Yield,?Return][opt] }',
    'StatementList[Yield,Return]: StatementListItem[?Yield,?Return]',
    'StatementList[Yield,Return]: StatementList[?Yield,?Return] StatementListItem[?Yield,?Return]',
    'StatementListItem[Yield,Return]: Statement[?Yield,?Return]',
    'StatementListItem[Yield,Return]: Declaration[?Yield]',
*/

function parseBlockStatement(Yield, Return) {
    var nt = parseBlock(Yield, Return);
    return Production['BlockStatement: Block'](nt);
}

function parseBlock(Yield, Return) {
    consumeToken('{');
    var nt = parseStatementList_opt(Yield, Return);
    consumeToken('}');
    return Production['Block: { StatementList[opt] }'](nt);
}


function parseStatementList_opt(Yield, Return) {
    switch (peekToken()) {
        case '}':
        case 'case':
        case 'default':
        case '':
            return null;
    }
    return parseStatementList(Yield, Return);
}

function parseStatementList(Yield, Return) {
    var nt = parseStatementListItem(Yield, Return);
    var list = Production['StatementList: StatementListItem'](nt);
    while (true) {
        switch (peekToken()) {
            case '}':
            case 'case':
            case 'default':
            case '':
                return list;
        }
        var nt = parseStatementListItem(Yield, Return);
        var list = Production['StatementList: StatementList StatementListItem'](list, nt);
    }
}

function parseStatementListItem(Yield, Return) {
    switch (peekToken()) {
        case 'let':
            if (peekToken(1) !== '[' && peekToken(1) !== '{') {
                if (!peekTokenIsIdentifierName(1) || peekTokenIsReservedWord(1)) {
                    break;
                }
            }
        case 'const':
        case 'function':
        case 'class':
            var nt = parseDeclaration(Yield);
            return Production['StatementListItem: Declaration'](nt);
    }
    var nt = parseStatement(Yield, Return);
    return Production['StatementListItem: Statement'](nt);
}

// 13.3.1 Let and Const Declarations
/*
    'LexicalDeclaration[In,Yield]: LetOrConst BindingList[?In,?Yield] ;',
    'LetOrConst: let',
    'LetOrConst: const',
    'BindingList[In,Yield]: LexicalBinding[?In,?Yield]',
    'BindingList[In,Yield]: BindingList[?In,?Yield] , LexicalBinding[?In,?Yield]',
    'LexicalBinding[In,Yield]: BindingIdentifier[?Yield] Initializer[?In,?Yield][opt]',
    'LexicalBinding[In,Yield]: BindingPattern[?Yield] Initializer[?In,?Yield]',
*/

function parseLexicalDeclaration(In, Yield) {
    var lc = parseLetOrConst();
    var nt = parseBindingList(In, Yield);
    insertAutoSemicolon();
    return Production['LexicalDeclaration: LetOrConst BindingList ;'](lc, nt);
}

function parseLetOrConst() {
    switch (peekToken()) {
        case 'let':
            consumeToken('let');
            return Production['LetOrConst: let']();
        case 'const':
            consumeToken('const');
            return Production['LetOrConst: const']();
    }
}

function parseBindingList(In, Yield) {
    var nt = parseLexicalBinding(In, Yield);
    return parseBindingList_after_Binding(nt, In, Yield);
}

function parseBindingList_after_LexicalBinding(nt, In, Yield) {
    var list = Production['BindingList: LexicalBinding'](nt);
    while (peekToken() === ',') {
        consumeToken(',');
        var nt = parseLexicalBinding(In, Yield);
        var list = Production['BindingList: BindingList , LexicalBinding'](list, nt);
    }
    return list;
}

function parseLexicalBinding(In, Yield) {
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseBindingIdentifier(Yield);
        var ini = parseInitializer_opt(In, Yield);
        return Production['LexicalBinding: BindingIdentifier Initializer[opt]'](nt, ini);
    }
    var nt = parseBindingPattern(Yield);
    var ini = parseInitializer(In, Yield);
    return Production['LexicalBinding: BindingPattern Initializer'](nt, ini);

}

// 13.3.2 Variable Statement
/*
    'VariableStatement[Yield]: var VariableDeclarationList[In,?Yield] ;',
    'VariableDeclarationList[In,Yield]: VariableDeclaration[?In,?Yield]',
    'VariableDeclarationList[In,Yield]: VariableDeclarationList[?In,?Yield] , VariableDeclaration[?In,?Yield]',
    'VariableDeclaration[In,Yield]: BindingIdentifier[?Yield] Initializer[?In,?Yield][opt]',
    'VariableDeclaration[In,Yield]: BindingPattern[?Yield] Initializer[?In,?Yield]',
*/

function parseVariableStatement(Yield) {
    consumeToken('var');
    var nt = parseVariableDeclarationList('In', Yield);
    insertAutoSemicolon();
    return Production['VariableStatement: var VariableDeclarationList ;'](nt);
}

function parseVariableDeclarationList(In, Yield) {
    var nt = parseVariableDeclaration(In, Yield);
    return parseVariableDeclarationList_after_VariableDeclaration(nt, In, Yield);
}

function parseVariableDeclarationList_after_VariableDeclaration(nt, In, Yield) {
    var list = Production['VariableDeclarationList: VariableDeclaration'](nt);
    while (peekToken() === ',') {
        consumeToken(',');
        var nt = parseVariableDeclaration(In, Yield);
        var list = Production['VariableDeclarationList: VariableDeclarationList , VariableDeclaration'](list, nt);
    }
    return list;
}

function parseVariableDeclaration(In, Yield) {
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseBindingIdentifier(Yield);
        var ini = parseInitializer_opt(In, Yield);
        return Production['VariableDeclaration: BindingIdentifier Initializer[opt]'](nt, ini);
    }
    var nt = parseBindingPattern(Yield);
    var ini = parseInitializer(In, Yield);
    return Production['VariableDeclaration: BindingPattern Initializer'](nt, ini);
}

// 13.3.3 Destructuring Binding Patterns
/*
    'BindingPattern[Yield]: ObjectBindingPattern[?Yield]',
    'BindingPattern[Yield]: ArrayBindingPattern[?Yield]',
    'ObjectBindingPattern[Yield]: { }',
    'ObjectBindingPattern[Yield]: { BindingPropertyList[?Yield] }',
    'ObjectBindingPattern[Yield]: { BindingPropertyList[?Yield] , }',
    'ArrayBindingPattern[Yield]: [ Elision[opt] BindingRestElement[?Yield][opt] ]',
    'ArrayBindingPattern[Yield]: [ BindingElementList[?Yield] ]',
    'ArrayBindingPattern[Yield]: [ BindingElementList[?Yield] , Elision[opt] BindingRestElement[?Yield][opt] ]',
    'BindingPropertyList[Yield]: BindingProperty[?Yield]',
    'BindingPropertyList[Yield]: BindingPropertyList[?Yield] , BindingProperty[?Yield]',
    'BindingElementList[Yield]: BindingElisionElement[?Yield]',
    'BindingElementList[Yield]: BindingElementList[?Yield] , BindingElisionElement[?Yield]',
    'BindingElisionElement[Yield]: Elision[opt] BindingElement[?Yield]',
    'BindingProperty[Yield]: SingleNameBinding[?Yield]',
    'BindingProperty[Yield]: PropertyName[?Yield] : BindingElement[?Yield]',
    'BindingElement[Yield]: SingleNameBinding[?Yield]',
    'BindingElement[Yield]: BindingPattern[?Yield] Initializer[In,?Yield][opt]',
    'SingleNameBinding[Yield]: BindingIdentifier[?Yield] Initializer[In,?Yield][opt]',
    'BindingRestElement[Yield]: ... BindingIdentifier[?Yield]',
    'BindingRestElement[Yield]: ... BindingPattern[?Yield]',
*/

function parseBindingPattern(Yield) {
    if (peekToken() === '{') {
        var nt = parseObjectBindingPattern(Yield);
        return Production['BindingPattern: ObjectBindingPattern'](nt);
    }
    var nt = parseArrayBindingPattern(Yield);
    return Production['BindingPattern: ArrayBindingPattern'](nt);
}

function parseObjectBindingPattern(Yield) {
    consumeToken('{');
    if (peekToken() === '}') {
        consumeToken('}');
        return Production['ObjectBindingPattern: { }']();
    }
    var nt = parseBindingProperty(Yield);
    var list = Production['BindingPropertyList: BindingProperty'](nt);
    while (true) {
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectBindingPattern: { BindingPropertyList }'](list);
        }
        consumeToken(',');
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectBindingPattern: { BindingPropertyList , }'](list);
        }
        var nt = parseBindingProperty(Yield);
        var list = Production['BindingPropertyList: BindingPropertyList , BindingProperty'](list, nt);
    }
}

function parseArrayBindingPattern(Yield) {
    consumeToken('[');
    var elis = parseElision_opt();
    if (peekToken() === ']') {
        consumeToken(']');
        return Production['ArrayBindingPattern: [ Elision[opt] BindingRestElement[opt] ]'](elis, null);
    }
    if (peekToken() === '...') {
        var nt = parseBindingRestElement(Yield);
        consumeToken(']');
        return Production['ArrayBindingPattern: [ Elision[opt] BindingRestElement[opt] ]'](elis, nt);
    }
    var nt = parseBindingElement(Yield);
    var nt = Production['BindingElisionElement: Elision[opt] BindingElement'](elis, nt);
    var list = Production['BindingElementList: BindingElisionElement'](nt);
    while (true) {
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayBindingPattern: [ BindingElementList ]'](list);
        }
        consumeToken(',');
        var elis = parseElision_opt();
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement[opt] ]'](list, elis, null);
        }
        if (peekToken() === '...') {
            var nt = parseBindingRestElement(Yield);
            consumeToken(']');
            return Production['ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement[opt] ]'](list, elis, nt);
        }
        var nt = parseBindingElement(Yield);
        var nt = Production['BindingElisionElement: Elision[opt] BindingElement'](elis, nt);
        var list = Production['BindingElementList: BindingElementList , BindingElisionElement'](list, nt);

    }
}

function parseBindingProperty(Yield) {
    if (peekTokenIsIdentifierName() && peekToken(1) !== ':') {
        var nt = parseSingleNameBinding(Yield);
        return Production['BindingProperty: SingleNameBinding'](nt);
    }
    var name = parsePropertyName(Yield);
    consumeToken(':');
    var nt = parseBindingElement(Yield);
    return Production['BindingProperty: PropertyName : BindingElement'](name, nt);
}

function parseBindingElement(Yield) {
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseSingleNameBinding(Yield);
        return Production['BindingElement: SingleNameBinding'](nt);
    }
    var nt = parseBindingPattern(Yield);
    var ini = parseInitializer_opt('In', Yield);
    return Production['BindingElement: BindingPattern Initializer[opt]'](nt, ini);
}

function parseSingleNameBinding(Yield) {
    var nt = parseBindingIdentifier(Yield);
    var ini = parseInitializer_opt('In', Yield);
    return Production['SingleNameBinding: BindingIdentifier Initializer[opt]'](nt, ini);
}

function parseBindingRestElement(Yield) {
    consumeToken('...');
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseBindingIdentifier(Yield);
        return Production['BindingRestElement: ... BindingIdentifier'](nt);
    }
    var nt = parseBindingPattern(Yield);
    return Production['BindingRestElement: ... BindingPattern'](nt);
}

// 13.4 Empty Statement
/*
    'EmptyStatement: ;',
*/

function parseEmptyStatement() {
    consumeToken(';');
    return Production['EmptyStatement: ;']();
}

// 13.5 Expression Statement
/*
    'ExpressionStatement[Yield]: Expression[In,?Yield] ;',
*/

function parseExpressionStatement(Yield) {
    switch (peekToken()) {
        case '{':
        case 'function':
        case 'class':
            throw EarlySyntaxError();
        case 'let':
            if (peekToken(1) === '[') {
                throw EarlySyntaxError();
            }
    }
    var nt = parseExpression('In', Yield);
    insertAutoSemicolon();
    return Production['ExpressionStatement: Expression ;'](nt);
}

// 13.6 The if Statement
/*
    'IfStatement[Yield,Return]: if ( Expression[In,?Yield] ) Statement[?Yield,?Return] else Statement[?Yield,?Return]',
    'IfStatement[Yield,Return]: if ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
*/

function parseIfStatement(Yield, Return) {
    consumeToken('if');
    consumeToken('(');
    var expr = parseExpression('In', Yield);
    consumeToken(')');
    var stmt1 = parseStatement(Yield, Return);
    if (peekToken() === 'else') {
        consumeToken('else');
        var stmt2 = parseStatement(Yield, Return);
        return Production['IfStatement: if ( Expression ) Statement else Statement'](expr, stmt1, stmt2);
    }
    return Production['IfStatement: if ( Expression ) Statement'](expr, stmt1);

}

// 13.7 Iteration Statements
/*
    'IterationStatement[Yield,Return]: do Statement[?Yield,?Return] while ( Expression[In,?Yield] ) ;',
    'IterationStatement[Yield,Return]: while ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( Expression[?Yield][opt] ; Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var VariableDeclarationList[?Yield] ; Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LexicalDeclaration[?Yield] Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LeftHandSideExpression[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var ForBinding[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( ForDeclaration[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LeftHandSideExpression[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var ForBinding[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( ForDeclaration[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'ForDeclaration[Yield]: LetOrConst ForBinding[?Yield]',
    'ForBinding[Yield]: BindingIdentifier[?Yield]',
    'ForBinding[Yield]: BindingPattern[?Yield]',
*/

function parseIterationStatement(Yield, Return) {
    switch (peekToken()) {
        case 'do':
            consumeToken('do');
            var stmt = parseStatement(Yield, Return);
            consumeToken('while');
            consumeToken('(');
            var expr = parseExpression('In', Yield);
            consumeToken(')');
            if (peekToken() === ';') {
                consumeToken(';');
            }
            return Production['IterationStatement: do Statement while ( Expression ) ;'](stmt, expr);

        case 'while':
            consumeToken('while');
            consumeToken('(');
            var expr = parseExpression('In', Yield);
            consumeToken(')');
            var stmt = parseStatement(Yield, Return);
            return Production['IterationStatement: while ( Expression ) Statement'](expr, stmt);
    }

    consumeToken('for');
    consumeToken('(');
    var type = peekToken();
    switch (type) {
        case 'var':
            consumeToken('var');
            var nt = parseForBinding(Yield);
            if (peekToken() === 'in') {
                consumeToken('in');
                var expr = parseExpression('In', Yield);
                consumeToken(')');
                var stmt = parseStatement(Yield, Return);
                return Production['IterationStatement: for ( var ForBinding in Expression ) Statement'](nt, expr, stmt);
            }
            if (peekToken() === 'of') {
                consumeToken('of');
                var expr = parseAssignmentExpression('In', Yield);
                consumeToken(')');
                var stmt = parseStatement(Yield, Return);
                return Production['IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement'](nt, expr, stmt);
            }
            if (nt.is('BindingIdentifier')) {
                var nt = nt.resolve('BindingIdentifier');
                delete nt.nested;
                var ini = parseInitializer_opt(!'In', Yield);
                var nt = Production['VariableDeclaration: BindingIdentifier Initializer[opt]'](nt, ini);
            } else {
                var nt = nt.resolve('BindingPattern');
                delete nt.nested;
                var ini = parseInitializer(!'In', Yield);
                var nt = Production['VariableDeclaration: BindingPattern Initializer'](nt, ini);
            }
            var nt = parseVariableDeclarationList_after_VariableDeclaration(nt, !'In', Yield);
            consumeToken(';');
            var expr1 = parseExpression_opt('In', Yield);
            consumeToken(';');
            var expr2 = parseExpression_opt('In', Yield);
            consumeToken(')');
            var stmt = parseStatement(Yield, Return);
            return Production['IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement'](nt, expr1, expr2, stmt);

        case 'let':
            if (peekToken(1) !== '[' && peekToken(1) !== '{') {
                if (!peekTokenIsIdentifierName(1) || peekTokenIsReservedWord(1)) {
                    break;
                }
            }
        case 'const':
            var nt = parseForDeclaration(Yield);
            if (peekToken() === 'in') {
                consumeToken('in');
                var expr = parseExpression('In', Yield);
                consumeToken(')');
                var stmt = parseStatement(Yield, Return);
                return Production['IterationStatement: for ( ForDeclaration in Expression ) Statement'](nt, expr, stmt);
            }
            if (peekToken() === 'of') {
                consumeToken('of');
                var expr = parseAssignmentExpression('In', Yield);
                consumeToken(')');
                var stmt = parseStatement(Yield, Return);
                return Production['IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement'](nt, expr, stmt);
            }
            var lc = nt.LetOrConst;
            delete lc.nested;
            var nt = nt.ForBinding;
            if (nt.is('BindingIdentifier')) {
                var nt = nt.resolve('BindingIdentifier');
                delete nt.nested;
                var ini = parseInitializer_opt(!'In', Yield);
                var nt = Production['LexicalBinding: BindingIdentifier Initializer[opt]'](nt, ini);
            } else {
                var nt = nt.resolve('BindingPattern');
                delete nt.nested;
                var ini = parseInitializer(!'In', Yield);
                var nt = Production['LexicalBinding: BindingPattern Initializer'](nt, ini);
            }
            var nt = parseBindingList_after_LexicalBinding(nt, !'In', Yield);
            var nt = Production['LexicalDeclaration: LetOrConst BindingList ;'](lc, nt);
            consumeToken(';');
            var expr1 = parseExpression_opt('In', Yield);
            consumeToken(';');
            var expr2 = parseExpression_opt('In', Yield);
            consumeToken(')');
            var stmt = parseStatement(Yield, Return);
            return Production['IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement'](nt, expr1, expr2, stmt);
    }

    var nt = parseExpression_opt(!'In', Yield);
    if (peekToken() === 'in') {
        if (!nt.is('LeftHandSideExpression')) {
            throw EarlySyntaxError();
        }
        nt = nt.resolve('LeftHandSideExpression');
        delete nt.nested;
        if (nt.is('ObjectLiteral') || nt.is('ArrayLiteral')) {
            // from 13.7.5.1
            //TODO re-parseAssignmentPattern(Yield);
        }
        consumeToken('in');
        var expr = parseExpression('In', Yield);
        consumeToken(')');
        var stmt = parseStatement(Yield, Return);
        return Production['IterationStatement: for ( LeftHandSideExpression in Expression ) Statement'](nt, expr, stmt);
    }
    if (peekToken() === 'of') {
        if (type === 'let') throw EarlySyntaxError();
        if (!nt.is('LeftHandSideExpression')) {
            throw EarlySyntaxError();
        }
        nt = nt.resolve('LeftHandSideExpression');
        delete nt.nested;
        if (nt.is('ObjectLiteral') || nt.is('ArrayLiteral')) {
            // from 13.7.5.1
            //TODO re-parseAssignmentPattern(Yield);
        }
        consumeToken('of');
        var expr = parseAssignmentExpression('In', Yield);
        consumeToken(')');
        var stmt = parseStatement(Yield, Return);
        return Production['IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement'](nt, expr, stmt);
    }
    consumeToken(';');
    var expr1 = parseExpression_opt('In', Yield);
    consumeToken(';');
    var expr2 = parseExpression_opt('In', Yield);
    consumeToken(')');
    var stmt = parseStatement(Yield, Return);
    return Production['IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement'](nt, expr1, expr2, stmt);
}

function parseForDeclaration(Yield) {
    var lc = parseLetOrConst();
    var nt = parseForBinding(Yield);
    return Production['ForDeclaration: LetOrConst ForBinding'](lc, nt);
}

function parseForBinding(Yield) {
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseBindingIdentifier(Yield);
        return Production['ForBinding: BindingIdentifier'](nt);
    }
    var nt = parseBindingPattern(Yield);
    return Production['ForBinding: BindingPattern'](nt);
}

// 13.8 The continue Statement
/*
    'ContinueStatement[Yield]: continue ;',
    'ContinueStatement[Yield]: continue LabelIdentifier[?Yield] ;',
*/

function parseContinueStatement(Yield) {
    consumeToken('continue');
    if (!isAutoSemicolonCapable()) {
        var nt = parseLabelIdentifier(Yield);
        insertAutoSemicolon();
        return Production['ContinueStatement: continue LabelIdentifier ;'](nt);
    }
    insertAutoSemicolon();
    return Production['ContinueStatement: continue ;']();
}

// 13.9 The break Statement
/*
    'BreakStatement[Yield]: break ;',
    'BreakStatement[Yield]: break LabelIdentifier[?Yield] ;',
*/

function parseBreakStatement(Yield) {
    consumeToken('break');
    if (!isAutoSemicolonCapable()) {
        var nt = parseLabelIdentifier(Yield);
        insertAutoSemicolon();
        return Production['BreakStatement: break LabelIdentifier ;'](nt);

    }
    insertAutoSemicolon();
    return Production['BreakStatement: break ;']();

}

// 13.10 The return Statement
/*
    'ReturnStatement[Yield]: return ;',
    'ReturnStatement[Yield]: return Expression[In,?Yield] ;',
*/

function parseReturnStatement(Yield) {
    consumeToken('return');
    if (!isAutoSemicolonCapable()) {
        var nt = parseExpression('In', Yield);
        insertAutoSemicolon();
        return Production['ReturnStatement: return Expression ;'](nt);
    }
    insertAutoSemicolon();
    return Production['ReturnStatement: return ;']();

}

// 13.11 The with Statement
/*
    'WithStatement[Yield,Return]: with ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
*/

function parseWithStatement(Yield, Return) {
    consumeToken('with');
    consumeToken('(');
    var expr = parseExpression('In', Yield);
    consumeToken(')');
    var stmt = parseStatement(Yield, Return);
    return Production['WithStatement: with ( Expression ) Statement'](expr, stmt);

}

// 13.12 The switch Statement
/*
    'SwitchStatement[Yield,Return]: switch ( Expression[In,?Yield] ) CaseBlock[?Yield,?Return]',
    'CaseBlock[Yield,Return]: { CaseClauses[?Yield,?Return][opt] }',
    'CaseBlock[Yield,Return]: { CaseClauses[?Yield,?Return][opt] DefaultClause[?Yield,?Return] CaseClauses[?Yield,?Return][opt] }',
    'CaseClauses[Yield,Return]: CaseClause[?Yield,?Return]',
    'CaseClauses[Yield,Return]: CaseClauses[?Yield,?Return] CaseClause[?Yield,?Return]',
    'CaseClause[Yield,Return]: case Expression[In,?Yield] : StatementList[?Yield,?Return][opt]',
    'DefaultClause[Yield,Return]: default : StatementList[?Yield,?Return][opt]',
*/

function parseSwitchStatement(Yield, Return) {
    consumeToken('switch');
    consumeToken('(');
    var expr = parseExpression('In', Yield);
    consumeToken(')');
    var nt = parseCaseBlock(Yield, Return);
    return Production['SwitchStatement: switch ( Expression ) CaseBlock'](expr, nt);
}

function parseCaseBlock(Yield, Return) {
    consumeToken('{');
    var c1 = parseCaseClauses_opt(Yield, Return);
    if (peekToken() === 'default') {
        var d = parseDefaultClause(Yield, Return);
        var c2 = parseCaseClauses_opt(Yield, Return);
        consumeToken('}');
        return Production['CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }'](c1, d, c2);
    }
    consumeToken('}');
    return Production['CaseBlock: { CaseClauses[opt] }'](c1);
}

function parseCaseClauses_opt(Yield, Return) {
    if (peekToken() !== 'case') return null;
    var nt = parseCaseClause(Yield, Return);
    var list = Production['CaseClauses: CaseClause'](nt);
    while (peekToken() === 'case') {
        var nt = parseCaseClause(Yield, Return);
        var list = Production['CaseClauses: CaseClauses CaseClause'](list, nt);
    }
}

function parseCaseClause(Yield, Return) {
    consumeToken('case');
    var expr = parseExpression('In', Yield);
    consumeToken(':');
    var stmt = parseStatementList_opt(Yield, Return);
    return Production['CaseClause: case Expression : StatementList[opt]'](expr, stmt);
}

function parseDefaultClause(Yield, Return) {
    consumeToken('default');
    consumeToken(':');
    var stmt = parseStatementList_opt(Yield, Return);
    return Production['DefaultClause: default : StatementList[opt]'](stmt);
}

// 13.13 Labelled Statements
/*
    'LabelledStatement[Yield,Return]: LabelIdentifier[?Yield] : LabelledItem[?Yield,?Return]',
    'LabelledItem[Yield,Return]: Statement[?Yield,?Return]',
    'LabelledItem[Yield,Return]: FunctionDeclaration[?Yield]',
*/

function parseLabelledStatement(Yield, Return) {
    var label = parseLabelIdentifier(Yield);
    consumeToken(':');
    var item = parseLabelledItem(Yield, Return);
    return Production['LabelledStatement: LabelIdentifier : LabelledItem'](label, item);
}

function parseLabelledItem(Yield, Return) {
    if (peekToken() !== 'function') {
        var nt = parseStatement(Yield, Return);
        return Production['LabelledItem: Statement'](nt);
    }
    var nt = parseFunctionDeclaration(Yield, !'Default');
    return Production['LabelledItem: FunctionDeclaration'](nt);
}

// 13.14 The throw Statement
/*
    'ThrowStatement[Yield]: throw Expression[In,?Yield] ;',
*/

function parseThrowStatement(Yield) {
    consumeToken('throw');
    if (peekTokenIsLineSeparated()) {
        throw EarlySyntaxError();
    }
    var nt = parseExpression('In', Yield);
    insertAutoSemicolon();
    return Production['ThrowStatement: throw Expression ;'](nt);
}

// 13.15 The try Statement
/*
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Catch[?Yield,?Return]',
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Finally[?Yield,?Return]',
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Catch[?Yield,?Return] Finally[?Yield,?Return]',
    'Catch[Yield,Return]: catch ( CatchParameter[?Yield] ) Block[?Yield,?Return]',
    'Finally[Yield,Return]: finally Block[?Yield,?Return]',
    'CatchParameter[Yield]: BindingIdentifier[?Yield]',
    'CatchParameter[Yield]: BindingPattern[?Yield]',
*/

function parseTryStatement(Yield, Return) {
    consumeToken('try');
    var blk = parseBlock(Yield, Return);
    if (peekToken() === 'catch') {
        var cat = parseCatch(Yield, Return);
        if (peekToken() === 'finally') {
            var fin = parseFinally(Yield, Return);
            return Production['TryStatement: try Block Catch Finally'](blk, cat, fin);
        }
        return Production['TryStatement: try Block Catch'](blk, cat);
    }
    var fin = parseFinally(Yield, Return);
    return Production['TryStatement: try Block Finally'](blk, fin);
}

function parseCatch(Yield, Return) {
    consumeToken('catch');
    consumeToken('(');
    var nt = parseCatchParameter(Yield);
    consumeToken(')');
    var blk = parseBlock(Yield, Return);
    return Production['Catch: catch ( CatchParameter ) Block'](nt, blk);
}

function parseFinally(Yield, Return) {
    consumeToken('finally');
    var blk = parseBlock(Yield, Return);
    return Production['Finally: finally Block'](blk);
}

function parseCatchParameter(Yield) {
    if (peekToken() !== '[' && peekToken() !== '{') {
        var nt = parseBindingIdentifier(Yield);
        return Production['CatchParameter: BindingIdentifier'](nt);
    }
    var nt = parseBindingPattern(Yield);
    return Production['CatchParameter: BindingPattern'](nt);
}

// 13.16 The debugger Statement
/*
    'DebuggerStatement: debugger ;',
*/

function parseDebuggerStatement() {
    consumeToken('debugger');
    insertAutoSemicolon();
    return Production['DebuggerStatement: debugger ;']();
}

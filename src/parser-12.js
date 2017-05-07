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

// 12.1 Identifiers
/*
    'IdentifierReference[Yield]: Identifier',
    'IdentifierReference[Yield]:[~Yield] yield',
    'BindingIdentifier[Yield]: Identifier',
    'BindingIdentifier[Yield]:[~Yield] yield',
    'LabelIdentifier[Yield]: Identifier',
    'LabelIdentifier[Yield]:[~Yield] yield',
    'Identifier: IdentifierName but not ReservedWord',
*/

function parseIdentifierReference(Yield) {
    if (!Yield && peekToken() === 'yield') {
        consumeToken('yield');
        return Production['IdentifierReference: yield']();
    }
    var nt = parseIdentifier();
    if (Yield && nt.StringValue() === "yield") throw EarlySyntaxError(); // from 12.1.1
    return Production['IdentifierReference: Identifier'](nt);
}

function parseBindingIdentifier(Yield) {
    if (!Yield && peekToken() === 'yield') {
        consumeToken('yield');
        return Production['BindingIdentifier: yield']();
    }
    var nt = parseIdentifier();
    if (Yield && nt.StringValue() === "yield") throw EarlySyntaxError(); // from 12.1.1
    return Production['BindingIdentifier: Identifier'](nt);
}

function parseLabelIdentifier(Yield) {
    if (!Yield && peekToken() === 'yield') {
        consumeToken('yield');
        return Production['LabelIdentifier: yield']();
    }
    var nt = parseIdentifier();
    if (Yield && nt.StringValue() === "yield") throw EarlySyntaxError(); // from 12.1.1
    return Production['LabelIdentifier: Identifier'](nt);
}

function parseIdentifier() {
    if (peekTokenIsReservedWord()) {
        throw EarlySyntaxError();
    }
    var nt = parseIdentifierName();
    return Production['Identifier: IdentifierName but not ReservedWord'](nt);
}

// 12.2 Primary Expression
/*
    'PrimaryExpression[Yield]: this',
    'PrimaryExpression[Yield]: IdentifierReference[?Yield]',
    'PrimaryExpression[Yield]: Literal',
    'PrimaryExpression[Yield]: ArrayLiteral[?Yield]',
    'PrimaryExpression[Yield]: ObjectLiteral[?Yield]',
    'PrimaryExpression[Yield]: FunctionExpression',
    'PrimaryExpression[Yield]: ClassExpression[?Yield]',
    'PrimaryExpression[Yield]: GeneratorExpression',
    'PrimaryExpression[Yield]: RegularExpressionLiteral',
    'PrimaryExpression[Yield]: TemplateLiteral[?Yield]',
    'PrimaryExpression[Yield]: CoverParenthesizedExpressionAndArrowParameterList[?Yield]',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( Expression[In,?Yield] )',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( )',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( ... BindingIdentifier[?Yield] )',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( ... BindingPattern[?Yield] )',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( Expression[In,?Yield] , ... BindingIdentifier[?Yield] )',
    'CoverParenthesizedExpressionAndArrowParameterList[Yield]: ( Expression[In,?Yield] , ... BindingPattern[?Yield] )',
    'ParenthesizedExpression[Yield]: ( Expression[In,?Yield] )',
*/

function parsePrimaryExpression(Yield) {
    switch (peekToken()) {
        case 'this':
            consumeToken('this');
            return Production['PrimaryExpression: this']();
        case 'null':
        case 'true':
        case 'false':
        case '0':
        case '"':
            var nt = parseLiteral();
            return Production['PrimaryExpression: Literal'](nt);
        case '[':
            var nt = parseArrayLiteral(Yield);
            return Production['PrimaryExpression: ArrayLiteral'](nt);
        case '{':
            var nt = parseObjectLiteral(Yield);
            return Production['PrimaryExpression: ObjectLiteral'](nt);
        case 'function':
            if (peekToken(1) === '*') {
                var nt = parseGeneratorExpression();
                return Production['PrimaryExpression: GeneratorExpression'](nt);
            }
            var nt = parseFunctionExpression();
            return Production['PrimaryExpression: FunctionExpression'](nt);
        case 'class':
            var nt = parseClassExpression(Yield);
            return Production['PrimaryExpression: ClassExpression'](nt);
        case '/':
        case '/=':
            var nt = parseRegularExpressionLiteral(Yield);
            return Production['PrimaryExpression: RegularExpressionLiteral'](nt);
        case '`':
            var nt = parseTemplateLiteral(Yield);
            return Production['PrimaryExpression: TemplateLiteral'](nt);
        case '(':
            var nt = parseCoverParenthesizedExpressionAndArrowParameterList(Yield);
            return Production['PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList'](nt);
    }
    var nt = parseIdentifierReference(Yield);
    return Production['PrimaryExpression: IdentifierReference'](nt);
}

function parseCoverParenthesizedExpressionAndArrowParameterList(Yield) {
    consumeToken('(');
    if (peekToken() === ')') {
        consumeToken(')');
        return Production['CoverParenthesizedExpressionAndArrowParameterList: ( )']();
    }
    if (peekToken() === '...') {
        consumeToken('...');
        if (peekToken() === '{' || peekToken() === '[') {
            var nt = parseBindingPattern(Yield);
            return Production['CoverParenthesizedExpressionAndArrowParameterList: ( ... BindingPattern )'](nt);
        }
        var nt = parseBindingIdentifier(Yield);
        return Production['CoverParenthesizedExpressionAndArrowParameterList: ( ... BindingIdentifier )'](nt);
    }
    var expr = parseExpression('In', Yield);
    if (peekToken() === ')') {
        consumeToken(')');
        return Production['CoverParenthesizedExpressionAndArrowParameterList: ( Expression )'](expr);
    }
    consumeToken(',');
    consumeToken('...');
    if (peekToken() === '{' || peekToken() === '[') {
        var nt = parseBindingPattern(Yield);
        return Production['CoverParenthesizedExpressionAndArrowParameterList: ( Expression , ... BindingPattern )'](expr, nt);
    }
    var nt = parseBindingIdentifier(Yield);
    return Production['CoverParenthesizedExpressionAndArrowParameterList: ( Expression , ... BindingIdentifier )'](expr, nt);
}

// 12.2.4 Literals
/*
    'Literal: NullLiteral',
    'Literal: BooleanLiteral',
    'Literal: NumericLiteral',
    'Literal: StringLiteral',
*/

function parseLiteral() {
    switch (peekToken()) {
        case 'null':
            consumeToken('null');
            var nt = Production['NullLiteral: null']();
            return Production['Literal: NullLiteral'](nt);
        case 'true':
            consumeToken('true');
            var nt = Production['BooleanLiteral: true']();
            return Production['Literal: BooleanLiteral'](nt);
        case 'false':
            consumeToken('false');
            var nt = Production['BooleanLiteral: false']();
            return Production['Literal: BooleanLiteral'](nt);
        case '0':
            var nt = parseNumericLiteral();
            return Production['Literal: NumericLiteral'](nt);
        case '"':
            var nt = parseStringLiteral();
            return Production['Literal: StringLiteral'](nt);
    }
    throw EarlySyntaxError();
}

// 12.2.5 Array Initializer
/*
    'ArrayLiteral[Yield]: [ Elision[opt] ]',
    'ArrayLiteral[Yield]: [ ElementList[?Yield] ]',
    'ArrayLiteral[Yield]: [ ElementList[?Yield] , Elision[opt] ]',
    'ElementList[Yield]: Elision[opt] AssignmentExpression[In,?Yield]',
    'ElementList[Yield]: Elision[opt] SpreadElement[?Yield]',
    'ElementList[Yield]: ElementList[?Yield] , Elision[opt] AssignmentExpression[In,?Yield]',
    'ElementList[Yield]: ElementList[?Yield] , Elision[opt] SpreadElement[?Yield]',
    'Elision: ,',
    'Elision: Elision ,',
    'SpreadElement[Yield]: ... AssignmentExpression[In,?Yield]',
*/

function parseArrayLiteral(Yield) {
    consumeToken('[');
    var elis = parseElision_opt();
    if (peekToken() === ']') {
        consumeToken(']');
        return Production['ArrayLiteral: [ Elision[opt] ]'](elis);
    }
    if (peekToken() === '...') {
        var nt = parseSpreadElement(Yield);
        var list = Production['ElementList: Elision[opt] SpreadElement'](elis, nt);
    } else {
        var nt = parseAssignmentExpression('In', Yield);
        var list = Production['ElementList: Elision[opt] AssignmentExpression'](elis, nt);
    }
    while (true) {
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayLiteral: [ ElementList ]'](list);
        }
        consumeToken(',');
        var elis = parseElision_opt();
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayLiteral: [ ElementList , Elision[opt] ]'](list, elis);
        }
        if (peekToken() === '...') {
            var nt = parseSpreadElement(Yield);
            var list = Production['ElementList: ElementList , Elision[opt] SpreadElement'](list, elis, nt);
        } else {
            var nt = parseAssignmentExpression('In', Yield);
            var list = Production['ElementList: ElementList , Elision[opt] AssignmentExpression'](list, elis, nt);
        }
    }
}

function parseElision_opt() {
    if (peekToken() !== ',') return null;
    consumeToken(',');
    var elis = Production['Elision: ,']();
    while (true) {
        if (peekToken() !== ',') return elis;
        consumeToken(',');
        var elis = Production['Elision: Elision ,'](elis);
    }
}

function parseSpreadElement(Yield) {
    consumeToken('...');
    var nt = parseAssignmentExpression('In', Yield);
    return Production['SpreadElement: ... AssignmentExpression'](nt);
}

// 12.2.6 Object Initializer
/*
    'ObjectLiteral[Yield]: { }',
    'ObjectLiteral[Yield]: { PropertyDefinitionList[?Yield] }',
    'ObjectLiteral[Yield]: { PropertyDefinitionList[?Yield] , }',
    'PropertyDefinitionList[Yield]: PropertyDefinition[?Yield]',
    'PropertyDefinitionList[Yield]: PropertyDefinitionList[?Yield] , PropertyDefinition[?Yield]',
    'PropertyDefinition[Yield]: IdentifierReference[?Yield]',
    'PropertyDefinition[Yield]: CoverInitializedName[?Yield]',
    'PropertyDefinition[Yield]: PropertyName[?Yield] : AssignmentExpression[In,?Yield]',
    'PropertyDefinition[Yield]: MethodDefinition[?Yield]',
    'PropertyName[Yield]: LiteralPropertyName',
    'PropertyName[Yield]: ComputedPropertyName[?Yield]',
    'LiteralPropertyName: IdentifierName',
    'LiteralPropertyName: StringLiteral',
    'LiteralPropertyName: NumericLiteral',
    'ComputedPropertyName[Yield]: [ AssignmentExpression[In,?Yield] ]',
    'CoverInitializedName[Yield]: IdentifierReference[?Yield] Initializer[In,?Yield]',
    'Initializer[In,Yield]: = AssignmentExpression[?In,?Yield]',
*/

function parseObjectLiteral(Yield) {
    consumeToken('{');
    if (peekToken() === '}') {
        consumeToken('}');
        return Production['ObjectLiteral: { }']();
    }
    var nt = parsePropertyDefinition(Yield);
    var list = Production['PropertyDefinitionList: PropertyDefinition'](nt);
    while (true) {
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectLiteral: { PropertyDefinitionList }'](list);
        }
        consumeToken(',');
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectLiteral: { PropertyDefinitionList , }'](list);
        }
        var nt = parsePropertyDefinition(Yield);
        var list = Production['PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition'](list, nt);
    }
}

function parsePropertyDefinition(Yield) {
    if (peekToken() === '[' || peekToken() === '"' || peekToken() === '0') {
        var name = parsePropertyName(Yield);
        if (peekToken() === '(') {
            var nt = parseMethodDefinition_after_PropertyName(name, Yield);
            return Production['PropertyDefinition: MethodDefinition'](nt);
        }
        consumeToken(':');
        var nt = parseAssignmentExpression('In', Yield);
        return Production['PropertyDefinition: PropertyName : AssignmentExpression'](name, nt);
    }
    if (peekTokenIsIdentifierName()) {
        if (peekToken(1) === ',' || peekToken(1) === '}') {
            var nt = parseIdentifierReference(Yield);
            return Production['PropertyDefinition: IdentifierReference'](nt);
        }
        if (peekToken(1) === '=') {
            var nt = parseCoverInitializedName(Yield);
            return Production['PropertyDefinition: CoverInitializedName'](nt);
        }
        if (peekToken(1) === ':') {
            var name = parsePropertyName(Yield);
            consumeToken(':');
            var nt = parseAssignmentExpression('In', Yield);
            return Production['PropertyDefinition: PropertyName : AssignmentExpression'](name, nt);
        }
    }
    var nt = parseMethodDefinition(Yield);
    return Production['PropertyDefinition: MethodDefinition'](nt);
}

function parseCoverInitializedName(Yield) {
    var nt = parseIdentifierReference(Yield);
    var ini = parseInitializer('In', Yield);
    return Production['CoverInitializedName: IdentifierReference Initializer'](nt, ini);
}

function parsePropertyName(Yield) {
    if (peekToken() === '[') {
        var nt = parseComputedPropertyName(Yield);
        return Production['PropertyName: ComputedPropertyName'](nt);
    }
    var nt = parseLiteralPropertyName();
    return Production['PropertyName: LiteralPropertyName'](nt);
}

function parseLiteralPropertyName() {
    if (peekToken() === '"') {
        var nt = parseStringLiteral();
        return Production['LiteralPropertyName: StringLiteral'](nt);
    }
    if (peekToken() === '0') {
        var nt = parseNumericLiteral();
        return Production['LiteralPropertyName: NumericLiteral'](nt);
    }
    var nt = parseIdentifierName();
    return Production['LiteralPropertyName: IdentifierName'](nt);
}

function parseComputedPropertyName(Yield) {
    consumeToken('[');
    var nt = parseAssignmentExpression('In', Yield);
    consumeToken(']');
    return Production['ComputedPropertyName: [ AssignmentExpression ]'](nt);
}

function parseInitializer_opt(In, Yield) {
    if (peekToken() !== '=') return null;
    return parseInitializer(In, Yield);
}

function parseInitializer(In, Yield) {
    consumeToken('=');
    var nt = parseAssignmentExpression(In, Yield);
    return Production['Initializer: = AssignmentExpression'](nt);
}

// 12.2.9 Template Literals
/*
    'TemplateLiteral[Yield]: NoSubstitutionTemplate',
    'TemplateLiteral[Yield]: TemplateHead Expression[In,?Yield] TemplateSpans[?Yield]',
    'TemplateSpans[Yield]: TemplateTail',
    'TemplateSpans[Yield]: TemplateMiddleList[?Yield] TemplateTail',
    'TemplateMiddleList[Yield]: TemplateMiddle Expression[In,?Yield]',
    'TemplateMiddleList[Yield]: TemplateMiddleList[?Yield] TemplateMiddle Expression[In,?Yield]',
*/

function parseTemplateLiteral(Yield) {
    var nt = parseTemplate(Yield);
    if (nt.is('Template: NoSubstitutionTemplate')) {
        var nt = nt.NoSubstitutionTemplate;
        return Production['TemplateLiteral: NoSubstitutionTemplate'](nt);
    }
    Assert(nt.is('Template: TemplateHead'));
    var head = nt.TemplateHead;
    var expr = parseExpression('In', Yield);
    var nt = parseTemplateSpans(Yield);
    return Production['TemplateLiteral: TemplateHead Expression TemplateSpans'](head, expr, nt);
}

function parseTemplateSpans(Yield) {
    var nt = parseTemplateSubstitutionTail();
    if (nt.is('TemplateSubstitutionTail: TemplateTail')) {
        var nt = nt.TemplateTail;
        return Production['TemplateSpans: TemplateTail'](nt);
    }
    Assert(nt.is('TemplateSubstitutionTail: TemplateMiddle'));
    var nt = nt.TemplateMiddle;
    var expr = parseExpression('In', Yield);
    var list = Production['TemplateMiddleList: TemplateMiddle Expression'](nt, expr);
    while (true) {
        var nt = parseTemplateSubstitutionTail();
        if (nt.is('TemplateSubstitutionTail: TemplateTail')) {
            var nt = nt.TemplateTail;
            return Production['TemplateSpans: TemplateMiddleList TemplateTail'](list, nt);
        }
        Assert(nt.is('TemplateSubstitutionTail: TemplateMiddle'));
        var nt = nt.TemplateMiddle;
        var expr = parseExpression('In', Yield);
        var list = Production['TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression'](list, nt, expr);
    }
}

// 12.3 Left-Hand-Side Expressions
/*
    'MemberExpression[Yield]: PrimaryExpression[?Yield]',
    'MemberExpression[Yield]: MemberExpression[?Yield] [ Expression[In,?Yield] ]',
    'MemberExpression[Yield]: MemberExpression[?Yield] . IdentifierName',
    'MemberExpression[Yield]: MemberExpression[?Yield] TemplateLiteral[?Yield]',
    'MemberExpression[Yield]: SuperProperty[?Yield]',
    'MemberExpression[Yield]: MetaProperty',
    'MemberExpression[Yield]: new MemberExpression[?Yield] Arguments[?Yield]',
    'SuperProperty[Yield]: super [ Expression[In,?Yield] ]',
    'SuperProperty[Yield]: super . IdentifierName',
    'MetaProperty: NewTarget',
    'NewTarget: new . target',
    'NewExpression[Yield]: MemberExpression[?Yield]',
    'NewExpression[Yield]: new NewExpression[?Yield]',
    'CallExpression[Yield]: MemberExpression[?Yield] Arguments[?Yield]',
    'CallExpression[Yield]: SuperCall[?Yield]',
    'CallExpression[Yield]: CallExpression[?Yield] Arguments[?Yield]',
    'CallExpression[Yield]: CallExpression[?Yield] [ Expression[In,?Yield] ]',
    'CallExpression[Yield]: CallExpression[?Yield] . IdentifierName',
    'CallExpression[Yield]: CallExpression[?Yield] TemplateLiteral[?Yield]',
    'SuperCall[Yield]: super Arguments[?Yield]',
    'Arguments[Yield]: ( )',
    'Arguments[Yield]: ( ArgumentList[?Yield] )',
    'ArgumentList[Yield]: AssignmentExpression[In,?Yield]',
    'ArgumentList[Yield]: ... AssignmentExpression[In,?Yield]',
    'ArgumentList[Yield]: ArgumentList[?Yield] , AssignmentExpression[In,?Yield]',
    'ArgumentList[Yield]: ArgumentList[?Yield] , ... AssignmentExpression[In,?Yield]',
    'LeftHandSideExpression[Yield]: NewExpression[?Yield]',
    'LeftHandSideExpression[Yield]: CallExpression[?Yield]',
*/

function parseLeftHandSideExpression(Yield) {
    var newOperators = 0;
    while (peekToken() === 'new' && peekToken(1) !== '.') {
        consumeToken('new');
        newOperators++;
    }
    if (peekToken() === 'new' && peekToken(1) === '.') {
        var nt = parseMetaProperty();
        var mem = Production['MemberExpression: MetaProperty'](nt);
    } else if (peekToken() === 'super') {
        if (peekToken(1) === '(' && newOperators === 0) {
            var nt = parseSuperCall(Yield);
            var nt = Production['CallExpression: SuperCall'](nt);
            var nt = parseCallExpression_after_CallExpression(nt, Yield);
            return Production['LeftHandSideExpression: CallExpression'](nt);
        }
        var nt = parseSuperProperty(Yield);
        var mem = Production['MemberExpression: SuperProperty'](nt);
    } else {
        var nt = parsePrimaryExpression(Yield);
        var mem = Production['MemberExpression: PrimaryExpression'](nt);
    }
    while (true) {
        switch (peekToken()) {
            case '[':
                consumeToken('[');
                var nt = parseExpression('In', Yield);
                consumeToken(']');
                var mem = Production['MemberExpression: MemberExpression [ Expression ]'](mem, nt);
                continue;
            case '.':
                consumeToken('.');
                var nt = parseIdentifierName();
                var mem = Production['MemberExpression: MemberExpression . IdentifierName'](mem, nt);
                continue;
            case '`':
                var nt = parseTemplateLiteral(Yield);
                var mem = Production['MemberExpression: MemberExpression TemplateLiteral'](mem, nt);
                continue;
            case '(':
                var nt = parseArguments(Yield);
                if (newOperators === 0) {
                    var nt = Production['CallExpression: MemberExpression Arguments'](mem, nt);
                    var nt = parseCallExpression_after_CallExpression(nt, Yield);
                    return Production['LeftHandSideExpression: CallExpression'](nt);
                }
                newOperators--;
                var mem = Production['MemberExpression: new MemberExpression Arguments'](mem, nt);
                continue;
        }
        break;
    }
    var nt = Production['NewExpression: MemberExpression'](mem);
    while (newOperators > 0) {
        newOperators--;
        var nt = Production['NewExpression: new NewExpression'](nt);
    }
    return Production['LeftHandSideExpression: NewExpression'](nt);
}

function parseSuperProperty(Yield) {
    consumeToken('super');
    if (peekToken() === '[') {
        consumeToken('[');
        var nt = parseExpression('In', Yield);
        consumeToken(']');
        return Production['SuperProperty: super [ Expression ]'](nt);
    }
    consumeToken('.');
    var nt = parseIdentifierName();
    return Production['SuperProperty: super . IdentifierName'](nt);
}

function parseMetaProperty() {
    var nt = parseNewTarget();
    return Production['MetaProperty: NewTarget'](nt);
}

function parseNewTarget() {
    consumeToken('new');
    consumeToken('.');
    consumeToken('target');
    return Production['NewTarget: new . target']();
}

function parseCallExpression_after_CallExpression(expr, Yield) {
    while (true) {
        switch (peekToken()) {
            case '(':
                var nt = parseArguments(Yield);
                var expr = Production['CallExpression: CallExpression Arguments'](expr, nt);
                continue;
            case '[':
                consumeToken('[');
                var nt = parseExpression('In', Yield);
                consumeToken(']');
                var expr = Production['CallExpression: CallExpression [ Expression ]'](expr, nt);
                continue;
            case '.':
                consumeToken('.');
                var nt = parseIdentifierName();
                var expr = Production['CallExpression: CallExpression . IdentifierName'](expr, nt);
                continue;
            case '`':
                var nt = parseTemplateLiteral(Yield);
                var expr = Production['CallExpression: CallExpression TemplateLiteral'](expr, nt);
                continue;
        }
        return expr;
    }
}

function parseSuperCall(Yield) {
    consumeToken('super');
    var nt = parseArguments(Yield);
    return Production['SuperCall: super Arguments'](nt);
}

function parseArguments(Yield) {
    consumeToken('(');
    if (peekToken() === ')') {
        consumeToken(')');
        return Production['Arguments: ( )']();
    }
    if (peekToken() === '...') {
        consumeToken('...');
        var nt = parseAssignmentExpression('In', Yield);
        var list = Production['ArgumentList: ... AssignmentExpression'](nt);
    } else {
        var nt = parseAssignmentExpression('In', Yield);
        var list = Production['ArgumentList: AssignmentExpression'](nt);
    }
    while (true) {
        if (peekToken() === ')') {
            consumeToken(')');
            return Production['Arguments: ( ArgumentList )'](list);
        }
        consumeToken(',');
        if (peekToken() === '...') {
            consumeToken('...');
            var nt = parseAssignmentExpression('In', Yield);
            var list = Production['ArgumentList: ArgumentList , ... AssignmentExpression'](list, nt);
        } else {
            var nt = parseAssignmentExpression('In', Yield);
            var list = Production['ArgumentList: ArgumentList , AssignmentExpression'](list, nt);
        }
    }
}

// 12.4 Update Expressions
/*
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield]',
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield] ++',
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield] --',
    'UpdateExpression[Yield]: ++ UnaryExpression[?Yield]',
    'UpdateExpression[Yield]: -- UnaryExpression[?Yield]',
*/

function parseUpdateExpression(Yield) {
    if (peekToken() === '++') {
        consumeToken('++');
        var nt = parseUnaryExpression(Yield);
        return Production['UpdateExpression: ++ UnaryExpression'](nt);
    }
    if (peekToken() === '--') {
        consumeToken('--');
        var nt = parseUnaryExpression(Yield);
        return Production['UpdateExpression: -- UnaryExpression'](nt);
    }
    var nt = parseLeftHandSideExpression(Yield);
    if (!peekTokenIsLineSeparated() && peekToken() === '++') {
        consumeToken('++');
        return Production['UpdateExpression: LeftHandSideExpression ++'](nt);
    }
    if (!peekTokenIsLineSeparated() && peekToken() === '--') {
        consumeToken('--');
        return Production['UpdateExpression: LeftHandSideExpression --'](nt);
    }
    return Production['UpdateExpression: LeftHandSideExpression'](nt);
}

// 12.5 Unary Operators
/*
    'UnaryExpression[Yield]: UpdateExpression[?Yield]',
    'UnaryExpression[Yield]: delete UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: void UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: typeof UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: + UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: - UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: ~ UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: ! UnaryExpression[?Yield]',
*/

function parseUnaryExpression(Yield) {
    switch (peekToken()) {
        case 'delete':
            consumeToken('delete');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: delete UnaryExpression'](nt);
        case 'void':
            consumeToken('void');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: void UnaryExpression'](nt);
        case 'typeof':
            consumeToken('typeof');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: typeof UnaryExpression'](nt);
        case '+':
            consumeToken('+');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: + UnaryExpression'](nt);
        case '-':
            consumeToken('-');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: - UnaryExpression'](nt);
        case '~':
            consumeToken('~');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: ~ UnaryExpression'](nt);
        case '!':
            consumeToken('!');
            var nt = parseUnaryExpression(Yield);
            return Production['UnaryExpression: ! UnaryExpression'](nt);
    }
    var nt = parseUpdateExpression(Yield);
    return Production['UnaryExpression: UpdateExpression'](nt);
}

// 12.6 Exponentiation Operator
/*
    'ExponentiationExpression[Yield]: UnaryExpression[?Yield]',
    'ExponentiationExpression[Yield]: UpdateExpression[?Yield] ** ExponentiationExpression[?Yield]',
*/

function parseExponentiationExpression(Yield) {
    var nt = parseUnaryExpression(Yield);
    if (!nt.is('UnaryExpression: UpdateExpression') || peekToken() !== '**') {
        return Production['ExponentiationExpression: UnaryExpression'](nt);
    }
    var lval = nt.UpdateExpression;
    delete lval.nested;
    consumeToken('**');
    var nt = parseExponentiationExpression(Yield);
    return Production['ExponentiationExpression: UpdateExpression ** ExponentiationExpression'](lval, nt);
}

// 12.7 Multiplicative Operators
/*
    'MultiplicativeExpression[Yield]: ExponentiationExpression[?Yield]',
    'MultiplicativeExpression[Yield]: MultiplicativeExpression[?Yield] MultiplicativeOperator ExponentiationExpression[?Yield]',
*/

function parseMultiplicativeExpression(Yield) {
    var nt = parseExponentiationExpression(Yield);
    var lval = Production['MultiplicativeExpression: ExponentiationExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '*':
                consumeToken('*');
                var ope = Production['MultiplicativeOperator: *']();
                break;
            case '/':
                consumeToken('/');
                var ope = Production['MultiplicativeOperator: /']();
                break;
            case '%':
                consumeToken('%');
                var ope = Production['MultiplicativeOperator: %']();
                break;
            default:
                return lval;
        }
        var nt = parseExponentiationExpression(Yield);
        var lval = Production['MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression'](lval, ope, nt);
    }
}

// 12.8 Additive Operators
/*
    'AdditiveExpression[Yield]: MultiplicativeExpression[?Yield]',
    'AdditiveExpression[Yield]: AdditiveExpression[?Yield] + MultiplicativeExpression[?Yield]',
    'AdditiveExpression[Yield]: AdditiveExpression[?Yield] - MultiplicativeExpression[?Yield]',
*/

function parseAdditiveExpression(Yield) {
    var nt = parseMultiplicativeExpression(Yield);
    var lval = Production['AdditiveExpression: MultiplicativeExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '+':
                consumeToken('+');
                var nt = parseMultiplicativeExpression(Yield);
                var lval = Production['AdditiveExpression: AdditiveExpression + MultiplicativeExpression'](lval, nt);
                break;
            case '-':
                consumeToken('-');
                var nt = parseMultiplicativeExpression(Yield);
                var lval = Production['AdditiveExpression: AdditiveExpression - MultiplicativeExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

// 12.9 Bitwise Shift Operators
/*
    'ShiftExpression[Yield]: AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] << AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] >> AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] >>> AdditiveExpression[?Yield]',
*/

function parseShiftExpression(Yield) {
    var nt = parseAdditiveExpression(Yield);
    var lval = Production['ShiftExpression: AdditiveExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '<<':
                consumeToken('<<');
                var nt = parseAdditiveExpression(Yield);
                var lval = Production['ShiftExpression: ShiftExpression << AdditiveExpression'](lval, nt);
                break;
            case '>>':
                consumeToken('>>');
                var nt = parseAdditiveExpression(Yield);
                var lval = Production['ShiftExpression: ShiftExpression >> AdditiveExpression'](lval, nt);
                break;
            case '>>>':
                consumeToken('>>>');
                var nt = parseAdditiveExpression(Yield);
                var lval = Production['ShiftExpression: ShiftExpression >>> AdditiveExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

// 12.10 Relational Operators
/*
    'RelationalExpression[In,Yield]: ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] < ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] > ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] <= ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] >= ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] instanceof ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]:[+In] RelationalExpression[In,?Yield] in ShiftExpression[?Yield]',
*/

function parseRelationalExpression(In, Yield) {
    var nt = parseShiftExpression(Yield);
    var lval = Production['RelationalExpression: ShiftExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '<':
                consumeToken('<');
                var nt = parseShiftExpression(Yield);
                var lval = Production['RelationalExpression: RelationalExpression < ShiftExpression'](lval, nt);
                break;
            case '>':
                consumeToken('>');
                var nt = parseShiftExpression(Yield);
                var lval = Production['RelationalExpression: RelationalExpression > ShiftExpression'](lval, nt);
                break;
            case '<=':
                consumeToken('<=');
                var nt = parseShiftExpression(Yield);
                var lval = Production['RelationalExpression: RelationalExpression <= ShiftExpression'](lval, nt);
                break;
            case '>=':
                consumeToken('>=');
                var nt = parseShiftExpression(Yield);
                var lval = Production['RelationalExpression: RelationalExpression >= ShiftExpression'](lval, nt);
                break;
            case 'instanceof':
                consumeToken('instanceof');
                var nt = parseShiftExpression(Yield);
                var lval = Production['RelationalExpression: RelationalExpression instanceof ShiftExpression'](lval, nt);
                break;
            case 'in':
                if (In) {
                    consumeToken('in');
                    var nt = parseShiftExpression(Yield);
                    var lval = Production['RelationalExpression: RelationalExpression in ShiftExpression'](lval, nt);
                    break;
                }
            default:
                return lval;
        }
    }
}

// 12.11 Equality Operators
/*
    'EqualityExpression[In,Yield]: RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] == RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] != RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] === RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] !== RelationalExpression[?In,?Yield]',
*/

function parseEqualityExpression(In, Yield) {
    var nt = parseRelationalExpression(In, Yield);
    var lval = Production['EqualityExpression: RelationalExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '==':
                consumeToken('==');
                var nt = parseRelationalExpression(In, Yield);
                var lval = Production['EqualityExpression: EqualityExpression == RelationalExpression'](lval, nt);
                break;
            case '!=':
                consumeToken('!=');
                var nt = parseRelationalExpression(In, Yield);
                var lval = Production['EqualityExpression: EqualityExpression != RelationalExpression'](lval, nt);
                break;
            case '===':
                consumeToken('===');
                var nt = parseRelationalExpression(In, Yield);
                var lval = Production['EqualityExpression: EqualityExpression === RelationalExpression'](lval, nt);
                break;
            case '!==':
                consumeToken('!==');
                var nt = parseRelationalExpression(In, Yield);
                var lval = Production['EqualityExpression: EqualityExpression !== RelationalExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

// 12.12 Binary Bitwise Operators
/*
    'BitwiseANDExpression[In,Yield]: EqualityExpression[?In,?Yield]',
    'BitwiseANDExpression[In,Yield]: BitwiseANDExpression[?In,?Yield] & EqualityExpression[?In,?Yield]',
    'BitwiseXORExpression[In,Yield]: BitwiseANDExpression[?In,?Yield]',
    'BitwiseXORExpression[In,Yield]: BitwiseXORExpression[?In,?Yield] ^ BitwiseANDExpression[?In,?Yield]',
    'BitwiseORExpression[In,Yield]: BitwiseXORExpression[?In,?Yield]',
    'BitwiseORExpression[In,Yield]: BitwiseORExpression[?In,?Yield] | BitwiseXORExpression[?In,?Yield]',
*/

function parseBitwiseANDExpression(In, Yield) {
    var nt = parseEqualityExpression(In, Yield);
    var lval = Production['BitwiseANDExpression: EqualityExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '&':
                consumeToken('&');
                var nt = parseEqualityExpression(In, Yield);
                var lval = Production['BitwiseANDExpression: BitwiseANDExpression & EqualityExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

function parseBitwiseXORExpression(In, Yield) {
    var nt = parseBitwiseANDExpression(In, Yield);
    var lval = Production['BitwiseXORExpression: BitwiseANDExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '^':
                consumeToken('^');
                var nt = parseBitwiseANDExpression(In, Yield);
                var lval = Production['BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

function parseBitwiseORExpression(In, Yield) {
    var nt = parseBitwiseXORExpression(In, Yield);
    var lval = Production['BitwiseORExpression: BitwiseXORExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '|':
                consumeToken('|');
                var nt = parseBitwiseXORExpression(In, Yield);
                var lval = Production['BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

// 12.13 Binary Logical Operators
/*
    'LogicalANDExpression[In,Yield]: BitwiseORExpression[?In,?Yield]',
    'LogicalANDExpression[In,Yield]: LogicalANDExpression[?In,?Yield] && BitwiseORExpression[?In,?Yield]',
    'LogicalORExpression[In,Yield]: LogicalANDExpression[?In,?Yield]',
    'LogicalORExpression[In,Yield]: LogicalORExpression[?In,?Yield] || LogicalANDExpression[?In,?Yield]',
*/

function parseLogicalANDExpression(In, Yield) {
    var nt = parseBitwiseORExpression(In, Yield);
    var lval = Production['LogicalANDExpression: BitwiseORExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '&&':
                consumeToken('&&');
                var nt = parseBitwiseORExpression(In, Yield);
                var lval = Production['LogicalANDExpression: LogicalANDExpression && BitwiseORExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

function parseLogicalORExpression(In, Yield) {
    var nt = parseLogicalANDExpression(In, Yield);
    var lval = Production['LogicalORExpression: LogicalANDExpression'](nt);
    while (true) {
        switch (peekToken()) {
            case '||':
                consumeToken('||');
                var nt = parseLogicalANDExpression(In, Yield);
                var lval = Production['LogicalORExpression: LogicalORExpression || LogicalANDExpression'](lval, nt);
                break;
            default:
                return lval;
        }
    }
}

// 12.14 Conditional Operator ( ? : )
/*
    'ConditionalExpression[In,Yield]: LogicalORExpression[?In,?Yield]',
    'ConditionalExpression[In,Yield]: LogicalORExpression[?In,?Yield] ? AssignmentExpression[In,?Yield] : AssignmentExpression[?In,?Yield]',
*/

function parseConditionalExpression(In, Yield) {
    var nt = parseLogicalORExpression(In, Yield);
    if (peekToken() === '?') {
        consumeToken('?');
        var expr1 = parseAssignmentExpression('In', Yield);
        consumeToken(':');
        var expr2 = parseAssignmentExpression(In, Yield);
        return Production['ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression'](nt, expr1, expr2);
    }
    return Production['ConditionalExpression: LogicalORExpression'](nt);
}


// 12.15 Assignment Operators
/*
    'AssignmentExpression[In,Yield]: ConditionalExpression[?In,?Yield]',
    'AssignmentExpression[In,Yield]:[+Yield] YieldExpression[?In]',
    'AssignmentExpression[In,Yield]: ArrowFunction[?In,?Yield]',
    'AssignmentExpression[In,Yield]: LeftHandSideExpression[?Yield] = AssignmentExpression[?In,?Yield]',
    'AssignmentExpression[In,Yield]: LeftHandSideExpression[?Yield] AssignmentOperator AssignmentExpression[?In,?Yield]',
*/

function parseAssignmentExpression(In, Yield) {
    if (Yield && peekToken() === 'yield') {
        var nt = parseYieldExpression(In);
        return Production['AssignmentExpression: YieldExpression'](nt);
    }
    var nt = parseConditionalExpression(In, Yield);
    if (!peekTokenIsLineSeparated() && peekToken() === '=>') {
        if (nt.is('Identifier')) {
            var nt = nt.resolve('Identifier');
            delete nt.nested;
            var nt = Production['BindingIdentifier: Identifier'](nt);
            var nt = Production['ArrowParameters: BindingIdentifier'](nt);
            var nt = parseArrowFunction_after_ArrowParameters(nt, In, Yield);
            return Production['AssignmentExpression: ArrowFunction'](nt);
        }
        if (nt.is('CoverParenthesizedExpressionAndArrowParameterList')) {
            var nt = nt.resolve('CoverParenthesizedExpressionAndArrowParameterList');
            delete nt.nested;
            var nt = Production['ArrowParameters: CoverParenthesizedExpressionAndArrowParameterList'](nt);
            var nt = parseArrowFunction_after_ArrowParameters(nt, In, Yield);
            return Production['AssignmentExpression: ArrowFunction'](nt);
        }
    }
    if (nt.is('LeftHandSideExpression')) {
        var lhs = nt.resolve('LeftHandSideExpression');
        delete lhs.nested;
        var c = peekToken();
        switch (c) {
            case '=':
                if (lhs.is('ObjectLiteral') || lhs.is('ArrayLiteral')) {
                    // from 12.15.1
                    //TODO parseAssignmentPattern(Yield)
                }
                consumeToken('=');
                var nt = parseAssignmentExpression(In, Yield);
                return Production['AssignmentExpression: LeftHandSideExpression = AssignmentExpression'](lhs, nt);
            case '*=':
            case '/=':
            case '%=':
            case '+=':
            case '-=':
            case '<<=':
            case '>>=':
            case '>>>=':
            case '&=':
            case '|=':
            case '^=':
                consumeToken(c);
                var ope = Production['AssignmentOperator: ' + c]();
                var nt = parseAssignmentExpression(In, Yield);
                return Production['AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression'](lhs, ope, nt);
        }
    }
    return Production['AssignmentExpression: ConditionalExpression'](nt);
}

// 12.15.5 Destructuring Assignment
/*
    'AssignmentPattern[Yield]: ObjectAssignmentPattern[?Yield]',
    'AssignmentPattern[Yield]: ArrayAssignmentPattern[?Yield]',
    'ObjectAssignmentPattern[Yield]: { }',
    'ObjectAssignmentPattern[Yield]: { AssignmentPropertyList[?Yield] }',
    'ObjectAssignmentPattern[Yield]: { AssignmentPropertyList[?Yield] , }',
    'ArrayAssignmentPattern[Yield]: [ Elision[opt] AssignmentRestElement[?Yield][opt] ]',
    'ArrayAssignmentPattern[Yield]: [ AssignmentElementList[?Yield] ]',
    'ArrayAssignmentPattern[Yield]: [ AssignmentElementList[?Yield] , Elision[opt] AssignmentRestElement[?Yield][opt] ]',
    'AssignmentPropertyList[Yield]: AssignmentProperty[?Yield]',
    'AssignmentPropertyList[Yield]: AssignmentPropertyList[?Yield] , AssignmentProperty[?Yield]',
    'AssignmentElementList[Yield]: AssignmentElisionElement[?Yield]',
    'AssignmentElementList[Yield]: AssignmentElementList[?Yield] , AssignmentElisionElement[?Yield]',
    'AssignmentElisionElement[Yield]: Elision[opt] AssignmentElement[?Yield]',
    'AssignmentProperty[Yield]: IdentifierReference[?Yield] Initializer[In,?Yield][opt]',
    'AssignmentProperty[Yield]: PropertyName[?Yield] : AssignmentElement[?Yield]',
    'AssignmentElement[Yield]: DestructuringAssignmentTarget[?Yield] Initializer[In,?Yield][opt]',
    'AssignmentRestElement[Yield]: ... DestructuringAssignmentTarget[?Yield]',
    'DestructuringAssignmentTarget[Yield]: LeftHandSideExpression[?Yield]',
*/

function parseAssignmentPattern(Yield) {
    if (peekToken() === '{') {
        var nt = parseObjectAssignmentPattern(Yield);
        return Production['AssignmentPattern: ObjectAssignmentPattern'](nt);
    }
    var nt = parseArrayAssignmentPattern(Yield);
    return Production['AssignmentPattern: ArrayAssignmentPattern'](nt);
}

function parseObjectAssignmentPattern(Yield) {
    consumeToken('{');
    if (peekToken() === '}') {
        consumeToken('}');
        return Production['ObjectAssignmentPattern: { }']();
    }
    var nt = parseAssignmentProperty(Yield);
    var list = Production['AssignmentPropertyList: AssignmentProperty'](nt);
    while (true) {
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectAssignmentPattern: { AssignmentPropertyList }'](list);
        }
        consumeToken(',');
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ObjectAssignmentPattern: { AssignmentPropertyList , }'](list);
        }
        var nt = parseAssignmentProperty(Yield);
        var list = Production['AssignmentPropertyList: AssignmentPropertyList , AssignmentProperty'](list, nt);
    }
}

function parseArrayAssignmentPattern(Yield) {
    consumeToken('[');
    var elis = parseElision_opt();
    if (peekToken() === ']') {
        consumeToken(']');
        return Production['ArrayAssignmentPattern: [ Elision[opt] AssignmentRestElement[opt] ]'](elis, null);
    }
    if (peekToken() === '...') {
        var nt = parseAssignmentRestElement(Yield);
        return Production['ArrayAssignmentPattern: [ Elision[opt] AssignmentRestElement[opt] ]'](elis, nt);
    }
    var nt = parseAssignmentElement(Yield);
    var nt = Production['AssignmentElisionElement: Elision[opt] AssignmentElement'](elis, nt);
    var list = Production['AssignmentElementList: AssignmentElisionElement'](nt);
    while (true) {
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayAssignmentPattern: [ AssignmentElementList ]'](list);
        }
        consumeToken(',');
        var elis = parseElision_opt();
        if (peekToken() === ']') {
            consumeToken(']');
            return Production['ArrayAssignmentPattern: [ AssignmentElementList , Elision[opt] AssignmentRestElement[opt] ]'](list, elis, null);
        }
        if (peekToken() === '...') {
            var nt = parseAssignmentRestElement(Yield);
            return Production['ArrayAssignmentPattern: [ AssignmentElementList , Elision[opt] AssignmentRestElement[opt] ]'](list, elis, nt);
        }
        var nt = parseAssignmentElement(Yield);
        var nt = Production['AssignmentElisionElement: Elision[opt] AssignmentElement'](elis, nt);
        var list = Production['AssignmentElementList: AssignmentElementList , AssignmentElisionElement'](list, nt);

    }
}

function parseAssignmentProperty(Yield) {
    if (peekTokenIsIdentifierName() && peekToken(1) !== ':') {
        var name = parseIdentifierReference(Yield);
        var ini = parseInitializer_opt('In', Yield);
        return Production['AssignmentProperty: IdentifierReference Initializer[opt]'](name, ini);
    }
    var name = parsePropertyName(Yield);
    consumeToken(':');
    var nt = parseAssignmentElement(Yield);
    return Production['AssignmentProperty: PropertyName : AssignmentElement'](name, nt);
}

function parseAssignmentElement(Yield) {
    var nt = parseDestructuringAssignmentTarget(Yield);
    var ini = parseInitializer_opt('In', Yield);
    return Production['AssignmentElement: DestructuringAssignmentTarget Initializer[opt]'](nt, ini);
}

function parseAssignmentRestElement(Yield) {
    consumeToken('...');
    var nt = parseDestructuringAssignmentTarget(Yield);
    return Production['AssignmentRestElement: ... DestructuringAssignmentTarget'](nt);
}

function parseDestructuringAssignmentTarget(Yield) {
    var nt = parseLeftHandSideExpression(Yield);
    if (nt.is('ObjectLiteral') || nt.is('ArrayLiteral')) {
        // from 12.15.5.1
        //TODO parseAssignmentPattern(Yield)
    }
    return Production['DestructuringAssignmentTarget: LeftHandSideExpression'](nt);
}

// 12.16 Comma Operator ( , )
/*
    'Expression[In,Yield]: AssignmentExpression[?In,?Yield]',
    'Expression[In,Yield]: Expression[?In,?Yield] , AssignmentExpression[?In,?Yield]',
*/

function parseExpression_opt(In, Yield) {
    if (peekToken() === ';') return null;
    if (peekToken() === '}') return null;
    return parseExpression(In, Yield);
}

function parseExpression(In, Yield) {
    var nt = parseAssignmentExpression(In, Yield);
    var lval = Production['Expression: AssignmentExpression'](nt);
    while (peekToken() === ',') {
        if (peekToken(1) === '...') {
            break;
        }
        consumeToken(',');
        var nt = parseAssignmentExpression(In, Yield);
        var lval = Production['Expression: Expression , AssignmentExpression'](lval, nt);
    }
    return lval;
}

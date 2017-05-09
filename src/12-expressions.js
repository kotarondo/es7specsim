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

// 12 ECMAScript Language: Expressions

// 12.1 Identifiers

Syntax([
    'IdentifierReference[Yield]: Identifier',
    'IdentifierReference[Yield]:[~Yield] yield',
    'BindingIdentifier[Yield]: Identifier',
    'BindingIdentifier[Yield]:[~Yield] yield',
    'LabelIdentifier[Yield]: Identifier',
    'LabelIdentifier[Yield]:[~Yield] yield',
    'Identifier: IdentifierName but not ReservedWord',
]);

// 12.1.1
Static_Semantics('Early Errors', [

    'BindingIdentifier: Identifier',
    function() {
        var name = this.Identifier.StringValue();
        if (this.strict && (name === "arguments" || name === "eval")) throw EarlySyntaxError();
    },

    'IdentifierReference: yield',
    'BindingIdentifier: yield',
    'LabelIdentifier: yield',
    function() {
        if (this.strict) throw EarlySyntaxError();
    },

    'IdentifierReference: Identifier',
    'BindingIdentifier: Identifier',
    'LabelIdentifier: Identifier',
    function() {
        // moved into the parser.
        // if (Yield && this.Identifier.StringValue() === "yield") throw EarlySyntaxError();
    },

    'Identifier: IdentifierName but not ReservedWord',
    function() {
        var name = this.IdentifierName.StringValue();
        if (this.strict && (name === "implements" || name === "interface" || name === "let" || name === "package" || name === "private" || name === "protected" || name === "public" || name === "static" || name === "yield")) throw EarlySyntaxError();
        if (isReservedWord(name) && name !== "yield") throw EarlySyntaxError();
    },
]);

// 12.1.2
Static_Semantics('BoundNames', [

    'BindingIdentifier: Identifier',
    function() {
        return [this.Identifier.StringValue()];
    },

    'BindingIdentifier: yield',
    function() {
        return ["yield"];
    },
]);

// 12.1.3
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'IdentifierReference: Identifier',
    function() {
        var name = this.Identifier.StringValue();
        if (this.strict && (name === "eval" || name === "arguments")) return false;
        return true;
    },

    'IdentifierReference: yield',
    function() {
        return true;
    },
]);

// 12.1.4
Static_Semantics('StringValue', [

    'IdentifierReference: yield',
    'BindingIdentifier: yield',
    'LabelIdentifier: yield',
    function() {
        return "yield";
    },

    'Identifier: IdentifierName but not ReservedWord',
    function() {
        return this.IdentifierName.StringValue();
    },
]);

// 12.1.5
Runtime_Semantics('BindingInitialization', [

    'BindingIdentifier: Identifier',
    function(value, environment) {
        var name = this.Identifier.StringValue();
        return InitializeBoundName(name, value, environment, this.strict);
    },

    'BindingIdentifier: yield',
    function(value, environment) {
        return InitializeBoundName("yield", value, environment, this.strict);
    },
]);

// 12.1.5.1
function InitializeBoundName(name, value, environment, strict) { //MODIFIED: strict argument added
    Assert(Type(name) === 'String');
    if (environment !== undefined) {
        var env = environment.EnvironmentRecord;
        env.InitializeBinding(name, value);
        return undefined;
    } else {
        var lhs = ResolveBinding(name, undefined, strict);
        return PutValue(lhs, value);
    }
}

// 12.1.6
Runtime_Semantics('Evaluation', [

    'IdentifierReference: Identifier',
    function() {
        return ResolveBinding(this.Identifier.StringValue(), undefined, this.strict);
    },

    'IdentifierReference: yield',
    function() {
        return ResolveBinding("yield", undefined, this.strict);
    },
]);

// 12.2 Primary Expression

Syntax([
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
]);


// 12.2.1 Semantics

// 12.2.1.1
Static_Semantics('CoveredParenthesizedExpression', [

    'CoverParenthesizedExpressionAndArrowParameterList: ( Expression )',
    function() {
        if (!this.ParenthesizedExpression) {
            this.ParenthesizedExpression = Production['ParenthesizedExpression: ( Expression )'](this.Expression);
            this.ParenthesizedExpression.strict = this.strict;
        }
        return this.ParenthesizedExpression;
    },
]);

// 12.2.1.2
Static_Semantics('HasName', [

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        if (expr.IsFunctionDefinition() === false) return false;
        return expr.HasName();
    },
]);

// 12.2.1.3
Static_Semantics('IsFunctionDefinition', [

    'PrimaryExpression: this',
    'PrimaryExpression: IdentifierReference',
    'PrimaryExpression: Literal',
    'PrimaryExpression: ArrayLiteral',
    'PrimaryExpression: ObjectLiteral',
    'PrimaryExpression: RegularExpressionLiteral',
    'PrimaryExpression: TemplateLiteral',
    function() {
        return false;
    },
    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        return expr.IsFunctionDefinition();
    },
]);

// 12.2.1.4
Static_Semantics('IsIdentifierRef', [

    'PrimaryExpression: IdentifierReference',
    function() {
        return true;
    },

    'PrimaryExpression: this',
    'PrimaryExpression: Literal',
    'PrimaryExpression: ArrayLiteral',
    'PrimaryExpression: ObjectLiteral',
    'PrimaryExpression: FunctionExpression',
    'PrimaryExpression: ClassExpression',
    'PrimaryExpression: GeneratorExpression',
    'PrimaryExpression: RegularExpressionLiteral',
    'PrimaryExpression: TemplateLiteral',
    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        return false;
    },
]);

// 12.2.1.5
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'PrimaryExpression: this',
    'PrimaryExpression: Literal',
    'PrimaryExpression: ArrayLiteral',
    'PrimaryExpression: ObjectLiteral',
    'PrimaryExpression: FunctionExpression',
    'PrimaryExpression: ClassExpression',
    'PrimaryExpression: GeneratorExpression',
    'PrimaryExpression: RegularExpressionLiteral',
    'PrimaryExpression: TemplateLiteral',
    function() {
        return false;
    },

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        return expr.IsValidSimpleAssignmentTarget();
    },
]);

// 12.2.2 The this Keyword

// 12.2.2.1
Runtime_Semantics('Evaluation', [

    'PrimaryExpression: this',
    function() {
        return ResolveThisBinding();
    },
]);

// 12.2.3 Identifier Reference

// 12.2.4 Literals

Syntax([
    'Literal: NullLiteral',
    'Literal: BooleanLiteral',
    'Literal: NumericLiteral',
    'Literal: StringLiteral',
]);

// 12.2.4.1
Runtime_Semantics('Evaluation', [

    'Literal: NullLiteral',
    function() {
        return null;
    },

    'Literal: BooleanLiteral',
    function() {
        if (this.BooleanLiteral.is('BooleanLiteral: false')) return false;
        if (this.BooleanLiteral.is('BooleanLiteral: true')) return true;
        return Assert(false);
    },

    'Literal: NumericLiteral',
    function() {
        return this.NumericLiteral.MV();
    },

    'Literal: StringLiteral',
    function() {
        return this.StringLiteral.StringValue();
    },
]);

// 12.2.5 Array Initializer

Syntax([
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
]);

// 12.2.5.1
Static_Semantics('ElisionWidth', [

    'Elision: ,',
    function() {
        return 1;
    },

    'Elision: Elision ,',
    function() {
        var preceding = this.Elision.ElisionWidth;
        return preceding + 1;
    },
]);

// 12.2.5.2
Runtime_Semantics('ArrayAccumulation', [

    'ElementList: Elision[opt] AssignmentExpression',
    function(array, nextIndex) {
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        var initResult = this.AssignmentExpression.Evaluation();
        var initValue = GetValue(initResult);
        var created = CreateDataProperty(array, ToString(ToUint32(nextIndex + padding)), initValue);
        Assert(created === true);
        return nextIndex + padding + 1;
    },

    'ElementList: Elision[opt] SpreadElement',
    function(array, nextIndex) {
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        return this.SpreadElement.ArrayAccumulation(array, nextIndex + padding);
    },

    'ElementList: ElementList , Elision[opt] AssignmentExpression',
    function(array, nextIndex) {
        var postIndex = this.ElementList.ArrayAccumulation(array, nextIndex);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        var initResult = this.AssignmentExpression.Evaluation();
        var initValue = GetValue(initResult);
        var created = CreateDataProperty(array, ToString(ToUint32(postIndex + padding)), initValue);
        Assert(created === true);
        return postIndex + padding + 1;
    },

    'ElementList: ElementList , Elision[opt] SpreadElement',
    function(array, nextIndex) {
        var postIndex = this.ElementList.ArrayAccumulation(array, nextIndex);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        return this.SpreadElement.ArrayAccumulation(array, postIndex + padding);
    },

    'SpreadElement: ... AssignmentExpression',
    function(array, nextIndex) {
        var spreadRef = this.AssignmentExpression.Evaluation();
        var spreadObj = GetValue(spreadRef);
        var iterator = GetIterator(spreadObj);
        while (true) {
            var next = IteratorStep(iterator);
            if (next === false) return nextIndex;
            var nextValue = IteratorValue(next);
            var status = CreateDataProperty(array, ToString(ToUint32(nextIndex)), nextValue);
            Assert(status === true);
            var nextIndex = nextIndex + 1;
        }
    },
]);

// 12.2.5.3
Runtime_Semantics('Evaluation', [

    'ArrayLiteral: [ Elision[opt] ]',
    function() {
        var array = ArrayCreate(0);
        var pad = this.Elision ? this.Elision.ElisionWidth() : 0;
        _Set(array, "length", ToUint32(pad), false);
        return array;
    },

    'ArrayLiteral: [ ElementList ]',
    function() {
        var array = ArrayCreate(0);
        var len = this.ElementList.ArrayAccumulation(array, 0);
        _Set(array, "length", ToUint32(len), false);
        return array;
    },

    'ArrayLiteral: [ ElementList , Elision[opt] ]',
    function() {
        var array = ArrayCreate(0);
        var len = this.ElementList.ArrayAccumulation(array, 0);
        var padding = this.Elision ? this.Elision.ElisionWidth() : 0;
        _Set(array, "length", ToUint32(padding + len), false);
        return array;
    },
]);

// 12.2.6 Object Initializer

Syntax([
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
]);

// 12.2.6.1
Static_Semantics('Early Errors', [

    'PropertyDefinition: MethodDefinition',
    function() {
        if (this.MethodDefinition.HasDirectSuper() === true) throw EarlySyntaxError();
    },

    'PropertyDefinition: CoverInitializedName',
    function() {
        throw EarlySyntaxError();
    },
]);

// 12.2.6.2
Static_Semantics('ComputedPropertyContains', [

    'PropertyName: LiteralPropertyName',
    function(symbol) {
        return false;
    },

    'PropertyName: ComputedPropertyName',
    function(symbol) {
        return this.ComputedPropertyName.Contains(symbol);
    },
]);

// 12.2.6.3
Static_Semantics('Contains', [

    'PropertyDefinition: MethodDefinition',
    function(symbol) {
        if (symbol === 'MethodDefinition') return true;
        return this.MethodDefinition.ComputedPropertyContains(symbol);
    },

    'LiteralPropertyName: IdentifierName',
    function(symbol) {
        return false;
    },
]);

// 12.2.6.4
Static_Semantics('HasComputedPropertyKey', [

    'PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition',
    function() {
        if (this.PropertyDefinitionList.HasComputedPropertyKey() === true) return true;
        return this.PropertyDefinition.HasComputedPropertyKey();
    },

    'PropertyDefinition: IdentifierReference',
    function() {
        return false;
    },

    'PropertyDefinition: PropertyName : AssignmentExpression',
    function() {
        return this.PropertyName.IsComputedPropertyKey();
    },
]);

// 12.2.6.5
Static_Semantics('IsComputedPropertyKey', [

    'PropertyName: LiteralPropertyName',
    function() {
        return false;
    },

    'PropertyName: ComputedPropertyName',
    function() {
        return true;
    },
]);

// 12.2.6.6
Static_Semantics('PropName', [

    'PropertyDefinition: IdentifierReference',
    function() {
        return this.IdentifierReference.StringValue();
    },

    'PropertyDefinition: PropertyName : AssignmentExpression',
    function() {
        return this.PropertyName.PropName();
    },

    'LiteralPropertyName: IdentifierName',
    function() {
        return this.IdentifierName.StringValue();
    },

    'LiteralPropertyName: StringLiteral',
    function() {
        return this.StringLiteral.SV();
    },

    'LiteralPropertyName: NumericLiteral',
    function() {
        var nbr = this.NumericLiteral.MV();
        return ToString(nbr);
    },

    'ComputedPropertyName: [ AssignmentExpression ]',
    function() {
        return empty;
    },
]);

// 12.2.6.7
Static_Semantics('PropertyNameList', [

    'PropertyDefinitionList: PropertyDefinition',
    function() {
        if (this.PropertyDefinition.PropName() === empty) return [];
        return [this.PropertyDefinition.PropName()];
    },

    'PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition',
    function() {
        var list = this.PropertyDefinitionList.PropertyNameList();
        if (this.PropertyDefinition.PropName() === empty) return list;
        list.push(this.PropertyDefinition.PropName());
        return list;
    },
]);

// 12.2.6.8
Runtime_Semantics('Evaluation', [

    'ObjectLiteral: { }',
    function() {
        return ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
    },

    'ObjectLiteral: { PropertyDefinitionList }',
    'ObjectLiteral: { PropertyDefinitionList , }',
    function() {
        var obj = ObjectCreate(currentRealm.Intrinsics['%ObjectPrototype%']);
        var status = this.PropertyDefinitionList.PropertyDefinitionEvaluation(obj, true);
        return obj;
    },

    'LiteralPropertyName: IdentifierName',
    function() {
        return this.IdentifierName.StringValue();
    },

    'LiteralPropertyName: StringLiteral',
    function() {
        return this.StringLiteral.SV();
    },

    'LiteralPropertyName: NumericLiteral',
    function() {
        var nbr = this.NumericLiteral.MV();
        return ToString(nbr);
    },

    'ComputedPropertyName: [ AssignmentExpression ]',
    function() {
        var exprValue = this.AssignmentExpression.Evaluation();
        var propName = GetValue(exprValue);
        return ToPropertyKey(propName);
    },
]);

// 12.2.6.9
Runtime_Semantics('PropertyDefinitionEvaluation', [

    'PropertyDefinitionList: PropertyDefinitionList , PropertyDefinition',
    function(object, enumerable) {
        var status = this.PropertyDefinitionList.PropertyDefinitionEvaluation(object, enumerable);
        return this.PropertyDefinition.PropertyDefinitionEvaluation(object, enumerable);
    },

    'PropertyDefinition: IdentifierReference',
    function(object, enumerable) {
        var propName = this.IdentifierReference.StringValue();
        var exprValue = this.IdentifierReference.Evaluation();
        var propValue = GetValue(exprValue);
        Assert(enumerable === true);
        return CreateDataPropertyOrThrow(object, propName, propValue);
    },

    'PropertyDefinition: PropertyName : AssignmentExpression',
    function(object, enumerable) {
        var propKey = this.PropertyName.Evaluation();
        var exprValueRef = this.AssignmentExpression.Evaluation();
        var propValue = GetValue(exprValueRef);
        if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true) {
            var hasNameProperty = HasOwnProperty(propValue, "name");
            if (hasNameProperty === false) SetFunctionName(propValue, propKey);
        }
        Assert(enumerable === true);
        return CreateDataPropertyOrThrow(object, propKey, propValue);
    },
]);

// 12.2.7 Function Defining Expressions

// 12.2.8 Regular Expression Literals

// 12.2.8.1
Static_Semantics('Early Errors', [

    'PrimaryExpression: RegularExpressionLiteral',
    function() {
        //TODO It === a Syntax Error if BodyText of RegularExpressionLiteral cannot = recognized using the goal symbol Pattern of the ECMAScript RegExp grammar specified in 21.2.1;
        //TODO It === a Syntax Error if FlagText of RegularExpressionLiteral contains any code points other than "g", "i", "m", "u", or "y", or if it contains the same code point more than once;
    },
]);

// 12.2.8.2
Runtime_Semantics('Evaluation', [

    'PrimaryExpression: RegularExpressionLiteral',
    function() {
        var pattern = this.RegularExpressionLiteral.BodyText();
        var flags = this.RegularExpressionLiteral.FlagText();
        return RegExpCreate(pattern, flags);
    },
]);

// 12.2.9 Template Literals

Syntax([
    'TemplateLiteral[Yield]: NoSubstitutionTemplate',
    'TemplateLiteral[Yield]: TemplateHead Expression[In,?Yield] TemplateSpans[?Yield]',
    'TemplateSpans[Yield]: TemplateTail',
    'TemplateSpans[Yield]: TemplateMiddleList[?Yield] TemplateTail',
    'TemplateMiddleList[Yield]: TemplateMiddle Expression[In,?Yield]',
    'TemplateMiddleList[Yield]: TemplateMiddleList[?Yield] TemplateMiddle Expression[In,?Yield]',
]);

// 12.2.9.1
Static_Semantics('TemplateStrings', [

    'TemplateLiteral: NoSubstitutionTemplate',
    function(raw) {
        if (raw === false) {
            var string = this.NoSubstitutionTemplate.TV();
        } else {
            var string = this.NoSubstitutionTemplate.TRV();
        }
        return [string];
    },

    'TemplateLiteral: TemplateHead Expression TemplateSpans',
    function(raw) {
        if (raw === false) {
            var head = this.TemplateHead.TV();
        } else {
            var head = this.TemplateHead.TRV();
        }
        var tail = this.TemplateSpans.TemplateStrings(raw);
        return [head].concat(tail);
    },

    'TemplateSpans: TemplateTail',
    function(raw) {
        if (raw === false) {
            var tail = this.TemplateTail.TV();
        } else {
            var tail = this.TemplateTail.TRV();
        }
        return [tail];
    },

    'TemplateSpans: TemplateMiddleList TemplateTail',
    function(raw) {
        var middle = this.TemplateMiddleList.TemplateStrings(raw);
        if (raw === false) {
            var tail = this.TemplateTail.TV();
        } else {
            var tail = this.TemplateTail.TRV();
        }
        return middle.concat(tail);
    },

    'TemplateMiddleList: TemplateMiddle Expression',
    function(raw) {
        if (raw === false) {
            var string = this.TemplateMiddle.TV();
        } else {
            var string = this.TemplateMiddle.TRV();
        }
        return [string];
    },

    'TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression',
    function(raw) {
        var front = this.TemplateMiddleList.TemplateStrings(raw);
        if (raw === false) {
            var last = this.TemplateMiddle.TV();
        } else {
            var last = this.TemplateMiddle.TRV();
        }
        front.push(last);
        return front;
    },
]);

// 12.2.9.2
Runtime_Semantics('ArgumentListEvaluation', [

    'TemplateLiteral: NoSubstitutionTemplate',
    function() {
        var templateLiteral = this;
        var siteObj = GetTemplateObject(templateLiteral);
        return [siteObj];
    },

    'TemplateLiteral: TemplateHead Expression TemplateSpans',
    function() {
        var templateLiteral = this;
        var siteObj = GetTemplateObject(templateLiteral);
        var firstSub = this.Expression.Evaluation();
        var restSub = this.TemplateSpans.SubstitutionEvaluation();
        Assert(Type(restSub) === 'List');
        return [siteObj, firstSub].concat(restSub);
    },
]);

// 12.2.9.3
function GetTemplateObject(templateLiteral) {
    var rawStrings = templateLiteral.TemplateStrings(true);
    var realm = currentRealm;
    var templateRegistry = realm.TemplateMap;
    for (var e of templateRegistry) {
        if (e.Strings.equals(rawStrings)) {
            return e.Array;
        }
    }
    var cookedStrings = templateLiteral.TemplateStrings(false);
    var count = cookedStrings.length;
    var template = ArrayCreate(count);
    var rawObj = ArrayCreate(count);
    var index = 0;
    while (index < count) {
        var prop = ToString(index);
        var cookedValue = cookedStrings[index];
        template.DefineOwnProperty(prop, PropertyDescriptor({ Value: cookedValue, Writable: false, Enumerable: true, Configurable: false }));
        var rawValue = rawStrings[index];
        rawObj.DefineOwnProperty(prop, PropertyDescriptor({ Value: rawValue, Writable: false, Enumerable: true, Configurable: false }));
        index = index + 1;
    }
    SetIntegrityLevel(rawObj, "frozen");
    template.DefineOwnProperty("raw", PropertyDescriptor({ Value: rawObj, Writable: false, Enumerable: false, Configurable: false }));
    SetIntegrityLevel(template, "frozen");
    templateRegistry.push(Record({ Strings: rawStrings, Array: template }));
    return template;
}

// 12.2.9.4
Runtime_Semantics('SubstitutionEvaluation', [

    'TemplateSpans: TemplateTail',
    function() {
        return [];
    },

    'TemplateSpans: TemplateMiddleList TemplateTail',
    function() {
        return this.TemplateMiddleList.SubstitutionEvaluation();
    },

    'TemplateMiddleList: TemplateMiddle Expression',
    function() {
        var sub = this.Expression.Evaluation();
        return [sub];
    },

    'TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression',
    function() {
        var preceding = this.TemplateMiddleList.SubstitutionEvaluation();
        var next = this.Expression.Evaluation();
        preceding.push(next);
        return preceding;
    },
]);

// 12.2.9.5
Runtime_Semantics('Evaluation', [

    'TemplateLiteral: NoSubstitutionTemplate',
    function() {
        return this.NoSubstitutionTemplate.TV();
    },

    'TemplateLiteral: TemplateHead Expression TemplateSpans',
    function() {
        var head = this.TemplateHead.TV();
        var sub = this.Expression.Evaluation();
        var middle = ToString(sub);
        var tail = this.TemplateSpans.Evaluation();
        return head + middle + tail;
    },

    'TemplateSpans: TemplateTail',
    function() {
        var tail = this.TemplateTail.TV();
        return tail;
    },

    'TemplateSpans: TemplateMiddleList TemplateTail',
    function() {
        var head = this.TemplateMiddleList.Evaluation();
        var tail = this.TemplateTail.TV();
        return head + tail;
    },

    'TemplateMiddleList: TemplateMiddle Expression',
    function() {
        var head = this.TemplateMiddle.TV();
        var sub = this.Expression.Evaluation();
        var middle = ToString(sub);
        return head + middle;
    },

    'TemplateMiddleList: TemplateMiddleList TemplateMiddle Expression',
    function() {
        var rest = this.TemplateMiddleList.Evaluation();
        var middle = this.TemplateMiddle.TV();
        var sub = this.Expression.Evaluation();
        var last = ToString(sub);
        return rest + middle + last;
    },
]);

// 12.2.10 The Grouping Operator

// 12.2.10.1
Static_Semantics('Early Errors', [

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        if (!this.is('CoverParenthesizedExpressionAndArrowParameterList: ( Expression )')) throw EarlySyntaxError();
        this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression().apply_early_error_rules();
    },
]);

// 12.2.10.2
Static_Semantics('IsFunctionDefinition', [

    'ParenthesizedExpression: ( Expression )',
    function() {
        return this.Expression.IsFunctionDefinition();
    },
]);

// 12.2.10.3
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'ParenthesizedExpression: ( Expression )',
    function() {
        return this.Expression.IsValidSimpleAssignmentTarget();
    },
]);

// 12.2.10.4
Runtime_Semantics('Evaluation', [

    'PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList',
    function() {
        var expr = this.CoverParenthesizedExpressionAndArrowParameterList.CoveredParenthesizedExpression();
        return expr.Evaluation();
    },

    'ParenthesizedExpression: ( Expression )',
    function() {
        return this.Expression.Evaluation();
    },
]);

// 12.3 Left-Hand-Side Expressions

Syntax([
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
]);

// 12.3.1 Static Semantics

// 12.3.1.1
Static_Semantics('Contains', [

    'MemberExpression: MemberExpression . IdentifierName',
    function(symbol) {
        if (this.MemberExpression.Contains(symbol) === true) return true;
        return false;
    },

    'SuperProperty: super . IdentifierName',
    function(symbol) {
        if (symbol === 'super') return true;
        return false;
    },

    'CallExpression: CallExpression . IdentifierName',
    function(symbol) {
        if (this.CallExpression.Contains(symbol) === true) return true;
        return false;
    },
]);

// 12.3.1.2
Static_Semantics('IsFunctionDefinition', [

    'MemberExpression: MemberExpression [ Expression ]',
    'MemberExpression: MemberExpression . IdentifierName',
    'MemberExpression: MemberExpression TemplateLiteral',
    'MemberExpression: SuperProperty',
    'MemberExpression: MetaProperty',
    'MemberExpression: new MemberExpression Arguments',
    'NewExpression: new NewExpression',
    'CallExpression: MemberExpression Arguments',
    'CallExpression: SuperCall',
    'CallExpression: CallExpression Arguments',
    'CallExpression: CallExpression [ Expression ]',
    'CallExpression: CallExpression . IdentifierName',
    'CallExpression: CallExpression TemplateLiteral',
    function() {
        return false;
    },
]);

// 12.3.1.3
Static_Semantics('IsDestructuring', [

    'MemberExpression: PrimaryExpression',
    function() {
        if (this.PrimaryExpression.is('ObjectLiteral') || this.PrimaryExpression.is('ArrayLiteral')) return true;
        return false;
    },

    'MemberExpression: MemberExpression [ Expression ]',
    'MemberExpression: MemberExpression . IdentifierName',
    'MemberExpression: MemberExpression TemplateLiteral',
    'MemberExpression: SuperProperty',
    'MemberExpression: MetaProperty',
    'MemberExpression: new MemberExpression Arguments',
    'NewExpression: new NewExpression',
    'CallExpression: MemberExpression Arguments',
    'CallExpression: SuperCall',
    'CallExpression: CallExpression Arguments',
    'CallExpression: CallExpression [ Expression ]',
    'CallExpression: CallExpression . IdentifierName',
    'CallExpression: CallExpression TemplateLiteral',
    function() {
        return false;
    },
]);

// 12.3.1.4
Static_Semantics('IsIdentifierRef', [

    'LeftHandSideExpression: CallExpression',
    'MemberExpression: MemberExpression [ Expression ]',
    'MemberExpression: MemberExpression . IdentifierName',
    'MemberExpression: MemberExpression TemplateLiteral',
    'MemberExpression: SuperProperty',
    'MemberExpression: MetaProperty',
    'MemberExpression: new MemberExpression Arguments',
    'NewExpression: new NewExpression',
    function() {
        return false;
    },
]);

// 12.3.1.5
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'CallExpression: CallExpression [ Expression ]',
    'CallExpression: CallExpression . IdentifierName',
    'MemberExpression: MemberExpression [ Expression ]',
    'MemberExpression: MemberExpression . IdentifierName',
    'MemberExpression: SuperProperty',
    function() {
        return true;
    },

    'CallExpression: MemberExpression Arguments',
    'CallExpression: SuperCall',
    'CallExpression: CallExpression Arguments',
    'CallExpression: CallExpression TemplateLiteral',
    'NewExpression: new NewExpression',
    'MemberExpression: MemberExpression TemplateLiteral',
    'MemberExpression: new MemberExpression Arguments',
    'NewTarget: new . target',
    function() {
        return false;
    },
]);

// 12.3.2 Property Accessors

// 12.3.2.1
Runtime_Semantics('Evaluation', [

    'MemberExpression: MemberExpression [ Expression ]',
    function() {
        var baseReference = this.MemberExpression.Evaluation();
        var baseValue = GetValue(baseReference);
        var propertyNameReference = this.Expression.Evaluation();
        var propertyNameValue = GetValue(propertyNameReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyKey = ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyKey, strict);
    },

    'MemberExpression: MemberExpression . IdentifierName',
    function() {
        var baseReference = this.MemberExpression.Evaluation();
        var baseValue = GetValue(baseReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyNameString = this.IdentifierName.StringValue();
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyNameString, strict);
    },

    'CallExpression: CallExpression [ Expression ]',
    function() {
        var baseReference = this.CallExpression.Evaluation();
        var baseValue = GetValue(baseReference);
        var propertyNameReference = this.Expression.Evaluation();
        var propertyNameValue = GetValue(propertyNameReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyKey = ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyKey, strict);
    },

    'CallExpression: CallExpression . IdentifierName',
    function() {
        var baseReference = this.CallExpression.Evaluation();
        var baseValue = GetValue(baseReference);
        var bv = RequireObjectCoercible(baseValue);
        var propertyNameString = this.IdentifierName.StringValue();
        if (this.strict) var strict = true;
        else var strict = false;
        return Reference(bv, propertyNameString, strict);
    },
]);

// 12.3.3 The new Operator

// 12.3.3.1
Runtime_Semantics('Evaluation', [

    'NewExpression: new NewExpression',
    function() {
        return EvaluateNew(this.NewExpression, empty);
    },

    'MemberExpression: new MemberExpression Arguments',
    function() {
        return EvaluateNew(this.MemberExpression, this.Arguments);
    },
]);

// 12.3.3.1.1
function EvaluateNew(constructProduction, _arguments) {
    Assert(constructProduction.is('NewExpression') || constructProduction.is('MemberExpression'));
    Assert(_arguments === empty || _arguments.is('Arguments'));
    var ref = constructProduction.Evaluation();
    var constructor = GetValue(ref);
    if (_arguments === empty) var argList = [];
    else {
        var argList = _arguments.ArgumentListEvaluation();
    }
    if (IsConstructor(constructor) === false) throw $TypeError();
    return Construct(constructor, argList);
}

// 12.3.4 Function Calls

// 12.3.4.1
Runtime_Semantics('Evaluation', [

    'CallExpression: MemberExpression Arguments',
    function() {
        var ref = this.MemberExpression.Evaluation();
        var func = GetValue(ref);
        if (Type(ref) === 'Reference' && IsPropertyReference(ref) === false && GetReferencedName(ref) === "eval") {
            if (SameValue(func, currentRealm.Intrinsics['%eval%']) === true) {
                var argList = this.Arguments.ArgumentListEvaluation();
                if (argList.length === 0) return undefined;
                var evalText = argList[0];
                if (this.strict) var strictCaller = true;
                else var strictCaller = false;
                var evalRealm = currentRealm;
                return PerformEval(evalText, evalRealm, strictCaller, true);
            }
        }
        if (Type(ref) === Reference) {
            if (IsPropertyReference(ref) === true) {
                var thisValue = GetThisValue(ref);
            } else {
                var refEnv = GetBase(ref);
                var thisValue = refEnv.WithBaseObject();
            }
        } else {
            var thisValue = undefined;
        }
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateDirectCall(func, thisValue, this.Arguments, tailCall);
    },

    'CallExpression: CallExpression Arguments',
    function() {
        var ref = this.CallExpression.Evaluation();
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(ref, this.Arguments, tailCall);
    },
]);

// 12.3.4.2
function EvaluateCall(ref, _arguments, tailPosition) {
    var func = GetValue(ref);
    if (Type(ref) === 'Reference') {
        if (IsPropertyReference(ref) === true) {
            var thisValue = GetThisValue(ref);
        } else {
            var refEnv = GetBase(ref);
            var thisValue = refEnv.WithBaseObject();
        }
    } else {
        var thisValue = undefined;
    }
    return EvaluateDirectCall(func, thisValue, _arguments, tailPosition);
}

// 12.3.4.3
function EvaluateDirectCall(func, thisValue, _arguments, tailPosition) {
    var argList = _arguments.ArgumentListEvaluation();
    if (Type(func) !== 'Object') throw $TypeError();
    if (IsCallable(func) === false) throw $TypeError();
    if (tailPosition === true) PrepareForTailCall();
    if (tailPosition === true) throw new PendingTailCall(func, thisValue, argList);
    var result = Call(func, thisValue, argList);
    Assert(tailPosition !== true);
    Assert(Type(result).is_an_element_of(['Undefined', 'Boolean', 'Number', 'String', 'Symbol', 'Null', 'Object']));
    return result;
}

// 12.3.5 The super Keyword

// 12.3.5.1
Runtime_Semantics('Evaluation', [

    'SuperProperty: super [ Expression ]',
    function() {
        var propertyNameReference = this.Expression.Evaluation();
        var propertyNameValue = GetValue(propertyNameReference);
        var propertyKey = ToPropertyKey(propertyNameValue);
        if (this.strict) var strict = true;
        else var strict = false;
        return MakeSuperPropertyReference(propertyKey, strict);
    },

    'SuperProperty: super . IdentifierName',
    function() {
        var propertyKey = this.IdentifierName.StringValue();
        if (this.strict) var strict = true;
        else var strict = false;
        return MakeSuperPropertyReference(propertyKey, strict);
    },

    'SuperCall: super Arguments',
    function() {
        var newTarget = GetNewTarget();
        if (newTarget === undefined) throw $ReferenceError();
        var func = GetSuperConstructor();
        var argList = this.Arguments.ArgumentListEvaluation();
        var result = Construct(func, argList, newTarget);
        var thisER = GetThisEnvironment();
        return thisER.BindThisValue(result);
    },
]);

// 12.3.5.2
function GetSuperConstructor() {
    var envRec = GetThisEnvironment();
    Assert(envRec instanceof FunctionEnvironmentRecord);
    var activeFunction = envRec.FunctionObject;
    var superConstructor = activeFunction.GetPrototypeOf();
    if (IsConstructor(superConstructor) === false) throw $TypeError();
    return superConstructor;
}

// 12.3.5.3
function MakeSuperPropertyReference(propertyKey, strict) {
    var env = GetThisEnvironment();
    if (env.HasSuperBinding() === false) throw $ReferenceError();
    var actualThis = env.GetThisBinding();
    var baseValue = env.GetSuperBase();
    var bv = RequireObjectCoercible(baseValue);
    var ref = Reference(bv, propertyKey, strict);
    ref.thisValue = actualThis;
    return ref;
}

// 12.3.6 Argument Lists

// 12.3.6.1
Runtime_Semantics('ArgumentListEvaluation', [

    'Arguments: ( )',
    function() {
        return [];
    },

    'ArgumentList: AssignmentExpression',
    function() {
        var ref = this.AssignmentExpression.Evaluation();
        var arg = GetValue(ref);
        return [arg];
    },

    'ArgumentList: ... AssignmentExpression',
    function() {
        var list = [];
        var spreadRef = this.AssignmentExpression.Evaluation();
        var spreadObj = GetValue(spreadRef);
        var iterator = GetIterator(spreadObj);
        while (true) {
            var next = IteratorStep(iterator);
            if (next === false) return list;
            var nextArg = IteratorValue(next);
            list.push(nextArg);
        }
    },

    'ArgumentList: ArgumentList , AssignmentExpression',
    function() {
        var precedingArgs = this.ArgumentList.Evaluation();
        var ref = this.AssignmentExpression.Evaluation();
        var arg = GetValue(ref);
        precedingArgs.push(arg);
        return precedingArgs;
    },

    'ArgumentList: ArgumentList , ... AssignmentExpression',
    function() {
        var precedingArgs = this.ArgumentList.Evaluation();
        var spreadRef = this.AssignmentExpression.Evaluation();
        var iterator = GetIterator(GetValue(spreadRef));
        while (true) {
            var next = IteratorStep(iterator);
            if (next === false) return precedingArgs;
            var nextArg = IteratorValue(next);
            precedingArgs.push(nextArg);
        }
    },

]);

// 12.3.7 Tagged Templates

// 12.3.7.1
Runtime_Semantics('Evaluation', [

    'MemberExpression: MemberExpression TemplateLiteral',
    function() {
        var tagRef = this.MemberExpression.Evaluation();
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(tagRef, this.TemplateLiteral, tailCall);
    },

    'CallExpression: CallExpression TemplateLiteral',
    function() {
        var tagRef = this.CallExpression.Evaluation();
        var thisCall = this;
        var tailCall = IsInTailPosition(thisCall);
        return EvaluateCall(tagRef, this.TemplateLiteral, tailCall);
    },
]);

// 12.3.8 Meta Properties

// 12.3.8.1
Runtime_Semantics('Evaluation', [

    'NewTarget: new . target',
    function() {
        return GetNewTarget();
    },
]);

// 12.4 Update Expressions

Syntax([
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield]',
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield] ++',
    'UpdateExpression[Yield]: LeftHandSideExpression[?Yield] --',
    'UpdateExpression[Yield]: ++ UnaryExpression[?Yield]',
    'UpdateExpression[Yield]: -- UnaryExpression[?Yield]',
]);

// 12.4.1
Static_Semantics('Early Errors', [

    'UpdateExpression: LeftHandSideExpression ++',
    'UpdateExpression: LeftHandSideExpression --',
    function() {
        if (this.LeftHandSideExpression.IsValidSimpleAssignmentTarget() === false) throw EarlyReferenceError();
    },
    'UpdateExpression: ++ UnaryExpression',
    'UpdateExpression: -- UnaryExpression',
    function() {
        if (this.UnaryExpression.IsValidSimpleAssignmentTarget() === false) throw EarlyReferenceError();
    },
]);

// 12.4.2
Static_Semantics('IsFunctionDefinition', [

    'UpdateExpression: LeftHandSideExpression ++',
    'UpdateExpression: LeftHandSideExpression --',
    'UpdateExpression: ++ UnaryExpression',
    'UpdateExpression: -- UnaryExpression',
    function() {
        return false;
    },
]);

// 12.4.3
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'UpdateExpression: LeftHandSideExpression ++',
    'UpdateExpression: LeftHandSideExpression --',
    'UpdateExpression: ++ UnaryExpression',
    'UpdateExpression: -- UnaryExpression',
    function() {
        return false;
    },
]);

// 12.4.4 Postfix Increment Operator

// 12.4.4.1
Runtime_Semantics('Evaluation', [

    'UpdateExpression: LeftHandSideExpression ++',
    function() {
        var lhs = this.LeftHandSideExpression.Evaluation();
        var oldValue = ToNumber(GetValue(lhs));
        var newValue = oldValue + 1;
        PutValue(lhs, newValue);
        return oldValue;
    },
]);

// 12.4.5 Postfix Decrement Operator

// 12.4.5.1
Runtime_Semantics('Evaluation', [

    'UpdateExpression: LeftHandSideExpression --',
    function() {
        var lhs = this.LeftHandSideExpression.Evaluation();
        var oldValue = ToNumber(GetValue(lhs));
        var newValue = oldValue - 1;
        PutValue(lhs, newValue);
        return oldValue;
    },
]);

// 12.4.6 Prefix Increment Operator

// 12.4.6.1
Runtime_Semantics('Evaluation', [

    'UpdateExpression: ++ UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        var oldValue = ToNumber(GetValue(expr));
        var newValue = oldValue + 1;
        PutValue(expr, newValue);
        return newValue;
    },
]);

// 12.4.7 Prefix Decrement Operator

// 12.4.7.1
Runtime_Semantics('Evaluation', [

    'UpdateExpression: -- UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        var oldValue = ToNumber(GetValue(expr));
        var newValue = oldValue - 1;
        PutValue(expr, newValue);
        return newValue;
    },
]);

// 12.5 Unary Operators

Syntax([
    'UnaryExpression[Yield]: UpdateExpression[?Yield]',
    'UnaryExpression[Yield]: delete UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: void UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: typeof UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: + UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: - UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: ~ UnaryExpression[?Yield]',
    'UnaryExpression[Yield]: ! UnaryExpression[?Yield]',
]);

// 12.5.1
Static_Semantics('IsFunctionDefinition', [

    // 'UnaryExpression: UpdateExpression', spec bug
    'UnaryExpression: delete UnaryExpression',
    'UnaryExpression: void UnaryExpression',
    'UnaryExpression: typeof UnaryExpression',
    'UnaryExpression: + UnaryExpression',
    'UnaryExpression: - UnaryExpression',
    'UnaryExpression: ~ UnaryExpression',
    'UnaryExpression: ! UnaryExpression',
    function() {
        return false;
    },
]);

// 12.5.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    // 'UnaryExpression: UpdateExpression', spec bug
    'UnaryExpression: delete UnaryExpression',
    'UnaryExpression: void UnaryExpression',
    'UnaryExpression: typeof UnaryExpression',
    'UnaryExpression: + UnaryExpression',
    'UnaryExpression: - UnaryExpression',
    'UnaryExpression: ~ UnaryExpression',
    'UnaryExpression: ! UnaryExpression',
    function() {
        return false;
    },
]);

// 12.5.3 The delete Operator

// 12.5.3.1
Static_Semantics('Early Errors', [

    'UnaryExpression: delete UnaryExpression',
    function() {
        if (this.UnaryExpression.strict && this.UnaryExpression.is('PrimaryExpression: IdentifierReference')) throw EarlySyntaxError();
        var expr = this.UnaryExpression;
        while (expr.is('PrimaryExpression: CoverParenthesizedExpressionAndArrowParameterList')) {
            expr = expr.resolve('CoverParenthesizedExpressionAndArrowParameterList').Expression;
            if (expr.strict && expr.is('PrimaryExpression: IdentifierReference')) throw EarlySyntaxError();
        }
    },
]);

// 12.5.3.2
Runtime_Semantics('Evaluation', [

    'UnaryExpression: delete UnaryExpression',
    function() {
        var ref = this.UnaryExpression.Evaluation();
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

// 12.5.4 The void Operator

// 12.5.4.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: void UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        GetValue(expr);
        return undefined;
    },
]);

// 12.5.5 The typeof Operator

// 12.5.5.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: typeof UnaryExpression',
    function() {
        var val = this.UnaryExpression.Evaluation();
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

// 12.5.6 Unary + Operator

// 12.5.6.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: + UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        return ToNumber(GetValue(expr));
    },
]);

// 12.5.7 Unary - Operator

// 12.5.7.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: - UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        var oldValue = ToNumber(GetValue(expr));
        if (isNaN(oldValue)) return NaN;
        return -oldValue;
    },
]);

// 12.5.8 Bitwise NOT Operator ( ~ )

// 12.5.8.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: ~ UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        var oldValue = ToInt32(GetValue(expr));
        return ~oldValue;
    },

]);

// 12.5.9 Logical NOT Operator ( ! )

// 12.5.9.1
Runtime_Semantics('Evaluation', [

    'UnaryExpression: ! UnaryExpression',
    function() {
        var expr = this.UnaryExpression.Evaluation();
        var oldValue = ToBoolean(GetValue(expr));
        if (oldValue === true) return false;
        return true;
    },

]);

// 12.6 Exponentiation Operator

Syntax([
    'ExponentiationExpression[Yield]: UnaryExpression[?Yield]',
    'ExponentiationExpression[Yield]: UpdateExpression[?Yield] ** ExponentiationExpression[?Yield]',
]);

// 12.6.1
Static_Semantics('IsFunctionDefinition', [

    'ExponentiationExpression: UpdateExpression ** ExponentiationExpression',
    function() {
        return false;
    },
]);

// 12.6.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'ExponentiationExpression: UpdateExpression ** ExponentiationExpression',
    function() {
        return false;
    },
]);

// 12.6.3
Runtime_Semantics('Evaluation', [

    'ExponentiationExpression: UpdateExpression ** ExponentiationExpression',
    function() {
        var left = this.UpdateExpression.Evaluation();
        var leftValue = GetValue(left);
        var right = this.ExponentiationExpression.Evaluation();
        var rightValue = GetValue(right);
        var base = ToNumber(leftValue);
        var exponent = ToNumber(rightValue);
        return Math.pow(base, exponent);
    },
]);

// 12.7 Multiplicative Operators

Syntax([
    'MultiplicativeExpression[Yield]: ExponentiationExpression[?Yield]',
    'MultiplicativeExpression[Yield]: MultiplicativeExpression[?Yield] MultiplicativeOperator ExponentiationExpression[?Yield]',
    'MultiplicativeOperator: *',
    'MultiplicativeOperator: /',
    'MultiplicativeOperator: %',
]);

// 12.7.1
Static_Semantics('IsFunctionDefinition', [

    'MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression',
    function() {
        return false;
    },
]);

// 12.7.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression',
    function() {
        return false;
    },
]);

// 12.7.3
Runtime_Semantics('Evaluation', [

    'MultiplicativeExpression: MultiplicativeExpression MultiplicativeOperator ExponentiationExpression',
    function() {
        var left = this.MultiplicativeExpression.Evaluation();
        var leftValue = GetValue(left);
        var right = this.ExponentiationExpression.Evaluation();
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

// 12.7.3.1 Applying the * Operator
// 12.7.3.2 Applying the / Operator
// 12.7.3.3 Applying the % Operator
// 12.7.3.4 Applying the ** Operator

// 12.8 Additive Operators

Syntax([
    'AdditiveExpression[Yield]: MultiplicativeExpression[?Yield]',
    'AdditiveExpression[Yield]: AdditiveExpression[?Yield] + MultiplicativeExpression[?Yield]',
    'AdditiveExpression[Yield]: AdditiveExpression[?Yield] - MultiplicativeExpression[?Yield]',
]);

// 12.8.1
Static_Semantics('IsFunctionDefinition', [

    'AdditiveExpression: AdditiveExpression + MultiplicativeExpression',
    'AdditiveExpression: AdditiveExpression - MultiplicativeExpression',
    function() {
        return false;
    },
]);

// 12.8.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'AdditiveExpression: AdditiveExpression + MultiplicativeExpression',
    'AdditiveExpression: AdditiveExpression - MultiplicativeExpression',
    function() {
        return false;
    },
]);

// 12.8.3 The Addition Operator ( + )

// 12.8.3.1
Runtime_Semantics('Evaluation', [

    'AdditiveExpression: AdditiveExpression + MultiplicativeExpression',
    function() {
        var lref = this.AdditiveExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.MultiplicativeExpression.Evaluation();
        var rval = GetValue(rref);
        var lprim = ToPrimitive(lval);
        var rprim = ToPrimitive(rval);
        if (Type(lprim) === 'String' || Type(rprim) === 'String') {
            var lstr = ToString(lprim);
            var rstr = ToString(rprim);
            return lstr + rstr;
        }
        var lnum = ToNumber(lprim);
        var rnum = ToNumber(rprim);
        return lnum + rnum;
    },
]);

// 12.8.4 The Subtraction Operator ( - )

// 12.8.4.1
Runtime_Semantics('Evaluation', [

    'AdditiveExpression: AdditiveExpression - MultiplicativeExpression',
    function() {
        var lref = this.AdditiveExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.MultiplicativeExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToNumber(lval);
        var rnum = ToNumber(rval);
        return lnum - rnum;
    },
]);

// 12.8.5 Applying the Additive Operators to Numbers

// 12.9 Bitwise Shift Operators

Syntax([
    'ShiftExpression[Yield]: AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] << AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] >> AdditiveExpression[?Yield]',
    'ShiftExpression[Yield]: ShiftExpression[?Yield] >>> AdditiveExpression[?Yield]',
]);

// 12.9.1
Static_Semantics('IsFunctionDefinition', [

    'ShiftExpression: ShiftExpression << AdditiveExpression',
    'ShiftExpression: ShiftExpression >> AdditiveExpression',
    'ShiftExpression: ShiftExpression >>> AdditiveExpression',
    function() {
        return false;
    },
]);

// 12.9.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'ShiftExpression: ShiftExpression << AdditiveExpression',
    'ShiftExpression: ShiftExpression >> AdditiveExpression',
    'ShiftExpression: ShiftExpression >>> AdditiveExpression',
    function() {
        return false;
    },
]);

// 12.9.3 The Left Shift Operator ( << )

// 12.9.3.1
Runtime_Semantics('Evaluation', [

    'ShiftExpression: ShiftExpression << AdditiveExpression',
    function() {
        var lref = this.ShiftExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum << shiftCount;
    },
]);

// 12.9.4 The Signed Right Shift Operator ( >> )

// 12.9.4.1
Runtime_Semantics('Evaluation', [

    'ShiftExpression: ShiftExpression >> AdditiveExpression',
    function() {
        var lref = this.ShiftExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum >> shiftCount;
    },
]);

// 12.9.5 The Unsigned Right Shift Operator ( >>> )

// 12.9.5.1
Runtime_Semantics('Evaluation', [

    'ShiftExpression: ShiftExpression >>> AdditiveExpression',
    function() {
        var lref = this.ShiftExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.AdditiveExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToUint32(lval);
        var rnum = ToUint32(rval);
        var shiftCount = rnum & 0x1F;
        return lnum >>> shiftCount;
    },
]);

// 12.10 Relational Operators

Syntax([
    'RelationalExpression[In,Yield]: ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] < ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] > ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] <= ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] >= ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]: RelationalExpression[?In,?Yield] instanceof ShiftExpression[?Yield]',
    'RelationalExpression[In,Yield]:[+In] RelationalExpression[In,?Yield] in ShiftExpression[?Yield]',
]);

// 12.10.1
Static_Semantics('IsFunctionDefinition', [

    'RelationalExpression: RelationalExpression < ShiftExpression',
    'RelationalExpression: RelationalExpression > ShiftExpression',
    'RelationalExpression: RelationalExpression <= ShiftExpression',
    'RelationalExpression: RelationalExpression >= ShiftExpression',
    'RelationalExpression: RelationalExpression instanceof ShiftExpression',
    'RelationalExpression: RelationalExpression in ShiftExpression',
    function() {
        return false;
    },
]);

// 12.10.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'RelationalExpression: RelationalExpression < ShiftExpression',
    'RelationalExpression: RelationalExpression > ShiftExpression',
    'RelationalExpression: RelationalExpression <= ShiftExpression',
    'RelationalExpression: RelationalExpression >= ShiftExpression',
    'RelationalExpression: RelationalExpression instanceof ShiftExpression',
    'RelationalExpression: RelationalExpression in ShiftExpression',
    function() {
        return false;
    },
]);

// 12.10.3
Runtime_Semantics('Evaluation', [

    'RelationalExpression: RelationalExpression < ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(lval, rval);
        if (r === undefined) return false;
        else return r;
    },

    'RelationalExpression: RelationalExpression > ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(rval, lval, { LeftFirst: false });
        if (r === undefined) return false;
        else return r;
    },

    'RelationalExpression: RelationalExpression <= ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(rval, lval, { LeftFirst: false });
        if (r === true || r === undefined) return false;
        else return true;
    },

    'RelationalExpression: RelationalExpression >= ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        var r = AbstractRelationalComparison(lval, rval);
        if (r === true || r === undefined) return false;
        else return true;
    },

    'RelationalExpression: RelationalExpression instanceof ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        return InstanceofOperator(lval, rval);
    },

    'RelationalExpression: RelationalExpression in ShiftExpression',
    function() {
        var lref = this.RelationalExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.ShiftExpression.Evaluation();
        var rval = GetValue(rref);
        if (Type(rval) !== 'Object') throw $TypeError();
        return HasProperty(rval, ToPropertyKey(lval));
    },
]);

// 12.10.4
function InstanceofOperator(O, C) {
    if (Type(C) !== 'Object') throw $TypeError();
    var instOfHandler = GetMethod(C, wellKnownSymbols['@@hasInstance']);
    if (instOfHandler !== undefined) {
        return ToBoolean(Call(instOfHandler, C, [O]));
    }
    if (IsCallable(C) === false) throw $TypeError();
    return OrdinaryHasInstance(C, O);
}

// 12.11 Equality Operators

Syntax([
    'EqualityExpression[In,Yield]: RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] == RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] != RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] === RelationalExpression[?In,?Yield]',
    'EqualityExpression[In,Yield]: EqualityExpression[?In,?Yield] !== RelationalExpression[?In,?Yield]',
]);

// 12.11.1
Static_Semantics('IsFunctionDefinition', [

    'EqualityExpression: EqualityExpression == RelationalExpression',
    'EqualityExpression: EqualityExpression != RelationalExpression',
    'EqualityExpression: EqualityExpression === RelationalExpression',
    'EqualityExpression: EqualityExpression !== RelationalExpression',
    function() {
        return false;
    },
]);

// 12.11.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'EqualityExpression: EqualityExpression == RelationalExpression',
    'EqualityExpression: EqualityExpression != RelationalExpression',
    'EqualityExpression: EqualityExpression === RelationalExpression',
    'EqualityExpression: EqualityExpression !== RelationalExpression',
    function() {
        return false;
    },
]);

// 12.11.3
Runtime_Semantics('Evaluation', [

    'EqualityExpression: EqualityExpression == RelationalExpression',
    function() {
        var lref = this.EqualityExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.Evaluation();
        var rval = GetValue(rref);
        return AbstractEqualityComparison(rval, lval);
    },

    'EqualityExpression: EqualityExpression != RelationalExpression',
    function() {
        var lref = this.EqualityExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.Evaluation();
        var rval = GetValue(rref);
        var r = AbstractEqualityComparison(rval, lval);
        if (r === true) return false;
        else return true;
    },

    'EqualityExpression: EqualityExpression === RelationalExpression',
    function() {
        var lref = this.EqualityExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.Evaluation();
        var rval = GetValue(rref);
        return StrictEqualityComparison(rval, lval);
    },

    'EqualityExpression: EqualityExpression !== RelationalExpression',
    function() {
        var lref = this.EqualityExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.RelationalExpression.Evaluation();
        var rval = GetValue(rref);
        var r = StrictEqualityComparison(rval, lval);
        if (r === true) return false;
        else return true;
    },
]);

// 12.12 Binary Bitwise Operators

Syntax([
    'BitwiseANDExpression[In,Yield]: EqualityExpression[?In,?Yield]',
    'BitwiseANDExpression[In,Yield]: BitwiseANDExpression[?In,?Yield] & EqualityExpression[?In,?Yield]',
    'BitwiseXORExpression[In,Yield]: BitwiseANDExpression[?In,?Yield]',
    'BitwiseXORExpression[In,Yield]: BitwiseXORExpression[?In,?Yield] ^ BitwiseANDExpression[?In,?Yield]',
    'BitwiseORExpression[In,Yield]: BitwiseXORExpression[?In,?Yield]',
    'BitwiseORExpression[In,Yield]: BitwiseORExpression[?In,?Yield] | BitwiseXORExpression[?In,?Yield]',
]);

// 12.12.1
Static_Semantics('IsFunctionDefinition', [

    'BitwiseANDExpression: BitwiseANDExpression & EqualityExpression',
    'BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression',
    'BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression',
    function() {
        return false;
    },
]);

// 12.12.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'BitwiseANDExpression: BitwiseANDExpression & EqualityExpression',
    'BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression',
    'BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression',
    function() {
        return false;
    },
]);

// 12.12.3
Runtime_Semantics('Evaluation', [

    'BitwiseANDExpression: BitwiseANDExpression & EqualityExpression',
    function() {
        var lref = this.BitwiseANDExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.EqualityExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum & rnum;
    },

    'BitwiseXORExpression: BitwiseXORExpression ^ BitwiseANDExpression',
    function() {
        var lref = this.BitwiseXORExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.BitwiseANDExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum ^ rnum;
    },

    'BitwiseORExpression: BitwiseORExpression | BitwiseXORExpression',
    function() {
        var lref = this.BitwiseORExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.BitwiseXORExpression.Evaluation();
        var rval = GetValue(rref);
        var lnum = ToInt32(lval);
        var rnum = ToInt32(rval);
        return lnum | rnum;
    },
]);

// 12.13 Binary Logical Operators

Syntax([
    'LogicalANDExpression[In,Yield]: BitwiseORExpression[?In,?Yield]',
    'LogicalANDExpression[In,Yield]: LogicalANDExpression[?In,?Yield] && BitwiseORExpression[?In,?Yield]',
    'LogicalORExpression[In,Yield]: LogicalANDExpression[?In,?Yield]',
    'LogicalORExpression[In,Yield]: LogicalORExpression[?In,?Yield] || LogicalANDExpression[?In,?Yield]',
]);

// 12.13.1
Static_Semantics('IsFunctionDefinition', [

    'LogicalANDExpression: LogicalANDExpression && BitwiseORExpression',
    'LogicalORExpression: LogicalORExpression || LogicalANDExpression',
    function() {
        return false;
    },
]);

// 12.13.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'LogicalANDExpression: LogicalANDExpression && BitwiseORExpression',
    'LogicalORExpression: LogicalORExpression || LogicalANDExpression',
    function() {
        return false;
    },
]);

// 12.13.3
Runtime_Semantics('Evaluation', [

    'LogicalANDExpression: LogicalANDExpression && BitwiseORExpression',
    function() {
        var lref = this.LogicalANDExpression.Evaluation();
        var lval = GetValue(lref);
        var lbool = ToBoolean(lval);
        if (lbool === false) return lval;
        var rref = this.BitwiseORExpression.Evaluation();
        return GetValue(rref);
    },

    'LogicalORExpression: LogicalORExpression || LogicalANDExpression',
    function() {
        var lref = this.LogicalORExpression.Evaluation();
        var lval = GetValue(lref);
        var lbool = ToBoolean(lval);
        if (lbool === true) return lval;
        var rref = this.LogicalANDExpression.Evaluation();
        return GetValue(rref);
    },
]);

// 12.14 Conditional Operator ( ? : )

Syntax([
    'ConditionalExpression[In,Yield]: LogicalORExpression[?In,?Yield]',
    'ConditionalExpression[In,Yield]: LogicalORExpression[?In,?Yield] ? AssignmentExpression[In,?Yield] : AssignmentExpression[?In,?Yield]',
]);

// 12.14.1
Static_Semantics('IsFunctionDefinition', [

    'ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.14.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.14.3
Runtime_Semantics('Evaluation', [

    'ConditionalExpression: LogicalORExpression ? AssignmentExpression : AssignmentExpression',
    function() {
        var lref = this.LogicalORExpression.Evaluation();
        var lval = ToBoolean(GetValue(lref));
        if (lval === true) {
            var trueRef = this.AssignmentExpression1.Evaluation();
            return GetValue(trueRef);
        } else {
            var falseRef = this.AssignmentExpression2.Evaluation();
            return GetValue(falseRef);
        }
    },
]);

// 12.15 Assignment Operators

Syntax([
    'AssignmentExpression[In,Yield]: ConditionalExpression[?In,?Yield]',
    'AssignmentExpression[In,Yield]:[+Yield] YieldExpression[?In]',
    'AssignmentExpression[In,Yield]: ArrowFunction[?In,?Yield]',
    'AssignmentExpression[In,Yield]: LeftHandSideExpression[?Yield] = AssignmentExpression[?In,?Yield]',
    'AssignmentExpression[In,Yield]: LeftHandSideExpression[?Yield] AssignmentOperator AssignmentExpression[?In,?Yield]',
    'AssignmentOperator: *=',
    'AssignmentOperator: /=',
    'AssignmentOperator: %=',
    'AssignmentOperator: +=',
    'AssignmentOperator: -=',
    'AssignmentOperator: <<=',
    'AssignmentOperator: >>=',
    'AssignmentOperator: >>>=',
    'AssignmentOperator: &=',
    'AssignmentOperator: ^=',
    'AssignmentOperator: |=',
    'AssignmentOperator: **=',
]);

// 12.15.1
Static_Semantics('Early Errors', [

    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    function() {
        if (this.LeftHandSideExpression.is('ObjectLiteral') || this.LeftHandSideExpression.is('ArrayLiteral')) {
            // moved into the parser.
            // parseAssignmentPattern(Yield);
        } else {
            if (this.LeftHandSideExpression.IsValidSimpleAssignmentTarget() === false) throw EarlyReferenceError();
        }
    },

    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    function() {
        if (this.LeftHandSideExpression.IsValidSimpleAssignmentTarget() === false) throw EarlyReferenceError();
    },
]);

// 12.15.2
Static_Semantics('IsFunctionDefinition', [

    'AssignmentExpression: ArrowFunction',
    function() {
        return true;
    },

    'AssignmentExpression: YieldExpression',
    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.15.3
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'AssignmentExpression: YieldExpression',
    'AssignmentExpression: ArrowFunction',
    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.15.4
Runtime_Semantics('Evaluation', [

    'AssignmentExpression: LeftHandSideExpression = AssignmentExpression',
    function() {
        if (!(this.LeftHandSideExpression.is('ObjectLiteral') || this.LeftHandSideExpression.is('ArrayLiteral'))) {
            var lref = this.LeftHandSideExpression.Evaluation();
            var rref = this.AssignmentExpression.Evaluation();
            var rval = GetValue(rref);
            if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true && this.LeftHandSideExpression.IsIdentifierRef() === true) {
                var hasNameProperty = HasOwnProperty(rval, "name");
                if (hasNameProperty === false) SetFunctionName(rval, GetReferencedName(lref));
            }
            PutValue(lref, rval);
            return rval;
        }
        var assignmentPattern = this.AssignmentPattern;
        var rref = this.AssignmentExpression.Evaluation();
        var rval = GetValue(rref);
        var status = assignmentPattern.DestructuringAssignmentEvaluation(rval);
        return rval;
    },

    'AssignmentExpression: LeftHandSideExpression AssignmentOperator AssignmentExpression',
    function() {
        var lref = this.LeftHandSideExpression.Evaluation();
        var lval = GetValue(lref);
        var rref = this.AssignmentExpression.Evaluation();
        var rval = GetValue(rref);
        switch (this.AssignmentOperator) {
            case '*=':
                var lnum = ToNumber(lval);
                var rnum = ToNumber(rval);
                var r = lnum * rnum;
                break;
            case '/=':
                var lnum = ToNumber(lval);
                var rnum = ToNumber(rval);
                var r = lnum / rnum;
                break;
            case '%=':
                var lnum = ToNumber(lval);
                var rnum = ToNumber(rval);
                var r = lnum % rnum;
                break;
            case '+=':
                var lprim = ToPrimitive(lval);
                var rprim = ToPrimitive(rval);
                if (Type(lprim) === 'String' || Type(rprim) === 'String') {
                    var lstr = ToString(lprim);
                    var rstr = ToString(rprim);
                    var r = lstr + rstr;
                    break;
                }
                var lnum = ToNumber(lprim);
                var rnum = ToNumber(rprim);
                var r = lnum + rnum;
                break;
            case '-=':
                var lnum = ToNumber(lval);
                var rnum = ToNumber(rval);
                var r = lnum - rnum;
                break;
            case '<<=':
                var lnum = ToInt32(lval);
                var rnum = ToUint32(rval);
                var shiftCount = rnum & 0x1F;
                var r = lnum << shiftCount;
                break;
            case '>>=':
                var lnum = ToInt32(lval);
                var rnum = ToUint32(rval);
                var shiftCount = rnum & 0x1F;
                var r = lnum >> shiftCount;
                break;
            case '>>>=':
                var lnum = ToUint32(lval);
                var rnum = ToUint32(rval);
                var shiftCount = rnum & 0x1F;
                var r = lnum >>> shiftCount;
                break;
            case '&=':
                var lnum = ToInt32(lval);
                var rnum = ToInt32(rval);
                var r = lnum & rnum;
                break;
            case '|=':
                var lnum = ToInt32(lval);
                var rnum = ToInt32(rval);
                var r = lnum | rnum;
                break;
            case '^=':
                var lnum = ToInt32(lval);
                var rnum = ToInt32(rval);
                var r = lnum ^ rnum;
                break;
            case '**=':
                var base = ToNumber(lval);
                var exponent = ToNumber(rval);
                var r = Math.pow(base, exponent);
                break;
        }
        PutValue(lref, r);
        return r;
    },
]);

// 12.15.5 Destructuring Assignment

Syntax([
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
]);

// 12.15.5.1
Static_Semantics('Early Errors', [

    'AssignmentProperty: IdentifierReference Initializer[opt]',
    function() {
        if (this.IdentifierReference.IsValidSimpleAssignmentTarget() === false) throw EarlySyntaxError();
    },

    'DestructuringAssignmentTarget: LeftHandSideExpression',
    function() {
        if (this.LeftHandSideExpression.is('ObjectLiteral') || this.LeftHandSideExpression.is('ArrayLiteral')) {
            // moved into the parser.
            // parseAssignmentPattern(Yield);
        } else {
            if (this.LeftHandSideExpression.IsValidSimpleAssignmentTarget() === false) throw EarlySyntaxError();
        }
    },
]);

// 12.15.5.2
Runtime_Semantics('DestructuringAssignmentEvaluation', [

    'ObjectAssignmentPattern: { }',
    function(value) {
        RequireObjectCoercible(value);
        return empty;
    },

    'ObjectAssignmentPattern: { AssignmentPropertyList }',
    'ObjectAssignmentPattern: { AssignmentPropertyList , }',
    function(value) {
        RequireObjectCoercible(value);
        return this.AssignmentPropertyList.DestructuringAssignmentEvaluation(value);
    },

    'ArrayAssignmentPattern: [ ]',
    function(value) {
        var iterator = GetIterator(value);
        return IteratorClose(iterator, NormalCompletion(empty));
    },

    'ArrayAssignmentPattern: [ Elision ]',
    function(value) {
        var iterator = GetIterator(value);
        var iteratorRecord = Record({ Iterator: iterator, Done: false });
        var result = concreteCompletion(this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
        if (iteratorRecord.Done === false) return IteratorClose(iterator, result);
        return resolveCompletion(result);
    },

    'ArrayAssignmentPattern: [ Elision[opt] AssignmentRestElement ]',
    function(value) {
        var iterator = GetIterator(value);
        var iteratorRecord = Record({ Iterator: iterator, Done: false });
        if (this.Elision) {
            var status = concreteCompletion(this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
            if (status.is_an_abrupt_completion()) {
                if (iteratorRecord.Done === false) return IteratorClose(iterator, status);
                return resolveCompletion(status);
            }
        }
        var result = concreteCompletion(this.AssignmentRestElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
        if (iteratorRecord.Done === false) return IteratorClose(iterator, result);
        return resolveCompletion(result);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList ]',
    function(value) {
        var iterator = GetIterator(value);
        var iteratorRecord = Record({ Iterator: iterator, Done: false });
        var result = concreteCompletion(this.AssignmentElementList.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
        if (iteratorRecord.Done === false) return IteratorClose(iterator, result);
        return resolveCompletion(result);
    },

    'ArrayAssignmentPattern: [ AssignmentElementList , Elision[opt] AssignmentRestElement[opt] ]',
    function(value) {
        var iterator = GetIterator(value);
        var iteratorRecord = Record({ Iterator: iterator, Done: false });
        var status = concreteCompletion(this.AssignmentElementList.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
        if (status.is_an_abrupt_completion()) {
            if (iteratorRecord.Done === false) return IteratorClose(iterator, status);
            return resolveCompletion(status);
        }
        if (this.Elision) {
            var status = concreteCompletion(this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
            if (status.is_an_abrupt_completion()) {
                if (iteratorRecord.Done === false) return IteratorClose(iterator, status);
                return resolveCompletion(status);
            }
        }
        if (this.AssignmentRestElement) {
            var status = concreteCompletion(this.AssignmentRestElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord));
        }
        if (iteratorRecord.Done === false) return IteratorClose(iterator, status);
        return resolveCompletion(status);
    },

    'AssignmentPropertyList: AssignmentPropertyList , AssignmentProperty',
    function(value) {
        var status = this.AssignmentPropertyList.DestructuringAssignmentEvaluation(value);
        return this.AssignmentProperty.DestructuringAssignmentEvaluation(value);
    },

    'AssignmentProperty: IdentifierReference Initializer[opt]',
    function(value) {
        var P = this.IdentifierReference.StringValue();
        var lref = ResolveBinding(P, undefined, this.strict);
        var v = GetV(value, P);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                var hasNameProperty = HasOwnProperty(v, "name");
                if (hasNameProperty === false) SetFunctionName(v, P);
            }
        }
        return PutValue(lref, v);
    },

    'AssignmentProperty: PropertyName : AssignmentElement',
    function(value) {
        var name = this.PropertyName.Evaluation();
        return this.AssignmentElement.KeyedDestructuringAssignmentEvaluation(value, name);
    },
]);

// 12.15.5.3
Runtime_Semantics('IteratorDestructuringAssignmentEvaluation', [

    'AssignmentElementList: AssignmentElisionElement',
    function(iteratorRecord) {
        return this.AssignmentElisionElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'AssignmentElementList: AssignmentElementList , AssignmentElisionElement',
    function(iteratorRecord) {
        var status = this.AssignmentElementList.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        return this.AssignmentElisionElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'AssignmentElisionElement: AssignmentElement',
    function(iteratorRecord) {
        return this.AssignmentElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'AssignmentElisionElement: Elision AssignmentElement',
    function(iteratorRecord) {
        var status = this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        return this.AssignmentElement.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'Elision: ,',
    function(iteratorRecord) {
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
        }
        return empty;
    },

    'Elision: Elision ,',
    function(iteratorRecord) {
        var status = this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
        }
        return empty;
    },

    'AssignmentElement: DestructuringAssignmentTarget Initializer[opt]',
    function(iteratorRecord) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.Evaluation();
        }
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var value = concreteCompletion(IteratorValue(next));
                if (value.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(value);
                value = resolveCompletion(value);
            }
        }
        if (iteratorRecord.Done === true) var value = undefined;
        if (this.Initializer && value === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
        } else var v = value;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var nestedAssignmentPattern = this.DestructuringAssignmentTarget.AssignmentPattern;
            return nestedAssignmentPattern.DestructuringAssignmentEvaluation(v);
        }
        if (this.Initializer && value === undefined && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            var hasNameProperty = HasOwnProperty(v, "name");
            if (hasNameProperty === false) SetFunctionName(v, GetReferencedName(lref));
        }
        return PutValue(lref, v);
    },

    'AssignmentRestElement: ... DestructuringAssignmentTarget',
    function(iteratorRecord) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.Evaluation();
        }
        var A = ArrayCreate(0);
        var n = 0;
        while (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var nextValue = concreteCompletion(IteratorValue(next));
                if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(nextValue);
                nextValue = resolveCompletion(nextValue);
                var status = CreateDataProperty(A, ToString(n), nextValue);
                Assert(status === true);
                n++;
            }
        }
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            return PutValue(lref, A);
        }
        var nestedAssignmentPattern = this.DestructuringAssignmentTarget.AssignmentPattern;
        return nestedAssignmentPattern.DestructuringAssignmentEvaluation(A);
    },

]);

// 12.15.5.4
Runtime_Semantics('KeyedDestructuringAssignmentEvaluation', [

    'AssignmentElement: DestructuringAssignmentTarget Initializer[opt]',
    function(value, propertyName) {
        if (!(this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral'))) {
            var lref = this.DestructuringAssignmentTarget.Evaluation();
        }
        var v = GetV(value, propertyName);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var rhsValue = GetValue(defaultValue);
        } else var rhsValue = v;
        if (this.DestructuringAssignmentTarget.is('ObjectLiteral') || this.DestructuringAssignmentTarget.is('ArrayLiteral')) {
            var assignmentPattern = this.DestructuringAssignmentTarget.AssignmentPattern;
            return assignmentPattern.DestructuringAssignmentEvaluation(rhsValue);
        }
        if (this.Initializer && v === undefined && IsAnonymousFunctionDefinition(this.Initializer) === true && this.DestructuringAssignmentTarget.IsIdentifierRef() === true) {
            var hasNameProperty = HasOwnProperty(rhsValue, "name");
            if (hasNameProperty === false) SetFunctionName(rhsValue, GetReferencedName(lref));
        }
        return PutValue(lref, rhsValue);
    },
]);

// 12.16 Comma Operator ( , )

Syntax([
    'Expression[In,Yield]: AssignmentExpression[?In,?Yield]',
    'Expression[In,Yield]: Expression[?In,?Yield] , AssignmentExpression[?In,?Yield]',
]);

// 12.16.1
Static_Semantics('IsFunctionDefinition', [

    'Expression: Expression , AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.16.2
Static_Semantics('IsValidSimpleAssignmentTarget', [

    'Expression: Expression , AssignmentExpression',
    function() {
        return false;
    },
]);

// 12.16.3
Runtime_Semantics('Evaluation', [

    'Expression: Expression , AssignmentExpression',
    function() {
        var lref = this.Expression.Evaluation();
        GetValue(lref);
        var rref = this.AssignmentExpression.Evaluation();
        return GetValue(rref);
    },
]);

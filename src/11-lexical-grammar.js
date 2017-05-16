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

// 11 ECMAScript Language: Lexical Grammar

// 11.3 Line Terminators
Syntax([
    'LineTerminatorSequence:: <LF>',
    'LineTerminatorSequence:: <CR>[lookahead≠<LF>]',
    'LineTerminatorSequence:: <LS>',
    'LineTerminatorSequence:: <PS>',
    'LineTerminatorSequence:: <CR><LF>',
]);

// 11.6 Names and Keywords

Syntax([
    'IdentifierName:: IdentifierStart',
    'IdentifierName:: IdentifierName IdentifierPart',
    'IdentifierStart:: UnicodeIDStart',
    'IdentifierStart:: $',
    'IdentifierStart:: _',
    'IdentifierStart:: \\ UnicodeEscapeSequence',
    'IdentifierPart:: UnicodeIDContinue',
    'IdentifierPart:: $',
    'IdentifierPart:: _',
    'IdentifierPart:: \\ UnicodeEscapeSequence',
    'IdentifierPart:: <ZWNJ>',
    'IdentifierPart:: <ZWJ>',
    'UnicodeIDStart:: any_code_point_“ID_Start”',
    'UnicodeIDContinue:: any_code_point_“ID_Continue”',
]);

// 11.6.1 Identifier Names

// 11.6.1.1
Static_Semantics('Early Errors', [

    'IdentifierStart:: \\ UnicodeEscapeSequence',
    function() {
        var c = this.UnicodeEscapeSequence.SV();
        if (c !== "$" && c !== "_" && !isUnicodeIDStart(c)) throw EarlySyntaxError();
    },

    'IdentifierPart:: \\ UnicodeEscapeSequence',
    function() {
        var c = this.UnicodeEscapeSequence.SV();
        if (c !== "$" && c !== "_" && c !== '\u200C' && c !== '\u200D' && !isUnicodeIDContinue(c)) throw EarlySyntaxError();
    },
]);

// 11.6.1.2
Static_Semantics('StringValue', [

    'IdentifierName:: IdentifierStart',
    'IdentifierName:: IdentifierName IdentifierPart',
    function() {
        var sequence = [];
        var name = this;
        while (true) {
            if (name.is('IdentifierName:: IdentifierStart')) {
                var c = name.IdentifierStart;
                if (c.is('IdentifierStart:: UnicodeIDStart')) {
                    sequence.unshift(c.UnicodeIDStart.char);
                } else if (c.is('IdentifierStart:: $')) {
                    sequence.unshift('$');
                } else if (c.is('IdentifierStart:: _')) {
                    sequence.unshift('_');
                } else if (c.is('IdentifierStart:: \\ UnicodeEscapeSequence')) {
                    sequence.unshift(c.UnicodeEscapeSequence.SV());
                } else Assert(false);
                break;
            }
            Assert(name.is('IdentifierName:: IdentifierName IdentifierPart'));
            var c = name.IdentifierPart;
            if (c.is('IdentifierPart:: UnicodeIDContinue')) {
                sequence.unshift(c.UnicodeIDContinue.char);
            } else if (c.is('IdentifierPart:: $')) {
                sequence.unshift('$');
            } else if (c.is('IdentifierPart:: _')) {
                sequence.unshift('_');
            } else if (c.is('IdentifierPart:: \\ UnicodeEscapeSequence')) {} else if (c.is('IdentifierPart:: <ZWNJ>')) {
                sequence.unshift('\u200C');
            } else if (c.is('IdentifierPart:: <ZWJ>')) {
                sequence.unshift('\u200D');
            } else Assert(false);
            name = name.IdentifierName;
        }
        return sequence.join('');
    },
]);

// 11.8 Literals

// 11.8.1 Null Literals

Syntax([
    'NullLiteral:: null',
]);

// 11.8.2 Boolean Literals

Syntax([
    'BooleanLiteral:: true',
    'BooleanLiteral:: false',
]);

// 11.8.3 Numeric Literals

Syntax([
    'NumericLiteral:: DecimalLiteral',
    'NumericLiteral:: BinaryIntegerLiteral',
    'NumericLiteral:: OctalIntegerLiteral',
    'NumericLiteral:: HexIntegerLiteral',
    'DecimalLiteral:: DecimalIntegerLiteral . DecimalDigits[opt] ExponentPart[opt]',
    'DecimalLiteral:: . DecimalDigits ExponentPart[opt]',
    'DecimalLiteral:: DecimalIntegerLiteral ExponentPart[opt]',
    'DecimalIntegerLiteral:: 0',
    'DecimalIntegerLiteral:: NonZeroDigit DecimalDigits[opt]',
    'DecimalDigits:: DecimalDigit',
    'DecimalDigits:: DecimalDigits DecimalDigit',
    'DecimalDigit:: one_of_0123456789',
    'NonZeroDigit:: one_of_123456789',
    'ExponentPart:: ExponentIndicator SignedInteger',
    'ExponentIndicator:: one_of_eE',
    'SignedInteger:: DecimalDigits',
    'SignedInteger:: + DecimalDigits',
    'SignedInteger:: - DecimalDigits',
    'BinaryIntegerLiteral:: 0b BinaryDigits',
    'BinaryIntegerLiteral:: 0B BinaryDigits',
    'BinaryDigits:: BinaryDigit',
    'BinaryDigits:: BinaryDigits BinaryDigit',
    'BinaryDigit:: one_of_01',
    'OctalIntegerLiteral:: 0o OctalDigits',
    'OctalIntegerLiteral:: 0O OctalDigits',
    'OctalDigits:: OctalDigit',
    'OctalDigits:: OctalDigits OctalDigit',
    'OctalDigit:: one_of_01234567',
    'HexIntegerLiteral:: 0x HexDigits',
    'HexIntegerLiteral:: 0X HexDigits',
    'HexDigits:: HexDigit',
    'HexDigits:: HexDigits HexDigit',
    'HexDigit:: one_of_0123456789abcdefABCDEF',
]);

// 11.8.3.1
Static_Semantics('MV', [

    'NumericLiteral:: DecimalLiteral',
    'NumericLiteral:: BinaryIntegerLiteral',
    'NumericLiteral:: OctalIntegerLiteral',
    'NumericLiteral:: HexIntegerLiteral',
    function() {
        // Here we rely on underlying virtual machine.
        return Number(this.raw);
    },

    'HexDigit:: one_of_0123456789abcdefABCDEF',
    function() {
        var c = this.char;
        var i = '0123456789abcdef'.indexOf(c);
        if (i >= 0) return i;
        var i = '0123456789ABCDEF'.indexOf(c);
        if (i >= 0) return i;
        Assert(false);
    },

    'HexDigits:: HexDigit',
    function() {
        return this.HexDigit.MV();
    },

    'HexDigits:: HexDigits HexDigit',
    function() {
        return (this.HexDigits.MV() * 16) + this.HexDigit.MV(); // inaccurate but no problem
    },
]);

// 11.8.4 String Literals

Syntax([
    'StringLiteral:: " DoubleStringCharacters[opt] "',
    "StringLiteral:: ' SingleStringCharacters[opt] '",
    'DoubleStringCharacters:: DoubleStringCharacter DoubleStringCharacters[opt]',
    'SingleStringCharacters:: SingleStringCharacter SingleStringCharacters[opt]',
    'DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_LineTerminator',
    'DoubleStringCharacter:: \\ EscapeSequence',
    'DoubleStringCharacter:: LineContinuation',
    'SingleStringCharacter:: SourceCharacter but_not_one_of_\'_or_\\_or_LineTerminator',
    'SingleStringCharacter:: \\ EscapeSequence',
    'SingleStringCharacter:: LineContinuation',
    'LineContinuation:: \\ LineTerminatorSequence',
    'EscapeSequence:: CharacterEscapeSequence',
    'EscapeSequence:: 0[lookahead∉DecimalDigit]',
    'EscapeSequence:: HexEscapeSequence',
    'EscapeSequence:: UnicodeEscapeSequence',
    'CharacterEscapeSequence:: SingleEscapeCharacter',
    'CharacterEscapeSequence:: NonEscapeCharacter',
    'SingleEscapeCharacter:: one_of_\'"\\bfnrtv',
    'NonEscapeCharacter:: SourceCharacter but_not_one_of_EscapeCharacter_or_LineTerminator',
    'EscapeCharacter:: SingleEscapeCharacter',
    'EscapeCharacter:: DecimalDigit',
    'EscapeCharacter:: x',
    'EscapeCharacter:: u',
    'HexEscapeSequence:: x HexDigit HexDigit',
    'UnicodeEscapeSequence:: u Hex4Digits',
    'UnicodeEscapeSequence:: u { HexDigits }',
    'Hex4Digits:: HexDigit HexDigit HexDigit HexDigit',
]);

// 11.8.4.1
Static_Semantics('Early Errors', [
    'UnicodeEscapeSequence:: u { HexDigits }',
    function() {
        if (this.HexDigits.MV() > 1114111) throw EarlySyntaxError();
    },
]);

// 11.8.4.2
Static_Semantics('StringValue', [

    'StringLiteral:: " DoubleStringCharacters[opt] "',
    "StringLiteral:: ' SingleStringCharacters[opt] '",
    function() {
        return this.SV();
    },
]);

// 11.8.4.3
Static_Semantics('SV', [

    'StringLiteral:: " "',
    function() {
        return '';
    },

    "StringLiteral:: ' '",
    function() {
        return '';
    },

    'StringLiteral:: " DoubleStringCharacters "',
    function() {
        return this.DoubleStringCharacters.SV();
    },

    "StringLiteral:: ' SingleStringCharacters '",
    function() {
        return this.SingleStringCharacters.SV();
    },

    'DoubleStringCharacters:: DoubleStringCharacter',
    function() {
        return this.DoubleStringCharacter.SV();
    },

    'DoubleStringCharacters:: DoubleStringCharacter DoubleStringCharacters',
    function() {
        return this.DoubleStringCharacter.SV() + this.DoubleStringCharacters.SV();
    },

    'SingleStringCharacters:: SingleStringCharacter',
    function() {
        return this.SingleStringCharacter.SV();
    },

    'SingleStringCharacters:: SingleStringCharacter SingleStringCharacters',
    function() {
        return this.SingleStringCharacter.SV() + this.SingleStringCharacters.SV();
    },

    'DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_LineTerminator',
    function() {
        return this.SourceCharacter.char;
    },

    'DoubleStringCharacter:: \\ EscapeSequence',
    function() {
        return this.EscapeSequence.SV();
    },

    'DoubleStringCharacter:: LineContinuation',
    function() {
        return '';
    },

    'SingleStringCharacter:: SourceCharacter but_not_one_of_\'_or_\\_or_LineTerminator',
    function() {
        return this.SourceCharacter.char;
    },

    'SingleStringCharacter:: \\ EscapeSequence',
    function() {
        return this.EscapeSequence.SV();
    },

    'SingleStringCharacter:: LineContinuation',
    function() {
        return '';
    },

    'EscapeSequence:: CharacterEscapeSequence',
    function() {
        return this.CharacterEscapeSequence.SV();
    },

    'EscapeSequence:: 0',
    function() {
        return '\0';
    },

    'EscapeSequence:: HexEscapeSequence',
    function() {
        return this.HexEscapeSequence.SV();
    },

    'EscapeSequence:: UnicodeEscapeSequence',
    function() {
        return this.UnicodeEscapeSequence.SV();
    },

    'CharacterEscapeSequence:: SingleEscapeCharacter',
    function() {
        switch (this.SingleEscapeCharacter.char) {
            case 'b':
                return '\u0008';
            case 't':
                return '\u0009';
            case 'n':
                return '\u000A';
            case 'v':
                return '\u000B';
            case 'f':
                return '\u000C';
            case 'r':
                return '\u000D';
            case '"':
                return '\u0022';
            case "'":
                return '\u0027';
            case '\\':
                return '\u005C';
        }
        Assert(false);
    },

    'CharacterEscapeSequence:: NonEscapeCharacter',
    function() {
        return this.NonEscapeCharacter.SV();
    },

    'NonEscapeCharacter:: SourceCharacter but_not_one_of_EscapeCharacter_or_LineTerminator',
    function() {
        return this.SourceCharacter.char;
    },

    'HexEscapeSequence:: x HexDigit HexDigit',
    function() {
        return String.fromCharCode(16 * this.HexDigit1.MV() + this.HexDigit2.MV());
    },

    'UnicodeEscapeSequence:: u Hex4Digits',
    function() {
        return this.Hex4Digits.SV();
    },

    'Hex4Digits:: HexDigit HexDigit HexDigit HexDigit',
    function() {
        return String.fromCharCode(4096 * this.HexDigit1.MV() + 256 * this.HexDigit2.MV() + 16 * this.HexDigit3.MV() + this.HexDigit4.MV());
    },

    'UnicodeEscapeSequence:: u { HexDigits }',
    function() {
        return UTF16Encoding(this.HexDigits.MV());
    },
]);

// 11.8.5 Regular Expression Literals

Syntax([
    'RegularExpressionLiteral:: / RegularExpressionBody / RegularExpressionFlags',
    'RegularExpressionBody:: RegularExpressionFirstChar RegularExpressionChars',
    'RegularExpressionChars:: [empty]',
    'RegularExpressionChars:: RegularExpressionChars RegularExpressionChar',
    'RegularExpressionFirstChar:: RegularExpressionNonTerminator but_not_one_of_*_or_\\_or_/_or_[',
    'RegularExpressionFirstChar:: RegularExpressionBackslashSequence',
    'RegularExpressionFirstChar:: RegularExpressionClass',
    'RegularExpressionChar:: RegularExpressionNonTerminator but_not_one_of_\\_or_/_or_[',
    'RegularExpressionChar:: RegularExpressionBackslashSequence',
    'RegularExpressionChar:: RegularExpressionClass',
    'RegularExpressionBackslashSequence:: \\ RegularExpressionNonTerminator',
    'RegularExpressionNonTerminator:: SourceCharacter but_not_LineTerminator',
    'RegularExpressionClass:: [ RegularExpressionClassChars ]',
    'RegularExpressionClassChars:: [empty]',
    'RegularExpressionClassChars:: RegularExpressionClassChars RegularExpressionClassChar',
    'RegularExpressionClassChar:: RegularExpressionNonTerminator but_not_one_of_]_or_\\',
    'RegularExpressionClassChar:: RegularExpressionBackslashSequence',
    'RegularExpressionFlags:: [empty]',
    'RegularExpressionFlags:: RegularExpressionFlags IdentifierPart',
]);

// 11.8.5.1
Static_Semantics('Early Errors', [

    'RegularExpressionFlags:: RegularExpressionFlags IdentifierPart',
    function() {
        if (this.IdentifierPart.Contains('UnicodeEscapeSequence')) throw EarlySyntaxError();
    },
]);

// 11.8.5.2
Static_Semantics('BodyText', [

    'RegularExpressionLiteral:: / RegularExpressionBody / RegularExpressionFlags',
    function() {
        //TODO Return the source text that was recognized as RegularExpressionBody.
    },
]);

// 11.8.5.3
Static_Semantics('FlagText', [

    'RegularExpressionLiteral:: / RegularExpressionBody / RegularExpressionFlags',
    function() {
        //TODO Return the source text that was recognized as RegularExpressionFlags.
    },
]);

// 11.8.6 Template Literal Lexical Components

Syntax([
    'Template:: NoSubstitutionTemplate',
    'Template:: TemplateHead',
    'NoSubstitutionTemplate:: ` TemplateCharacters[opt] `',
    'TemplateHead:: ` TemplateCharacters[opt] ${',
    'TemplateSubstitutionTail:: TemplateMiddle',
    'TemplateSubstitutionTail:: TemplateTail',
    'TemplateMiddle:: } TemplateCharacters[opt] ${',
    'TemplateTail:: } TemplateCharacters[opt] `',
    'TemplateCharacters:: TemplateCharacter TemplateCharacters[opt]',
    'TemplateCharacter:: $[lookahead≠{]',
    'TemplateCharacter:: \\ EscapeSequence',
    'TemplateCharacter:: LineContinuation',
    'TemplateCharacter:: LineTerminatorSequence',
    'TemplateCharacter:: SourceCharacter but_not_one_of_`_or_\\_or_$_or_LineTerminator',
]);

// 11.8.6.1
Static_Semantics('TV', [
    //TODO
]);

Static_Semantics('TRV', [
    //TODO
]);

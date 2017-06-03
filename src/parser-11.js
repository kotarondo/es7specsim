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

// 11.2 White Space

function isWhiteSpace(c) {
    switch (c) {
        case '\u0009':
        case '\u000B':
        case '\u000C':
        case '\u0020':
        case '\u00A0':
        case '\uFEFF':
            return true;
    }
    return isUnicodeZs(c);
}

// 11.3 Line Terminators
/*
    'LineTerminatorSequence:: <LF>',
    'LineTerminatorSequence:: <CR>',
    'LineTerminatorSequence:: <LS>',
    'LineTerminatorSequence:: <PS>',
    'LineTerminatorSequence:: <CR><LF>',
*/

function parseLineTerminatorSequence() {
    switch (peekChar()) {
        case '\u000A':
            consumeChar('\u000A');
            return Production['LineTerminatorSequence:: <LF>']();
        case '\u000D':
            consumeChar('\u000D');
            if (peekChar() !== '\u000A') {
                return Production['LineTerminatorSequence:: <CR>']();
            } else {
                return Production['LineTerminatorSequence:: <CR><LF>']();
            }
        case '\u2028':
            consumeChar('\u2028');
            return Production['LineTerminatorSequence:: <LS>']();
        case '\u2029':
            consumeChar('\u2029');
            return Production['LineTerminatorSequence:: <PS>']();
    }
    throw EarlySyntaxError();
}

function isLineTerminator(c) {
    switch (c) {
        case '\u000A':
        case '\u000D':
        case '\u2028':
        case '\u2029':
            return true;
    }
    return false;
}

// 11.4 Comments

function skipMultiLineComment() {
    consumeChar('/');
    consumeChar('*');
    while (true) {
        var c = peekChar();
        if (c === '') throw EarlySyntaxError();
        if (c === '*' && peekChar(1) === '/') {
            consumeChar('*');
            consumeChar('/');
            break;
        }
        if (isLineTerminator(c)) {
            var isLineSeparated = true;
        }
        consumeChar(c);
    }
    return isLineSeparated;
}

function skipSingleLineComment() {
    consumeChar('/');
    consumeChar('/');
    while (true) {
        var c = peekChar();
        if (c === '' || isLineTerminator(c)) {
            break;
        }
        consumeChar(c);
    }
}

function skipSeparators() {
    while (true) {
        var c = peekChar();
        if (c === '') {
            var isLineSeparated = true;
            break;
        }
        if (isWhiteSpace(c)) {
            consumeChar(c);
            continue;
        }
        if (isLineTerminator(c)) {
            var isLineSeparated = true;
            consumeChar(c);
            continue;
        }
        if (c === '/' && peekChar(1) === '*') {
            if (skipMultiLineComment()) {
                var isLineSeparated = true;
            }
            continue;
        }
        if (c === '/' && peekChar(1) === '/') {
            skipSingleLineComment();
            continue;
        }
        break;
    }
    return isLineSeparated;
}

// 11.5 Tokens

function peekToken(ahead) {
    Assert(ahead === undefined || ahead >= 0);
    try {
        var pos = parsingPosition;
        skipSeparators();
        var start = parsingPosition;
        if (skipIfIdentifierName() || skipIfPunctuator()) {
            if (ahead) return peekToken(ahead - 1);
            var end = parsingPosition;
            return sourceText.substring(start, end);
        }
        Assert(!ahead);
        switch (peekChar()) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '.':
                return '0';
            case '"':
            case "'":
                return '"';
            case '`':
                return '`';
            case '}':
                return '}';
            case '/':
                if (peekChar(1) === '=') {
                    return '/=';
                }
                return '/';
            case '':
                return '';
        }
    } finally {
        parsingPosition = pos;
    }
    throw EarlySyntaxError();
}

function peekTokenIsLineSeparated() {
    try {
        var pos = parsingPosition;
        return skipSeparators();
    } finally {
        parsingPosition = pos;
    }
}

function peekTokenIsIdentifierName(ahead) {
    try {
        var pos = parsingPosition;
        skipSeparators();
        return skipIfIdentifierStart();
    } finally {
        parsingPosition = pos;
    }
}

function consumeToken(expected) {
    skipSeparators();
    var start = parsingPosition;
    var end = start + expected.length;
    if (expected !== sourceText.substring(start, end)) {
        throw EarlySyntaxError();
    }
    parsingPosition = end;
}

// 11.6.1 Identifier Names
/*
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
*/

function parseIdentifierName() {
    skipSeparators();
    var nt = parseIdentifierStart();
    var name = Production['IdentifierName:: IdentifierStart'](nt);
    while (true) {
        var nt = parseIdentifierPart_opt();
        if (!nt) {
            return name;
        }
        var name = Production['IdentifierName:: IdentifierName IdentifierPart'](name, nt);
    }
}

function parseIdentifierStart() {
    var c = peekChar();
    switch (c) {
        case '$':
            consumeChar(c);
            return Production['IdentifierStart:: $']();
        case '_':
            consumeChar(c);
            return Production['IdentifierStart:: _']();
        case '\\':
            consumeChar(c);
            var nt = parseUnicodeEscapeSequence();
            return Production['IdentifierStart:: \\ UnicodeEscapeSequence'](nt);

    }
    var nt = parseUnicodeIDStart();
    return Production['IdentifierStart:: UnicodeIDStart'](nt);
}

function parseIdentifierPart_opt() {
    var c = peekChar();
    switch (c) {
        case '$':
            consumeChar(c);
            return Production['IdentifierPart:: $']();
        case '_':
            consumeChar(c);
            return Production['IdentifierPart:: _']();
        case '\\':
            consumeChar(c);
            var nt = parseUnicodeEscapeSequence();
            return Production['IdentifierPart:: \\ UnicodeEscapeSequence'](nt);
        case '\u200C':
            consumeChar(c);
            return Production['IdentifierPart:: <ZWNJ>']();
        case '\u200D':
            consumeChar(c);
            return Production['IdentifierPart:: <ZWJ>']();



    }
    if (isUnicodeIDContinue(c)) {
        var nt = parseUnicodeIDContinue();
        return Production['IdentifierPart:: UnicodeIDContinue'](nt);
    }
    return null;
}

function parseUnicodeIDStart() {
    var c = peekChar();
    if (!isUnicodeIDStart(c)) throw EarlySyntaxError();
    consumeChar(c);
    var nt = Production['UnicodeIDStart:: any_code_point_“ID_Start”']();
    nt.char = c;
    return nt;

}

function parseUnicodeIDContinue() {
    var c = peekChar();
    if (!isUnicodeIDContinue(c)) throw EarlySyntaxError();
    consumeChar(c);
    var nt = Production['UnicodeIDContinue:: any_code_point_“ID_Continue”']();
    nt.char = c;
    return nt;
}

function skipIfIdentifierName() {
    if (skipIfIdentifierStart()) {
        while (skipIfIdentifierPart());
        return true;
    }
    return false;
}

function skipIfIdentifierStart() {
    var c = peekChar();
    if (isUnicodeIDStart(c)) {
        consumeChar(c);
        return true;
    }
    switch (c) {
        case '$':
        case '_':
            consumeChar(c);
            return true;
        case '\\':
            consumeChar(c);
            skipUnicodeEscapeSequence();
            return true;
    }
    return false;
}

function skipIfIdentifierPart() {
    var c = peekChar();
    if (isUnicodeIDContinue(c)) {
        consumeChar(c);
        return true;
    }
    switch (c) {
        case '$':
        case '_':
        case '\u200C':
        case '\u200D':
            consumeChar(c);
            return true;
        case '\\':
            consumeChar(c);
            skipUnicodeEscapeSequence();
            return true;
    }
    return false;
}

// 11.6.2 Reserved Words

function isReservedWord(token) {
    switch (token) {
        case 'break':
        case 'case':
        case 'catch':
        case 'class':
        case 'const':
        case 'continue':
        case 'debugger':
        case 'default':
        case 'delete':
        case 'do':
        case 'else':
        case 'export':
        case 'extends':
        case 'finally':
        case 'for':
        case 'function':
        case 'if':
        case 'import':
        case 'in':
        case 'instanceof':
        case 'new':
        case 'return':
        case 'super':
        case 'switch':
        case 'this':
        case 'throw':
        case 'try':
        case 'typeof':
        case 'var':
        case 'void':
        case 'while':
        case 'with':
        case 'yield':
        case 'enum':
        case 'null':
        case 'true':
        case 'false':
            return true;
        case 'await':
            if (isInModule) return true;
            break;
    }
    return false;
}

// 11.7 Punctuators

function skipIfPunctuator() {
    var c = peekChar();
    switch (c) {
        case '{':
        case '(':
        case ')':
        case '[':
        case ']':
        case ';':
        case ',':
        case '~':
        case '?':
        case ':':
            consumeChar(c);
            return true;
        case '.':
            if (isDecimalDigit(peekChar(1))) {
                return false;
            }
            consumeChar(c);
            if (peekChar() === '.' && peekChar(1) === '.') {
                consumeChar('.');
                consumeChar('.');
            }
            return true;
        case '<':
            consumeChar(c);
            peekChar() === '<' && consumeChar('<');
            peekChar() === '=' && consumeChar('=');
            return true;
        case '>':
            consumeChar(c);
            peekChar() === '>' && consumeChar('>');
            peekChar() === '>' && consumeChar('>');
            peekChar() === '=' && consumeChar('=');
            return true;
        case '=':
            consumeChar(c);
            if (peekChar() === '>') {
                consumeChar('>');
                return true;
            }
            peekChar() === '=' && consumeChar('=');
            peekChar() === '=' && consumeChar('=');
            return true;
        case '!':
            consumeChar(c);
            peekChar() === '=' && consumeChar('=');
            peekChar() === '=' && consumeChar('=');
            return true;
        case '+':
        case '-':
        case '&':
        case '|':
            consumeChar(c);
            if (peekChar() === c) {
                consumeChar(c);
                return true;
            }
            peekChar() === '=' && consumeChar('=');
            return true;
        case '*':
            consumeChar(c);
            peekChar() === '*' && consumeChar('*');
            peekChar() === '=' && consumeChar('=');
            return true;
        case '%':
        case '^':
            consumeChar(c);
            peekChar() === '=' && consumeChar('=');
            return true;
    }
    return false;
}

// 11.8.3 Numeric Literals
/*
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
*/

function parseNumericLiteral() {
    skipSeparators();
    var start = parsingPosition;
    var nt = parseNumeric();
    var end = parsingPosition;
    nt.raw = sourceText.substring(start, end);
    var c = peekChar();
    // The SourceCharacter immediately following a NumericLiteral must not be an IdentifierStart or DecimalDigit.
    if (isUnicodeIDStart(c) || c === '$' || c === '_' || c === '\\' || isDecimalDigit(c)) throw EarlySyntaxError();
    return nt;
}

function parseNumeric() {
    if (peekChar() === '0') {
        switch (peekChar(1)) {
            case 'b':
            case 'B':
                var nt = parseBinaryIntegerLiteral();
                return Production['NumericLiteral:: BinaryIntegerLiteral'](nt);
            case 'o':
            case 'O':
                var nt = parseOctalIntegerLiteral();
                return Production['NumericLiteral:: OctalIntegerLiteral'](nt);
            case 'x':
            case 'X':
                var nt = parseHexIntegerLiteral();
                return Production['NumericLiteral:: HexIntegerLiteral'](nt);
        }
        if (isDecimalDigit(peekChar(1))) throw EarlySyntaxError();
    }
    var nt = parseDecimalLiteral();
    return Production['NumericLiteral:: DecimalLiteral'](nt);
}

function parseDecimalLiteral() {
    if (peekChar() === '.') {
        consumeChar('.');
        var dgts = parseDecimalDigits();
        var ep = parseExponentPart_opt();
        return Production['DecimalLiteral:: . DecimalDigits ExponentPart[opt]'](dgts, ep);
    }
    var dil = parseDecimalIntegerLiteral();
    if (peekChar() === '.') {
        consumeChar('.');
        var dgts = parseDecimalDigits_opt();
        var ep = parseExponentPart_opt();
        return Production['DecimalLiteral:: DecimalIntegerLiteral . DecimalDigits[opt] ExponentPart[opt]'](dil, dgts, ep);
    }
    var ep = parseExponentPart_opt();
    return Production['DecimalLiteral:: DecimalIntegerLiteral ExponentPart[opt]'](dil, ep);
}

function parseDecimalIntegerLiteral() {
    if (peekChar() === '0') {
        consumeChar('0');
        return Production['DecimalIntegerLiteral:: 0']();
    }
    var d = parseNonZeroDigit();
    var dgts = parseDecimalDigits_opt();
    return Production['DecimalIntegerLiteral:: NonZeroDigit DecimalDigits[opt]'](d, dgts);
}

function parseDecimalDigits_opt() {
    var nt = parseDecimalDigit_opt();
    if (!nt) return null;
    var dgts = Production['DecimalDigits:: DecimalDigit'](nt);
    while (true) {
        var nt = parseDecimalDigit_opt();
        if (!nt) return dgts;
        var dgts = Production['DecimalDigits:: DecimalDigits DecimalDigit'](dgts, nt);
    }
}

function parseDecimalDigits() {
    var nt = parseDecimalDigits_opt();
    if (!nt) throw EarlySyntaxError();
    return nt;
}

function parseDecimalDigit_opt() {
    var c = peekChar();
    if (!isDecimalDigit(c)) return null;
    consumeChar(c);
    var nt = Production['DecimalDigit:: one_of_0123456789']();
    nt.char = c;
    return nt;
}

function isDecimalDigit(c) {
    return ('0123456789'.indexOf(c) >= 0 && c !== '');
}

function parseNonZeroDigit() {
    var c = peekChar();
    if (!isDecimalDigit(c) || c === '0') throw EarlySyntaxError();
    consumeChar(c);
    var nt = Production['NonZeroDigit:: one_of_123456789']();
    nt.char = c;
    return nt;
}

function parseExponentPart_opt() {
    var c = peekChar();
    if (c !== 'e' || c !== 'E') return null;
    consumeChar(c);
    var ei = Production['ExponentIndicator:: one_of_eE']();
    var nt = parseSignedInteger();
    return Production['ExponentPart:: ExponentIndicator SignedInteger'](ei, nt);
}

function parseSignedInteger() {
    if (peekChar() === '+') {
        consumeChar('+');
        var nt = parseDecimalDigits();
        return Production['SignedInteger:: + DecimalDigits'](nt);
    }
    if (peekChar() === '-') {
        consumeChar('-');
        var nt = parseDecimalDigits();
        return Production['SignedInteger:: - DecimalDigits'](nt);
    }
    var nt = parseDecimalDigits();
    return Production['SignedInteger:: DecimalDigits'](nt);
}

function parseBinaryIntegerLiteral() {
    consumeChar('0');
    if (peekChar() === 'b') {
        consumeChar('b');
        var nt = parseBinaryDigits();
        return Production['BinaryIntegerLiteral:: 0b BinaryDigits'](nt);
    }
    if (peekChar() === 'B') {
        consumeChar('B');
        var nt = parseBinaryDigits();
        return Production['BinaryIntegerLiteral:: 0B BinaryDigits'](nt);
    }
    throw EarlySyntaxError();
}

function parseBinaryDigits() {
    var nt = parseBinaryDigit_opt();
    if (!nt) throw EarlySyntaxError();
    var dgts = Production['BinaryDigits:: BinaryDigit'](nt);
    while (true) {
        var nt = parseBinaryDigit_opt();
        if (!nt) return dgts;
        var dgts = Production['BinaryDigits:: BinaryDigits BinaryDigit'](dgts, nt);
    }
}

function parseBinaryDigit_opt() {
    var c = peekChar();
    if ('01'.indexOf(c) < 0 || c === '') return null;
    consumeChar(c);
    var nt = Production['BinaryDigit:: one_of_01']();
    nt.char = c;
    return nt;
}

function parseOctalIntegerLiteral() {
    consumeChar('0');
    if (peekChar() === 'o') {
        consumeChar('o');
        var nt = parseOctalDigits();
        return Production['OctalIntegerLiteral:: 0o OctalDigits'](nt);
    }
    if (peekChar() === 'O') {
        consumeChar('O');
        var nt = parseOctalDigits();
        return Production['OctalIntegerLiteral:: 0O OctalDigits'](nt);
    }
    throw EarlySyntaxError();
}

function parseOctalDigits() {
    var nt = parseOctalDigit_opt();
    if (!nt) throw EarlySyntaxError();
    var dgts = Production['OctalDigits:: OctalDigit'](nt);
    while (true) {
        var nt = parseOctalDigit_opt();
        if (!nt) return dgts;
        var dgts = Production['OctalDigits:: OctalDigits OctalDigit'](dgts, nt);
    }
}

function parseOctalDigit_opt() {
    var c = peekChar();
    if ('01234567'.indexOf(c) < 0 || c === '') return null;
    consumeChar(c);
    var nt = Production['OctalDigit:: one_of_01234567']();
    nt.char = c;
    return nt;
}

function parseHexIntegerLiteral() {
    consumeChar('0');
    if (peekChar() === 'x') {
        consumeChar('x');
        var nt = parseHexDigits();
        return Production['HexIntegerLiteral:: 0x HexDigits'](nt);
    }
    if (peekChar() === 'X') {
        consumeChar('X');
        var nt = parseHexDigits();
        return Production['HexIntegerLiteral:: 0X HexDigits'](nt);
    }
    throw EarlySyntaxError();
}

function parseHexDigits() {
    var nt = parseHexDigit_opt();
    if (!nt) throw EarlySyntaxError();
    var dgts = Production['HexDigits:: HexDigit'](nt);
    while (true) {
        var nt = parseHexDigit_opt();
        if (!nt) return dgts;
        var dgts = Production['HexDigits:: HexDigits HexDigit'](dgts, nt);
    }
}

function parseHexDigit() {
    var nt = parseHexDigit_opt();
    if (!nt) throw EarlySyntaxError();
    return nt;
}

function parseHexDigit_opt() {
    var c = peekChar();
    if (!is_hexdigit_char(c)) return null;
    consumeChar(c);
    var nt = Production['HexDigit:: one_of_0123456789abcdefABCDEF']();
    nt.char = c;
    return nt;
}

function skipIfHexDigit() {
    var c = peekChar();
    if (!is_hexdigit_char(c)) return false;
    consumeChar(c);
    return true;
}

// 11.8.4 String Literals
/*
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
    'EscapeSequence:: 0',
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
*/

function parseStringLiteral() {
    skipSeparators();
    if (peekChar() === '"') {
        consumeChar('"');
        var nt = parseDoubleStringCharacters_opt();
        consumeChar('"');
        return Production['StringLiteral:: " DoubleStringCharacters[opt] "'](nt);
    }
    consumeChar("'");
    var nt = parseSingleStringCharacters_opt();
    consumeChar("'");
    return Production["StringLiteral:: ' SingleStringCharacters[opt] '"](nt);
}

function parseDoubleStringCharacters_opt() {
    var stack = [];
    while (true) {
        var c = peekChar();
        if (c === '"' || isLineTerminator(c)) break;
        var nt = parseDoubleStringCharacter();
        stack.push(nt);
    }
    var str = null;
    while (stack.length > 0) {
        var nt = stack.pop();
        var str = Production['DoubleStringCharacters:: DoubleStringCharacter DoubleStringCharacters[opt]'](nt, str);
    }
    return str;
}

function parseSingleStringCharacters_opt() {
    var stack = [];
    while (true) {
        var c = peekChar();
        if (c === "'" || isLineTerminator(c)) break;
        var nt = parseSingleStringCharacter();
        stack.push(nt);
    }
    var str = null;
    while (stack.length > 0) {
        var nt = stack.pop();
        var str = Production['SingleStringCharacters:: SingleStringCharacter SingleStringCharacters[opt]'](nt, str);
    }
    return str;
}

function parseDoubleStringCharacter() {
    if (peekChar() === '\\') {
        if (isLineTerminator(peekChar(1))) {
            var nt = parseLineContinuation();
            return Production['DoubleStringCharacter:: LineContinuation'](nt);
        }
        consumeChar('\\');
        var nt = parseEscapeSequence();
        return Production['DoubleStringCharacter:: \\ EscapeSequence'](nt);
    }
    var nt = parseSourceCharacter();
    return Production['DoubleStringCharacter:: SourceCharacter but_not_one_of_"_or_\\_or_LineTerminator'](nt);
}

function parseSingleStringCharacter() {
    if (peekChar() === '\\') {
        if (isLineTerminator(peekChar(1))) {
            var nt = parseLineContinuation();
            return Production['SingleStringCharacter:: LineContinuation'](nt);
        }
        consumeChar('\\');
        var nt = parseEscapeSequence();
        return Production['SingleStringCharacter:: \\ EscapeSequence'](nt);
    }
    var nt = parseSourceCharacter();
    return Production['SingleStringCharacter:: SourceCharacter but_not_one_of_\'_or_\\_or_LineTerminator'](nt);
}

function parseLineContinuation() {
    consumeChar('\\');
    var nt = parseLineTerminatorSequence();
    return Production['LineContinuation:: \\ LineTerminatorSequence'](nt);
}

function parseEscapeSequence() {
    switch (peekChar()) {
        case '0':
            if (!isDecimalDigit(peekChar(1))) {
                return Production['EscapeSequence:: 0']();
            }
            throw EarlySyntaxError();
        case 'x':
            var nt = parseHexEscapeSequence();
            return Production['EscapeSequence:: HexEscapeSequence'](nt);
        case 'u':
            var nt = parseUnicodeEscapeSequence();
            return Production['EscapeSequence:: UnicodeEscapeSequence'](nt);
    }
    var nt = parseCharacterEscapeSequence();
    return Production['EscapeSequence:: CharacterEscapeSequence'](nt);
}

function parseCharacterEscapeSequence() {
    var c = peekChar();
    switch (c) {
        case "'":
        case '"':
        case '\\':
        case 'b':
        case 'f':
        case 'n':
        case 'r':
        case 't':
        case 'v':
            var nt = Production['SingleEscapeCharacter:: one_of_\'"\\bfnrtv']();
            nt.char = c;
            return Production['CharacterEscapeSequence:: SingleEscapeCharacter'](nt);
    }
    if (isDecimalDigit(c)) throw EarlySyntaxError();
    var nt = Production['NonEscapeCharacter:: SourceCharacter but_not_one_of_EscapeCharacter_or_LineTerminator']();
    nt.char = c;
    return Production['CharacterEscapeSequence:: NonEscapeCharacter'](nt);
}

function parseHexEscapeSequence() {
    consumeChar('x');
    var d1 = parseHexDigit();
    var d2 = parseHexDigit();
    return Production['HexEscapeSequence:: x HexDigit HexDigit'](d1, d2);
}

function parseUnicodeEscapeSequence() {
    consumeChar('u');
    if (peekChar() === '{') {
        consumeChar('{');
        var nt = parseHexDigits();
        consumeChar('}');
        return Production['UnicodeEscapeSequence:: u { HexDigits }'](nt);
    }
    var nt = parseHex4Digits();
    return Production['UnicodeEscapeSequence:: u Hex4Digits'](nt);
}

function parseHex4Digits() {
    var d1 = parseHexDigit();
    var d2 = parseHexDigit();
    var d3 = parseHexDigit();
    var d4 = parseHexDigit();
    return Production['Hex4Digits:: HexDigit HexDigit HexDigit HexDigit'](d1, d2, d3, d4);
}

function skipUnicodeEscapeSequence() {
    consumeChar('u');
    if (peekChar() === '{') {
        consumeChar('{');
        if (!skipIfHexDigit()) throw EarlySyntaxError();
        while (skipIfHexDigit());
        consumeChar('}');
        return;
    }
    if (!(skipIfHexDigit() && skipIfHexDigit() && skipIfHexDigit() && skipIfHexDigit())) throw EarlySyntaxError();
}

// 11.8.5 Regular Expression Literals
/*
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
*/

function parseRegularExpressionLiteral() {
    skipSeparators();
    consumeChar('/');
    var start = parsingPosition;
    var body = parseRegularExpressionBody();
    var end = parsingPosition;
    // moved from 11.8.5.2
    body.text = sourceText.substring(start, end);
    consumeChar('/');
    var start = parsingPosition;
    var flags = parseRegularExpressionFlags();
    var end = parsingPosition;
    // moved from 11.8.5.3
    flags.text = sourceText.substring(start, end);
    var nt = Production['RegularExpressionLiteral:: / RegularExpressionBody / RegularExpressionFlags'](body, flags);
    return nt;
}

function parseRegularExpressionBody() {
    var c = parseRegularExpressionFirstChar();
    var nt = parseRegularExpressionChars();
    return Production['RegularExpressionBody:: RegularExpressionFirstChar RegularExpressionChars'](c, nt);
}

function parseRegularExpressionChars() {
    var nt = Production['RegularExpressionChars:: [empty]']();
    while (peekChar() !== '/') {
        var c = parseRegularExpressionChar();
        var nt = Production['RegularExpressionChars:: RegularExpressionChars RegularExpressionChar'](nt, c);
    }
    return nt;
}

function parseRegularExpressionFirstChar() {
    switch (peekChar()) {
        case '\\':
            var nt = parseRegularExpressionBackslashSequence();
            return Production['RegularExpressionFirstChar:: RegularExpressionBackslashSequence'](nt);
        case '[':
            var nt = parseRegularExpressionClass();
            return Production['RegularExpressionFirstChar:: RegularExpressionClass'](nt);
        case '*':
        case '/':
            throw EarlySyntaxError();
    }
    var nt = parseRegularExpressionNonTerminator();
    return Production['RegularExpressionFirstChar:: RegularExpressionNonTerminator but_not_one_of_*_or_\\_or_/_or_['](nt);
}

function parseRegularExpressionChar() {
    switch (peekChar()) {
        case '\\':
            var nt = parseRegularExpressionBackslashSequence();
            return Production['RegularExpressionChar:: RegularExpressionBackslashSequence'](nt);
        case '[':
            var nt = parseRegularExpressionClass();
            return Production['RegularExpressionChar:: RegularExpressionClass'](nt);
        case '/':
            throw EarlySyntaxError();
    }
    var nt = parseRegularExpressionNonTerminator();
    return Production['RegularExpressionChar:: RegularExpressionNonTerminator but_not_one_of_\\_or_/_or_['](nt);
}

function parseRegularExpressionBackslashSequence() {
    consumeChar('\\');
    var nt = parseRegularExpressionNonTerminator();
    return Production['RegularExpressionBackslashSequence:: \\ RegularExpressionNonTerminator'](nt);
}

function parseRegularExpressionNonTerminator() {
    if (isLineTerminator(peekChar())) throw EarlySyntaxError();
    var nt = parseSourceCharacter();
    return Production['RegularExpressionNonTerminator:: SourceCharacter but_not_LineTerminator'](nt);
}

function parseRegularExpressionClass() {
    consumeChar('[');
    var nt = parseRegularExpressionClassChars();
    consumeChar(']');
    return Production['RegularExpressionClass:: [ RegularExpressionClassChars ]'](nt);
}

function parseRegularExpressionClassChars() {
    var nt = Production['RegularExpressionClassChars:: [empty]']();
    while (peekChar() !== ']') {
        var c = parseRegularExpressionClassChar();
        var nt = Production['RegularExpressionClassChars:: RegularExpressionClassChars RegularExpressionClassChar'](nt, c);
    }
    return nt;
}

function parseRegularExpressionClassChar() {
    switch (peekChar()) {
        case '\\':
            var nt = parseRegularExpressionBackslashSequence();
            return Production['RegularExpressionClassChar:: RegularExpressionBackslashSequence'](nt);
        case ']':
            throw EarlySyntaxError();
    }
    var nt = parseRegularExpressionNonTerminator();
    return Production['RegularExpressionClassChar:: RegularExpressionNonTerminator but_not_one_of_]_or_\\'](nt);
}

function parseRegularExpressionFlags() {
    var nt = Production['RegularExpressionFlags:: [empty]']();
    while (true) {
        var c = parseIdentifierPart_opt();
        if (!c) break;
        var nt = Production['RegularExpressionFlags:: RegularExpressionFlags IdentifierPart'](nt, c);
    }
    return nt;
}

// 11.8.6 Template Literal Lexical Components
/*
    'Template:: NoSubstitutionTemplate',
    'Template:: TemplateHead',
    'NoSubstitutionTemplate:: ` TemplateCharacters[opt] `',
    'TemplateHead:: ` TemplateCharacters[opt] ${',
    'TemplateSubstitutionTail:: TemplateMiddle',
    'TemplateSubstitutionTail:: TemplateTail',
    'TemplateMiddle:: } TemplateCharacters[opt] ${',
    'TemplateTail:: } TemplateCharacters[opt] `',
    'TemplateCharacters:: TemplateCharacter TemplateCharacters[opt]',
    'TemplateCharacter:: $',
    'TemplateCharacter:: \\ EscapeSequence',
    'TemplateCharacter:: LineContinuation',
    'TemplateCharacter:: LineTerminatorSequence',
    'TemplateCharacter:: SourceCharacter but_not_one_of_`_or_\\_or_$_or_LineTerminator',
*/

function parseTemplate() {
    skipSeparators();
    consumeChar('`');
    var nt = parseTemplateCharacters_opt();
    if (peekChar() === '`') {
        consumeChar('`');
        var nt = Production['NoSubstitutionTemplate:: ` TemplateCharacters[opt] `'](nt);
        return Production['Template:: NoSubstitutionTemplate'](nt);
    }
    consumeChar('$');
    consumeChar('{');
    var nt = Production['TemplateHead:: ` TemplateCharacters[opt] ${'](nt);
    return Production['Template:: TemplateHead'](nt);
}

function parseTemplateSubstitutionTail() {
    skipSeparators();
    consumeChar('}');
    var nt = parseTemplateCharacters_opt();
    if (peekChar() === '`') {
        consumeChar('`');
        var nt = Production['TemplateTail:: } TemplateCharacters[opt] `'](nt);
        return Production['TemplateSubstitutionTail:: TemplateTail'](nt);
    }
    consumeChar('$');
    consumeChar('{');
    var nt = Production['TemplateMiddle:: } TemplateCharacters[opt] ${'](nt);
    return Production['TemplateSubstitutionTail:: TemplateMiddle'](nt);
}

function parseTemplateCharacters_opt() {
    var stack = [];
    while (true) {
        var c = peekChar();
        if (c === '`' || (c === '$' && peekChar(1) === '{')) break;
        var nt = parseTemplateCharacter();
        stack.push(nt);
    }
    var str = null;
    while (stack.length > 0) {
        var nt = stack.pop();
        var str = Production['TemplateCharacters:: TemplateCharacter TemplateCharacters[opt]'](nt, str);
    }
    return str;
}

function parseTemplateCharacter() {
    if (peekChar() === '$') {
        consumeChar('$');
        if (peekChar() === '{') throw EarlySyntaxError();
        return Production['TemplateCharacter:: $']();
    }
    if (peekChar() === '\\') {
        if (isLineTerminator(peekChar(1))) {
            var nt = parseLineContinuation();
            return Production['TemplateCharacter:: LineContinuation'](nt);
        }
        consumeChar('\\');
        var nt = parseEscapeSequence();
        return Production['TemplateCharacter:: \\ EscapeSequence'](nt);
    }
    if (isLineTerminator(peekChar())) {
        var nt = parseLineTerminatorSequence();
        return Production['TemplateCharacter:: LineTerminatorSequence'](nt);
    }
    if (peekChar() === '`') throw EarlySyntaxError();
    var nt = parseSourceCharacter();
    return Production['TemplateCharacter:: SourceCharacter but_not_one_of_`_or_\\_or_$_or_LineTerminator'](nt);
}

// 11.9.1 Rules of Automatic Semicolon Insertion

function insertAutoSemicolon() {
    if (peekToken() === ';') {
        consumeToken(';');
        return;
    }
    if (!isAutoSemicolonCapable()) {
        throw EarlySyntaxError();
    }
}

function isAutoSemicolonCapable() {
    if (peekToken() === ';' || peekToken() === '}') return true;
    return peekTokenIsLineSeparated();
}

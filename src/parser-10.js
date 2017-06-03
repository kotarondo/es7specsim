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

// 10.1 Source Text

var sourceText;
var parsingPosition;

function setParsingText(text) {
    sourceText = text;
    parsingPosition = 0;
}

function peekChar(ahead) {
    if (!ahead) ahead = 0;
    var i = parsingPosition;
    for (;; ahead--) {
        Assert(ahead >= 0);
        var c = sourceText[i];
        if (c === undefined) {
            return '';
        }
        var lead = code_unit_value(c);
        if (0xD800 <= lead && lead <= 0xDBFF) {
            var trail = code_unit_value(sourceText[i + 1]);
            if (0xDC00 <= trail && trail <= 0xDFFF) {
                if (ahead === 0) {
                    return String.fromCharCode(lead, trail);
                }
                i += 2;
                continue;
            }
        }
        if (ahead === 0) {
            return c;
        }
        i++;
    }
}

function consumeChar(expected) {
    var l = expected.length;
    if (expected !== sourceText.substring(parsingPosition, parsingPosition + l)) {
        throw EarlySyntaxError();
    }
    parsingPosition += l;
}

function parseSourceCharacter() {
    var c = peekChar();
    if (c === '') throw EarlySyntaxError();
    consumeChar(c);
    var nt = Production['SourceCharacter:: any_Unicode_code_point']();
    nt.char = c;
    return nt;
}

// 10.2 Types of Source Code

var isInModule;

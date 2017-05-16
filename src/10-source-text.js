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

// 10 ECMAScript Language: Source Code

// 10.1 Source Text

Syntax([
    'SourceCharacter:: any_Unicode_code_point',
]);

// 10.1.1
function UTF16Encoding(cp) {
    Assert(0 <= cp && cp <= 0x10FFFF);
    if (cp <= 65535) return cp;
    var cu1 = Math.floor((cp - 65536) / 1024) + 0xD800;
    var cu2 = modulo((cp - 65536), 1024) + 0xDC00;
    return String.fromCharCode(cu1, cu2);
}

// 10.1.2
function UTF16Decode(lead, trail) {
    Assert(0xD800 <= lead && lead <= 0xDBFF && 0xDC00 <= trail && trail <= 0xDFFF);
    var cp = (lead - 0xD800) * 1024 + (trail - 0xDC00) + 0x10000;
    return cp;
}

// 10.2 Types of Source Code

// 10.2.1 Strict Mode Code

function determineStrictModeCode(nt, strict) {
    switch (nt.goal) {
        case 'Script':
            if (nt.name === 'Script: [empty]') {
                nt.strict = strict;
                return;
            }
            var thisStrict = strict || containsUseStrictDirective(nt.resolve('StatementList'));
            var nextStrict = thisStrict;
            break;
        case 'Module':
        case 'ClassDeclaration':
        case 'ClassExpression':
            var thisStrict = true;
            var nextStrict = true;
            break;
        case 'FunctionDeclaration':
        case 'FunctionExpression':
            var thisStrict = strict;
            var nextStrict = strict || nt.FunctionBody.ContainsUseStrict();
            var except = 'BindingIdentifier';
            break;
        case 'GeneratorDeclaration':
        case 'GeneratorExpression':
        case 'GeneratorMethod':
            var thisStrict = strict;
            var nextStrict = strict || nt.GeneratorBody.ContainsUseStrict();
            var except = 'BindingIdentifier';
            break;
        case 'MethodDefinition':
            if (nt.name === 'MethodDefinition: GeneratorMethod') {
                var thisStrict = strict;
                var nextStrict = strict;
                break;
            }
            var thisStrict = strict;
            var nextStrict = strict || nt.FunctionBody.ContainsUseStrict();
            var except = 'PropertyName';
            break;
        case 'ArrowFunction':
            var thisStrict = strict;
            var nextStrict = strict || nt.ConciseBody.ContainsUseStrict();
            break;
        default:
            var thisStrict = strict;
            var nextStrict = strict;
            break;
    }
    nt.strict = thisStrict;
    for (var ref of nt.refs) {
        if (ref === except) {
            determineStrictModeCode(nt[ref], thisStrict);
        } else {
            determineStrictModeCode(nt[ref], nextStrict);
        }
    }
}

// 10.2.2 Non-ECMAScript Functions

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

// 18 The Global Object

// 18.1 Value Properties of the Global Object

// 18.1.1 Infinity

// 18.1.2 NaN

// 18.1.3 undefined

// 18.2 Function Properties of the Global Object

// 18.2.1
function global_eval(x) {
    var evalRealm = active_function_object.Realm;
    var strictCaller = false;
    var directEval = false;
    return PerformEval(x, evalRealm, strictCaller, directEval);
}

// 18.2.1.1
function PerformEval(x, evalRealm, strictCaller, direct) {
    Assert(direct !== false || strictCaller === false);
    if (Type(x) !== 'String') return x;
    try {
        setParsingText(x);
        var script = parseScript();
        determineStrictModeCode(script, strictCaller);
        script.apply_early_error_rules();
    } catch (e) {
        if (e instanceof EarlySyntaxError) throw $SyntaxError();
        if (e instanceof EarlyReferenceError) throw $SyntaxError(); // clarify the specification
        throw e;
    }
    if (script.Contains('ScriptBody') === false) return undefined;
    var body = script.ScriptBody;
    if (strictCaller === true) var strictEval = true;
    else var strictEval = script.IsStrict();
    var ctx = the_running_execution_context;
    if (direct === true) {
        var lexEnv = NewDeclarativeEnvironment(ctx.LexicalEnvironment);
        var varEnv = ctx.VariableEnvironment;
    } else {
        var lexEnv = NewDeclarativeEnvironment(evalRealm.GlobalEnv);
        var varEnv = evalRealm.GlobalEnv;
    }
    if (strictEval === true) var varEnv = lexEnv;
    var evalCxt = new ExecutionContext;
    evalCxt.Function = null;
    evalCxt.Realm = evalRealm;
    evalCxt.ScriptOrModule = ctx.ScriptOrModule;
    evalCxt.VariableEnvironment = varEnv;
    evalCxt.LexicalEnvironment = lexEnv;
    push_onto_the_execution_context_stack(evalCxt);
    Assert(evalCxt === the_running_execution_context);
    var result = concreteCompletion(EvalDeclarationInstantiation(body, varEnv, lexEnv, strictEval));
    if (result.Type === 'normal') {
        var result = concreteCompletion(body.Evaluation());
    }
    if (result.Type === 'normal' && result.Value === empty) {
        var result = NormalCompletion(undefined);
    }
    remove_from_the_execution_context_stack(evalCxt);
    return resolveCompletion(result);
}

// 18.2.1.2
function EvalDeclarationInstantiation(body, varEnv, lexEnv, strict) {
    var varNames = body.VarDeclaredNames();
    var varDeclarations = body.VarScopedDeclarations();
    var lexEnvRec = lexEnv.EnvironmentRecord;
    var varEnvRec = varEnv.EnvironmentRecord;
    if (strict === false) {
        if (varEnvRec instanceof GlobalEnvironmentRecord) {
            for (var name of varNames) {
                if (varEnvRec.HasLexicalDeclaration(name) === true) throw $SyntaxError();
            }
        }
        var thisLex = lexEnv;
        while (thisLex !== varEnv) {
            var thisEnvRec = thisLex.EnvironmentRecord;
            if (!(thisEnvRec instanceof ObjectEnvironmentRecord)) {
                for (var name of varNames) {
                    if (thisEnvRec.HasBinding(name) === true) {
                        throw $SyntaxError();
                    }
                }
            }
            var thisLex = thisLex.outer_lexical_environment;
        }
    }
    var functionsToInitialize = [];
    var declaredFunctionNames = [];
    for (var d of varDeclarations.slice().reverse()) {
        if (!(d.is('VariableDeclaration') || d.is('ForBinding'))) {
            Assert(d.is('FunctionDeclaration') || d.is('GeneratorDeclaration'));
            var fn = d.BoundNames()[0];
            if (!fn.is_an_element_of(declaredFunctionNames)) {
                if (varEnvRec instanceof GlobalEnvironmentRecord) {
                    var fnDefinable = varEnvRec.CanDeclareGlobalFunction(fn);
                    if (fnDefinable === false) throw $TypeError();
                }
                declaredFunctionNames.push(fn);
                functionsToInitialize.unshift(d);
            }
        }
    }
    var declaredVarNames = [];
    for (var d of varDeclarations) {
        if (d.is('VariableDeclaration') || d.is('ForBinding')) {
            for (var vn of d.BoundNames()) {
                if (!vn.is_an_element_of(declaredFunctionNames)) {
                    if (varEnvRec instanceof GlobalEnvironmentRecord) {
                        var vnDefinable = varEnvRec.CanDeclareGlobalVar(vn);
                        if (vnDefinable === false) throw $TypeError();
                    }
                    if (!vn.is_an_element_of(declaredVarNames)) {
                        declaredVarNames.push(vn);
                    }
                }
            }
        }
    }
    var lexDeclarations = body.LexicallyScopedDeclarations();
    for (var d of lexDeclarations) {
        for (var dn of d.BoundNames()) {
            if (d.IsConstantDeclaration() === true) {
                lexEnvRec.CreateImmutableBinding(dn, true);
            } else {
                lexEnvRec.CreateMutableBinding(dn, false);
            }
        }
    }
    for (var f of functionsToInitialize) {
        var fn = f.BoundNames()[0];
        var fo = f.InstantiateFunctionObject(lexEnv);
        if (varEnvRec instanceof GlobalEnvironmentRecord) {
            varEnvRec.CreateGlobalFunctionBinding(fn, fo, true);
        } else {
            var bindingExists = varEnvRec.HasBinding(fn);
            if (bindingExists === false) {
                var status = varEnvRec.CreateMutableBinding(fn, true);
                varEnvRec.InitializeBinding(fn, fo);
            } else {
                varEnvRec.SetMutableBinding(fn, fo, false);
            }
        }
    }
    for (var vn of declaredVarNames) {
        if (varEnvRec instanceof GlobalEnvironmentRecord) {
            varEnvRec.CreateGlobalVarBinding(vn, true);
        } else {
            var bindingExists = varEnvRec.HasBinding(vn);
            if (bindingExists === false) {
                var status = varEnvRec.CreateMutableBinding(vn, true);
                varEnvRec.InitializeBinding(vn, undefined);
            }
        }
    }
    return NormalCompletion(empty);
}

// 18.2.2
function global_isFinite(number) {
    var num = ToNumber(number);
    // Here we rely on underlying virtual machine.
    return isFinite(num);
}

// 18.2.3
function global_isNaN(number) {
    var num = ToNumber(number);
    // Here we rely on underlying virtual machine.
    return isNaN(num);
}

// 18.2.4
function global_parseFloat(string) {
    var inputString = ToString(string);
    // Here we rely on underlying virtual machine.
    return parseFloat(inputString);
}

// 18.2.5
function global_parseInt(string, radix) {
    var inputString = ToString(string);
    // Here we rely on underlying virtual machine.
    return parseInt(inputString);
}

// 18.2.6 URI Handling Functions

// 18.2.6.1 URI Syntax and Semantics

const uriReserved = ";/?:@&=+$,";
const uriAlpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const uriMark = "-_.!~*'()";
const uriUnescaped = uriAlpha + "0123456789" + uriMark;

// 18.2.6.1.1
function Encode(string, unescapedSet) {
    var strLen = string.legnth;
    var R = '';
    var k = 0;
    while (true) {
        if (k === strLen) return R;
        var C = string[k];
        if (C.is_an_element_of(unescapedSet)) {
            var S = C;
            var R = R + S;
        } else {
            if ((code_unit_value(C) >= 0xDC00) && (code_unit_value(C) <= 0xDFFF)) throw $URIError();
            if ((code_unit_value(C) < 0xD800) || (code_unit_value(C) > 0xDBFF)) {
                var V = code_unit_value(C);
            } else {
                k++;
                if (k === strLen) throw $URIError();
                var kChar = code_unit_value(string[k]);
                if ((kChar < 0xDC00) || (kChar > 0xDFFF)) throw $URIError();
                var V = UTF16Decode(code_unit_value(C), kChar);
            }
            var Octets = UTF8_encode(V);
            var L = Octets.length;
            var j = 0;
            while (j < L) {
                var jOctet = Octets[j];
                var S = '%' + '0123456789ABCDEF' [jOctet >> 4] + '0123456789ABCDEF' [jOctet & 15];
                var R = R + S;
                j++;
            }
        }
        k++;
    }
}

// 18.2.6.1.2
function Decode(string, reservedSet) {
    var strLen = string.length;
    var R = '';
    var k = 0;
    while (true) {
        if (k === strLen) return R;
        var C = string[k];
        if (C !== '%') {
            var S = C;
        } else {
            var start = k;
            if (k + 2 >= strLen) throw $URIError();
            if ((is_hexdigit_char(string[k + 1]) && is_hexdigit_char(string[k + 2])) === false) throw $URIError();
            var B = (mv_of_hexdigit_char(string[k + 1]) << 4) + mv_of_hexdigit_char(string[k + 2]);
            k += 2;
            if ((B & 0x80) === 0) {
                var C = String.fromCharCode(B);
                if (!C.is_an_element_of(reservedSet)) {
                    var S = C;
                } else {
                    var S = string.substring(start, k + 1);
                }
            } else {
                var n = 0;
                while (((B << n) & 0x80) !== 0) {
                    n++;
                }
                if (n === 1 || (n > 4)) throw $URIError();
                var Octets = [];
                Octets[0] = B;
                if (k + (3 * (n - 1)) >= strLen) throw $URIError();
                var j = 1;
                while (j < n) {
                    k++;
                    if (string[k] !== '%') throw $URIError();
                    if ((is_hexdigit_char(string[k + 1]) && is_hexdigit_char(string[k + 2])) === false) throw $URIError();
                    var B = (mv_of_hexdigit_char(string[k + 1]) << 4) + mv_of_hexdigit_char(string[k + 2]);
                    if ((B & 0xC0) !== 0x80) throw $URIError();
                    k += 2;
                    Octets[j] = B;
                    j++;
                }
                var V = UTF8_decode(Octets);
                if (V < 0x10000) {
                    var C = String.fromCharCode(V);
                    if (!C.is_an_element_of(reservedSet)) {
                        var S = C;
                    } else {
                        var S = string.substring(start, k + 1);
                    }
                } else {
                    var L = (((V - 0x10000) & 0x3FF) + 0xDC00);
                    var H = ((((V - 0x10000) >> 10) & 0x3FF) + 0xD800);
                    var S = String.fromCharCode(H, L);
                }
            }
        }
        var R = R + S;
        k++;
    }
}

function UTF8_encode(V) {
    var Octets = [];
    if (V <= 0x007F) {
        Octets[0] = V;
    } else if (V <= 0x07FF) {
        Octets[0] = 0xC0 + ((V >> 6) & 0x1F);
        Octets[1] = 0x80 + (V & 0x3F);
    } else if (V <= 0xFFFF) {
        Octets[0] = 0xE0 + ((V >> 12) & 0x1F);
        Octets[1] = 0x80 + ((V >> 6) & 0x3F);
        Octets[2] = 0x80 + (V & 0x3F);
    } else {
        Octets[0] = 0xF0 + ((V >> 18) & 0x07);
        Octets[1] = 0x80 + ((V >> 12) & 0x3F);
        Octets[2] = 0x80 + ((V >> 6) & 0x3F);
        Octets[3] = 0x80 + (V & 0x3F);
    }
    return Octets;
}

function UTF8_decode(Octets) {
    var len = Octets.length;
    if (len === 2) {
        var V = ((Octets[0] & 0x1F) << 6) + (Octets[1] & 0x3F);
        if (V <= 0x007F) throw $URIError();
    } else if (len === 3) {
        var V = ((Octets[0] & 0x0F) << 12) + ((Octets[1] & 0x3F) << 6) + (Octets[2] & 0x3F);
        if ((V <= 0x07FF) || ((0xD800 <= V) && (V <= 0xDFFF))) throw $URIError();
    } else {
        var V = ((Octets[0] & 0x07) << 18) + ((Octets[1] & 0x3F) << 12) + ((Octets[2] & 0x3F) << 6) + (Octets[3] & 0x3F);
        if ((V <= 0xFFFF) || (0x110000 <= V)) throw $URIError();
    }
    return V;
}

// 18.2.6.2
function global_decodeURI(encodedURI) {
    var uriString = ToString(encodedURI);
    var reservedURISet = uriReserved + "#";
    return Decode(uriString, reservedURISet);
}

// 18.2.6.3
function global_decodeURIComponent(encodedURIComponent) {
    var componentString = ToString(encodedURIComponent);
    var reservedURIComponentSet = '';
    return Decode(componentString, reservedURIComponentSet);
}

// 18.2.6.4
function global_encodeURI(uri) {
    var uriString = ToString(uri);
    var unescapedURISet = uriReserved + uriUnescaped + "#";
    return Encode(uriString, unescapedURISet);
}

// 18.2.6.5
function global_encodeURIComponent(uriComponent) {
    var componentString = ToString(uriComponent);
    var unescapedURIComponentSet = uriUnescaped;
    return Encode(componentString, unescapedURIComponentSet);
}

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

// 5 Notational Conventions

// 5.1 Syntactic and Lexical Grammars

// 5.1.1 Context-Free Grammars

// 5.1.2 The Lexical and RegExp Grammars

// 5.1.3 The Numeric String Grammar

// 5.1.4 The Syntactic Grammar

var Production = {};
var ProductionPrototype = {};

function isref(e) {
    if (e === 'ReservedWord') return false;
    return (/[A-Z]/.exec(e[0]) !== null);
}

function abbrev(e) {
    if (!isref(e)) return e;
    return e.replace(/\[(?!opt]).*?]/g, '');
}

function strip(e) {
    return e.split(/[[:]/)[0];
}

function rename_duplicated(e, i, names) {
    var r;
    var k = 0;
    for (var j = 0; j < names.length; j++) {
        if (names[j] !== e) continue;
        k++;
        if (i === j) {
            r = k;
        }
    }
    if (k === 1) return e;
    return e + r;
}

function Syntax(arr) {
    for (var g of arr) {
        createProduction(g);
    }
}

function createProduction(g) {
    var elems = g.split(' ').map(abbrev);
    var name = elems.join(' ');
    var types = [];
    var index = [];
    for (var i = 1; i < elems.length; i++) {
        if (isref(elems[i])) {
            types.push(strip(elems[i]));
            index.push(i);
        }
    }
    var refs = types.map(rename_duplicated);
    if (name.indexOf('[opt]') < 0) {
        var proto = createProductionPrototype(name, refs);
        Production[name] = function() {
            var obj = Object.create(proto);
            for (var i = 0; i < arguments.length; i++) {
                var nt = arguments[i];
                Assert(nt.goal === types[i]);
                obj[refs[i]] = nt;
                Assert(!nt.nested);
                nt.nested = obj;
            }
            return obj;
        };
        return;
    }
    var protos = [];
    var jmax = Math.pow(2, index.length);
    loop: for (var j = 0; j < jmax; j++) {
        var el = elems.slice();
        for (var i = 0; i < index.length; i++) {
            if (j & (1 << i)) {
                if (el[index[i]].indexOf('[opt]') <= 0) continue loop;
                el[index[i]] = null;
            } else {
                el[index[i]] = types[i];
            }
        }
        var el = el.filter(e => e);
        if (el.length === 1) el.push('[empty]');
        var n = el.join(' ');
        Assert(n.indexOf('[opt]') < 0);
        var rf = refs.filter((e, i) => !(j & (1 << i)));
        protos[j] = createProductionPrototype(n, rf);
    }
    Production[name] = function() {
        var j = 0;
        for (var i = 0; i < types.length; i++) {
            var nt = arguments[i];
            if (!nt) j += (1 << i);
        }
        var proto = protos[j];
        Assert(proto);
        var obj = Object.create(proto);
        for (var i = 0; i < arguments.length; i++) {
            var nt = arguments[i];
            Assert(nt === null || nt.goal === types[i]);
            if (!nt) continue;
            obj[refs[i]] = nt;
            Assert(!nt.nested);
            nt.nested = obj;
        }
        return obj;
    };
    return;
}

// 5.1.5 Grammar Notation

// 5.2 Algorithm Conventions

function implicit_chain_algorithm(ref, method) {
    return function() {
        return this[ref][method].apply(this[ref], arguments);
    };
}

function create_implicit_definitions_on_chain_productions() {
    var dirty = true;
    while (dirty) {
        dirty = false;
        for (var name in ProductionPrototype) {
            create(name);
        }
    }

    function create(name) {
        var proto = ProductionPrototype[name];
        if (proto.refs.length !== 1) return;
        var ref = proto.refs[0];
        for (var n in ProductionPrototype) {
            var p = ProductionPrototype[n];
            if (p.goal !== ref) continue;
            for (var m in p) {
                Assert(p[m] instanceof Function);
                if (m in proto) continue;
                proto[m] = implicit_chain_algorithm(ref, m);
                dirty = true;
            }
        }
    }
}

// 5.3 Static Semantic Rules

function Static_Semantics(method, arr) {
    var prods = [];
    for (var e of arr) {
        if (typeof e === 'string') {
            expand_opts(e, function(name) {
                prods.push(name);
            });
            continue;
        }
        for (var name of prods) {
            var proto = ProductionPrototype[name];
            if (!proto) {
                console.log('unknown production', name);
                continue;
            }
            if (method === 'Early Errors') {
                if (!(method in proto)) {
                    Object.defineProperty(proto, method, { value: [] });
                }
                proto[method].push(e);
            } else {
                if (method in proto) {
                    console.log('duplicate method', method, name);
                    continue;
                }
                proto[method] = e;
            }
        }
        prods = [];
    }
}

function Runtime_Semantics(method, arr) {
    Static_Semantics(method, arr);
}

function expand_opts(name, func) {
    if (name.indexOf('[opt]') < 0) {
        return func(name);
    }
    var n = name.replace('[opt]', '');
    expand_opts(n, func);
    var n = name.replace(/ [^ ]*?\[opt]/, '');
    expand_opts(n, func);
}

const commonProductionPrototype = Object.create(null);

function createProductionPrototype(name, refs) {
    Assert(!ProductionPrototype[name]);
    var elems = name.split(' ');
    var goal = strip(elems[0]);
    var proto = Object.create(commonProductionPrototype);
    Object.defineProperty(proto, 'name', { value: name });
    Object.defineProperty(proto, 'goal', { value: goal });
    Object.defineProperty(proto, 'refs', { value: refs });
    if (elems.length === 2 && isref(elems[1])) {
        var ident = elems[1];
        Object.defineProperty(proto, 'is', {
            value: function(a) {
                if (a === goal) return true;
                if (a === name) return true;
                return this[ident].is(a);
            }
        });
        Object.defineProperty(proto, 'resolve', {
            value: function(a) {
                if (a === goal) return this;
                if (a === name) return this;
                return this[ident].resolve(a);
            }
        });
    } else {
        Object.defineProperty(proto, 'is', {
            value: function(a) {
                if (a === goal) return true;
                if (a === name) return true;
                return false;
            }
        });
        Object.defineProperty(proto, 'resolve', {
            value: function(a) {
                if (a === goal) return this;
                if (a === name) return this;
                return null;
            }
        });
    }
    Object.defineProperty(proto, 'apply_early_error_rules', {
        value: function() {
            var rules = this['Early Errors'];
            if (rules) {
                for (var rule of rules) {
                    rule.call(this);
                }
            }
            for (var ref of refs) {
                this[ref].apply_early_error_rules();
            }
        }
    });
    if (goal === 'FunctionBody' || goal === 'GeneratorBody' || goal === 'ConciseBody') {
        Object.defineProperty(proto, 'is_nested_directly_or_indirectly_but_not_crossing_function_boundaries_within', {
            value: function(a) {
                if (a === goal) return true;
                if (a === name) return true;
                return false;
            }
        });
    } else {
        Object.defineProperty(proto, 'is_nested_directly_or_indirectly_but_not_crossing_function_boundaries_within', {
            value: function(a) {
                if (a === goal) return true;
                if (a === name) return true;
                if (!this.nested) return false;
                return this.nested.is_nested_directly_or_indirectly_but_not_crossing_function_boundaries_within(a);
            }
        });
    }
    ProductionPrototype[name] = proto;
    return proto;
}

function create_implicit_static_semantic_rule_Contains() {
    for (var name in ProductionPrototype) {
        var proto = ProductionPrototype[name];
        if ('Contains' in proto) continue;
        let refs = proto.refs;
        let syms = name.split(' ').map(strip);
        Object.defineProperty(proto, 'Contains', {
            value: function(symbol) {
                if (syms.includes(symbol)) return true;
                for (var ref of refs) {
                    if (this[ref].Contains(symbol)) return true;
                }
                return false;
            }
        });
    }
}

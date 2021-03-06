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
 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
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

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var filenames = [
    'helper.js',
    'unicode.js',
    '5-notational-conventions.js',
    '6-data-types-and-values.js',
    '7-abstract-operations.js',
    '8-executable-code-and-execution-contexts.js',
    '9-ordinary-and-exotic-objects-behaviours.js',
    '10-source-text.js',
    '11-lexical-grammar.js',
    '12-expressions.js',
    '13-statements-and-declarations.js',
    '14-functions-and-classes.js',
    '15-scripts-and-modules.js',
    '16-error-handling.js',
    'parser-10.js',
    'parser-11.js',
    'parser-12.js',
    'parser-13.js',
    'parser-14.js',
    'parser-15.js',
    '18-the-global-object.js',
    '19-fundamental-objects.js',
    '20-numbers-and-dates.js',
    '21-text-processing.js',
    '22-indexed-collections.js',
    '23-keyed-collection.js',
    '24-structured-data.js',
    '25-control-abstraction-objects.js',
    '26-reflection.js',
    'generator_compiler.js',
];

function expand_concreteCompletion(raw) {
    return raw.replace(/var ([\w${}]*) = concreteCompletion(\(.*\));/gm,
        'try{var $1=$2;$1=NormalCompletion($1)}catch(_e){if(!(_e instanceof Completion))throw _e;$1=_e}');
}

function expand_compileConcreteCompletion(raw) {
    return raw.replace(/var (\w*) = compileConcreteCompletion(\(.*\));/gm,
        '{ctx.$(`try{`);var $1=$2||ctx.allocVar();ctx.$(`var ${$1}=NormalCompletion(${$1})}catch(_e){if(!(_e instanceof Completion))throw _e;${$1}=_e}`)}');
}

function expand_throw(raw) {
    return raw.replace(/throw (\$[^;]*);/g,
        'throw Completion({Type:"throw",Value:$1,Target:empty});');
}

function expand_ReturnIfAbrupt(raw) {
    return raw.replace(/ReturnIfAbrupt\(([^)]*)\);/g,
        '{if($1.is_an_abrupt_completion()){throw $1;}$1=$1.Value;}');
}

function expand_IfAbruptRejectPromise(raw) {
    return raw.replace(/IfAbruptRejectPromise\(([^,]*), ([^)]*)\);/g,
        '{if($1.is_an_abrupt_completion()){Call($2.Reject,undefined,[$1.Value]);return $2.Promise;}$1=$1.Value;}');
}

for (var filename of filenames) {
    var text = fs.readFileSync(path.join(__dirname, 'src', filename), 'utf8');
    var text = expand_throw(text);
    var text = expand_ReturnIfAbrupt(text);
    if (filename === '25-control-abstraction-objects.js') {
        var text = expand_IfAbruptRejectPromise(text);
    }
    var text = expand_concreteCompletion(text);
    if (['25-control-abstraction-objects.js', 'generator_compiler.js'].includes(filename)) {
        var text = expand_compileConcreteCompletion(text);
    }
    vm.runInThisContext(text, {
        filename: filename,
        displayErrors: true,
    });
}

function expand_TypedArray(raw, __TypedArray__) {
    return raw.replace(/__TypedArray__/g, __TypedArray__);
}

var template = fs.readFileSync(path.join(__dirname, 'src', '2224-typed-array-constructor.js'), 'utf8');
for (var __TypedArray__ in Table50) {
    var text = expand_TypedArray(template, __TypedArray__);
    var text = expand_throw(text);
    var text = expand_ReturnIfAbrupt(text);
    var text = expand_concreteCompletion(text);
    vm.runInThisContext(text, {
        filename: __TypedArray__ + '.js',
        displayErrors: true,
    });
}

create_implicit_static_semantic_rule_Contains();
create_implicit_definitions_on_chain_productions();


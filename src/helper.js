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

function Assert(cond) {
    if (cond) return;
    debugger;
    throw new Error("Assertion failed");
}

function get_symbol_description(sym) {
    return /^Symbol\((.*)\)$/.exec(sym.toString())[1];
}

function is_negative_zero(x) {
    return (x === 0 && (1 / x) < 0);
}

function define_method(c, n, v) {
    Object.defineProperty(c.prototype, n, {
        value: v
    });
}

define_method(String, 'is_an_element_of', function(a) {
    return a.includes(this.valueOf());
});

define_method(Array, 'contains', Array.prototype.includes);

define_method(Array, 'contains_any_duplicate_entries', function() {
    return (this.length !== new Set(this).size);
});

define_method(Array, 'also_occurs_in', function(a) {
    return this.some(e => a.contains(e));
});

define_method(Array, 'remove', function(e) {
    var i = this.indexOf(e);
    if (i >= 0) this.splice(i, 1);
});

define_method(Array, 'equals', function(a) {
    if (a.length !== this.length) return false;
    for (var i = 0; i < this.length; i++) {
        if (a[i] !== this[i]) return false;
    }
    return true;
});

define_method(Array, 'append_elements_of', function(a) {
    Array.prototype.push.apply(this, a);
});

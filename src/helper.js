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

function is_primitive_value(x) {
    switch (typeof x) {
        case 'undefined':
        case 'boolean':
        case 'string':
        case 'symbol':
        case 'number':
            return true;
    }
    if (x === null) return true;
    return false;
}

function is_positive_zero(x) {
    return (x === 0 && (1 / x) > 0);
}

function is_negative_zero(x) {
    return (x === 0 && (1 / x) < 0);
}

function modulo(x, y) {
    return x - y * Math.floor(x / y);
}

function is_digit_char(c) {
    if (c.length !== 1) return false;
    return ('0123456789'.indexOf(c) >= 0);
}

function mv_of_digit_char(c) {
    Assert(c.length === 1);
    var x = '0123456789'.indexOf(c);
    Assert(x >= 0);
    return x;
}

function is_hexdigit_char(c) {
    if (c.length !== 1) return false;
    return ('0123456789ABCDEFabcdef'.indexOf(c) >= 0);
}

function mv_of_hexdigit_char(c) {
    Assert(c.length === 1);
    var x = '0123456789ABCDEFabcdef'.indexOf(c);
    Assert(x >= 0);
    if (x < 16) return x;
    return x - 6;
}

function code_unit_value(c) {
    Assert(c.length === 1);
    return c.charCodeAt(0);
}

function define_method_direct(p, n, v) {
    Object.defineProperty(v, 'name', {
        value: p.name ? p.name + '.' + n : n
    });
    Object.defineProperty(p, n, {
        value: v
    });
}

function define_method(c, n, v) {
    Object.defineProperty(v, 'name', {
        value: c.name ? c.name + '.' + n : n
    });
    Object.defineProperty(c.prototype, n, {
        value: v
    });
}

define_method(Array, 'contains', Array.prototype.includes);

define_method(String, 'contains', String.prototype.includes);

define_method(String, 'is_an_element_of', function(a) {
    return a.contains(this.valueOf());
});

define_method(Array, 'contains_any_duplicate_entries', function() {
    return (this.length !== new Set(this).size);
});

define_method(Array, 'contains_any_duplicate_elements', function() {
    return (this.length !== new Set(this).size);
});

define_method(Array, 'also_occurs_in', function(a) {
    return this.some(e => a.contains(e));
});

define_method(Array, 'remove', function(e) {
    var i = this.indexOf(e);
    if (i < 0) return false;
    this.splice(i, 1);
    return true;
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

define_method(Array, 'contains_more_than_one_occurrence_of', function(a) {
    return (this.indexOf(a) !== this.lastIndexOf(a));
});

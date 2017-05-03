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

function get_symbol_description(sym) {
    return /^Symbol\((.*)\)$/.exec(sym.toString())[1];
}

function is_negative_zero(x) {
    return (x === 0 && (1 / x) < 0);
}

Object.defineProperty(Array.prototype, 'contains', {
    value: Array.prototype.includes
});

Object.defineProperty(String.prototype, 'is_an_element_of', {
    value: function(a) {
        return a.includes(this.valueOf());
    }
});

Object.defineProperty(Array.prototype, 'contains_any_duplicate_entries', {
    value: function() {
        return (this.length !== new Set(this).size);
    }
});

Object.defineProperty(Array.prototype, 'also_occurs_in', {
    value: function(a) {
        return this.some(e => a.contains(e));
    }
});

function remove_an_element_from(elem, list) {
    var i = list.indexOf(elem);
    if (i >= 0) list.splice(i, 1);
}

function list_equals(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function list_append(a, b) {
    Array.prototype.push.apply(a, b);
}

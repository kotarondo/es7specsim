if (!assert) {
    var assert = {
        sameValue: function(x, y) {
            if (x !== y) throw new Error(x + " !== " + y);
        }
    };
}

// -------------------------------
var iter = function*() {
    L1: L2: {
        yield 1;
        break L1;
        yield 2;
    }
    L3: while (true) {
        if (yield 3) break L3;
    }
}();

assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next().value, 3);
assert.sameValue(iter.next(null).value, 3);
assert.sameValue(iter.next(0).value, 3);
assert.sameValue(iter.next('').value, 3);
assert.sameValue(iter.next(1).done, true);

// -------------------------------
var iter = function*() {
    switch (yield 0) {
        case yield 1:
            yield 2;
        case yield 3:
            yield 4;
        case yield 5:
            yield 6;
    }
}();

assert.sameValue(iter.next().value, 0);
assert.sameValue(iter.next(iter).value, 1);
assert.sameValue(iter.next().value, 3);
assert.sameValue(iter.next(iter).value, 4);
assert.sameValue(iter.next().value, 6);
assert.sameValue(iter.next('B').done, true);

// -------------------------------
function* gen12() {
    switch (yield 1) {
        case yield 2:
            yield 3;
        case yield 4:
            yield 5;
            break;
        default:
            yield 6;
        case yield 7:
        case yield 8:
            yield 9;
    }
}

var iter = gen12();
assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('A').value, 2);
assert.sameValue(iter.next('B').value, 4);
assert.sameValue(iter.next('B').value, 7);
assert.sameValue(iter.next('B').value, 8);
assert.sameValue(iter.next('B').value, 6);
assert.sameValue(iter.next('B').value, 9);
assert.sameValue(iter.next('B').done, true);

var iter = gen12();
assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('A').value, 2);
assert.sameValue(iter.next('A').value, 3);
assert.sameValue(iter.next().value, 5);
assert.sameValue(iter.next().done, true);

var iter = gen12();
assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('A').value, 2);
assert.sameValue(iter.next('B').value, 4);
assert.sameValue(iter.next('B').value, 7);
assert.sameValue(iter.next('A').value, 9);
assert.sameValue(iter.next().done, true);

// -------------------------------
var iter = function*() {
    var a = {};
    for (const b of yield 2) {
        a[b] = yield 3;
    }
    return a;
}();

assert.sameValue(iter.next().value, 2);
assert.sameValue(iter.next([0, 9]).value, 3);
assert.sameValue(iter.next('x').value, 3);
assert.sameValue(JSON.stringify(iter.next('y')), '{"value":{"0":"x","9":"y"},"done":true}');

// -------------------------------
var iter = function*() {
    var a = {};
    for (a[yield 1] of yield 2) {
        yield 3;
    }
    return a;
}();

assert.sameValue(iter.next().value, 2);
assert.sameValue(iter.next(['b', 'a']).value, 1);
assert.sameValue(iter.next('y').value, 3);
assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('x').value, 3);
assert.sameValue(JSON.stringify(iter.next()), '{"value":{"y":"b","x":"a"},"done":true}');

// -------------------------------
var iter = function*() {
    var a = {};
    for (var b of yield 2) {
        a[b] = yield 3;
    }
    return a;
}();

assert.sameValue(iter.next().value, 2);
assert.sameValue(iter.next([9, 0]).value, 3);
assert.sameValue(iter.next('x').value, 3);
assert.sameValue(JSON.stringify(iter.next('y')), '{"value":{"0":"y","9":"x"},"done":true}');

// -------------------------------
var iter = function*() {
    var a = {};
    for (var b in yield 2) {
        a[b] = yield 3;
    }
    return a;
}();

assert.sameValue(iter.next().value, 2);
assert.sameValue(iter.next({ b: 0, a: 0 }).value, 3);
assert.sameValue(iter.next('x').value, 3);
assert.sameValue(JSON.stringify(iter.next('y')), '{"value":{"b":"x","a":"y"},"done":true}');

// -------------------------------
var iter = function*() {
    var a = {};
    for (a[yield 1] in yield 2) {
        yield 3;
    }
    return a;
}();

assert.sameValue(iter.next().value, 2);
assert.sameValue(iter.next({ b: 0, a: 0 }).value, 1);
assert.sameValue(iter.next('x').value, 3);
assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('y').value, 3);
assert.sameValue(JSON.stringify(iter.next()), '{"value":{"x":"b","y":"a"},"done":true}');

// -------------------------------
function* gen11() {
    var i, x = [];
    for (let [i, j = yield] in yield) {
        yield(function() { return j + i });
    }

}

var iter = gen11();
iter.next();
iter.next([111, 112]);
var f0 = iter.next('114').value;
assert.sameValue(f0(), '1140');
iter.next();
var f1 = iter.next('115').value;
assert.sameValue(f1(), '1151');
assert.sameValue(iter.next().done, true);

var iter = gen11();
iter.next();
iter.next([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
var f0 = iter.next('X').value;
for (var i = 1; i < 19; i++) iter.next('A' + i);
var f10 = iter.next('B').value;
assert.sameValue(f10(), '01');
assert.sameValue(iter.next().done, true);
assert.sameValue(f0(), 'X0');

// -------------------------------
function* gen10() {
    var i, x = [];
    for (i = 0; i < 3; i++) {
        x.push(yield i);
    }
    yield x.join();
    for (let i = 0, j = yield; i < 3; i++) {
        yield(function() { return i + j });
    }
    for (const i = 0, j = yield; i < 3; i++) {
        yield(function() { return i + j });
    }

}

var iter = gen10();
assert.sameValue(iter.next().value, 0);
assert.sameValue(iter.next('A').value, 1);
assert.sameValue(iter.next('B').value, 2);
assert.sameValue(iter.next('C').value, 'A,B,C');

assert.sameValue(iter.next().value, undefined);
var f0 = iter.next('A').value;
assert.sameValue(f0(), '0A');
var f1 = iter.next('B').value;
assert.sameValue(f1(), '1A');
var f2 = iter.next('C').value;
assert.sameValue(f0(), '0A');
assert.sameValue(f1(), '1A');
assert.sameValue(f2(), '2A');

assert.sameValue(iter.next().value, undefined);
var f0 = iter.next('A').value;
assert.sameValue(f0(), '0A');
try {
    iter.next();
    assert.sameValue(false, true);
} catch (e) {
    assert.sameValue(e instanceof TypeError, true);
}

// -------------------------------
function* gen9() {
    var x = [];
    do {
        x.push(yield 'in');
    } while (yield x.length);
    return x.join();
}

var iter = gen9();
assert.sameValue(iter.next().value, 'in');
assert.sameValue(iter.next('A').value, 1);
assert.sameValue(iter.next(true).value, 'in');
assert.sameValue(iter.next('B').value, 2);
assert.sameValue(iter.next(false).value, 'A,B');

// -------------------------------
function* gen8() {
    var x = [];
    while (yield x.length) x.push(yield 'in');
    return x.join();
}

var iter = gen8();
assert.sameValue(iter.next().value, 0);
assert.sameValue(iter.next(true).value, 'in');
assert.sameValue(iter.next('A').value, 1);
assert.sameValue(iter.next(true).value, 'in');
assert.sameValue(iter.next('B').value, 2);
assert.sameValue(iter.next(false).value, 'A,B');

// -------------------------------
function* gen7() {
    var x, y, z;
    if (yield 71) x = yield 72;
    else y = yield 73;
    if (yield 74) z = yield 75;
    return x + ',' + y + ',' + z;
}

var iter = gen7();
assert.sameValue(iter.next().value, 71);
assert.sameValue(iter.next(true).value, 72);
assert.sameValue(iter.next('X').value, 74);
assert.sameValue(iter.next(true).value, 75);
assert.sameValue(iter.next('Z').value, 'X,undefined,Z');

var iter = gen7();
assert.sameValue(iter.next().value, 71);
assert.sameValue(iter.next(false).value, 73);
assert.sameValue(iter.next('Y').value, 74);
assert.sameValue(iter.next(false).value, 'undefined,Y,undefined');

// -------------------------------
function* gen6() {
    var { y: z = yield } = yield 6;
    var { x = yield } = yield z + 'a';
    var [{ z } = yield] = yield x + 'b';
    var { y: { z } = yield } = yield z + 'c';
    return z + 'd';
}

var iter = gen6();
assert.sameValue(iter.next().value, 6);
assert.sameValue(iter.next({ y: 66 }).value, '66a');
assert.sameValue(iter.next({ x: 67 }).value, '67b');
assert.sameValue(iter.next([{ z: 68 }]).value, '68c');
assert.sameValue(iter.next({ y: { z: 69 } }).value, '69d');

var iter = gen6();
assert.sameValue(iter.next().value, 6);
assert.sameValue(iter.next({ z: 66 }).value, undefined);
assert.sameValue(iter.next(67).value, '67a');
assert.sameValue(iter.next({}).value, undefined);
assert.sameValue(iter.next(68).value, '68b');
assert.sameValue(iter.next([]).value, undefined);
assert.sameValue(iter.next({ z: 69 }).value, '69c');
assert.sameValue(iter.next([]).value, undefined);
assert.sameValue(iter.next({ z: 691 }).value, '691d');

// -------------------------------
function* gen5() {
    var x = '';
    var [x = yield + x, ] = yield x;
    var [x = yield + x + x, , ] = yield x;
    var [, ...[, x = (yield) + x]] = yield x;
    var [x = yield, y = yield] = yield x;
    return x + ',' + y;
}

var iter = gen5();
assert.sameValue(iter.next().value, '');
assert.sameValue(iter.next([51]).value, 51);
assert.sameValue(iter.next([52]).value, 52);
assert.sameValue(iter.next([, , 53]).value, 53);
assert.sameValue(iter.next([54, 55]).value, '54,55');

var iter = gen5();
assert.sameValue(iter.next().value, '');
assert.sameValue(iter.next([]).value, 0);
assert.sameValue(iter.next('51').value, '51');
assert.sameValue(iter.next([, 55, 56, 57]).value, '5151');
assert.sameValue(iter.next('52').value, '52');
assert.sameValue(iter.next([]).value, undefined);
assert.sameValue(iter.next('53').value, '5352');
assert.sameValue(iter.next(['054', , '055']).value, undefined);
assert.sameValue(iter.next(56).value, '054,56');

// -------------------------------
var iter = function*() {
    var [x = yield 41, , ...[y = yield 42]] = yield;
    return x + ',' + y;
}();

assert.sameValue(iter.next().value, undefined);
assert.sameValue(iter.next([undefined, 42, undefined, 44]).value, 41);
assert.sameValue(iter.next(441).value, 42);
assert.sameValue(iter.next(442).value, '441,442');

// -------------------------------
var iter = function*() {
    yield new
    class extends(yield 4) {
        constructor(x) {
            super(x + 1);
        }
        m4(y) { return y; }
        static m41(y) { return y + 1; }
    }(4);
}();

assert.sameValue(iter.next().value, 4);
class B4 {
    constructor(x) {
        this.x = x;
    }
}
var b4 = iter.next(B4).value;
assert.sameValue(b4 instanceof B4, true);
assert.sameValue(b4.m4(44), 44);

// -------------------------------
var iter = function*() {
    class C extends(yield 3) {
        constructor(x) {
            super(x + 1);
        }
        m3(y) { return y; }
        static m31(y) { return y + 1; }
    }
    yield new C('3');
}();

assert.sameValue(iter.next().value, 3);
class B3 {
    constructor(x) {
        this.y = x;
    }
}
var b3 = iter.next(B3).value;
assert.sameValue(b3 instanceof B3, true);
assert.sameValue(b3.y, '31');

// -------------------------------
var iter = function*() {
    yield {*[yield 2](a) { return yield a; } }
}();

assert.sameValue(iter.next().value, 2);
var f = iter.next('b2').value.b2;
assert.sameValue(f.name, 'b2');
var g = f('c2');
assert.sameValue(g.next().value, 'c2');
var obj = g.next('r2');
assert.sameValue(obj.value, 'r2');
assert.sameValue(obj.done, true);

// -------------------------------
var iter = function*() {
    yield {
        [yield 1](a) { return a; }
    }
}();

assert.sameValue(iter.next().value, 1);
var f = iter.next('b1').value.b1;
assert.sameValue(f.name, 'b1');
assert.sameValue(f('c1'), 'c1');
assert.sameValue(iter.next().done, true);

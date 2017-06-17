if (!assert) {
    var assert = {
        sameValue: function(x, y) {
            if (x !== y) throw new Error(x + " !== " + y);
        }
    };
}

// -------------------------------
var iter = function*() {
    debugger
    var x = 'abc';
    yield eval(yield 1);
}();

assert.sameValue(iter.next().value, 1);
assert.sameValue(iter.next('x').value, 'abc');

// -------------------------------
function* gen6() {
    ({ y: z = yield } = yield 6);
    ({ x = yield } = yield z + 'a');
    [{ z } = yield] = yield x + 'b';
    ({ "y": { z } = yield } = yield z + 'c');
    ({ 0: { z: w } = { z } } = yield z + 'd');
    ({ x, y, } = yield w);
    ({} = x);
    ([] = y);
    return x + y;
}

var x, y, z, w;
var iter = gen6();
assert.sameValue(iter.next().value, 6);
assert.sameValue(iter.next({ y: 66 }).value, '66a');
assert.sameValue(iter.next({ x: 67 }).value, '67b');
assert.sameValue(iter.next([{ z: 68 }]).value, '68c');
assert.sameValue(iter.next({ y: { z: 69 } }).value, '69d');
assert.sameValue(iter.next({ 0: { z: '70' } }).value, '70');
assert.sameValue(iter.next({ x: 'X', y: 'Y' }).value, 'XY');

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
    var x, y;
    var x = '';
    [x = yield + x, ] = yield x;
    [x = yield + x + x, , ] = yield x;
    [, ...[, x = (yield) + x]] = yield x;
    [x = yield, y = yield] = yield x;
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
    yield(yield 'a') & (yield 'b');
    yield(yield 'c') ^ (yield 'd');
    yield(yield 'e') | (yield 'f');
    yield(yield 'g') && (yield 'h');
    yield(yield 'i') && (yield 'j');
    yield(yield 'k') || (yield 'l');
    yield(yield 'k') || (yield 'l');
}();

assert.sameValue(iter.next().value, 'a');
assert.sameValue(iter.next(11).value, 'b');
assert.sameValue(iter.next(-2).value, 10);
assert.sameValue(iter.next().value, 'c');
assert.sameValue(iter.next(1234).value, 'd');
assert.sameValue(iter.next(1234).value, 0);
assert.sameValue(iter.next().value, 'e');
assert.sameValue(iter.next(6).value, 'f');
assert.sameValue(iter.next(12).value, 14);
assert.sameValue(iter.next().value, 'g');
assert.sameValue(iter.next(true).value, 'h');
assert.sameValue(iter.next(123).value, 123);
assert.sameValue(iter.next().value, 'i');
assert.sameValue(iter.next(0).value, 0);
assert.sameValue(iter.next().value, 'k');
assert.sameValue(iter.next('abc').value, 'abc');
assert.sameValue(iter.next().value, 'k');
assert.sameValue(iter.next(null).value, 'l');
assert.sameValue(iter.next(99).value, 99);

// -------------------------------
var iter = function*() {
    yield(yield 'a') instanceof(yield 'b');
    yield(yield 'c') in (yield 'd');
    yield(yield 'e') == (yield 'f');
    yield(yield 'g') != (yield 'h');
    yield(yield 'i') === (yield 'j');
    yield(yield 'k') !== (yield 'l');
}();

assert.sameValue(iter.next().value, 'a');
assert.sameValue(iter.next([]).value, 'b');
assert.sameValue(iter.next(Array).value, true);
assert.sameValue(iter.next().value, 'c');
assert.sameValue(iter.next('length').value, 'd');
assert.sameValue(iter.next([]).value, true);
assert.sameValue(iter.next().value, 'e');
assert.sameValue(iter.next(null).value, 'f');
assert.sameValue(iter.next(undefined).value, true);
assert.sameValue(iter.next().value, 'g');
assert.sameValue(iter.next('0').value, 'h');
assert.sameValue(iter.next(0).value, false);
assert.sameValue(iter.next().value, 'i');
assert.sameValue(iter.next(NaN).value, 'j');
assert.sameValue(iter.next(NaN).value, false);
assert.sameValue(iter.next().value, 'k');
assert.sameValue(iter.next(NaN).value, 'l');
assert.sameValue(iter.next(NaN).value, true);

// -------------------------------
var iter = function*() {
    yield(yield 'a') < (yield 'b');
    yield(yield 'c') > (yield 'd');
    yield(yield 'e') <= (yield 'f');
    yield(yield 'g') >= (yield 'h');
    yield(yield 'i') >= (yield 'j');
}();

assert.sameValue(iter.next().value, 'a');
assert.sameValue(iter.next(3).value, 'b');
assert.sameValue(iter.next(10).value, true);
assert.sameValue(iter.next().value, 'c');
assert.sameValue(iter.next(3).value, 'd');
assert.sameValue(iter.next('3').value, false);
assert.sameValue(iter.next().value, 'e');
assert.sameValue(iter.next('a').value, 'f');
assert.sameValue(iter.next('ab').value, true);
assert.sameValue(iter.next().value, 'g');
assert.sameValue(iter.next('00').value, 'h');
assert.sameValue(iter.next('0').value, true);
assert.sameValue(iter.next().value, 'i');
assert.sameValue(iter.next(NaN).value, 'j');
assert.sameValue(iter.next(NaN).value, false);

// -------------------------------
var iter = function*() {
    yield - (yield 'a');
    yield ~(yield 'b');
    yield !(yield 'c');
    yield(yield 'd') ** (yield 'e');
    yield(yield 'f') - (yield 'g');
    yield(yield 'h') << (yield 'i');
    yield(yield 'h') >> (yield 'i');
    yield(yield 'h') >>> (yield 'i');
}();

assert.sameValue(iter.next().value, 'a');
assert.sameValue(iter.next(10).value, -10);
assert.sameValue(iter.next().value, 'b');
assert.sameValue(iter.next(10).value, -11);
assert.sameValue(iter.next().value, 'c');
assert.sameValue(iter.next(10).value, false);
assert.sameValue(iter.next().value, 'd');
assert.sameValue(iter.next(3).value, 'e');
assert.sameValue(iter.next(4).value, 81);
assert.sameValue(iter.next().value, 'f');
assert.sameValue(iter.next('7').value, 'g');
assert.sameValue(iter.next('4').value, 3);
assert.sameValue(iter.next().value, 'h');
assert.sameValue(iter.next('7').value, 'i');
assert.sameValue(iter.next('4').value, 112);
assert.sameValue(iter.next().value, 'h');
assert.sameValue(iter.next(112).value, 'i');
assert.sameValue(iter.next('5').value, 3);
assert.sameValue(iter.next().value, 'h');
assert.sameValue(iter.next(-1).value, 'i');
assert.sameValue(iter.next(16).value, 0xffff);

// -------------------------------
var iter = function*() {
    var a = yield 'a';
    yield a[yield 'b']++;
    yield a[yield 'c']--;
    yield ++a[yield 'd'];
    yield --a[yield 'e'];
    yield a;
    yield delete a[yield 'f'];
    try {
        yield delete a[yield 'g'];
    } catch (e) {
        yield false; // in strict mode
    }
    yield void a[yield 'h'];
    yield typeof(yield 'i');

}();

var obj = [0, 0, 0, 0];
assert.sameValue(iter.next().value, 'a');
assert.sameValue(iter.next(obj).value, 'b');
assert.sameValue(iter.next(0).value, 0);
assert.sameValue(iter.next().value, 'c');
assert.sameValue(iter.next(1).value, 0);
assert.sameValue(iter.next().value, 'd');
assert.sameValue(iter.next(2).value, 1);
assert.sameValue(iter.next().value, 'e');
assert.sameValue(iter.next(3).value, -1);
assert.sameValue(JSON.stringify(iter.next().value), '[1,-1,1,-1]');
assert.sameValue(iter.next().value, 'f');
assert.sameValue(iter.next(2).value, true);
assert.sameValue('2' in obj, false);
assert.sameValue(iter.next().value, 'g');
assert.sameValue(iter.next('length').value, false);
assert.sameValue(iter.next().value, 'h');
assert.sameValue(iter.next(1).value, undefined);
assert.sameValue(iter.next().value, 'i');
assert.sameValue(iter.next(obj).value, 'object');

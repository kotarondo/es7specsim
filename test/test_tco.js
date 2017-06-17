var callCount = 0;
(function f(n) {
    'use strict';
    if (n > 0) {
        callCount++;
        return f.call(null, n - 1);
    }
})(1000);

assert.sameValue(callCount, 1000);

var callCount = 0;
(function f(n) {
    'use strict';
    if (n > 0) {
        callCount++;
        return f.apply(null, [n - 1]);
    }
})(1000);

assert.sameValue(callCount, 1000);

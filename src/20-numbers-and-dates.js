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

// 20 Numbers and Dates

// 20.1 Number Objects

// 20.1.1 The Number Constructor

// 20.1.1.1

function Number$(value) {
    if (arguments.length === 0) var n = +0;
    else var n = ToNumber(value);
    if (NewTarget === undefined) return n;
    var O = OrdinaryCreateFromConstructor(NewTarget, "%NumberPrototype%", ['NumberData']);
    O.NumberData = n;
    return O;
}

// 20.1.2 Properties of the Number Constructor

// 20.1.2.1 Number.EPSILON

// 20.1.2.2
function Number_isFinite(number) {
    if (Type(number) !== 'Number') return false;
    if (!Number.isFinite(number)) return false;
    else return true;
}

// 20.1.2.3
function Number_isInteger(number) {
    if (Type(number) !== 'Number') return false;
    if (!Number.isFinite(number)) return false;
    var integer = ToInteger(number);
    if (integer !== number) return false;
    else return true;
}

// 20.1.2.4
function Number_isNaN(number) {
    if (Type(number) !== 'Number') return false;
    if (Number.isNaN(number)) return true;
    else return false;
}

// 20.1.2.5
function Number_isSafeInteger(number) {
    if (Type(number) !== 'Number') return false;
    if (!Number.isFinite(number)) return false;
    var integer = ToInteger(number);
    if (integer !== number) return false;
    if (Math.abs(integer) <= 0x1fffffffffffff) return true;
    else return false;
}

// 20.1.2.6 Number.MAX_SAFE_INTEGER

// 20.1.2.7 Number.MAX_VALUE

// 20.1.2.8 Number.MIN_SAFE_INTEGER

// 20.1.2.9 Number.MIN_VALUE

// 20.1.2.10 Number.NaN

// 20.1.2.11 Number.NEGATIVE_INFINITY

// 20.1.2.12 Number.parseFloat ( string )

// 20.1.2.13 Number.parseInt ( string, radix )

// 20.1.2.14 Number.POSITIVE_INFINITY

// 20.1.2.15 Number.prototype

// 20.1.3 Properties of the Number Prototype Object

function thisNumberValue(value) {
    if (Type(value) === 'Number') return value;
    if (Type(value) === 'Object' && 'NumberData' in value) {
        Assert(Type(value.NumberData) === 'Number');
        return value.NumberData;
    }
    throw $TypeError();
}

// 20.1.3.1 Number.prototype.constructor

// 20.1.3.2
function Number_prototype_toExponential(fractionDigits) {
    var x = thisNumberValue(this);
    var f = ToInteger(fractionDigits);
    Assert(f === 0 || fractionDigits !== undefined);
    if (Number.isNaN(x)) return "NaN";
    if (x === +Infinity) return "Infinity";
    if (x === -Infinity) return "-Infinity";
    if (f < 0 || f > 20) throw $RangeError();
    // Here we rely on underlying virtual machine.
    if (fractionDigits === undefined) {
        return x.toExponential();
    } else {
        return x.toExponential(f);
    }
}

// 20.1.3.3
function Number_prototype_toFixed(fractionDigits) {
    var x = thisNumberValue(this);
    var f = ToInteger(fractionDigits);
    if (f < 0 || f > 20) throw $RangeError();
    if (Number.isNaN(x)) return "NaN";
    // Here we rely on underlying virtual machine.
    return x.toFixed(f);
}

// 20.1.3.4
function Number_prototype_toLocaleString(reserved1, reserved2) {
    var x = thisNumberValue(this);
    return x.toLocaleString(); // implementation-dependent
}

// 20.1.3.5
function Number_prototype_toPrecision(precision) {
    var x = thisNumberValue(this);
    if (precision === undefined) return ToString(x);
    var p = ToInteger(precision);
    if (Number.isNaN(x)) return "NaN";
    if (x === +Infinity) return "Infinity";
    if (x === -Infinity) return "-Infinity";
    if (p < 1 || p > 21) throw $RangeError();
    // Here we rely on underlying virtual machine.
    return x.toPrecision(p);
}

// 20.1.3.6
function Number_prototype_toString(radix) {
    var x = thisNumberValue(this);
    if (arguments.length === 0) var radixNumber = 10;
    else if (radix === undefined) var radixNumber = 10;
    else var radixNumber = ToInteger(radix);
    if (radixNumber < 2 || radixNumber > 36) throw $RangeError();
    if (radixNumber === 10) return ToString(x);
    // Here we rely on underlying virtual machine.
    return x.toString(radixNumber);
}

// 20.1.3.7
function Number_prototype_valueOf() {
    return thisNumberValue(this);
}

// 20.1.4 Properties of Number Instances

// 20.2 The Math Object

// 20.2.1 Value Properties of the Math Object

// 20.2.1.1 Math.E

// 20.2.1.2 Math.LN10

// 20.2.1.3 Math.LN2

// 20.2.1.4 Math.LOG10E

// 20.2.1.5 Math.LOG2E

// 20.2.1.6 Math.PI

// 20.2.1.7 Math.SQRT1_2

// 20.2.1.8 Math.SQRT2

// 20.2.1.9 Math [ @@toStringTag ]

// 20.2.2 Function Properties of the Math Object

// 20.2.2.1
function Math_abs(x) {
    x = ToNumber(x);
    return Math.abs(x);
}

// 20.2.2.2
function Math_acos(x) {
    x = ToNumber(x);
    return Math.acos(x);
}

// 20.2.2.3
function Math_acosh(x) {
    x = ToNumber(x);
    return Math.acosh(x);
}

// 20.2.2.4
function Math_asin(x) {
    x = ToNumber(x);
    return Math.asin(x);
}

// 20.2.2.5
function Math_asinh(x) {
    x = ToNumber(x);
    return Math.asinh(x);
}

// 20.2.2.6
function Math_atan(x) {
    x = ToNumber(x);
    return Math.atan(x);
}

// 20.2.2.7
function Math_atanh(x) {
    x = ToNumber(x);
    return Math.atanh(x);
}

// 20.2.2.8
function Math_atan2(y, x) {
    y = ToNumber(y);
    x = ToNumber(x);
    return Math.atan2(y, x);
}

// 20.2.2.9
function Math_cbrt(x) {
    x = ToNumber(x);
    return Math.cbrt(x);
}

// 20.2.2.10
function Math_ceil(x) {
    x = ToNumber(x);
    return Math.ceil(x);
}

// 20.2.2.11
function Math_clz32(x) {
    x = ToNumber(x);
    return Math.clz32(x);
}

// 20.2.2.12
function Math_cos(x) {
    x = ToNumber(x);
    return Math.cos(x);
}

// 20.2.2.13
function Math_cosh(x) {
    x = ToNumber(x);
    return Math.cosh(x);
}

// 20.2.2.14
function Math_exp(x) {
    x = ToNumber(x);
    return Math.exp(x);
}

// 20.2.2.15
function Math_expm1(x) {
    x = ToNumber(x);
    return Math.expm1(x);
}

// 20.2.2.16
function Math_floor(x) {
    x = ToNumber(x);
    return Math.floor(x);
}

// 20.2.2.17
function Math_fround(x) {
    x = ToNumber(x);
    return Math.fround(x);
}

// 20.2.2.18
function Math_hypot(...values) {
    values = values.map(ToNumber);
    return Math.hypot.apply(Math, values);
}

// 20.2.2.19
function Math_imul(x, y) {
    x = ToNumber(x);
    y = ToNumber(y);
    return Math.imul(x, y);
}

// 20.2.2.20
function Math_log(x) {
    x = ToNumber(x);
    return Math.log(x);
}

// 20.2.2.21
function Math_log1p(x) {
    x = ToNumber(x);
    return Math.log1p(x);
}

// 20.2.2.22
function Math_log10(x) {
    x = ToNumber(x);
    return Math.log10(x);
}

// 20.2.2.23
function Math_log2(x) {
    x = ToNumber(x);
    return Math.log2(x);
}
// 20.2.2.24
function Math_max(...values) {
    values = values.map(ToNumber);
    return Math.max.apply(Math, values);
}

// 20.2.2.25
function Math_min(...values) {
    values = values.map(ToNumber);
    return Math.min.apply(Math, values);
}

// 20.2.2.26
function Math_pow(base, exponent) {
    base = ToNumber(base);
    exponent = ToNumber(exponent);
    return Math.pow(base, exponent);
}

// 20.2.2.27
function Math_random() {
    return Math.random();
}

// 20.2.2.28
function Math_round(x) {
    x = ToNumber(x);
    return Math.round(x);
}

// 20.2.2.29
function Math_sign(x) {
    x = ToNumber(x);
    return Math.sign(x);
}

// 20.2.2.30
function Math_sin(x) {
    x = ToNumber(x);
    return Math.sin(x);
}

// 20.2.2.31
function Math_sinh(x) {
    x = ToNumber(x);
    return Math.sinh(x);
}

// 20.2.2.32
function Math_sqrt(x) {
    x = ToNumber(x);
    return Math.sqrt(x);
}

// 20.2.2.33
function Math_tan(x) {
    x = ToNumber(x);
    return Math.tan(x);
}

// 20.2.2.34
function Math_tanh(x) {
    x = ToNumber(x);
    return Math.tanh(x);
}

// 20.2.2.35
function Math_trunc(x) {
    x = ToNumber(x);
    return Math.trunc(x);
}

// 20.3 Date Objects

// 20.3.1 Overview of Date Objects and Definitions of Abstract Operations

// 20.3.1.1 Time Values and Time Range

// 20.3.1.2 Day Number and Time within Day

function Day(t) {
    return Math.floor(t / msPerDay);
}

const msPerDay = 86400000;

function TimeWithinDay(t) {
    return modulo(t, msPerDay);
}

// 20.3.1.3 Year Number

function DaysInYear(y) {
    if (modulo(y, 4) !== 0) return 365;
    if (modulo(y, 100) !== 0) return 366;
    if (modulo(y, 400) !== 0) return 365;
    return 366;
}

function DayFromYear(y) {
    return 365 * (y - 1970) + Math.floor((y - 1969) / 4) - Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400);
}

function TimeFromYear(y) {
    return msPerDay * DayFromYear(y);
}

function YearFromTime(t) {
    var y = Math.floor(Day(t) / 365.2425);
    if (TimeFromYear(y) <= t) {
        while (TimeFromYear(y + 1) <= t) {
            y = y + 1;
        }
        return y;
    }
    y = y - 1;
    while (TimeFromYear(y) > t) {
        y = y - 1;
    }
    return y;
}

function InLeapYear(t) {
    if (DaysInYear(YearFromTime(t)) === 365) return 0;
    return 1;
}

// 20.3.1.4 Month Number

function MonthFromTime(t) {
    var dayWithinYear = DayWithinYear(t);
    var inLeapYear = InLeapYear(t);
    if (dayWithinYear < 31) return 0;
    if (dayWithinYear < 59 + inLeapYear) return 1;
    if (dayWithinYear < 90 + inLeapYear) return 2;
    if (dayWithinYear < 120 + inLeapYear) return 3;
    if (dayWithinYear < 151 + inLeapYear) return 4;
    if (dayWithinYear < 181 + inLeapYear) return 5;
    if (dayWithinYear < 212 + inLeapYear) return 6;
    if (dayWithinYear < 243 + inLeapYear) return 7;
    if (dayWithinYear < 273 + inLeapYear) return 8;
    if (dayWithinYear < 304 + inLeapYear) return 9;
    if (dayWithinYear < 334 + inLeapYear) return 10;
    if (dayWithinYear < 365 + inLeapYear) return 11;
}

function DayWithinYear(t) {
    return Day(t) - DayFromYear(YearFromTime(t));
}

// 20.3.1.5 Date Number

function DateFromTime(t) {
    var monthFromTime = MonthFromTime(t);
    if (monthFromTime === 0) return DayWithinYear(t) + 1;
    if (monthFromTime === 1) return DayWithinYear(t) - 30;
    if (monthFromTime === 2) return DayWithinYear(t) - 58 - InLeapYear(t);
    if (monthFromTime === 3) return DayWithinYear(t) - 89 - InLeapYear(t);
    if (monthFromTime === 4) return DayWithinYear(t) - 119 - InLeapYear(t);
    if (monthFromTime === 5) return DayWithinYear(t) - 150 - InLeapYear(t);
    if (monthFromTime === 6) return DayWithinYear(t) - 180 - InLeapYear(t);
    if (monthFromTime === 7) return DayWithinYear(t) - 211 - InLeapYear(t);
    if (monthFromTime === 8) return DayWithinYear(t) - 242 - InLeapYear(t);
    if (monthFromTime === 9) return DayWithinYear(t) - 272 - InLeapYear(t);
    if (monthFromTime === 10) return DayWithinYear(t) - 303 - InLeapYear(t);
    if (monthFromTime === 11) return DayWithinYear(t) - 333 - InLeapYear(t);
}

// 20.3.1.6 Week Day

function WeekDay(t) {
    return modulo((Day(t) + 4), 7);
}

// 20.3.1.7 Local Time Zone Adjustment

// 20.3.1.8 Daylight Saving Time Adjustment

// 20.3.1.9
function LocalTime(t) {
    // return t + LocalTZA + DaylightSavingTA(t);
    // use underlying virtual machines.
    return t - (new Date(t)).getTimezoneOffset() * msPerMinute;
}

// 20.3.1.10
function UTC(t) {
    // return t - LocalTZA - DaylightSavingTA(t - LocalTZA);
    // use underlying virtual machines.
    return (new Date(1970, 0, 1, 0, 0, 0, t)).valueOf();
}

// 20.3.1.11 Hours, Minutes, Second, and Milliseconds

function HourFromTime(t) {
    return modulo(Math.floor(t / msPerHour), HoursPerDay);
}

function MinFromTime(t) {
    return modulo(Math.floor(t / msPerMinute), MinutesPerHour);
}

function SecFromTime(t) {
    return modulo(Math.floor(t / msPerSecond), SecondsPerMinute);
}

function msFromTime(t) {
    return modulo(t, msPerSecond);
}

const HoursPerDay = 24;
const MinutesPerHour = 60;
const SecondsPerMinute = 60;
const msPerSecond = 1000;
const msPerMinute = 60000;
const msPerHour = 3600000;

// 20.3.1.12
function MakeTime(hour, min, sec, ms) {
    if (!(Number.isFinite(hour) && Number.isFinite(min) && Number.isFinite(sec) && Number.isFinite(ms))) return NaN;
    var h = ToInteger(hour);
    var m = ToInteger(min);
    var s = ToInteger(sec);
    var milli = ToInteger(ms);
    var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
    return t;
}

// 20.3.1.13
function MakeDay(year, month, date) {
    if (!(Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(date))) return NaN;
    var y = ToInteger(year);
    var m = ToInteger(month);
    var dt = ToInteger(date);
    var ym = y + Math.floor(m / 12);
    var mn = modulo(m, 12);
    var t = TimeFromYear(ym);
    if (mn === 1) t += msPerHour * HoursPerDay * 31;
    if (mn === 2) t += msPerHour * HoursPerDay * (59 + InLeapYear(t));
    if (mn === 3) t += msPerHour * HoursPerDay * (90 + InLeapYear(t));
    if (mn === 4) t += msPerHour * HoursPerDay * (120 + InLeapYear(t));
    if (mn === 5) t += msPerHour * HoursPerDay * (151 + InLeapYear(t));
    if (mn === 6) t += msPerHour * HoursPerDay * (181 + InLeapYear(t));
    if (mn === 7) t += msPerHour * HoursPerDay * (212 + InLeapYear(t));
    if (mn === 8) t += msPerHour * HoursPerDay * (243 + InLeapYear(t));
    if (mn === 9) t += msPerHour * HoursPerDay * (273 + InLeapYear(t));
    if (mn === 10) t += msPerHour * HoursPerDay * (304 + InLeapYear(t));
    if (mn === 11) t += msPerHour * HoursPerDay * (334 + InLeapYear(t));
    if (!(YearFromTime(t) === ym && MonthFromTime(t) === mn && DateFromTime(t) === 1)) return NaN;
    return Day(t) + dt - 1;
}

// 20.3.1.14
function MakeDate(day, time) {
    if (!(Number.isFinite(day) && Number.isFinite(time))) return NaN;
    return day * msPerDay + time;
}

// 20.3.1.15
function TimeClip(time) {
    if (!Number.isFinite(time)) return NaN;
    if (Math.abs(time) > 8.64e15) return NaN;
    var clippedTime = ToInteger(time);
    if (is_negative_zero(clippedTime)) var clippedTime = +0;
    return clippedTime;
}

// 20.3.1.16 Date Time String Format

// 20.3.1.16.1 Extended Years

// 20.3.2 The Date Constructor

function Date$() {
    switch (arguments.length) {
        case 0:
            return Date$3.apply(this, arguments);
        case 1:
            return Date$2.apply(this, arguments);
        default:
            return Date$1.apply(this, arguments);
    }
}

// 20.3.2.1
function Date$1(year, month, date, hours, minutes, seconds, ms) {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs >= 2);
    if (NewTarget !== undefined) {
        var y = ToNumber(year);
        var m = ToNumber(month);
        if (arguments.length >= 3) var dt = ToNumber(date);
        else var dt = 1;
        if (arguments.length >= 4) var h = ToNumber(hours);
        else var h = 0;
        if (arguments.length >= 5) var min = ToNumber(minutes);
        else var min = 0;
        if (arguments.length >= 6) var s = ToNumber(seconds);
        else var s = 0;
        if (arguments.length >= 7) var milli = ToNumber(ms);
        else var milli = 0;
        if (!Number.isNaN(y) && 0 <= ToInteger(y) && ToInteger(y) <= 99) var yr = 1900 + ToInteger(y);
        else var yr = y;
        var finalDate = MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli));
        var O = OrdinaryCreateFromConstructor(NewTarget, "%DatePrototype%", ['DateValue']);
        O.DateValue = TimeClip(UTC(finalDate));
        return O;
    } else {
        var now = Date.now();
        return ToDateString(now);
    }
}

// 20.3.2.2
function Date$2(value) {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs === 1);
    if (NewTarget !== undefined) {
        if (Type(value) === 'Object' && 'DateValue' in value) {
            var tv = thisTimeValue(value);
        } else {
            var v = ToPrimitive(value);
            if (Type(v) === 'String') {
                var tv = Date.parse(v);
            } else {
                var tv = ToNumber(v);
            }
        }
        var O = OrdinaryCreateFromConstructor(NewTarget, "%DatePrototype%", ['DateValue']);
        O.DateValue = TimeClip(tv);
        return O;
    } else {
        var now = Date.now();
        return ToDateString(now);
    }
}

// 20.3.2.3
function Date$3() {
    var numberOfArgs = arguments.length;
    Assert(numberOfArgs === 0);
    if (NewTarget !== undefined) {
        var O = OrdinaryCreateFromConstructor(NewTarget, "%DatePrototype%", ['DateValue']);
        O.DateValue = Date.now();
        return O;
    } else {
        var now = Date.now();
        return ToDateString(now);
    }
}

// 20.3.3 Properties of the Date Constructor

// 20.3.3.1
function Date_now() {
    return Date.now();
}

// 20.3.3.2
function Date_parse(string) {
    var s = ToString(string);
    return Date.parse(s);
}

// 20.3.3.3 Date.prototype

// 20.3.3.4
function Date_UTC(year, month, date, hours, minutes, seconds, ms) {
    var y = ToNumber(year);
    if (STRICT_CONFORMANCE) {
        var m = ToNumber(month);
    } else {
        if (arguments.length >= 2) var m = ToNumber(month);
        else var m = 0;
    }
    if (arguments.length >= 3) var dt = ToNumber(date);
    else var dt = 1;
    if (arguments.length >= 4) var h = ToNumber(hours);
    else var h = 0;
    if (arguments.length >= 5) var min = ToNumber(minutes);
    else var min = 0;
    if (arguments.length >= 6) var s = ToNumber(seconds);
    else var s = 0;
    if (arguments.length >= 7) var milli = ToNumber(ms);
    else var milli = 0;
    if (!Number.isNaN(y) && 0 <= ToInteger(y) && ToInteger(y) <= 99) var yr = 1900 + ToInteger(y);
    else var yr = y;
    return TimeClip(MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli)));
}

// 20.3.4 Properties of the Date Prototype Object

function thisTimeValue(value) {
    if (Type(value) === 'Object' && 'DateValue' in value) {
        return value.DateValue;
    }
    throw $TypeError();
}

// 20.3.4.1 Date.prototype.constructor

// 20.3.4.2
function Date_prototype_getDate() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return DateFromTime(LocalTime(t));
}

// 20.3.4.3
function Date_prototype_getDay() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return WeekDay(LocalTime(t));
}

// 20.3.4.4
function Date_prototype_getFullYear() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return YearFromTime(LocalTime(t));
}

// 20.3.4.5
function Date_prototype_getHours() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return HourFromTime(LocalTime(t));
}

// 20.3.4.6
function Date_prototype_getMilliseconds() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return msFromTime(LocalTime(t));
}

// 20.3.4.7
function Date_prototype_getMinutes() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return MinFromTime(LocalTime(t));
}

// 20.3.4.8
function Date_prototype_getMonth() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return MonthFromTime(LocalTime(t));
}

// 20.3.4.9
function Date_prototype_getSeconds() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return SecFromTime(LocalTime(t));
}

// 20.3.4.10
function Date_prototype_getTime() {
    return thisTimeValue(this);
}

// 20.3.4.11
function Date_prototype_getTimezoneOffset() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return (t - LocalTime(t)) / msPerMinute;
}

// 20.3.4.12
function Date_prototype_getUTCDate() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return DateFromTime(t);
}

// 20.3.4.13
function Date_prototype_getUTCDay() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return WeekDay(t);
}

// 20.3.4.14
function Date_prototype_getUTCFullYear() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return YearFromTime(t);
}

// 20.3.4.15
function Date_prototype_getUTCHours() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return HourFromTime(t);
}

// 20.3.4.16
function Date_prototype_getUTCMilliseconds() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return msFromTime(t);
}

// 20.3.4.17
function Date_prototype_getUTCMinutes() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return MinFromTime(t);
}

// 20.3.4.18
function Date_prototype_getUTCMonth() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return MonthFromTime(t);
}

// 20.3.4.19
function Date_prototype_getUTCSeconds() {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) return NaN;
    return SecFromTime(t);
}

// 20.3.4.20
function Date_prototype_setDate(date) {
    var t = LocalTime(thisTimeValue(this));
    var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
    var u = TimeClip(UTC(newDate));
    this.DateValue = u;
    return u;
}

// 20.3.4.21
function Date_prototype_setFullYear(year, month, date) {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) var t = +0;
    else var t = LocalTime(t);
    var y = ToNumber(year);
    if (arguments.length <= 1) var m = MonthFromTime(t);
    else var m = ToNumber(month);
    if (arguments.length <= 2) var dt = DateFromTime(t);
    else var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(y, m, dt), TimeWithinDay(t));
    var u = TimeClip(UTC(newDate));
    this.DateValue = u;
    return u;
}

// 20.3.4.22
function Date_prototype_setHours(hour, min, sec, ms) {
    var t = LocalTime(thisTimeValue(this));
    var h = ToNumber(hour);
    if (arguments.length <= 1) var m = MinFromTime(t);
    else var m = ToNumber(min);
    if (arguments.length <= 2) var s = SecFromTime(t);
    else var s = ToNumber(sec);
    if (arguments.length <= 3) var milli = msFromTime(t);
    else var milli = ToNumber(ms);
    var date = MakeDate(Day(t), MakeTime(h, m, s, milli));
    var u = TimeClip(UTC(date));
    this.DateValue = u;
    return u;
}

// 20.3.4.23
function Date_prototype_setMilliseconds(ms) {
    var t = LocalTime(thisTimeValue(this));
    var ms = ToNumber(ms);
    var time = MakeTime(HourFromTime(t), MinFromTime(t), SecFromTime(t), ms);
    var u = TimeClip(UTC(MakeDate(Day(t), time)));
    this.DateValue = u;
    return u;
}

// 20.3.4.24
function Date_prototype_setMinutes(min, sec, ms) {
    var t = LocalTime(thisTimeValue(this));
    var m = ToNumber(min);
    if (arguments.length <= 1) var s = SecFromTime(t);
    else var s = ToNumber(sec);
    if (arguments.length <= 2) var milli = msFromTime(t);
    else var milli = ToNumber(ms);
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), m, s, milli));
    var u = TimeClip(UTC(date));
    this.DateValue = u;
    return u;
}

// 20.3.4.25
function Date_prototype_setMonth(month, date) {
    var t = LocalTime(thisTimeValue(this));
    var m = ToNumber(month);
    if (arguments.length <= 1) var dt = DateFromTime(t);
    else var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), m, dt), TimeWithinDay(t));
    var u = TimeClip(UTC(newDate));
    this.DateValue = u;
    return u;
}

// 20.3.4.26
function Date_prototype_setSeconds(sec, ms) {
    var t = LocalTime(thisTimeValue(this));
    var s = ToNumber(sec);
    if (arguments.length <= 1) var milli = msFromTime(t);
    else var milli = ToNumber(ms);
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), MinFromTime(t), s, milli));
    var u = TimeClip(UTC(date));
    this.DateValue = u;
    return u;
}

// 20.3.4.27
function Date_prototype_setTime(time) {
    thisTimeValue(this);
    var t = ToNumber(time);
    var v = TimeClip(t);
    this.DateValue = v;
    return v;
}

// 20.3.4.28
function Date_prototype_setUTCDate(date) {
    var t = thisTimeValue(this);
    var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    this.DateValue = v;
    return v;
}

// 20.3.4.29
function Date_prototype_setUTCFullYear(year, month, date) {
    var t = thisTimeValue(this);
    if (Number.isNaN(t)) var t = +0;
    var y = ToNumber(year);
    if (arguments.length <= 1) var m = MonthFromTime(t);
    else var m = ToNumber(month);
    if (arguments.length <= 2) var dt = DateFromTime(t);
    else var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(y, m, dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    this.DateValue = v;
    return v;
}

// 20.3.4.30
function Date_prototype_setUTCHours(hour, min, sec, ms) {
    var t = thisTimeValue(this);
    var h = ToNumber(hour);
    if (arguments.length <= 1) var m = MinFromTime(t);
    else var m = ToNumber(min);
    if (arguments.length <= 2) var s = SecFromTime(t);
    else var s = ToNumber(sec);
    if (arguments.length <= 3) var milli = msFromTime(t);
    else var milli = ToNumber(ms);
    var newDate = MakeDate(Day(t), MakeTime(h, m, s, milli));
    var v = TimeClip(newDate);
    this.DateValue = v;
    return v;
}

// 20.3.4.31
function Date_prototype_setUTCMilliseconds(ms) {
    var t = thisTimeValue(this);
    var milli = ToNumber(ms);
    var time = MakeTime(HourFromTime(t), MinFromTime(t), SecFromTime(t), milli);
    var v = TimeClip(MakeDate(Day(t), time));
    this.DateValue = v;
    return v;
}

// 20.3.4.32
function Date_prototype_setUTCMinutes(min, sec, ms) {
    var t = thisTimeValue(this);
    var m = ToNumber(min);
    if (arguments.length <= 1) var s = SecFromTime(t);
    else
        var s = ToNumber(sec);
    if (arguments.length <= 2) var milli = msFromTime(t);
    else
        var milli = ToNumber(ms);
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), m, s, milli));
    var v = TimeClip(date);
    this.DateValue = v;
    return v;
}

// 20.3.4.33
function Date_prototype_setUTCMonth(month, date) {
    var t = thisTimeValue(this);
    var m = ToNumber(month);
    if (arguments.length <= 1) var dt = DateFromTime(t);
    else
        var dt = ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), m, dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    this.DateValue = v;
    return v;
}

// 20.3.4.34
function Date_prototype_setUTCSeconds(sec, ms) {
    var t = thisTimeValue(this);
    var s = ToNumber(sec);
    if (arguments.length <= 1) var milli = msFromTime(t);
    else
        var milli = ToNumber(ms);
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), MinFromTime(t), s, milli));
    var v = TimeClip(date);
    this.DateValue = v;
    return v;
}

// 20.3.4.35
function Date_prototype_toDateString() {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toDateString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.36
function Date_prototype_toISOString() {
    var t = thisTimeValue(this);
    // Here we rely on underlying virtual machine.
    try {
        return (new Date(t)).toISOString();
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.37
function Date_prototype_toJSON(key) {
    var O = ToObject(this);
    var tv = ToPrimitive(O, 'hint Number');
    if (Type(tv) === 'Number' && !Number.isFinite(tv)) return null;
    return Invoke(O, "toISOString");
}

// 20.3.4.38
function Date_prototype_toLocaleDateString(reserved1, reserved2) {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toLocaleDateString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.39
function Date_prototype_toLocaleString(reserved1, reserved2) {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toLocaleString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.40
function Date_prototype_toLocaleTimeString(reserved1, reserved2) {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toLocaleString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.41
function Date_prototype_toString() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('DateValue' in O)) {
        var tv = NaN;
    } else {
        var tv = thisTimeValue(O);
        return ToDateString(tv);
    }
}

// 20.3.4.41.1
function ToDateString(tv) {
    Assert(Type(tv) === 'Number');
    if (Number.isNaN(tv)) return "Invalid Date";
    try {
        return (new Date(tv)).toString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.42
function Date_prototype_toTimeString() {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toTimeString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.43
function Date_prototype_toUTCString() {
    var t = thisTimeValue(this);
    try {
        return (new Date(t)).toUTCString(); // implementation-dependent
    } catch (e) {
        throw $RangeError();
    }
}

// 20.3.4.44
function Date_prototype_valueOf() {
    return thisTimeValue(this);
}

// 20.3.4.45 Date.prototype [ @@toPrimitive ] ( hint )
function Date_prototype_toPrimitive(hint) {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (hint === "string" || hint === "default") {
        var tryFirst = "string";
    } else if (hint === "number") {
        var tryFirst = "number";
    } else throw $TypeError();
    return OrdinaryToPrimitive(O, tryFirst);
}

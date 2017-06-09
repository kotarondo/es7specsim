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

// 23 Keyed Collection

// 23.1 Map Objects

// 23.1.1 The Map Constructor

// 23.1.1.1
function Map$(iterable) {
    if (NewTarget === undefined) throw $TypeError();
    var map = OrdinaryCreateFromConstructor(NewTarget, "%MapPrototype%", ['MapData']);
    map.MapData = [];
    if (iterable === undefined || iterable === null) var iter = undefined;
    else {
        var adder = Get(map, "set");
        if (IsCallable(adder) === false) throw $TypeError();
        var iter = GetIterator(iterable);
    }
    if (iter === undefined) return map;
    while (true) {
        var next = IteratorStep(iter);
        if (next === false) return map;
        var nextItem = IteratorValue(next);
        if (Type(nextItem) !== 'Object') {
            var error = Completion({ Type: 'throw', Value: $TypeError(), Target: empty });
            return IteratorClose(iter, error);
        }
        var k = concreteCompletion(Get(nextItem, "0"));
        if (k.is_an_abrupt_completion()) return IteratorClose(iter, k);
        var v = concreteCompletion(Get(nextItem, "1"));
        if (v.is_an_abrupt_completion()) return IteratorClose(iter, v);
        var status = concreteCompletion(Call(adder, map, [k.Value, v.Value]));
        if (status.is_an_abrupt_completion()) return IteratorClose(iter, status);
    }
}

// 23.1.2 Properties of the Map Constructor

// 23.1.2.1 Map.prototype

// 23.1.2.2 get Map [ @@species ]
function get_Map_species() {
    return this;
}

// 23.1.3 Properties of the Map Prototype Object

// 23.1.3.1
function Map_prototype_clear() {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    for (var p of entries) {
        p.Key = empty;
        p.Value = empty;
    }
    return undefined;
}

// 23.1.3.2 Map.prototype.constructor

// 23.1.3.3
function Map_prototype_delete(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    for (var p of entries) {
        if (p.Key !== empty && SameValueZero(p.Key, key) === true) {
            p.Key = empty;
            p.Value = empty;
            return true;
        }
    }
    return false;
}

// 23.1.3.4
function Map_prototype_entries() {
    var M = this;
    return CreateMapIterator(M, "key+value");
}

// 23.1.3.5
function Map_prototype_forEach(callbackfn, thisArg) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var entries = M.MapData;
    for (var e of entries) {
        if (e.Key !== empty) {
            Call(callbackfn, T, [e.Value, e.Key, M]);
        }
    }
    return undefined;
}
//length === 1

// 23.1.3.6
function Map_prototype_get(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    for (var p of entries) {
        if (p.Key !== empty && SameValueZero(p.Key, key) === true) return p.Value;
    }
    return undefined;
}

// 23.1.3.7
function Map_prototype_has(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    for (var p of entries) {
        if (p.Key !== empty && SameValueZero(p.Key, key) === true) return true;
    }
    return false;
}

// 23.1.3.8
function Map_prototype_keys() {
    var M = this;
    return CreateMapIterator(M, "key");
}

// 23.1.3.9
function Map_prototype_set(key, value) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    for (var p of entries) {
        if (p.Key !== empty && SameValueZero(p.Key, key) === true) {
            p.Value = value;
            return M;
        }
    }
    if (is_negative_zero(key)) var key = +0;
    var p = Record({ Key: key, Value: value });
    entries.push(p);
    return M;
}

// 23.1.3.10
function get_Map_prototype_size() {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('MapData' in M)) throw $TypeError();
    var entries = M.MapData;
    var count = 0;
    for (var p of entries) {
        if (p.Key !== empty) count = count + 1;
    }
    return count;
}

// 23.1.3.11
function Map_prototype_values() {
    var M = this;
    return CreateMapIterator(M, "value");
}

// 23.1.3.12 Map.prototype [ @@iterator ] ( )

// 23.1.3.13 Map.prototype [ @@toStringTag ]

// 23.1.4 Properties of Map Instances

// 23.1.5 Map Iterator Objects

// 23.1.5.1
function CreateMapIterator(map, kind) {
    if (Type(map) !== 'Object') throw $TypeError();
    if (!('MapData' in map)) throw $TypeError();
    var iterator = ObjectCreate(currentRealm.Intrinsics['%MapIteratorPrototype%'], ['Map', 'MapNextIndex', 'MapIterationKind']);
    iterator.Map = map;
    iterator.MapNextIndex = 0;
    iterator.MapIterationKind = kind;
    return iterator;
}

// 23.1.5.2 The %MapIteratorPrototype% Object

// 23.1.5.2.1 %MapIteratorPrototype%.next ( )
function MapIteratorPrototype_next() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('Map' in O && 'MapNextIndex' in O && 'MapIterationKind' in O)) throw $TypeError();
    var m = O.Map;
    var index = O.MapNextIndex;
    var itemKind = O.MapIterationKind;
    if (m === undefined) return CreateIterResultObject(undefined, true);
    Assert('MapData' in m);
    var entries = m.MapData;
    while (index < entries.length) {
        var e = entries[index];
        index = index + 1;
        O.MapNextIndex = index;
        if (e.Key !== empty) {
            if (itemKind === "key") var result = e.Key;
            else if (itemKind === "value") var result = e.Value;
            else {
                Assert(itemKind === "key+value");
                var result = CreateArrayFromList([e.Key, e.Value]);
            }
            return CreateIterResultObject(result, false);
        }
    }
    O.Map = undefined;
    return CreateIterResultObject(undefined, true);
}

// 23.1.5.2.2 %MapIteratorPrototype% [ @@toStringTag ]

// 23.1.5.3 Properties of Map Iterator Instances

// 23.2 Set Objects

// 23.2.1 The Set Constructor

// 23.2.1.1
function Set$(iterable) {
    if (NewTarget === undefined) throw $TypeError();
    var set = OrdinaryCreateFromConstructor(NewTarget, "%SetPrototype%", ['SetData']);
    set.SetData = [];
    if (iterable === undefined || iterable === null) var iter = undefined;
    else {
        var adder = Get(set, "add");
        if (IsCallable(adder) === false) throw $TypeError();
        var iter = GetIterator(iterable);
    }
    if (iter === undefined) return set;
    while (true) {
        var next = IteratorStep(iter);
        if (next === false) return set;
        var nextValue = IteratorValue(next);
        var status = concreteCompletion(Call(adder, set, [nextValue]));
        if (status.is_an_abrupt_completion()) return IteratorClose(iter, status);
    }
}

// 23.2.2 Properties of the Set Constructor

// 23.2.2.1 Set.prototype

// 23.2.2.2 get Set [ @@species ]
function get_Set_species() {
    return this;
}

// 23.2.3 Properties of the Set Prototype Object

// 23.2.3.1
function Set_prototype_add(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    var entries = S.SetData;
    for (var e of entries) {
        if (e !== empty && SameValueZero(e, value) === true) {
            return S;
        }
    }
    if (is_negative_zero(value)) var value = +0;
    entries.push(value);
    return S;
}

// 23.2.3.2
function Set_prototype_clear() {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    var entries = S.SetData;
    for (var i in entries) {
        entries[i] = empty;
    }
    return undefined;
}

// 23.2.3.3 Set.prototype.constructor

// 23.2.3.4
function Set_prototype_delete(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    var entries = S.SetData;
    for (var i in entries) {
        var e = entries[i];
        if (e !== empty && SameValueZero(e, value) === true) {
            entries[i] = empty;
            return true;
        }
    }
    return false;
}

// 23.2.3.5
function Set_prototype_entries() {
    var S = this;
    return CreateSetIterator(S, "key+value");
}

// 23.2.3.6
function Set_prototype_forEach(callbackfn, thisArg) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    if (IsCallable(callbackfn) === false) throw $TypeError();
    var T = thisArg;
    var entries = S.SetData;
    for (var e of entries) {
        if (e !== empty) {
            Call(callbackfn, T, [e, e, S]);
        }
    }
    return undefined;
}
//length ===1

// 23.2.3.7
function Set_prototype_has(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    var entries = S.SetData;
    for (var e of entries) {
        if (e !== empty && SameValueZero(e, value) === true) return true;
    }
    return false;
}

// 23.2.3.8 Set.prototype.keys ( )

// 23.2.3.9
function get_Set_prototype_size() {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('SetData' in S)) throw $TypeError();
    var entries = S.SetData;
    var count = 0;
    for (var e of entries) {
        if (e !== empty) count = count + 1;
    }
    return count;
}

// 23.2.3.10
function Set_prototype_values() {
    var S = this;
    return CreateSetIterator(S, "value");
}

// 23.2.3.11 Set.prototype [ @@iterator ] ( )

// 23.2.3.12 Set.prototype [ @@toStringTag ]

// 23.2.4 Properties of Set Instances

// 23.2.5 Set Iterator Objects

// 23.2.5.1
function CreateSetIterator(set, kind) {
    if (Type(set) !== 'Object') throw $TypeError();
    if (!('SetData' in set)) throw $TypeError();
    var iterator = ObjectCreate(currentRealm.Intrinsics['%SetIteratorPrototype%'], ['IteratedSet', 'SetNextIndex', 'SetIterationKind']);
    iterator.IteratedSet = set;
    iterator.SetNextIndex = 0;
    iterator.SetIterationKind = kind;
    return iterator;
}

// 23.2.5.2 The %SetIteratorPrototype% Object

// 23.2.5.2.1 %SetIteratorPrototype%.next ( )
function SetIteratorPrototype_next() {
    var O = this;
    if (Type(O) !== 'Object') throw $TypeError();
    if (!('IteratedSet' in O && 'SetNextIndex' in O && 'SetIterationKind' in O)) throw $TypeError();
    var s = O.IteratedSet;
    var index = O.SetNextIndex;
    var itemKind = O.SetIterationKind;
    if (s === undefined) return CreateIterResultObject(undefined, true);
    Assert('SetData' in s);
    var entries = s.SetData;
    while (index < entries.length) {
        var e = entries[index];
        index = index + 1;
        O.SetNextIndex = index;
        if (e !== empty) {
            if (itemKind === "key+value") {
                return CreateIterResultObject(CreateArrayFromList([e, e]), false);
            }
            return CreateIterResultObject(e, false);
        }
    }
    O.IteratedSet = undefined;
    return CreateIterResultObject(undefined, true);
}

// 23.2.5.2.2 %SetIteratorPrototype% [ @@toStringTag ]

// 23.2.5.3 Properties of Set Iterator Instances

// 23.3 WeakMap Objects

// 23.3.1 The WeakMap Constructor

// 23.3.1.1
function WeakMap$(iterable) {
    if (NewTarget === undefined) throw $TypeError();
    var map = OrdinaryCreateFromConstructor(NewTarget, "%WeakMapPrototype%", ['WeakMapData']);
    map.WeakMapData = new WeakMap();
    if (iterable === undefined || iterable === null) var iter = undefined;
    else {
        var adder = Get(map, "set");
        if (IsCallable(adder) === false) throw $TypeError();
        var iter = GetIterator(iterable);
    }
    if (iter === undefined) return map;
    while (true) {
        var next = IteratorStep(iter);
        if (next === false) return map;
        var nextItem = IteratorValue(next);
        if (Type(nextItem) !== 'Object') {
            var error = Completion({ Type: 'throw', Value: $TypeError(), Target: empty });
            return IteratorClose(iter, error);
        }
        var k = concreteCompletion(Get(nextItem, "0"));
        if (k.is_an_abrupt_completion()) return IteratorClose(iter, k);
        var v = concreteCompletion(Get(nextItem, "1"));
        if (v.is_an_abrupt_completion()) return IteratorClose(iter, v);
        var status = concreteCompletion(Call(adder, map, [k.Value, v.Value]));
        if (status.is_an_abrupt_completion()) return IteratorClose(iter, status);
    }
}

// 23.3.2 Properties of the WeakMap Constructor

// 23.3.2.1 WeakMap.prototype

// 23.3.3 Properties of the WeakMap Prototype Object

// 23.3.3.1 WeakMap.prototype.constructor

// 23.3.3.2
function WeakMap_prototype_delete(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('WeakMapData' in M)) throw $TypeError();
    var entries = M.WeakMapData;
    if (Type(key) !== 'Object') return false;
    // Here we rely on underlying virtual machine.
    return entries.delete(key);
}

// 23.3.3.3
function WeakMap_prototype_get(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('WeakMapData' in M)) throw $TypeError();
    var entries = M.WeakMapData;
    if (Type(key) !== 'Object') return undefined;
    // Here we rely on underlying virtual machine.
    return entries.get(key);
}

// 23.3.3.4
function WeakMap_prototype_has(key) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('WeakMapData' in M)) throw $TypeError();
    var entries = M.WeakMapData;
    if (Type(key) !== 'Object') return false;
    // Here we rely on underlying virtual machine.
    return entries.has(key);
}

// 23.3.3.5
function WeakMap_prototype_set(key, value) {
    var M = this;
    if (Type(M) !== 'Object') throw $TypeError();
    if (!('WeakMapData' in M)) throw $TypeError();
    var entries = M.WeakMapData;
    if (Type(key) !== 'Object') throw $TypeError();
    // Here we rely on underlying virtual machine.
    entries.set(key, value);
    return M;
}

// 23.3.3.6 WeakMap.prototype [ @@toStringTag ]

// 23.3.4 Properties of WeakMap Instances

// 23.4 WeakSet Objects

// 23.4.1 The WeakSet Constructor

// 23.4.1.1
function WeakSet$(iterable) {
    if (NewTarget === undefined) throw $TypeError();
    var set = OrdinaryCreateFromConstructor(NewTarget, "%WeakSetPrototype%", ['WeakSetData']);
    set.WeakSetData = new WeakSet();
    if (iterable === undefined || iterable === null) var iter = undefined;
    else {
        var adder = Get(set, "add");
        if (IsCallable(adder) === false) throw $TypeError();
        var iter = GetIterator(iterable);
    }
    if (iter === undefined) return set;
    while (true) {
        var next = IteratorStep(iter);
        if (next === false) return set;
        var nextValue = IteratorValue(next);
        var status = concreteCompletion(Call(adder, set, [nextValue]));
        if (status.is_an_abrupt_completion()) return IteratorClose(iter, status);
    }
}

// 23.4.2 Properties of the WeakSet Constructor

// 23.4.2.1 WeakSet.prototype

// 23.4.3 Properties of the WeakSet Prototype Object

// 23.4.3.1
function WeakSet_prototype_add(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('WeakSetData' in S)) throw $TypeError();
    if (Type(value) !== 'Object') throw $TypeError();
    var entries = S.WeakSetData;
    // Here we rely on underlying virtual machine.
    entries.add(value);
    return S;
}

// 23.4.3.2 WeakSet.prototype.constructor

// 23.4.3.3
function WeakSet_prototype_delete(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('WeakSetData' in S)) throw $TypeError();
    if (Type(value) !== 'Object') return false;
    var entries = S.WeakSetData;
    // Here we rely on underlying virtual machine.
    return entries.delete(value);
}

// 23.4.3.4
function WeakSet_prototype_has(value) {
    var S = this;
    if (Type(S) !== 'Object') throw $TypeError();
    if (!('WeakSetData' in S)) throw $TypeError();
    var entries = S.WeakSetData;
    if (Type(value) !== 'Object') return false;
    // Here we rely on underlying virtual machine.
    return entries.has(value);
}

// 23.4.3.5 WeakSet.prototype [ @@toStringTag ]

// 23.4.4 Properties of WeakSet Instances

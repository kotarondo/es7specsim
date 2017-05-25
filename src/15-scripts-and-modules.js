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

// 15 ECMAScript Language: Scripts and Modules

// 15.1 Scripts

Syntax([
    'Script: ScriptBody[opt]',
    'ScriptBody: StatementList',
]);

// 15.1.1
Static_Semantics('Early Errors', [

    'Script: ScriptBody',
    function() {
        if (this.ScriptBody.LexicallyDeclaredNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
        if (this.ScriptBody.LexicallyDeclaredNames().also_occurs_in(this.ScriptBody.VarDeclaredNames())) throw EarlySyntaxError();
    },

    'ScriptBody: StatementList',
    function() {
        //TODO if( this.StatementList.Contains ('super') unless the source code containing super === eval code that === being processed by a direct eval that === contained in function code that !== the function code of an ArrowFunction;) throw EarlySyntaxError();
        //TODO if( this.StatementList.Contains('NewTarget') unless the source code containing NewTarget === eval code that === being processed by a direct eval that === contained in function code that !== the function code of an ArrowFunction;) throw EarlySyntaxError();
        if (this.StatementList.ContainsDuplicateLabels([]) === true) throw EarlySyntaxError();
        if (this.StatementList.ContainsUndefinedBreakTarget([]) === true) throw EarlySyntaxError();
        if (this.StatementList.ContainsUndefinedContinueTarget([], []) === true) throw EarlySyntaxError();
    },
]);

// 15.1.2
Static_Semantics('IsStrict', [

    'ScriptBody: StatementList',
    function() {
        if (containsUseStrictDirective(this)) return true;
        else return false;
    },
]);

// 15.1.3
Static_Semantics('LexicallyDeclaredNames', [

    'Script: [empty]',
    function() {
        return []; // TODO clarify the specification
    },

    'ScriptBody: StatementList',
    function() {
        return this.StatementList.TopLevelLexicallyDeclaredNames();
    },
]);

// 15.1.4
Static_Semantics('LexicallyScopedDeclarations', [

    'Script: [empty]',
    function() {
        return []; // TODO clarify the specification
    },

    'ScriptBody: StatementList',
    function() {
        return this.StatementList.TopLevelLexicallyScopedDeclarations();
    },
]);

// 15.1.5
Static_Semantics('VarDeclaredNames', [

    'Script: [empty]',
    function() {
        return []; // TODO clarify the specification
    },

    'ScriptBody: StatementList',
    function() {
        return this.StatementList.TopLevelVarDeclaredNames();
    },
]);

// 15.1.6
Static_Semantics('VarScopedDeclarations', [

    'Script: [empty]',
    function() {
        return []; // TODO clarify the specification
    },

    'ScriptBody: StatementList',
    function() {
        return this.StatementList.TopLevelVarScopedDeclarations();
    },
]);

// 15.1.7
Runtime_Semantics('Evaluation', [

    'Script: [empty]',
    function() {
        return undefined;
    },
]);

// 15.1.8 Script Records

function Script_Record(like) {
    if (!this) {
        return new Script_Record(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 15.1.9
function ParseScript(sourceText, realm, hostDefined) {
    Assert(typeof sourceText === 'string');
    try {
        setParsingText(sourceText);
        var body = parseScript();
        determineStrictModeCode(body, false);
        body.apply_early_error_rules();
    } catch (e) {
        var body = [e];
    }
    if (Type(body) === 'List') return body;
    return Script_Record({ Realm: realm, Environment: undefined, ECMAScriptCode: body, HostDefined: hostDefined });
}

// 15.1.10
function ScriptEvaluation(scriptRecord) {
    var globalEnv = scriptRecord.Realm.GlobalEnv;
    var callerContext = the_running_execution_context;
    var scriptCtx = new ExecutionContext;
    scriptCtx.Function = null;
    scriptCtx.Realm = scriptRecord.Realm;
    scriptCtx.ScriptOrModule = scriptRecord;
    scriptCtx.VariableEnvironment = globalEnv;
    scriptCtx.LexicalEnvironment = globalEnv;
    push_onto_the_execution_context_stack(scriptCtx);
    var scriptBody = scriptRecord.ECMAScriptCode;
    var result = concreteCompletion(GlobalDeclarationInstantiation(scriptBody, globalEnv));
    if (result.Type === 'normal') {
        var result = concreteCompletion(scriptBody.Evaluation());
    }
    if (result.Type === 'normal' && result.Value === empty) {
        var result = NormalCompletion(undefined);
    }
    remove_from_the_execution_context_stack(scriptCtx);
    Assert(the_execution_context_stack.length > 0);
    Assert(callerContext === the_running_execution_context);
    return resolveCompletion(result);
}

// 15.1.11
function GlobalDeclarationInstantiation(script, env) {
    var envRec = env.EnvironmentRecord;
    Assert(envRec instanceof GlobalEnvironmentRecord);
    var lexNames = script.LexicallyDeclaredNames();
    var varNames = script.VarDeclaredNames();
    for (var name of lexNames) {
        if (envRec.HasVarDeclaration(name) === true) throw $SyntaxError();
        if (envRec.HasLexicalDeclaration(name) === true) throw $SyntaxError();
        var hasRestrictedGlobal = envRec.HasRestrictedGlobalProperty(name);
        if (hasRestrictedGlobal === true) throw $SyntaxError();
    }
    for (var name of varNames) {
        if (envRec.HasLexicalDeclaration(name) === true) throw $SyntaxError();
    }
    var varDeclarations = script.VarScopedDeclarations();
    var functionsToInitialize = [];
    var declaredFunctionNames = [];
    for (var d of varDeclarations.slice().reverse()) {
        if (!d.is('VariableDeclaration') && !d.is('ForBinding')) {
            Assert(d.is('FunctionDeclaration') || d.is('GeneratorDeclaration'));
            var fn = d.BoundNames()[0];
            if (!fn.is_an_element_of(declaredFunctionNames)) {
                var fnDefinable = envRec.CanDeclareGlobalFunction(fn);
                if (fnDefinable === false) throw $TypeError();
                declaredFunctionNames.push(fn);
                functionsToInitialize.unshift(d);
            }
        }
    }
    var declaredVarNames = [];
    for (var d of varDeclarations) {
        if (d.is('VariableDeclaration') || d.is('ForBinding')) {
            for (var vn of d.BoundNames()) {
                if (!vn.is_an_element_of(declaredFunctionNames)) {
                    var vnDefinable = envRec.CanDeclareGlobalVar(vn);
                    if (vnDefinable === false) throw $TypeError();
                    if (!vn.is_an_element_of(declaredVarNames)) {
                        declaredVarNames.push(vn);
                    }
                }
            }
        }
    }
    var lexDeclarations = script.LexicallyScopedDeclarations();
    for (var d of lexDeclarations) {
        for (var dn of d.BoundNames()) {
            if (d.IsConstantDeclaration() === true) {
                envRec.CreateImmutableBinding(dn, true);
            } else {
                envRec.CreateMutableBinding(dn, false);
            }
        }
    }
    for (var f of functionsToInitialize) {
        var fn = f.BoundNames()[0];
        var fo = f.InstantiateFunctionObject(env);
        envRec.CreateGlobalFunctionBinding(fn, fo, false);
    }
    for (var vn of declaredVarNames) {
        envRec.CreateGlobalVarBinding(vn, false);
    }
    return empty;
}

// 15.1.12
function ScriptEvaluationJob(sourceText, hostDefined) {
    Assert(typeof sourceText === 'string');
    var realm = currentRealm;
    var s = ParseScript(sourceText, realm, hostDefined);
    if (Type(s) === 'List') {
        HostReportErrors(s);
        return NextJob(NormalCompletion(undefined));
    }
    var status = concreteCompletion(ScriptEvaluation(s));
    return NextJob(status);
}

// 15.2 Modules

Syntax([
    'Module: ModuleBody[opt]',
    'ModuleBody: ModuleItemList',
    'ModuleItemList: ModuleItem',
    'ModuleItemList: ModuleItemList ModuleItem',
    'ModuleItem: ImportDeclaration',
    'ModuleItem: ExportDeclaration',
    'ModuleItem: StatementListItem',
]);

// 15.2.1 Module Semantics

// 15.2.1.1
Static_Semantics('Early Errors', [

    'ModuleBody: ModuleItemList',
    function() {
        if (this.ModuleItemList.LexicallyDeclaredNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
        if (this.ModuleItemList.LexicallyDeclaredNames().also_occurs_in(this.ModuleItemList.VarDeclaredNames())) throw EarlySyntaxError();
        if (this.ModuleItemList.ExportedNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
        if (!this.ModuleItemList.ExportedBindings().also_occur_in(this.ModuleItemList.VarDeclaredNames().concat(this.ModuleItemList.LexicallyDeclaredNames()))) throw EarlySyntaxError();
        if (this.ModuleItemList.Contains('super')) throw EarlySyntaxError();
        if (this.ModuleItemList.Contains('NewTarget')) throw EarlySyntaxError();
        if (this.ModuleItemList.ContainsDuplicateLabels([]) === true) throw EarlySyntaxError();
        if (this.ModuleItemList.ContainsUndefinedBreakTarget([]) === true) throw EarlySyntaxError();
        if (this.ModuleItemList.ContainsUndefinedContinueTarget([], []) === true) throw EarlySyntaxError();
    },
]);

// 15.2.1.2
Static_Semantics('ContainsDuplicateLabels', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function(labelSet) {
        var hasDuplicates = this.ModuleItemList.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.ModuleItem.ContainsDuplicateLabels(labelSet);
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: ExportDeclaration',
    function(labelSet) {
        return false;
    },
]);

// 15.2.1.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function(labelSet) {
        var hasUndefinedLabels = this.ModuleItemList.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.ModuleItem.ContainsUndefinedBreakTarget(labelSet);
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: ExportDeclaration',
    function(labelSet) {
        return false;
    },
]);

// 15.2.1.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.ModuleItemList.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.ModuleItem.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: ExportDeclaration',
    function(iterationSet, labelSet) {
        return false;
    },
]);

// 15.2.1.5
Static_Semantics('ExportedBindings', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var names = this.ModuleItemList.ExportedBindings();
        names.append_elements_of(this.ModuleItem.ExportedBindings());
        return names;
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: StatementListItem',
    function() {
        return [];
    },
]);

// 15.2.1.6
Static_Semantics('ExportedNames', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var names = this.ModuleItemList.ExportedNames();
        names.append_elements_of(this.ModuleItem.ExportedNames());
        return names;
    },

    'ModuleItem: ExportDeclaration',
    function() {
        return this.ExportDeclaration.ExportedNames();
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: StatementListItem',
    function() {
        return [];
    },
]);

// 15.2.1.7
Static_Semantics('ExportEntries', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var entries = this.ModuleItemList.ExportEntries();
        entries.append_elements_of(this.ModuleItem.ExportEntries());
        return entries;
    },

    'ModuleItem: ImportDeclaration',
    'ModuleItem: StatementListItem',
    function() {
        return [];
    },
]);


// 15.2.1.8
Static_Semantics('ImportEntries', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var entries = this.ModuleItemList.ImportEntries();
        entries.append_elements_of(this.ModuleItem.ImportEntries());
        return entries;
    },

    'ModuleItem: ExportDeclaration',
    'ModuleItem: StatementListItem',
    function() {
        return [];
    },
]);

// 15.2.1.9
function ImportedLocalNames(importEntries) {
    var localNames = [];
    for (var i of importEntries) {
        localNames.push(i.LocalName);
    }
    return localNames;
}

// 15.2.1.10
Static_Semantics('ModuleRequests', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItem',
    function() {
        return this.ModuleItem.ModuleRequests();
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var moduleNames = this.ModuleItemList.ModuleRequests();
        var additionalNames = this.ModuleItem.ModuleRequests();
        moduleNames.append_elements_of(additionalNames.filter(e => !e.is_an_element_of(moduleNames)));
        return moduleNames;
    },

    'ModuleItem: StatementListItem',
    function() {
        return [];
    },
]);

// 15.2.1.11
Static_Semantics('LexicallyDeclaredNames', [

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var names = this.ModuleItemList.LexicallyDeclaredNames();
        names.append_elements_of(this.ModuleItem.LexicallyDeclaredNames());
        return names;
    },

    'ModuleItem: ImportDeclaration',
    function() {
        return this.ImportDeclaration.BoundNames();
    },

    'ModuleItem: ExportDeclaration',
    function() {
        if (this.ExportDeclaration.is('ExportDeclaration: export VariableStatement')) return [];
        return this.ExportDeclaration.BoundNames();
    },

    'ModuleItem: StatementListItem',
    function() {
        return this.StatementListItem.LexicallyDeclaredNames();
    },
]);

// 15.2.1.12
Static_Semantics('LexicallyScopedDeclarations', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var declarations = this.ModuleItemList.LexicallyScopedDeclarations();
        declarations.append_elements_of(this.ModuleItem.LexicallyScopedDeclarations());
        return declarations;
    },

    'ModuleItem: ImportDeclaration',
    function() {
        return [];
    },
]);

// 15.2.1.13
Static_Semantics('VarDeclaredNames', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var names = this.ModuleItemList.VarDeclaredNames();
        names.append_elements_of(this.ModuleItem.VarDeclaredNames());
        return names;
    },

    'ModuleItem: ImportDeclaration',
    function() {
        return [];
    },

    'ModuleItem: ExportDeclaration',
    function() {
        if (this.ExportDeclaration.is('ExportDeclaration: export VariableStatement')) return this.ExportDeclaration.BoundNames();
        return [];
    },
]);

// 15.2.1.14
Static_Semantics('VarScopedDeclarations', [

    'Module: [empty]',
    function() {
        return [];
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var declarations = this.ModuleItemList.VarScopedDeclarations();
        declarations.append_elements_of(this.ModuleItem.VarScopedDeclarations());
        return declarations;
    },

    'ModuleItem: ImportDeclaration',
    function() {
        return [];
    },

    'ModuleItem: ExportDeclaration',
    function() {
        if (this.ExportDeclaration.is('ExportDeclaration: export VariableStatement')) return this.VariableStatement.VarScopedDeclarations();
        return [];
    },
]);

// 15.2.1.15 Abstract Module Records

// 15.2.1.16 Source Text Module Records

function SourceTextModuleRecord(like) {
    if (!this) {
        return new SourceTextModuleRecord(like);
    }
    for (var i in like) {
        this[i] = like[i];
    }
}

// 15.2.1.16.1
function ParseModule(sourceText, realm, hostDefined) {
    Assert(typeof sourceText === 'string');
    try {
        setParsingText(sourceText);
        var body = parseModule();
        determineStrictModeCode(body, true);
        body.apply_early_error_rules();
    } catch (e) {
        var body = [e];
    }
    if (Type(body) === 'List') return body;
    var requestedModules = body.ModuleRequests();
    var importEntries = body.ImportEntries();
    var importedBoundNames = ImportedLocalNames(importEntries);
    var indirectExportEntries = [];
    var localExportEntries = [];
    var starExportEntries = [];
    var exportEntries = body.ExportEntries();
    for (var ee of exportEntries) {
        if (ee.ModuleRequest === null) {
            if (!ee.LocalName.is_an_element_of(importedBoundNames)) {
                localExportEntries.push(ee);
            } else {
                var ie = importEntries.find(e => (e.LocalName === ee.LocalName));
                if (ie.ImportName === "*") {
                    //TODO Assert( this is a re-export of an imported module namespace object);
                    localExportEntries.push(ee);
                } else { // this is a re-export of a single name
                    indirectExportEntries.push(Record({ ModuleRequest: ie.ModuleRequest, ImportName: ie.ImportName, LocalName: null, ExportName: ee.ExportName }));
                }
            }
        } else if (ee.ImportName === "*") {
            starExportEntries.push(ee);
        } else {
            indirectExportEntries.push(ee);
        }
    }
    return SourceTextModuleRecord({ Realm: realm, Environment: undefined, HostDefined: hostDefined, Namespace: undefined, Evaluated: false, ECMAScriptCode: body, RequestedModules: requestedModules, ImportEntries: importEntries, LocalExportEntries: localExportEntries, StarExportEntries: starExportEntries, IndirectExportEntries: indirectExportEntries });
}

// 15.2.1.16.2
define_method(SourceTextModuleRecord, 'GetExportedNames', function(exportStarSet) {
    var module = this;
    if (exportStarSet.contains(module)) {
        //TODO Assert( We've reached the starting point of an import * circularity);
        return [];
    }
    exportStarSet.push(module);
    var exportedNames = [];
    for (var e of module.LocalExportEntries) {
        //TODO Assert( module provides the direct binding for this export);
        exportedNames.push(e.ExportName);
    }
    for (var e of module.IndirectExportEntries) {
        //TODO Assert( module imports a specific binding for this export);
        exportedNames.push(e.ExportName);
    }
    for (var e of module.StarExportEntries) {
        var requestedModule = HostResolveImportedModule(module, e.ModuleRequest);
        var starNames = requestedModule.GetExportedNames(exportStarSet);
        for (var n of starNames) {
            if (SameValue(n, "default") === false) {
                if (!n.is_an_element_of(exportedNames)) {
                    exportedNames.push(n);
                }
            }
        }
    }
    return exportedNames;
});

// 15.2.1.16.3 
define_method(SourceTextModuleRecord, 'ResolveExport', function(exportName, resolveSet, exportStarSet) {
    var module = this;
    for (var r of resolveSet) {
        if (module === r.Module && SameValue(exportName, r.ExportName) === true) {
            //TODO Assert( this === a circular import request);
            return null;
        }
    }
    resolveSet.push(Record({ Module: module, ExportName: exportName }));
    for (var e of module.LocalExportEntries) {
        if (SameValue(exportName, e.ExportName) === true) {
            //TODO Assert( module provides the direct binding for this export);
            return Record({ Module: module, BindingName: e.LocalName });
        }
    }
    for (var e of module.IndirectExportEntries) {
        if (SameValue(exportName, e.ExportName) === true) {
            //TODO Assert( module imports a specific binding for this export);
            var importedModule = HostResolveImportedModule(module, e.ModuleRequest);
            var indirectResolution = importedModule.ResolveExport(e.ImportName, resolveSet, exportStarSet);
            if (indirectResolution !== null) return indirectResolution;
        }
    }
    if (SameValue(exportName, "default") === true) {
        //TODO Assert( A default export was not explicitly defined by this module);
        throw $SyntaxError();
    }
    if (exportStarSet.contains(module)) return null;
    exportStarSet.push(module);
    var starResolution = null;
    for (var e of module.StarExportEntries) {
        var importedModule = HostResolveImportedModule(module, e.ModuleRequest);
        var resolution = importedModule.ResolveExport(exportName, resolveSet, exportStarSet);
        if (resolution === "ambiguous") return "ambiguous";
        if (resolution !== null) {
            if (starResolution === null) var starResolution = resolution;
            else {
                //TODO Assert( there === more than one * import that includes the requested name);
                if (resolution.Module !== starResolution.Module || SameValue(resolution.BindingName, starResolution.BindingName) === false) return "ambiguous";
            }
        }
    }
    return starResolution;
});

// 15.2.1.16.4
define_method(SourceTextModuleRecord, 'ModuleDeclarationInstantiation', function() {
    var module = this;
    var realm = module.Realm;
    Assert(realm !== undefined);
    var code = module.ECMAScriptCode;
    if (module.Environment !== undefined) return empty;
    var env = NewModuleEnvironment(realm.GlobalEnv);
    module.Environment = env;
    for (var required of module.RequestedModules) {
        var requiredModule = HostResolveImportedModule(module, required);
        requiredModule.ModuleDeclarationInstantiation();
    }
    for (var e in module.IndirectExportEntries) {
        var resolution = module.ResolveExport(e.ExportName, [], []);
        if (resolution === null || resolution === "ambiguous") throw $SyntaxError();
    }
    //TODO Assert( all named exports from module are resolvable);
    var envRec = env.EnvironmentRecord;
    for (var _in in module.ImportEntries) {
        var importedModule = HostResolveImportedModule(module, _in.ModuleRequest);
        if (_in.ImportName === "*") {
            var namespace = GetModuleNamespace(importedModule);
            envRec.CreateImmutableBinding(_in.LocalName, true);
            envRec.InitializeBinding(_in.LocalName, namespace);
        } else {
            var resolution = importedModule.ResolveExport(_in.ImportName, [], []);
            if (resolution === null || resolution === "ambiguous") throw $SyntaxError();
            envRec.CreateImportBinding(_in.LocalName, resolution.Module, resolution.BindingName);
        }
    }
    var varDeclarations = code.VarScopedDeclarations();
    var declaredVarNames = [];
    for (var d of varDeclarations) {
        for (var dn of d.BoundNames()) {
            if (!dn.is_an_element_of(declaredVarNames)) {
                envRec.CreateMutableBinding(dn, false);
                envRec.InitializeBinding(dn, undefined);
                declaredVarNames.push(dn);
            }
        }
    }
    var lexDeclarations = code.LexicallyScopedDeclarations();
    for (var d of lexDeclarations) {
        for (var dn of d.BoundNames()) {
            if (d.IsConstantDeclaration() === true) {
                envRec.CreateImmutableBinding(dn, true);
            } else {
                envRec.CreateMutableBinding(dn, false);
            }
            if (d.is('GeneratorDeclaration') || d.is('FunctionDeclaration')) {
                var fo = d.InstantiateFunctionObject(env);
                envRec.InitializeBinding(dn, fo);
            }
        }
    }
    return empty;
});

// 15.2.1.16.5
define_method(SourceTextModuleRecord, 'ModuleEvaluation', function() {
    var module = this;
    //TODO Assert( ModuleDeclarationInstantiation has already been invoked on module and successfully completed);
    Assert(module.Realm !== undefined);
    if (module.Evaluated === true) return undefined;
    module.Evaluated = true;
    for (var required of module.RequestedModules) {
        var requiredModule = HostResolveImportedModule(module, required);
        requiredModule.ModuleEvaluation();
    }
    var callerContext = the_running_execution_context;
    var moduleCtx = new ExecutionContext;
    moduleCtx.Function = null;
    moduleCtx.Realm = module.Realm;
    moduleCtx.ScriptOrModule = module;
    //TODO Assert( module has been linked and declarations in its module environment have been instantiated);
    moduleCtx.VariableEnvironment = module.Environment;
    moduleCtx.LexicalEnvironment = module.Environment;
    push_onto_the_execution_context_stack(moduleCtx);
    var result = concreteCompletion(module.ECMAScriptCode.Evaluation());
    remove_from_the_execution_context_stack(moduleCtx);
    Assert(callerContext === the_running_execution_context);
    return resolveCompletion(result);
});

// 15.2.1.17
function HostResolveImportedModule(referencingModule, specifier) {
    //TODO 
}

// 15.2.1.18
function GetModuleNamespace(module) {
    //TODO Assert( module === an instance of a concrete subclass of Module Record);
    var namespace = module.Namespace;
    if (namespace === undefined) {
        var exportedNames = module.GetExportedNames([]);
        var unambiguousNames = [];
        for (var name of exportedNames) {
            var resolution = module.ResolveExport(name, [], []);
            if (resolution === null) throw $SyntaxError();
            if (resolution !== "ambiguous") unambiguousNames.push(name);
        }
        var namespace = ModuleNamespaceCreate(module, unambiguousNames);
    }
    return namespace;
}

// 15.2.1.19
function TopLevelModuleEvaluationJob(sourceText, hostDefined) {
    Assert(typeof sourceText === 'string');
    var realm = currentRealm;
    var m = ParseModule(sourceText, realm, hostDefined);
    if (Type(m) === 'List') {
        HostReportErrors(m);
        return NextJob(NormalCompletion(undefined));
    }
    var status = m.ModuleDeclarationInstantiation();
    if (!status.is_an_abrupt_completion()) {
        //TODO Assert( all dependencies of m have been transitively resolved and m === ready for evaluation);
        var status = concreteCompletion(m.ModuleEvaluation());
    }
    return NextJob(status);
}

// 15.2.1.20
Runtime_Semantics('Evaluation', [

    'Module: [empty]',
    function() {
        return undefined;
    },

    'ModuleBody: ModuleItemList',
    function() {
        var result = concreteCompletion(this.ModuleItemList.Evaluation());
        if (result.Type === 'normal' && result.Value === empty) {
            return undefined;
        }
        return resolveCompletion(result);
    },

    'ModuleItemList: ModuleItemList ModuleItem',
    function() {
        var sl = concreteCompletion(this.ModuleItemList.Evaluation());
        ReturnIfAbrupt(sl);
        var s = concreteCompletion(this.ModuleItem.Evaluation());
        return resolveCompletion(UpdateEmpty(s, sl.Value));
    },

    'ModuleItem: ImportDeclaration',
    function() {
        return empty;
    },
]);

// 15.2.2 Imports

Syntax([
    'ImportDeclaration: import ImportClause FromClause ;',
    'ImportDeclaration: import ModuleSpecifier ;',
    'ImportClause: ImportedDefaultBinding',
    'ImportClause: NameSpaceImport',
    'ImportClause: NamedImports',
    'ImportClause: ImportedDefaultBinding , NameSpaceImport',
    'ImportClause: ImportedDefaultBinding , NamedImports',
    'ImportedDefaultBinding: ImportedBinding',
    'NameSpaceImport: * as ImportedBinding',
    'NamedImports: { }',
    'NamedImports: { ImportsList }',
    'NamedImports: { ImportsList , }',
    'FromClause: from ModuleSpecifier',
    'ImportsList: ImportSpecifier',
    'ImportsList: ImportsList , ImportSpecifier',
    'ImportSpecifier: ImportedBinding',
    'ImportSpecifier: IdentifierName as ImportedBinding',
    'ModuleSpecifier: StringLiteral',
    'ImportedBinding: BindingIdentifier',
]);

// 15.2.2.1
Static_Semantics('Early Errors', [

    'ModuleItem: ImportDeclaration',
    function() {
        if (this.ImportDeclaration.BoundNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
    },
]);

// 15.2.2.2
Static_Semantics('BoundNames', [

    'ImportDeclaration: import ImportClause FromClause ;',
    function() {
        return this.ImportClause.BoundNames();
    },

    'ImportDeclaration: import ModuleSpecifier ;',
    function() {
        return [];
    },

    'ImportClause: ImportedDefaultBinding , NameSpaceImport',
    function() {
        var names = this.ImportedDefaultBinding.BoundNames();
        names.append_elements_of(this.NameSpaceImport.BoundNames());
        return names;
    },

    'ImportClause: ImportedDefaultBinding , NamedImports',
    function() {
        var names = this.ImportedDefaultBinding.BoundNames();
        names.append_elements_of(this.NamedImports.BoundNames());
        return names;
    },

    'NamedImports: { }',
    function() {
        return [];
    },

    'ImportsList: ImportsList , ImportSpecifier',
    function() {
        var names = this.ImportsList.BoundNames();
        names.append_elements_of(this.ImportSpecifier.BoundNames());
        return names;
    },

    'ImportSpecifier: IdentifierName as ImportedBinding',
    function() {
        return this.ImportedBinding.BoundNames();
    },
]);

// 15.2.2.3
Static_Semantics('ImportEntries', [

    'ImportDeclaration: import ImportClause FromClause ;',
    function() {
        var module = this.FromClause.ModuleRequests()[0];
        return this.ImportClause.ImportEntriesForModule(module);
    },

    'ImportDeclaration: import ModuleSpecifier ;',
    function() {
        return [];
    },
]);

// 15.2.2.4
Static_Semantics('ImportEntriesForModule', [

    'ImportClause: ImportedDefaultBinding , NameSpaceImport',
    function(module) {
        var entries = this.ImportedDefaultBinding.ImportEntriesForModule(module);
        entries.append_elements_of(this.NameSpaceImport.ImportEntriesForModule(module));
        return entries;
    },

    'ImportClause: ImportedDefaultBinding , NamedImports',
    function(module) {
        var entries = this.ImportedDefaultBinding.ImportEntriesForModule(module);
        entries.append_elements_of(this.NamedImports.ImportEntriesForModule(module));
        return entries;
    },

    'ImportedDefaultBinding: ImportedBinding',
    function(module) {
        var localName = this.ImportedBinding.BoundNames()[0];
        var defaultEntry = Record({ ModuleRequest: module, ImportName: "default", LocalName: localName });
        return [defaultEntry];
    },

    'NameSpaceImport: * as ImportedBinding',
    function(module) {
        var localName = this.ImportedBinding.StringValue();
        var entry = Record({ ModuleRequest: module, ImportName: "*", LocalName: localName });
        return [entry];
    },

    'NamedImports: { }',
    function(module) {
        return [];
    },

    'ImportsList: ImportsList , ImportSpecifier',
    function(module) {
        var specs = this.ImportsList.ImportEntriesForModule(module);
        specs.append_elements_of(this.ImportSpecifier.ImportEntriesForModule(module));
        return specs;
    },

    'ImportSpecifier: ImportedBinding',
    function(module) {
        var localName = this.ImportedBinding.BoundNames()[0];
        var entry = Record({ ModuleRequest: module, ImportName: localName, LocalName: localName });
        return [entry];
    },

    'ImportSpecifier: IdentifierName as ImportedBinding',
    function(module) {
        var importName = this.IdentifierName.StringValue();
        var localName = this.ImportedBinding.StringValue();
        var entry = Record({ ModuleRequest: module, ImportName: importName, LocalName: localName });
        return [entry];
    },
]);

// 15.2.2.5
Static_Semantics('ModuleRequests', [

    'ImportDeclaration: import ImportClause FromClause ;',
    function() {
        return this.FromClause.ModuleRequests();
    },

    'ModuleSpecifier: StringLiteral',
    function() {
        return [this.StringLiteral.StringValue()];
    },
]);

// 15.2.3 Exports

Syntax([
    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    'ExportDeclaration: export VariableStatement',
    'ExportDeclaration: export Declaration',
    'ExportDeclaration: export default HoistableDeclaration[Default]',
    'ExportDeclaration: export default ClassDeclaration[Default]',
    'ExportDeclaration: export default AssignmentExpression[In] ;',
    'ExportClause: { }',
    'ExportClause: { ExportsList }',
    'ExportClause: { ExportsList , }',
    'ExportsList: ExportSpecifier',
    'ExportsList: ExportsList , ExportSpecifier',
    'ExportSpecifier: IdentifierName',
    'ExportSpecifier: IdentifierName as IdentifierName',
]);

// 15.2.3.1
Static_Semantics('Early Errors', [

    'ExportDeclaration: export ExportClause ;',
    function() {
        for (var n of this.ExportClause.ReferencedBindings()) {
            if (n.StringValue().is('ReservedWord') || n.StringValue().is_an_element_of(["implements", "interface", "let", "package", "private", "protected", "public", "static"])) throw EarlySyntaxError();
        }
    },
]);

// 15.2.3.2
Static_Semantics('BoundNames', [

    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    function() {
        return [];
    },

    'ExportDeclaration: export VariableStatement',
    function() {
        return this.VariableStatement.BoundNames();
    },

    'ExportDeclaration: export Declaration',
    function() {
        return this.Declaration.BoundNames();
    },

    'ExportDeclaration: export default HoistableDeclaration',
    function() {
        var declarationNames = this.HoistableDeclaration.BoundNames();
        if (!declarationNames.includes("*default*")) declarationNames.push("*default*");
        return declarationNames;
    },

    'ExportDeclaration: export default ClassDeclaration',
    function() {
        var declarationNames = this.ClassDeclaration.BoundNames();
        if (!declarationNames.includes("*default*")) declarationNames.push("*default*");
        return declarationNames;
    },

    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return ["*default*"];
    },
]);

// 15.2.3.3
Static_Semantics('ExportedBindings', [

    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export * FromClause ;',
    function() {
        return [];
    },

    'ExportDeclaration: export ExportClause ;',
    function() {
        return this.ExportClause.ExportedBindings();
    },

    'ExportDeclaration: export VariableStatement',
    function() {
        return this.VariableStatement.BoundNames();
    },

    'ExportDeclaration: export Declaration',
    function() {
        return this.Declaration.BoundNames();
    },

    'ExportDeclaration: export default HoistableDeclaration',
    'ExportDeclaration: export default ClassDeclaration',
    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return this.ExportDeclaration.BoundNames();
    },

    'ExportClause: { }',
    function() {
        return [];
    },

    'ExportsList: ExportsList , ExportSpecifier',
    function() {
        var names = this.ExportsList.ExportedBindings();
        names.append_elements_of(this.ExportSpecifier.ExportedBindings());
        return names;
    },

    'ExportSpecifier: IdentifierName',
    function() {
        return [this.IdentifierName.StringValue()];
    },

    'ExportSpecifier: IdentifierName as IdentifierName',
    function() {
        return [this.IdentifierName1.StringValue()];
    },
]);

// 15.2.3.4
Static_Semantics('ExportedNames', [

    'ExportDeclaration: export * FromClause ;',
    function() {
        return [];
    },

    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    function() {
        return this.ExportClause.ExportedNames();
    },

    'ExportDeclaration: export VariableStatement',
    function() {
        return this.VariableStatement.BoundNames();
    },

    'ExportDeclaration: export Declaration',
    function() {
        return this.Declaration.BoundNames();
    },

    'ExportDeclaration: export default HoistableDeclaration',
    'ExportDeclaration: export default ClassDeclaration',
    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return ["default"];
    },

    'ExportClause: { }',
    function() {
        return [];
    },

    'ExportsList: ExportsList , ExportSpecifier',
    function() {
        var names = this.ExportsList.ExportedNames();
        names.append_elements_of(this.ExportSpecifier.ExportedNames());
        return names;
    },

    'ExportSpecifier: IdentifierName',
    function() {
        return [this.IdentifierName.StringValue()];
    },

    'ExportSpecifier: IdentifierName as IdentifierName',
    function() {
        return [this.IdentifierName2.StringValue()];
    },
]);

// 15.2.3.5
Static_Semantics('ExportEntries', [

    'ExportDeclaration: export * FromClause ;',
    function() {
        var module = this.FromClause.ModuleRequests()[0];
        var entry = Record({ ModuleRequest: module, ImportName: "*", LocalName: null, ExportName: null });
        return [entry];
    },

    'ExportDeclaration: export ExportClause FromClause ;',
    function() {
        var module = this.FromClause.ModuleRequests()[0];
        return this.ExportClause.ExportEntriesForModule(module);
    },

    'ExportDeclaration: export ExportClause ;',
    function() {
        return this.ExportClause.ExportEntriesForModule(null);
    },

    'ExportDeclaration: export VariableStatement',
    function() {
        var entries = [];
        var names = this.VariableStatement.BoundNames();
        for (var name of names) {
            entries.push(Record({ ModuleRequest: null, ImportName: null, LocalName: name, ExportName: name }));
        }
        return entries;
    },

    'ExportDeclaration: export Declaration',
    function() {
        var entries = [];
        var names = this.Declaration.BoundNames();
        for (var name of names) {
            entries.push(Record({ ModuleRequest: null, ImportName: null, LocalName: name, ExportName: name }));
        }
        return entries;
    },

    'ExportDeclaration: export default HoistableDeclaration',
    function() {
        var names = this.HoistableDeclaration.BoundNames();
        var localName = names[0];
        return [Record({ ModuleRequest: null, ImportName: null, LocalName: localName, ExportName: "default" })];
    },

    'ExportDeclaration: export default ClassDeclaration',
    function() {
        var names = this.ClassDeclaration.BoundNames();
        var localName = names[0];
        return [Record({ ModuleRequest: null, ImportName: null, LocalName: localName, ExportName: "default" })];
    },

    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        var entry = Record({ ModuleRequest: null, ImportName: null, LocalName: "*default*", ExportName: "default" });
        return [entry];
    },
]);

// 15.2.3.6
Static_Semantics('ExportEntriesForModule', [

    'ExportClause: { }',
    function(module) {
        return [];
    },

    'ExportsList: ExportsList , ExportSpecifier',
    function(module) {
        var specs = this.ExportsList.ExportEntriesForModule(module);
        specs.append_elements_of(this.ExportSpecifier.ExportEntriesForModule(module));
        return specs;
    },

    'ExportSpecifier: IdentifierName',
    function(module) {
        var sourceName = this.IdentifierName.StringValue();
        if (module === null) {
            var localName = sourceName;
            var importName = null;
        } else {
            var localName = null;
            var importName = sourceName;
        }
        return [Record({ ModuleRequest: module, ImportName: importName, LocalName: localName, ExportName: sourceName })];
    },

    'ExportSpecifier: IdentifierName as IdentifierName',
    function(module) {
        var sourceName = this.IdentifierName1.StringValue();
        var exportName = this.IdentifierName2.StringValue();
        if (module === null) {
            var localName = sourceName;
            var importName = null;
        } else {
            var localName = null;
            var importName = sourceName;
        }
        return [Record({ ModuleRequest: module, ImportName: importName, LocalName: localName, ExportName: exportName })];
    },
]);

// 15.2.3.7
Static_Semantics('IsConstantDeclaration', [

    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return false;
    },
]);

// 15.2.3.8
Static_Semantics('LexicallyScopedDeclarations', [

    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    'ExportDeclaration: export VariableStatement',
    function() {
        return [];
    },

    'ExportDeclaration: export Declaration',
    function() {
        return [this.Declaration.DeclarationPart()];
    },

    'ExportDeclaration: export default HoistableDeclaration',
    function() {
        return [this.HoistableDeclaration.DeclarationPart()];
    },

    'ExportDeclaration: export default ClassDeclaration',
    function() {
        return [this.ClassDeclaration];
    },

    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return [this];
    },
]);

// 15.2.3.9
Static_Semantics('ModuleRequests', [

    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    function() {
        return this.FromClause.ModuleRequests();
    },

    'ExportDeclaration: export ExportClause ;',
    'ExportDeclaration: export VariableStatement',
    'ExportDeclaration: export Declaration',
    'ExportDeclaration: export default HoistableDeclaration',
    'ExportDeclaration: export default ClassDeclaration',
    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        return [];
    },
]);

// 15.2.3.10
Static_Semantics('ReferencedBindings', [

    'ExportClause: { }',
    function() {
        return [];
    },

    'ExportsList: ExportsList , ExportSpecifier',
    function() {
        var names = this.ExportsList.ReferencedBindings();
        names.append_elements_of(this.ExportSpecifier.ReferencedBindings());
        return names;
    },

    'ExportSpecifier: IdentifierName',
    function() {
        return [this.IdentifierName];
    },

    'ExportSpecifier: IdentifierName as IdentifierName',
    function() {
        return [this.IdentifierName1];
    },
]);

// 15.2.3.11
Runtime_Semantics('Evaluation', [

    'ExportDeclaration: export * FromClause ;',
    'ExportDeclaration: export ExportClause FromClause ;',
    'ExportDeclaration: export ExportClause ;',
    function() {
        return empty;
    },

    'ExportDeclaration: export VariableStatement',
    function() {
        return this.VariableStatement.Evaluation();
    },

    'ExportDeclaration: export Declaration',
    function() {
        return this.Declaration.Evaluation();
    },

    'ExportDeclaration: export default HoistableDeclaration',
    function() {
        return this.HoistableDeclaration.Evaluation();
    },

    'ExportDeclaration: export default ClassDeclaration',
    function() {
        var value = this.ClassDeclaration.BindingClassDeclarationEvaluation();
        var className = this.ClassDeclaration.BoundNames()[0];
        if (className === "*default*") {
            var hasNameProperty = HasOwnProperty(value, "name");
            if (hasNameProperty === false) SetFunctionName(value, "default");
            var env = the_running_execution_context.LexicalEnvironment;
            InitializeBoundName("*default*", value, env, true); //MODIFIED: strict arugument === true
        }
        return empty;
    },

    'ExportDeclaration: export default AssignmentExpression ;',
    function() {
        var rhs = this.AssignmentExpression.Evaluation();
        var value = GetValue(rhs);
        if (IsAnonymousFunctionDefinition(this.AssignmentExpression) === true) {
            var hasNameProperty = HasOwnProperty(value, "name");
            if (hasNameProperty === false) SetFunctionName(value, "default");
        }
        var env = the_running_execution_context.LexicalEnvironment;
        InitializeBoundName("*default*", value, env, true); //MODIFIED: strict arugument === true
        return empty;
    },
]);

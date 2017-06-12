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

// 15.1 Scripts
/*
    'Script: ScriptBody[opt]',
    'ScriptBody: StatementList',
*/

function parseScript() {
    var nt = parseScriptBody_opt();
    return Production['Script: ScriptBody[opt]'](nt);
}

function parseScriptBody_opt() {
    if (peekToken() === '') return null;
    var nt = parseStatementList(!'Yield', !'Return');
    if (peekToken() !== '') {
        throw EarlySyntaxError();
    }
    return Production['ScriptBody: StatementList'](nt);
}

// 15.2 Modules
/*
    'Module: ModuleBody[opt]',
    'ModuleBody: ModuleItemList',
    'ModuleItemList: ModuleItem',
    'ModuleItemList: ModuleItemList ModuleItem',
    'ModuleItem: ImportDeclaration',
    'ModuleItem: ExportDeclaration',
    'ModuleItem: StatementListItem',
*/

function parseModule() {
    var nt = parseModuleBody_opt();
    return Production['Module: ModuleBody[opt]'](nt);
}

function parseModuleBody_opt() {
    if (peekToken() === '') return null;
    var nt = parseModuleItemList();
    return Production['ModuleBody: ModuleItemList'](nt);
}

function parseModuleItemList() {
    var nt = parseModuleItem();
    var list = Production['ModuleItemList: ModuleItem'](nt);
    while (peekToken() !== '') {
        var nt = parseModuleItem();
        var list = Production['ModuleItemList: ModuleItemList ModuleItem'](list, nt);
    }
    return list;
}

function parseModuleItem() {
    switch (peekToken()) {
        case 'import':
            var nt = parseImportDeclaration();
            return Production['ModuleItem: ImportDeclaration'](nt);
        case 'export':
            var nt = parseExportDeclaration();
            return Production['ModuleItem: ExportDeclaration'](nt);
    }
    var nt = parseStatementListItem();
    return Production['ModuleItem: StatementListItem'](nt);
}

// 15.2.2 Imports
/*
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
*/

function parseImportDeclaration() {
    consumeToken('import');
    if (peekToken() === '"') {
        var nt = parseModuleSpecifier();
        insertAutoSemicolon();
        return Production['ImportDeclaration: import ModuleSpecifier ;'](nt);
    }
    var nt = parseImportClause();
    var from = parseFromClause();
    insertAutoSemicolon();
    return Production['ImportDeclaration: import ImportClause FromClause ;'](nt, from);
}

function parseImportClause() {
    switch (peekToken()) {
        case '*':
            var nt = parseNameSpaceImport();
            return Production['ImportClause: NameSpaceImport'](nt);
        case '{':
            var nt = parseNamedImports();
            return Production['ImportClause: NamedImports'](nt);
    }
    var nt = parseImportedBinding();
    var def = Production['ImportedDefaultBinding: ImportedBinding'](nt);
    if (peekToken() !== ',') {
        return Production['ImportClause: ImportedDefaultBinding'](def);
    }
    consumeToken(',');
    switch (peekToken()) {
        case '*':
            var nt = parseNameSpaceImport();
            return Production['ImportClause: ImportedDefaultBinding , NameSpaceImport'](def, nt);
        case '{':
            var nt = parseNamedImports();
            return Production['ImportClause: ImportedDefaultBinding , NamedImports'](def, nt);
    }
    throw EarlySyntaxError();
}

function parseNameSpaceImport() {
    consumeToken('*');
    consumeToken('as');
    var nt = parseImportedBinding();
    return Production['NameSpaceImport: * as ImportedBinding'](nt);
}

function parseNamedImports() {
    consumeToken('{');
    if (peekToken() === '}') {
        consumeToken('}');
        return Production['NamedImports: { }']();
    }
    var nt = parseImportSpecifier();
    var list = Production['ImportsList: ImportSpecifier'](nt);
    while (true) {
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['NamedImports: { ImportsList }'](list);
        }
        consumeToken(',');
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['NamedImports: { ImportsList , }'](list);
        }
        var nt = parseImportSpecifier();
        var list = Production['ImportsList: ImportsList , ImportSpecifier'](list, nt);
    }
}

function parseFromClause() {
    consumeToken('from');
    var nt = parseModuleSpecifier();
    return Production['FromClause: from ModuleSpecifier'](nt);
}

function parseImportSpecifier() {
    if (peekTokenIsIdentifierName() && peekToken(1) === 'as') {
        var name = parseIdentifierName();
        consumeToken('as');
        var nt = parseImportedBinding();
        return Production['ImportSpecifier: IdentifierName as ImportedBinding'](name, nt);
    }
    var nt = parseImportedBinding();
    return Production['ImportSpecifier: ImportedBinding'](nt);
}

function parseModuleSpecifier() {
    var nt = parseStringLiteral();
    return Production['ModuleSpecifier: StringLiteral'](nt);
}

function parseImportedBinding() {
    var nt = parseBindingIdentifier();
    return Production['ImportedBinding: BindingIdentifier'](nt);
}


// 15.2.3 Exports
/*
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
*/

function parseExportDeclaration() {
    consumeToken('export');
    switch (peekToken()) {
        case '*':
            consumeToken('*');
            var nt = parseFromClause();
            insertAutoSemicolon();
            return Production['ExportDeclaration: export * FromClause ;'](nt);
        case '{':
            var cl = parseExportClause();
            if (peekToken() === 'from') {
                var nt = parseFromClause();
                insertAutoSemicolon();
                return Production['ExportDeclaration: export ExportClause FromClause ;'](cl, nt);
            }
            insertAutoSemicolon();
            return Production['ExportDeclaration: export ExportClause ;'](cl);
        case 'var':
            var nt = parseVariableStatement();
            return Production['ExportDeclaration: export VariableStatement'](nt);
        case 'default':
            consumeToken('default');
            switch (peekToken()) {
                case 'function':
                    var nt = parseHoistableDeclaration(!'Yield', 'Default');
                    return Production['ExportDeclaration: export default HoistableDeclaration'](nt);
                case 'class':
                    var nt = parseClassDeclaration(!'Yield', 'Default');
                    return Production['ExportDeclaration: export default ClassDeclaration'](nt);
            }
            var nt = parseAssignmentExpression('In');
            insertAutoSemicolon();
            return Production['ExportDeclaration: export default AssignmentExpression ;'](nt);
    }
    var nt = parseDeclaration();
    return Production['ExportDeclaration: export Declaration'](nt);
}

function parseExportClause() {
    consumeToken('{');
    if (peekToken() === '}') {
        consumeToken('}');
        return Production['ExportClause: { }']();
    }
    var nt = parseExportSpecifier();
    var list = Production['ExportsList: ExportSpecifier'](nt);
    while (true) {
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ExportClause: { ExportsList }'](list);
        }
        consumeToken(',');
        if (peekToken() === '}') {
            consumeToken('}');
            return Production['ExportClause: { ExportsList , }'](list);
        }
        var nt = parseExportSpecifier();
        var list = Production['ExportsList: ExportsList , ExportSpecifier'](list, nt);
    }
}

function parseExportSpecifier() {
    var name = parseIdentifierName();
    if (peekToken() === 'as') {
        consumeToken('as');
        var nt = parseIdentifierName();
        return Production['ExportSpecifier: IdentifierName as IdentifierName'](name, nt);
    }
    return Production['ExportSpecifier: IdentifierName'](name);
}

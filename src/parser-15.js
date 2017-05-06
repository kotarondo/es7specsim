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
    var nt = parseStatementList();
    if (peekToken() !== '') {
        throw new EarlySyntaxError();
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

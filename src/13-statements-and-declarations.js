// 13 ECMAScript Language: Statements and Declarations

Syntax([
    'Statement[Yield,Return]: BlockStatement[?Yield,?Return]',
    'Statement[Yield,Return]: VariableStatement[?Yield]',
    'Statement[Yield,Return]: EmptyStatement',
    'Statement[Yield,Return]: ExpressionStatement[?Yield]',
    'Statement[Yield,Return]: IfStatement[?Yield,?Return]',
    'Statement[Yield,Return]: BreakableStatement[?Yield,?Return]',
    'Statement[Yield,Return]: ContinueStatement[?Yield]',
    'Statement[Yield,Return]: BreakStatement[?Yield]',
    'Statement[Yield,Return]:[+Return] ReturnStatement[?Yield]',
    'Statement[Yield,Return]: WithStatement[?Yield,?Return]',
    'Statement[Yield,Return]: LabelledStatement[?Yield,?Return]',
    'Statement[Yield,Return]: ThrowStatement[?Yield]',
    'Statement[Yield,Return]: TryStatement[?Yield,?Return]',
    'Statement[Yield,Return]: DebuggerStatement',
    'Declaration[Yield]: HoistableDeclaration[?Yield]',
    'Declaration[Yield]: ClassDeclaration[?Yield]',
    'Declaration[Yield]: LexicalDeclaration[In,?Yield]',
    'HoistableDeclaration[Yield,Default]: FunctionDeclaration[?Yield,?Default]',
    'HoistableDeclaration[Yield,Default]: GeneratorDeclaration[?Yield,?Default]',
    'BreakableStatement[Yield,Return]: IterationStatement[?Yield,?Return]',
    'BreakableStatement[Yield,Return]: SwitchStatement[?Yield,?Return]',
]);

// 13.1 Statement Semantics

// 13.1.1
Static_Semantics('ContainsDuplicateLabels', [

    'Statement: VariableStatement',
    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: ContinueStatement',
    'Statement: BreakStatement',
    'Statement: ReturnStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    function(labelSet) {
        return false;
    },
]);

// 13.1.2
Static_Semantics('ContainsUndefinedBreakTarget', [

    'Statement: VariableStatement',
    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: ContinueStatement',
    'Statement: ReturnStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    function(labelSet) {
        return false;
    },

]);

// 13.1.3
Static_Semantics('ContainsUndefinedContinueTarget', [

    'Statement: VariableStatement',
    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: BreakStatement',
    'Statement: ReturnStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    function(iterationSet, labelSet) {
        return false;
    },

    'BreakableStatement: IterationStatement',
    function(iterationSet, labelSet) {
        var newIterationSet = iterationSet.concat(labelSet);
        return this.IterationStatement.ContainsUndefinedContinueTarget(newIterationSet, []);
    },
]);

// 13.1.4
Static_Semantics('DeclarationPart', [

    'HoistableDeclaration: FunctionDeclaration',
    function() {
        return this.FunctionDeclaration;
    },

    'HoistableDeclaration: GeneratorDeclaration',
    function() {
        return this.GeneratorDeclaration;
    },

    'Declaration: ClassDeclaration',
    function() {
        return this.ClassDeclaration;
    },

    'Declaration: LexicalDeclaration',
    function() {
        return this.LexicalDeclaration;
    },
]);

// 13.1.5
Static_Semantics('VarDeclaredNames', [

    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: ContinueStatement',
    'Statement: BreakStatement',
    'Statement: ReturnStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    function() {
        return [];
    },
]);

// 13.1.6
Static_Semantics('VarScopedDeclarations', [

    'Statement: EmptyStatement',
    'Statement: ExpressionStatement',
    'Statement: ContinueStatement',
    'Statement: BreakStatement',
    'Statement: ReturnStatement',
    'Statement: ThrowStatement',
    'Statement: DebuggerStatement',
    function() {
        return [];
    },
]);

// 13.1.7
Runtime_Semantics('LabelledEvaluation', [

    'BreakableStatement: IterationStatement',
    function(labelSet) {
        var stmtResult = concreteCompletion(this.IterationStatement.LabelledEvaluation(labelSet));
        if (stmtResult.Type === 'break') {
            if (stmtResult.Target === empty) {
                if (stmtResult.Value === empty) var stmtResult = NormalCompletion(undefined);
                else var stmtResult = NormalCompletion(stmtResult.Value);
            }
        }
        return resolveCompletion(stmtResult);
    },

    'BreakableStatement: SwitchStatement',
    function(labelSet) {
        var stmtResult = concreteCompletion(this.SwitchStatement.Evaluation());
        if (stmtResult.Type === 'break') {
            if (stmtResult.Target === empty) {
                if (stmtResult.Value === empty) var stmtResult = NormalCompletion(undefined);
                else var stmtResult = NormalCompletion(stmtResult.Value);
            }
        }
        return resolveCompletion(stmtResult);
    },
]);

// 13.1.8
Runtime_Semantics('Evaluation', [

    'HoistableDeclaration: GeneratorDeclaration',
    function() {
        return empty;
    },

    'HoistableDeclaration: FunctionDeclaration',
    function() {
        return this.FunctionDeclaration.Evaluation();
    },

    'BreakableStatement: IterationStatement',
    'BreakableStatement: SwitchStatement',
    function() {
        var newLabelSet = [];
        return this.BreakableStatement.LabelledEvaluation(newLabelSet);
    },
]);

// 13.2 Block

Syntax([
    'BlockStatement[Yield,Return]: Block[?Yield,?Return]',
    'Block[Yield,Return]: { StatementList[?Yield,?Return][opt] }',
    'StatementList[Yield,Return]: StatementListItem[?Yield,?Return]',
    'StatementList[Yield,Return]: StatementList[?Yield,?Return] StatementListItem[?Yield,?Return]',
    'StatementListItem[Yield,Return]: Statement[?Yield,?Return]',
    'StatementListItem[Yield,Return]: Declaration[?Yield]',
]);

// 13.2.1
Static_Semantics('Early Errors', [

    'Block: { StatementList }',
    function() {
        if (this.StatementList.LexicallyDeclaredNames().contains_any_duplicate_entries()) throw EarlySytaxError();
        if (this.StatementList.LexicallyDeclaredNames().also_occurs_in(this.StatementList.VarDeclaredNames())) throw EarlySytaxError();
    }
]);

// 13.2.2
Static_Semantics('ContainsDuplicateLabels', [

    'Block: { }',
    function(labelSet) {
        return false;
    },

    'StatementList: StatementList StatementListItem',
    function(labelSet) {
        var hasDuplicates = this.StatementList.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.StatementListItem.ContainsDuplicateLabels(labelSet);
    },

    'StatementListItem: Declaration',
    function(labelSet) {
        return false;
    },
]);

// 13.2.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'Block: { }',
    function(labelSet) {
        return false;
    },

    'StatementList: StatementList StatementListItem',
    function(labelSet) {
        var hasUndefinedLabels = this.StatementList.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.StatementListItem.ContainsUndefinedBreakTarget(labelSet);
    },

    'StatementListItem: Declaration',
    function(labelSet) {
        return false;
    },
]);

// 13.2.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'Block: { }',
    function(iterationSet, labelSet) {
        return false;
    },

    'StatementList: StatementList StatementListItem',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.StatementList.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.StatementListItem.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'StatementListItem: Declaration',
    function(iterationSet, labelSet) {
        return false;
    },
]);

// 13.2.5
Static_Semantics('LexicallyDeclaredNames', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var names = this.StatementList.LexicallyDeclaredNames();
        names.append_elements_of(this.StatementListItem.LexicallyDeclaredNames());
        return names;
    },

    'StatementListItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.LabelledStatement.LexicallyDeclaredNames();
        return [];
    },

    'StatementListItem: Declaration',
    function() {
        return this.Declaration.BoundNames();
    },
]);

// 13.2.6
Static_Semantics('LexicallyScopedDeclarations', [

    'StatementList: StatementList StatementListItem',
    function() {
        var declarations = this.StatementList.LexicallyScopedDeclarations();
        declarations.append_elements_of(this.StatementListItem.LexicallyScopedDeclarations());
        return declarations;
    },

    'StatementListItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.LabelledStatement.LexicallyScopedDeclarations();
        return [];
    },

    'StatementListItem: Declaration',
    function() {
        return [Declaration.DeclarationPart()];
    },
]);

// 13.2.7
Static_Semantics('TopLevelLexicallyDeclaredNames', [

    'StatementList: StatementList StatementListItem',
    function() {
        var names = this.StatementList.TopLevelLexicallyDeclaredNames();
        names.append_elements_of(this.StatementListItem.TopLevelLexicallyDeclaredNames());
        return names;
    },

    'StatementListItem: Statement',
    function() {
        return [];
    },

    'StatementListItem: Declaration',
    function() {
        if (Declaration.is('Declaration: HoistableDeclaration')) {
            return [];
        }
        return this.Declaration.BoundNames();
    },
]);

// 13.2.8
Static_Semantics('TopLevelLexicallyScopedDeclarations', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var declarations = StatementList.TopLevelLexicallyScopedDeclarations();
        declarations.append_elements_of(this.StatementListItem.TopLevelLexicallyScopedDeclarations());
        return declarations;
    },

    'StatementListItem: Statement',
    function() {
        return [];
    },

    'StatementListItem: Declaration',
    function() {
        if (this.Declaration.is('Declaration: HoistableDeclaration')) {
            return [];
        }
        return [this.Declaration];
    },
]);

// 13.2.9
Static_Semantics('TopLevelVarDeclaredNames', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var names = this.StatementList.TopLevelVarDeclaredNames();
        names.append_elements_of(this.StatementListItem.TopLevelVarDeclaredNames());
        return names;
    },

    'StatementListItem: Declaration',
    function() {
        if (this.Declaration.is('Declaration: HoistableDeclaration')) {
            return this.Declaration.HoistableDeclaration.BoundNames();
        }
        return [];
    },

    'StatementListItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.TopLevelVarDeclaredNames();
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.2.10
Static_Semantics('TopLevelVarScopedDeclarations', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var declarations = this.StatementList.TopLevelVarScopedDeclarations();
        declarations.append_elements_of(this.StatementListItem.TopLevelVarScopedDeclarations());
        return declarations;
    },

    'StatementListItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.TopLevelVarScopedDeclarations();
        return this.Statement.VarScopedDeclarations();
    },

    'StatementListItem: Declaration',
    function() {
        if (this.Declaration.is('Declaration: HoistableDeclaration')) {
            var declaration = this.Declaration.HoistableDeclaration.DeclarationPart();
            return [declaration];
        }
        return [];
    },
]);

// 13.2.11
Static_Semantics('VarDeclaredNames', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var names = this.StatementList.VarDeclaredNames();
        names.append_elements_of(this.StatementListItem.VarDeclaredNames());
        return names;
    },

    'StatementListItem: Declaration',
    function() {
        return [];
    },
]);

// 13.2.12
Static_Semantics('VarScopedDeclarations', [

    'Block: { }',
    function() {
        return [];
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var declarations = this.StatementList.VarScopedDeclarations();
        declarations.append_elements_of(this.StatementListItem.VarScopedDeclarations());
        return declarations;
    },

    'StatementListItem: Declaration',
    function() {
        return [];
    },
]);

// 13.2.13
Runtime_Semantics('Evaluation', [

    'Block: { }',
    function() {
        return empty;
    },

    'Block: { StatementList }',
    function() {
        var oldEnv = the_running_execution_context.LexicalEnvironment;
        var blockEnv = NewDeclarativeEnvironment(oldEnv);
        BlockDeclarationInstantiation(StatementList, blockEnv);
        the_running_execution_context.LexicalEnvironment = blockEnv;
        try {
            var blockValue = this.StatementList.Evaluation();
        } finally {
            the_running_execution_context.LexicalEnvironment = oldEnv;
        }
        return blockValue;
    },

    'StatementList: StatementList StatementListItem',
    function() {
        var sl = this.StatementList.Evaluation();
        var s = concreteCompletion(this.StatementListItem.Evaluation());
        return resolveCompletion(UpdateEmpty(s, sl));
    },
]);

// 13.2.14
function BlockDeclarationInstantiation(code, env) {
    var envRec = env.EnvironmentRecord;
    Assert(envRec instanceof DeclarativeEnvironmentRecord);
    var declarations = code.LexicallyScopedDeclarations();
    for (var d of declarations) {
        for (var dn of d.BoundNames()) {
            if (d.IsConstantDeclaration() === true) {
                envRec.CreateImmutableBinding(dn, true);
            } else {
                envRec.CreateMutableBinding(dn, false);
            }
        }
        if (d.is('GeneratorDeclaration') || d.is('FunctionDeclaration')) {
            var fn = d.BoundNames();
            var fo = d.InstantiateFunctionObject(env);
            envRec.InitializeBinding(fn, fo);
        }
    }
}

// 13.3 Declarations and the Variable Statement

// 13.3.1 Let and Const Declarations

Syntax([
    'LexicalDeclaration[In,Yield]: LetOrConst BindingList[?In,?Yield] ;',
    'LetOrConst: let',
    'LetOrConst: const',
    'BindingList[In,Yield]: LexicalBinding[?In,?Yield]',
    'BindingList[In,Yield]: BindingList[?In,?Yield] , LexicalBinding[?In,?Yield]',
    'LexicalBinding[In,Yield]: BindingIdentifier[?Yield] Initializer[?In,?Yield][opt]',
    'LexicalBinding[In,Yield]: BindingPattern[?Yield] Initializer[?In,?Yield]',
]);

// 13.3.1.1
Static_Semantics('Early Errors', [

    'LexicalDeclaration: LetOrConst BindingList ;',
    function() {
        if (this.BindingList.BoundNames().contains("let")) throw EarlySyntaxError();
        if (this.BindingList.BoundNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
    },

    'LexicalBinding: BindingIdentifier Initializer[opt]',
    function() {
        if (!this.Initializer && LexicalDeclaration_containing_this_production.IsConstantDeclaration() === true) throw EarlySyntaxError(); //TODO
    },
]);

// 13.3.1.2
Static_Semantics('BoundNames', [

    'LexicalDeclaration: LetOrConst BindingList ;',
    function() {
        return this.BindingList.BoundNames();
    },

    'BindingList: BindingList , LexicalBinding',
    function() {
        var names = this.BindingList.BoundNames();
        names.append_elements_of(this.LexicalBinding.BoundNames());
        return names;
    },

    'LexicalBinding: BindingIdentifier Initializer[opt]',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'LexicalBinding: BindingPattern Initializer',
    function() {
        return this.BindingPattern.BoundNames();
    },
]);

// 13.3.1.3
Static_Semantics('IsConstantDeclaration', [

    'LexicalDeclaration: LetOrConst BindingList ;',
    function() {
        return this.LetOrConst.IsConstantDeclaration();
    },

    'LetOrConst: let',
    function() {
        return false;
    },

    'LetOrConst: const',
    function() {
        return true;
    },
]);

// 13.3.1.4
Runtime_Semantics('Evaluation', [

    'LexicalDeclaration: LetOrConst BindingList ;',
    function() {
        var next = this.BindingList.Evaluation();
        return empty;
    },

    'BindingList: BindingList , LexicalBinding',
    function() {
        var next = this.BindingList.Evaluation();
        return this.LexicalBinding.Evaluation();
    },

    'LexicalBinding: BindingIdentifier',
    function() {
        var lhs = ResolveBinding(this.BindingIdentifier.StringValue());
        return InitializeReferencedBinding(lhs, undefined);
    },

    'LexicalBinding: BindingIdentifier Initializer',
    function() {
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId);
        var rhs = this.Initializer.Evaluation();
        var value = GetValue(rhs);
        if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
            var hasNameProperty = HasOwnProperty(value, "name");
            if (hasNameProperty === false) SetFunctionName(value, bindingId);
        }
        return InitializeReferencedBinding(lhs, value);
    },

    'LexicalBinding: BindingPattern Initializer',
    function() {
        var rhs = this.Initializer.Evaluation();
        var value = GetValue(rhs);
        var env = the_running_execution_context.LexicalEnvironment;
        return this.BindingPattern.BindingInitialization(value, env);
    },
]);

// 13.3.2 Variable Statement

Syntax([
    'VariableStatement[Yield]: var VariableDeclarationList[In,?Yield] ;',
    'VariableDeclarationList[In,Yield]: VariableDeclaration[?In,?Yield]',
    'VariableDeclarationList[In,Yield]: VariableDeclarationList[?In,?Yield] , VariableDeclaration[?In,?Yield]',
    'VariableDeclaration[In,Yield]: BindingIdentifier[?Yield] Initializer[?In,?Yield][opt]',
    'VariableDeclaration[In,Yield]: BindingPattern[?Yield] Initializer[?In,?Yield]',
]);

// 13.3.2.1
Static_Semantics('BoundNames', [

    'VariableDeclarationList: VariableDeclarationList , VariableDeclaration',
    function() {
        var names = this.VariableDeclarationList.BoundNames();
        names.append_elements_of(this.VariableDeclaration.BoundNames());
        return names;
    },

    'VariableDeclaration: BindingIdentifier Initializer[opt]',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'VariableDeclaration: BindingPattern Initializer',
    function() {
        return this.BindingPattern.BoundNames();
    },
]);

// 13.3.2.2
Static_Semantics('VarDeclaredNames', [

    'VariableStatement: var VariableDeclarationList ;',
    function() {
        return this.VariableDeclarationList.BoundNames();
    },
]);

// 13.3.2.3
Static_Semantics('VarScopedDeclarations', [

    'VariableDeclarationList: VariableDeclaration',
    function() {
        return [this.VariableDeclaration];
    },

    'VariableDeclarationList: VariableDeclarationList , VariableDeclaration',
    function() {
        var declarations = this.VariableDeclarationList.VarScopedDeclarations();
        declarations.push(this.VariableDeclaration);
        return declarations;
    },
]);

// 13.3.2.4
Runtime_Semantics('Evaluation', [

    'VariableStatement: var VariableDeclarationList ;',
    function() {
        var next = this.VariableDeclarationList.Evaluation();
        return empty;
    },

    'VariableDeclarationList: VariableDeclarationList , VariableDeclaration',
    function() {
        var next = this.VariableDeclarationList.Evaluation();
        return this.VariableDeclaration.Evaluation();
    },

    'VariableDeclaration: BindingIdentifier',
    function() {
        return empty;
    },

    'VariableDeclaration: BindingIdentifier Initializer',
    function() {
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId);
        var rhs = this.Initializer.Evaluation();
        var value = GetValue(rhs);
        if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
            var hasNameProperty = HasOwnProperty(value, "name");
            if (hasNameProperty === false) SetFunctionName(value, bindingId);
        }
        return PutValue(lhs, value);
    },

    'VariableDeclaration: BindingPattern Initializer',
    function() {
        var rhs = this.Initializer.Evaluation();
        var rval = GetValue(rhs);
        return this.BindingPattern.BindingInitialization(rval, undefined);
    },
]);

// 13.3.3 Destructuring Binding Patterns

Syntax([
    'BindingPattern[Yield]: ObjectBindingPattern[?Yield]',
    'BindingPattern[Yield]: ArrayBindingPattern[?Yield]',
    'ObjectBindingPattern[Yield]: { }',
    'ObjectBindingPattern[Yield]: { BindingPropertyList[?Yield] }',
    'ObjectBindingPattern[Yield]: { BindingPropertyList[?Yield] , }',
    'ArrayBindingPattern[Yield]: [ Elision[opt] BindingRestElement[?Yield][opt] ]',
    'ArrayBindingPattern[Yield]: [ BindingElementList[?Yield] ]',
    'ArrayBindingPattern[Yield]: [ BindingElementList[?Yield] , Elision[opt] BindingRestElement[?Yield][opt] ]',
    'BindingPropertyList[Yield]: BindingProperty[?Yield]',
    'BindingPropertyList[Yield]: BindingPropertyList[?Yield] , BindingProperty[?Yield]',
    'BindingElementList[Yield]: BindingElisionElement[?Yield]',
    'BindingElementList[Yield]: BindingElementList[?Yield] , BindingElisionElement[?Yield]',
    'BindingElisionElement[Yield]: Elision[opt] BindingElement[?Yield]',
    'BindingProperty[Yield]: SingleNameBinding[?Yield]',
    'BindingProperty[Yield]: PropertyName[?Yield] : BindingElement[?Yield]',
    'BindingElement[Yield]: SingleNameBinding[?Yield]',
    'BindingElement[Yield]: BindingPattern[?Yield] Initializer[In,?Yield][opt]',
    'SingleNameBinding[Yield]: BindingIdentifier[?Yield] Initializer[In,?Yield][opt]',
    'BindingRestElement[Yield]: ... BindingIdentifier[?Yield]',
    'BindingRestElement[Yield]: ... BindingPattern[?Yield]',
]);

// 13.3.3.1
Static_Semantics('BoundNames', [

    'ObjectBindingPattern: { }',
    function() {
        return [];
    },

    'ArrayBindingPattern: [ Elision[opt] ]',
    function() {
        return [];
    },

    'ArrayBindingPattern: [ Elision[opt] BindingRestElement ]',
    function() {
        return this.BindingRestElement.BoundNames();
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] ]',
    function() {
        return this.BindingElementList.BoundNames();
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement ]',
    function() {
        var names = this.BindingElementList.BoundNames();
        names.append_elements_of(this.BindingRestElement.BoundNames());
        return names;
    },

    'BindingPropertyList: BindingPropertyList , BindingProperty',
    function() {
        var names = this.BindingPropertyList.BoundNames();
        names.append_elements_of(this.BindingProperty.BoundNames());
        return names;
    },

    'BindingElementList: BindingElementList , BindingElisionElement',
    function() {
        var names = this.BindingElementList.BoundNames();
        names.append_elements_of(this.BindingElisionElement.BoundNames());
        return names;
    },

    'BindingElisionElement: Elision[opt] BindingElement',
    function() {
        return this.BindingElement.BoundNames();
    },

    'BindingProperty: PropertyName : BindingElement',
    function() {
        return this.BindingElement.BoundNames();
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function() {
        return this.BindingIdentifier.BoundNames();
    },

    'BindingElement: BindingPattern Initializer[opt]',
    function() {
        return this.BindingPattern.BoundNames();
    },
]);

// 13.3.3.2
Static_Semantics('ContainsExpression', [

    'ObjectBindingPattern: { }',
    function() {
        return false;
    },

    'ArrayBindingPattern: [ Elision[opt] ]',
    function() {
        return false;
    },

    'ArrayBindingPattern: [ Elision[opt] BindingRestElement ]',
    function() {
        return this.BindingRestElement.ContainsExpression();
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] ]',
    function() {
        return this.BindingElementList.ContainsExpression();
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement ]',
    function() {
        var has = this.BindingElementList.ContainsExpression();
        if (has === true) return true;
        return this.BindingRestElement.ContainsExpression();
    },

    'BindingPropertyList: BindingPropertyList , BindingProperty',
    function() {
        var has = this.BindingPropertyList.ContainsExpression();
        if (has === true) return true;
        return this.BindingProperty.ContainsExpression();
    },

    'BindingElementList: BindingElementList , BindingElisionElement',
    function() {
        var has = this.BindingElementList.ContainsExpression();
        if (has === true) return true;
        return this.BindingElisionElement.ContainsExpression();
    },

    'BindingElisionElement: Elision[opt] BindingElement',
    function() {
        return this.BindingElement.ContainsExpression();
    },

    'BindingProperty: PropertyName : BindingElement',
    function() {
        var has = this.PropertyName.IsComputedPropertyKey();
        if (has === true) return true;
        return this.BindingElement.ContainsExpression();
    },

    'BindingElement: BindingPattern Initializer',
    function() {
        return true;
    },

    'SingleNameBinding: BindingIdentifier',
    function() {
        return false;
    },

    'SingleNameBinding: BindingIdentifier Initializer',
    function() {
        return true;
    },

    'BindingRestElement: ... BindingIdentifier',
    function() {
        return false;
    },

    'BindingRestElement: ... BindingPattern',
    function() {
        return this.BindingPattern.ContainsExpression();
    },
]);

// 13.3.3.3
Static_Semantics('HasInitializer', [

    'BindingElement: BindingPattern',
    function() {
        return false;
    },

    'BindingElement: BindingPattern Initializer',
    function() {
        return true;
    },

    'SingleNameBinding: BindingIdentifier',
    function() {
        return false;
    },

    'SingleNameBinding: BindingIdentifier Initializer',
    function() {
        return true;
    },
]);

// 13.3.3.4
Static_Semantics('IsSimpleParameterList', [

    'BindingElement: BindingPattern',
    function() {
        return false;
    },

    'BindingElement: BindingPattern Initializer',
    function() {
        return false;
    },

    'SingleNameBinding: BindingIdentifier',
    function() {
        return true;
    },

    'SingleNameBinding: BindingIdentifier Initializer',
    function() {
        return false;
    },
]);

// 13.3.3.5
Runtime_Semantics('BindingInitialization', [

    'BindingPattern: ObjectBindingPattern',
    function(value, environment) {
        RequireObjectCoercible(value);
        return this.ObjectBindingPattern.BindingInitialization(value, environment);
    },

    'BindingPattern: ArrayBindingPattern',
    function(value, environment) {
        var iterator = GetIterator(value);
        var iteratorRecord = Record({ Iterator: iterator, Done: false });
        var result = concreteCompletion(this.ArrayBindingPattern.IteratorBindingInitialization(iteratorRecord, environment));
        if (iteratorRecord.Done === false) return resolveCompletion(IteratorClose(iterator, result));
        return resolveCompletion(result);
    },

    'ObjectBindingPattern: { }',
    function(value, environment) {
        return empty;
    },

    'BindingPropertyList: BindingPropertyList , BindingProperty',
    function(value, environment) {
        var status = this.BindingPropertyList.BindingInitialization(value, environment);
        return this.BindingProperty.BindingInitialization(value, environment);
    },

    'BindingProperty: SingleNameBinding',
    function(value, environment) {
        var name = this.SingleNameBinding.BoundNames()[0];
        return this.SingleNameBinding.KeyedBindingInitialization(value, environment, name);
    },

    'BindingProperty: PropertyName : BindingElement',
    function(value, environment) {
        var P = this.PropertyName.Evaluation();
        return this.BindingElement.KeyedBindingInitialization(value, environment, P);
    },
]);

// 13.3.3.6
Runtime_Semantics('IteratorBindingInitialization', [

    'ArrayBindingPattern: [ ]',
    function(iteratorRecord, environment) {
        return empty;
    },

    'ArrayBindingPattern: [ Elision ]',
    function(iteratorRecord, environment) {
        return this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'ArrayBindingPattern: [ Elision[opt] BindingRestElement ]',
    function(iteratorRecord, environment) {
        if (this.Elision) {
            var status = this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        }
        return this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList ]',
    function(iteratorRecord, environment) {
        return this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , ]',
    function(iteratorRecord, environment) {
        return this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision ]',
    function(iteratorRecord, environment) {
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
    },

    'ArrayBindingPattern: [ BindingElementList , Elision[opt] BindingRestElement ]',
    function(iteratorRecord, environment) {
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        if (this.Elision) {
            var status = this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        }
        return this.BindingRestElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElementList: BindingElisionElement',
    function(iteratorRecord, environment) {
        return this.BindingElisionElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElementList: BindingElementList , BindingElisionElement',
    function(iteratorRecord, environment) {
        var status = this.BindingElementList.IteratorBindingInitialization(iteratorRecord, environment);
        return this.BindingElisionElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElisionElement: BindingElement',
    function(iteratorRecord, environment) {
        return this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElisionElement: Elision BindingElement',
    function(iteratorRecord, environment) {
        var status = this.Elision.IteratorDestructuringAssignmentEvaluation(iteratorRecord);
        return this.BindingElement.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'BindingElement: SingleNameBinding',
    function(iteratorRecord, environment) {
        return this.SingleNameBinding.IteratorBindingInitialization(iteratorRecord, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(iteratorRecord, environment) {
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId, environment);
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var v = concreteCompletion(IteratorValue(next));
                if (v.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(v);
                v = resolveCompletion(v);
            }
        }
        if (iteratorRecord.Done === true) var v = undefined;
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
            if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
                var hasNameProperty = HasOwnProperty(v, "name");
                if (hasNameProperty === false) SetFunctionName(v, bindingId);
            }
        }
        if (environment === undefined) return PutValue(lhs, v);
        return InitializeReferencedBinding(lhs, v);
    },

    'BindingElement: BindingPattern Initializer[opt]',
    function(iteratorRecord, environment) {
        if (iteratorRecord.Done === false) {
            var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
            if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(next);
            next = resolveCompletion(next);
            if (next === false) iteratorRecord.Done = true;
            else {
                var v = concreteCompletion(IteratorValue(next));
                if (v.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(v);
                v = resolveCompletion(v);
            }
        }
        if (iteratorRecord.Done === true) var v = undefined;
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
        }
        return this.BindingPattern.BindingInitialization(v, environment);
    },

    'BindingRestElement: ... BindingIdentifier',
    function(iteratorRecord, environment) {
        var lhs = ResolveBinding(this.BindingIdentifier.StringValue(), environment);
        var A = ArrayCreate(0);
        var n = 0;
        while (true) {
            if (iteratorRecord.Done === false) {
                var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
                if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(next);
                next = resolveCompletion(next);
                if (next === false) iteratorRecord.Done = true;
            }
            if (iteratorRecord.Done === true) {
                if (environment === undefined) return PutValue(lhs, A);
                return InitializeReferencedBinding(lhs, A);
            }
            var nextValue = IteratorValue(next);
            if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(nextValue);
            nextValue = resolveCompletion(nextValue);
            var status = CreateDataProperty(A, ToString(n), nextValue);
            Assert(status === true);
            n++;
        }
    },

    'BindingRestElement: ... BindingPattern',
    function(iteratorRecord, environment) {
        var A = ArrayCreate(0);
        var n = 0;
        while (true) {
            if (iteratorRecord.Done === false) {
                var next = concreteCompletion(IteratorStep(iteratorRecord.Iterator));
                if (next.is_an_abrupt_completion()) iteratorRecord.Done = true;
                ReturnIfAbrupt(next);
                next = resolveCompletion(next);
                if (next === false) iteratorRecord.Done = true;
            }
            if (iteratorRecord.Done === true) {
                return this.BindingPattern.BindingInitialization(A, environment);
            }
            var nextValue = concreteCompletion(IteratorValue(next));
            if (nextValue.is_an_abrupt_completion()) iteratorRecord.Done = true;
            ReturnIfAbrupt(nextValue);
            nextValue = resolveCompletion(nextValue);
            var status = CreateDataProperty(A, ToString(n), nextValue);
            Assert(status === true);
            n++;
        }
    },
]);

// 13.3.3.7
Runtime_Semantics('KeyedBindingInitialization', [

    'BindingElement: BindingPattern Initializer[opt]',
    function(value, environment, propertyName) {
        var v = GetV(value, propertyName);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
        }
        return this.BindingPattern.BindingInitialization(v, environment);
    },

    'SingleNameBinding: BindingIdentifier Initializer[opt]',
    function(value, environment, propertyName) {
        var bindingId = this.BindingIdentifier.StringValue();
        var lhs = ResolveBinding(bindingId, environment);
        var v = GetV(value, propertyName);
        if (this.Initializer && v === undefined) {
            var defaultValue = this.Initializer.Evaluation();
            var v = GetValue(defaultValue);
        }
        if (IsAnonymousFunctionDefinition(this.Initializer) === true) {
            var hasNameProperty = HasOwnProperty(v, "name");
            if (hasNameProperty === false) SetFunctionName(v, bindingId);
        }
        if (environment === undefined) return PutValue(lhs, v);
        return InitializeReferencedBinding(lhs, v);
    },
]);

// 13.4 Empty Statement

Syntax([
    'EmptyStatement: ;',
]);

// 13.4.1
Runtime_Semantics('Evaluation', [

    'EmptyStatement: ;',
    function() {
        return empty;
    },
]);

// 13.5 Expression Statement

Syntax([
    'ExpressionStatement[Yield]: Expression[In,?Yield] ;',
]);

// 13.5.1
Runtime_Semantics('Evaluation', [

    'ExpressionStatement: Expression ;',
    function() {
        var exprRef = this.Expression.Evaluation();
        return GetValue(exprRef);
    },
]);

// 13.6 The if Statement

Syntax([
    'IfStatement[Yield,Return]: if ( Expression[In,?Yield] ) Statement[?Yield,?Return] else Statement[?Yield,?Return]',
    'IfStatement[Yield,Return]: if ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
]);

// 13.6.1
Static_Semantics('Early Errors', [

    'IfStatement: if ( Expression ) Statement else Statement',
    'IfStatement: if ( Expression ) Statement',
    function() {
        if (IsLabelledFunction(this.Statement) === true) throw EarlySyntaxError();
    },
]);

// 13.6.2
Static_Semantics('ContainsDuplicateLabels', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function(labelSet) {
        var hasDuplicate = this.Statement1.ContainsDuplicateLabels(labelSet);
        if (hasDuplicate === true) return true;
        return this.Statement2.ContainsDuplicateLabels(labelSet);
    },

    'IfStatement: if ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.6.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function(labelSet) {
        var hasUndefinedLabels = this.Statement1.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.Statement2.ContainsUndefinedBreakTarget(labelSet);
    },

    'IfStatement: if ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },

]);

// 13.6.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.Statement1.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.Statement2.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'IfStatement: if ( Expression ) Statement',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.6.5
Static_Semantics('VarDeclaredNames', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function() {
        var names = this.Statement1.VarDeclaredNames();
        names.append_elements_of(this.Statement2.VarDeclaredNames());
        return names;
    },

    'IfStatement: if ( Expression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.6.6
Static_Semantics('VarScopedDeclarations', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function() {
        var declarations = this.Statement1.VarScopedDeclarations();
        declarations.append_elements_of(this.Statement2.VarScopedDeclarations());
        return declarations;
    },

    'IfStatement: if ( Expression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.6.7
Runtime_Semantics('Evaluation', [

    'IfStatement: if ( Expression ) Statement else Statement',
    function() {
        var exprRef = this.Expression.Evaluation();
        var exprValue = ToBoolean(GetValue(exprRef));
        if (exprValue === true) {
            var stmtCompletion = concreteCompletion(this.Statement1.Evaluation());
        } else {
            var stmtCompletion = concreteCompletion(this.Statement2.Evaluation());
        }
        return resolveCompletion(UpdateEmpty(stmtCompletion, undefined));
    },

    'IfStatement: if ( Expression ) Statement',
    function() {
        var exprRef = this.Expression.Evaluation();
        var exprValue = ToBoolean(GetValue(exprRef));
        if (exprValue === false) {
            return undefined;
        } else {
            var stmtCompletion = concreteCompletion(this.Statement.Evaluation());
            return resolveCompletion(UpdateEmpty(stmtCompletion, undefined));
        }
    },
]);

// 13.7 Iteration Statements

Syntax([
    'IterationStatement[Yield,Return]: do Statement[?Yield,?Return] while ( Expression[In,?Yield] ) ;',
    'IterationStatement[Yield,Return]: while ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( Expression[?Yield][opt] ; Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var VariableDeclarationList[?Yield] ; Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LexicalDeclaration[?Yield] Expression[In,?Yield][opt] ; Expression[In,?Yield][opt] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LeftHandSideExpression[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var ForBinding[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( ForDeclaration[?Yield] in Expression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( LeftHandSideExpression[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( var ForBinding[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'IterationStatement[Yield,Return]: for ( ForDeclaration[?Yield] of AssignmentExpression[In,?Yield] ) Statement[?Yield,?Return]',
    'ForDeclaration[Yield]: LetOrConst ForBinding[?Yield]',
    'ForBinding[Yield]: BindingIdentifier[?Yield]',
    'ForBinding[Yield]: BindingPattern[?Yield]',
]);

// 13.7.1 Semantics

// 13.7.1.1
Static_Semantics('Early Errors', [

    'IterationStatement: do Statement while ( Expression ) ;',
    'IterationStatement: while ( Expression ) Statement',
    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function() {
        if (IsLabelledFunction(this.Statement) === true) throw EarlySyntaxError();
    },
]);

// 13.7.1.2
function LoopContinues(completion, labelSet) {
    if (completion.Type === 'normal') return true;
    if (completion.Type !== 'continue') return false;
    if (completion.Target === empty) return true;
    if (completion.Target.is_an_element_of(labelSet)) return true;
    return false;
}

// 13.7.2 The do-while Statement

// 13.7.2.1
Static_Semantics('ContainsDuplicateLabels', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.7.2.2
Static_Semantics('ContainsUndefinedBreakTarget', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.7.2.3
Static_Semantics('ContainsUndefinedContinueTarget', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.7.2.4
Static_Semantics('VarDeclaredNames', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.7.2.5
Static_Semantics('VarScopedDeclarations', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.7.2.6
Runtime_Semantics('LabelledEvaluation', [

    'IterationStatement: do Statement while ( Expression ) ;',
    function(labelSet) {
        var V = undefined;
        while (true) {
            var stmt = concreteCompletion(this.Statement.Evaluation());
            if (LoopContinues(stmt, labelSet) === false) return resolveCompletion(UpdateEmpty(stmt, V));
            if (stmt.Value !== empty) var V = stmt.Value;
            var exprRef = this.Expression.Evaluation();
            var exprValue = GetValue(exprRef);
            if (ToBoolean(exprValue) === false) return V;
        }
    },
]);

// 13.7.3 The while Statement

// 13.7.3.1
Static_Semantics('ContainsDuplicateLabels', [

    'IterationStatement: while ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.7.3.2
Static_Semantics('ContainsUndefinedBreakTarget', [

    'IterationStatement: while ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.7.3.3
Static_Semantics('ContainsUndefinedContinueTarget', [

    'IterationStatement: while ( Expression ) Statement',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.7.3.4
Static_Semantics('VarDeclaredNames', [

    'IterationStatement: while ( Expression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.7.3.5
Static_Semantics('VarScopedDeclarations', [

    'IterationStatement: while ( Expression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.7.3.6
Runtime_Semantics('LabelledEvaluation', [

    'IterationStatement: while ( Expression ) Statement',
    function(labelSet) {
        var V = undefined;
        while (true) {
            var exprRef = this.Expression.Evaluation();
            var exprValue = GetValue(exprRef);
            if (ToBoolean(exprValue) === false) return V;
            var stmt = concreteCompletion(this.Statement.Evaluation());
            if (LoopContinues(stmt, labelSet) === false) return resolveCompletion(UpdateEmpty(stmt, V));
            if (stmt.Value !== empty) var V = stmt.Value;
        }
    },
]);

// 13.7.4 The for Statement

// 13.7.4.1
Static_Semantics('Early Errors', [

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function() {
        if (this.LexicalDeclaration.BoundNames().also_occurs_in(this.Statement.VarDeclaredNames())) throw EarlySyntaxError();
    },
]);

// 13.7.4.2
Static_Semantics('ContainsDuplicateLabels', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.7.4.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.7.4.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.7.4.5
Static_Semantics('VarDeclaredNames', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },

    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    function() {
        var names = this.VariableDeclarationList.BoundNames();
        names.append_elements_of(this.Statement.VarDeclaredNames());
        return names;
    },

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.7.4.6
Static_Semantics('VarScopedDeclarations', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },

    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    function() {
        var declarations = this.VariableDeclarationList.VarScopedDeclarations();
        declarations.append_elements_of(this.Statement.VarScopedDeclarations());
        return declarations;
    },

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.7.4.7
Runtime_Semantics('LabelledEvaluation', [

    'IterationStatement: for ( Expression[opt] ; Expression[opt] ; Expression[opt] ) Statement',
    function(labelSet) {
        if (this.Expression1) {
            var exprRef = this.Expression1.Evaluation();
            GetValue(exprRef);
        }
        return ForBodyEvaluation(this.Expression2, this.Expression3, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( var VariableDeclarationList ; Expression[opt] ; Expression[opt] ) Statement',
    function(labelSet) {
        var varDcl = this.VariableDeclarationList.Evaluation();
        return ForBodyEvaluation(this.Expression1, this.Expression2, this.Statement, [], labelSet);
    },

    'IterationStatement: for ( LexicalDeclaration Expression[opt] ; Expression[opt] ) Statement',
    function(labelSet) {
        var oldEnv = the_running_execution_context.LexicalEnvironment;
        var loopEnv = NewDeclarativeEnvironment(oldEnv);
        var loopEnvRec = loopEnv.EnvironmentRecord;
        var isConst = this.LexicalDeclaration.IsConstantDeclaration();
        var boundNames = this.LexicalDeclaration.BoundNames();
        for (var dn of boundNames) {
            if (isConst === true) {
                loopEnvRec.CreateImmutableBinding(dn, true);
            } else {
                loopEnvRec.CreateMutableBinding(dn, false);
            }
        }
        the_running_execution_context.LexicalEnvironment = loopEnv;
        var forDcl = cocreteCompletion(this.LexicalDeclaration.Evaluation());
        if (forDcl.is_an_abrupt_completion()) {
            the_running_execution_context.LexicalEnvironment = oldEnv;
            return resolveCompletion(forDcl);
        }
        if (isConst === false) var perIterationLets = boundNames;
        else var perIterationLets = [];
        var bodyResult = concreteCompletion(ForBodyEvaluation(this.Expression1, this.Expression2, this.Statement, perIterationLets, labelSet));
        the_running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(bodyResult);
    },
]);

// 13.7.4.8
function ForBodyEvaluation(test, increment, stmt, perIterationBindings, labelSet) {
    var V = undefined;
    CreatePerIterationEnvironment(perIterationBindings);
    while (true) {
        if (!test) {
            var testRef = test.Evaluation();
            var testValue = GetValue(testRef);
            if (ToBoolean(testValue) === false) return V;
        }
        var result = concreteCompletion(this.stmt.Evaluation());
        if (LoopContinues(result, labelSet) === false) return resolveCompletion(UpdateEmpty(result, V));
        if (result.Value !== empty) var V = result.Value;
        CreatePerIterationEnvironment(perIterationBindings);
        if (!increment) {
            var incRef = increment.Evaluation();
            GetValue(incRef);
        }
    }
}

// 13.7.4.9
function CreatePerIterationEnvironment(perIterationBindings) {
    if (perIterationBindings.length > 0) {
        var lastIterationEnv = the_running_execution_context.LexicalEnvironment;
        var lastIterationEnvRec = lastIterationEnv.EnvironmentRecord;
        var outer = lastIterationEnv.outer_lexical_environment;
        Assert(outer !== null);
        var thisIterationEnv = NewDeclarativeEnvironment(outer);
        var thisIterationEnvRec = thisIterationEnv.EnvironmentRecord;
        for (var bn of perIterationBindings) {
            thisIterationEnvRec.CreateMutableBinding(bn, false);
            var lastValue = lastIterationEnvRec.GetBindingValue(bn, true);
            thisIterationEnvRec.InitializeBinding(bn, lastValue);
        }
        the_running_execution_context.LexicalEnvironment = thisIterationEnv;
    }
    return undefined;
}

// 13.7.5 The for-in and for-of Statements

// 13.7.5.1
Static_Semantics('Early Errors', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function() {
        //TODO It === a Syntax Error if LeftHandSideExpression === either an ObjectLiteral or an ArrayLiteral and if the lexical token sequence matched by LeftHandSideExpression cannot = parsed with no tokens left over using AssignmentPattern as the goal symbol ;

        if (this.LeftHandSideExpression.is('ObjectLiteral') || this.LeftHandSideExpression.is('ArrayLiteral')) return;
        if (this.LeftHandSideExpression.IsValidSimpleAssignmentTarget() === false) throw EarlySyntaxError();

        //TODO It === a Syntax Error if the LeftHandSideExpression === CoverParenthesizedExpressionAndArrowParameterList: (Expression) and Expression derives a production that would produce a Syntax Error according to these rules if that production === substituted for LeftHandSideExpression. This rule === recursively applied ;
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function() {
        if (this.ForDeclaration.BoundNames().contains("let")) throw EarlySyntaxError();
        if (this.ForDeclaration.BoundNames().also_occurs_in(this.Statement.VarDeclaredNames())) throw EarlySyntaxError();
        if (this.ForDeclaration.BoundNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
    },
]);

// 13.7.5.2
Static_Semantics('BoundNames', [

    'ForDeclaration: LetOrConst ForBinding',
    function() {
        return this.ForBinding.BoundNames();
    },
]);

// 13.7.5.3
Static_Semantics('ContainsDuplicateLabels', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.7.5.4
Static_Semantics('ContainsUndefinedBreakTarget', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.7.5.5
Static_Semantics('ContainsUndefinedContinueTarget', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.7.5.6
Static_Semantics('IsDestructuring', [

    'ForDeclaration: LetOrConst ForBinding',
    function() {
        return this.ForBinding.IsDestructuring();
    },

    'ForBinding: BindingIdentifier',
    function() {
        return false;
    },

    'ForBinding: BindingPattern',
    function() {
        return true;
    },
]);

// 13.7.5.7
Static_Semantics('VarDeclaredNames', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },

    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    function() {
        var names = this.ForBinding.BoundNames();
        names.append_elements_of(this.Statement.VarDeclaredNames());
        return names;
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },

    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },

    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    function() {
        var names = this.ForBinding.BoundNames();
        names.append_elements_of(this.Statement.VarDeclaredNames());
        return names;
    },

    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.7.5.8
Static_Semantics('VarScopedDeclarations', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },

    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    function() {
        var declarations = [this.ForBinding];
        declarations.append_elements_of(this.Statement.VarScopedDeclarations());
        return declarations;
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },

    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },

    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    function() {
        var declarations = [this.ForBinding];
        declarations.append_elements_of(this.Statement.VarScopedDeclarations());
        return declarations;
    },

    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.7.5.9
Runtime_Semantics('BindingInitialization', [

    'ForDeclaration: LetOrConst ForBinding',
    function(value, environment) {
        return this.ForBinding.BindingInitialization(value, environment);
    },
]);

// 13.7.5.10
Runtime_Semantics('BindingInstantiation', [

    'ForDeclaration: LetOrConst ForBinding',
    function(environment) {
        var envRec = environment.EnvironmentRecord;
        Assert(envRec instanceof DeclarativeEnvironmentRecord);
        for (var name of this.ForBinding.BoundNames()) {
            if (this.LetOrConst.IsConstantDeclaration() === true) {
                envRec.CreateImmutableBinding(name, true);
            } else {
                envRec.CreateMutableBinding(name, false);
            }
        }
    },
]);

// 13.7.5.11
Runtime_Semantics('LabelledEvaluation', [

    'IterationStatement: for ( LeftHandSideExpression in Expression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation([], this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding in Expression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation([], this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration in Expression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation(this.ForDeclaration.BoundNames(), this.Expression, 'enumerate');
        return ForIn_OfBodyEvaluation(this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },

    'IterationStatement: for ( LeftHandSideExpression of AssignmentExpression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation([], this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.LeftHandSideExpression, this.Statement, keyResult, 'assignment', labelSet);
    },

    'IterationStatement: for ( var ForBinding of AssignmentExpression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation([], this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.ForBinding, this.Statement, keyResult, 'varBinding', labelSet);
    },

    'IterationStatement: for ( ForDeclaration of AssignmentExpression ) Statement',
    function(labelSet) {
        var keyResult = ForIn_OfHeadEvaluation(this.ForDeclaration.BoundNames(), this.AssignmentExpression, 'iterate');
        return ForIn_OfBodyEvaluation(this.ForDeclaration, this.Statement, keyResult, 'lexicalBinding', labelSet);
    },
]);

// 13.7.5.12
function ForIn_OfHeadEvaluation(TDZnames, expr, iterationKind) {
    var oldEnv = the_running_execution_context.LexicalEnvironment;
    if (TDZnames.length > 0) {
        Assert(!TDZnames.contains_any_duplicate_entries());
        var TDZ = NewDeclarativeEnvironment(oldEnv);
        var TDZEnvRec = TDZ.EnvironmentRecord;
        for (var name of TDZnames) {
            TDZEnvRec.CreateMutableBinding(name, false);
        }
        the_running_execution_context.LexicalEnvironment = TDZ;
    }
    try {
        var exprRef = this.expr.Evaluation();
    } finally {
        the_running_execution_context.LexicalEnvironment = oldEnv;
    }
    var exprValue = GetValue(exprRef);
    if (iterationKind === 'enumerate') {
        if (exprValue.Value === null || exprValue.Value === undefined) {
            throw Completion({ Type: 'break', Value: empty, Target: empty });
        }
        var obj = ToObject(exprValue);
        return EnumerateObjectProperties(obj);
    } else {
        Assert(iterationKind === 'iterate');
        return GetIterator(exprValue);
    }
}

// 13.7.5.13
function ForIn_OfBodyEvaluation(lhs, stmt, iterator, lhsKind, labelSet) {
    var oldEnv = the_running_execution_context.LexicalEnvironment;
    var V = undefined;
    var destructuring = lhs.IsDestructuring();
    if (destructuring === true && lhsKind === 'assignment') {
        Assert(lhs.is('LeftHandSideExpression'));
        var assignmentPattern = lhs.AssignmentPattern;
    }
    while (true) {
        var nextResult = IteratorStep(iterator);
        if (nextResult === false) return V;
        var nextValue = IteratorValue(nextResult);
        if (lhsKind === 'assignment' || lhsKind === 'varBinding') {
            if (destructuring === false) {
                var lhsRef = concreteCompletion(lhs.Evaluation());
            }
        } else {
            Assert(lhsKind.is('lexicalBinding'));
            Assert(lhs.is('ForDeclaration'));
            var iterationEnv = NewDeclarativeEnvironment(oldEnv);
            lhs.BindingInstantiation(iterationEnv);
            the_running_execution_context.LexicalEnvironment = iterationEnv;
            if (destructuring === false) {
                Assert(lhs.BoundNames().length === 1);
                var lhsName = lhs.BoundNames()[0];
                var lhsRef = NormalCompletion(ResolveBinding(lhsName));
            }
        }
        if (destructuring === false) {
            if (lhsRef.is_an_abrupt_completion()) {
                var status = lhsRef;
            } else if (lhsKind === 'lexicalBinding') {
                var status = concreteCompletion(InitializeReferencedBinding(lhsRef.Value, nextValue));
            } else {
                var status = concreteCompletion(PutValue(lhsRef.Value, nextValue));
            }
        } else {
            if (lhsKind === 'assignment') {
                var status = concreteCompletion(assignmentPattern.DestructuringAssignmentEvaluation(nextValue));
            } else if (lhsKind === 'varBinding') {
                Assert(lhs.is('ForBinding'));
                var status = concreteCompletion(lhs.BindingInitialization(nextValue, undefined));
            } else {
                Assert(lhsKind.is('lexicalBinding'));
                Assert(lhs.is('ForDeclaration'));
                var status = concreteCompletion(lhs.BindingInitialization(nextValue, iterationEnv));
            }
        }
        if (status.is_an_abrupt_completion()) {
            the_running_execution_context.LexicalEnvironment = oldEnv;
            return IteratorClose(iterator, status);
        }
        var result = concreteCompletion(this.stmt.Evaluation());
        the_running_execution_context.LexicalEnvironment = oldEnv;
        if (LoopContinues(result, labelSet) === false) return IteratorClose(iterator, UpdateEmpty(result, V));
        if (result.Value !== empty) var V = result.Value;
    }
}

// 13.7.5.14
Runtime_Semantics('Evaluation', [

    'ForBinding: BindingIdentifier',
    function() {
        var bindingId = this.BindingIdentifier.StringValue();
        return ResolveBinding(bindingId);
    },
]);

// 13.7.5.15
function EnumerateObjectProperties(O) {
    Assert(Type(O) === 'Object');
    //TODO return an Iterator object (25.1.1.2) whose next method iterates over all the String-valued keys of enumerable properties of O.
}

// 13.8 The continue Statement

Syntax([
    'ContinueStatement[Yield]: continue ;',
    'ContinueStatement[Yield]: continue LabelIdentifier[?Yield] ;',
]);

// 13.8.1
Static_Semantics('Early Errors', [

    'ContinueStatement: continue ;',
    'ContinueStatement: continue LabelIdentifier ;',
    function() {
        //TODO It === a Syntax Error if this production !== nested, directly or indirectly (but not crossing function boundaries), within an IterationStatement ;
    },
]);

// 13.8.2
Static_Semantics('ContainsUndefinedContinueTarget', [

    'ContinueStatement: continue ;',
    function(iterationSet, labelSet) {
        return false;
    },

    'ContinueStatement: continue LabelIdentifier ;',
    function(iterationSet, labelSet) {
        if (!this.LabelIdentifier.StringValue().is_an_element_of(iterationSet)) return true;
        return false;
    },
]);

// 13.8.3
Runtime_Semantics('Evaluation', [

    'ContinueStatement: continue ;',
    function() {
        throw Completion({ Type: 'continue', Value: empty, Target: empty });
    },

    'ContinueStatement: continue LabelIdentifier ;',
    function() {
        var label = this.LabelIdentifier.StringValue();
        throw Completion({ Type: 'continue', Value: empty, Target: label });
    },
]);

// 13.9 The break Statement

Syntax([
    'BreakStatement[Yield]: break ;',
    'BreakStatement[Yield]: break LabelIdentifier[?Yield] ;',
]);

// 13.9.1
Static_Semantics('Early Errors', [

    'BreakStatement: break ;',
    function() {
        //TODO It === a Syntax Error if this production !== nested, directly or indirectly (but not crossing function boundaries), within an IterationStatement or a SwitchStatement ;
    },
]);

// 13.9.2
Static_Semantics('ContainsUndefinedBreakTarget', [

    'BreakStatement: break ;',
    function(labelSet) {
        return false;
    },

    'BreakStatement: break LabelIdentifier ;',
    function(labelSet) {
        if (!this.LabelIdentifier.StringValue().is_an_element_of(labelSet)) return true;
        return false;
    },
]);

// 13.9.3
Runtime_Semantics('Evaluation', [

    'BreakStatement: break ;',
    function() {
        throw Completion({ Type: 'break', Value: empty, Target: empty });
    },

    'BreakStatement: break LabelIdentifier ;',
    function() {
        var label = this.LabelIdentifier.StringValue();
        throw Completion({ Type: 'break', Value: empty, Target: label });
    },
]);

// 13.10 The return Statement

Syntax([
    'ReturnStatement[Yield]: return ;',
    'ReturnStatement[Yield]: return Expression[In,?Yield] ;',
]);

// 13.10.1
Runtime_Semantics('Evaluation', [

    'ReturnStatement: return ;',
    function() {
        throw Completion({ Type: 'return', Value: undefined, Target: empty });
    },

    'ReturnStatement: return Expression ;',
    function() {
        var exprRef = this.Expression.Evaluation();
        var exprValue = GetValue(exprRef);
        throw Completion({ Type: 'return', Value: exprValue, Target: empty });
    },
]);

// 13.11 The with Statement

Syntax([
    'WithStatement[Yield,Return]: with ( Expression[In,?Yield] ) Statement[?Yield,?Return]',
]);

// 13.11.1
Static_Semantics('Early Errors', [

    'WithStatement: with ( Expression ) Statement',
    function() {
        if (this.strict) throw EarlySyntaxError();
        if (this.IsLabelledFunction(this.Statement) === true) throw EarlySyntaxError();
    },
]);

// 13.11.2
Static_Semantics('ContainsDuplicateLabels', [

    'WithStatement: with ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.11.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'WithStatement: with ( Expression ) Statement',
    function(labelSet) {
        return this.Statement.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.11.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'WithStatement: with ( Expression ) Statement',
    function(iterationSet, labelSet) {
        return this.Statement.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.11.5
Static_Semantics('VarDeclaredNames', [

    'WithStatement: with ( Expression ) Statement',
    function() {
        return this.Statement.VarDeclaredNames();
    },
]);

// 13.11.6
Static_Semantics('VarScopedDeclarations', [

    'WithStatement: with ( Expression ) Statement',
    function() {
        return this.Statement.VarScopedDeclarations();
    },
]);

// 13.11.7
Runtime_Semantics('Evaluation', [

    'WithStatement: with ( Expression ) Statement',
    function() {
        var val = this.Expression.Evaluation();
        var obj = ToObject(GetValue(val));
        var oldEnv = the_running_execution_context.LexicalEnvironment;
        var newEnv = NewObjectEnvironment(obj, oldEnv);
        newEnv.EnvironmentRecord.withEnvironment = true;
        the_running_execution_context.LexicalEnvironment = newEnv;
        var C = concreteCompletion(this.Statement.Evaluation());
        the_running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(UpdateEmpty(C, undefined));
    },
]);

// 13.12 The switch Statement

Syntax([
    'SwitchStatement[Yield,Return]: switch ( Expression[In,?Yield] ) CaseBlock[?Yield,?Return]',
    'CaseBlock[Yield,Return]: { CaseClauses[?Yield,?Return][opt] }',
    'CaseBlock[Yield,Return]: { CaseClauses[?Yield,?Return][opt] DefaultClause[?Yield,?Return] CaseClauses[?Yield,?Return][opt] }',
    'CaseClauses[Yield,Return]: CaseClause[?Yield,?Return]',
    'CaseClauses[Yield,Return]: CaseClauses[?Yield,?Return] CaseClause[?Yield,?Return]',
    'CaseClause[Yield,Return]: case Expression[In,?Yield] : StatementList[?Yield,?Return][opt]',
    'DefaultClause[Yield,Return]: default : StatementList[?Yield,?Return][opt]',
]);

// 13.12.1
Static_Semantics('Early Errors', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function() {
        if (this.CaseBlock.LexicallyDeclaredNames().contains_any_duplicate_entries()) throw EarlySyntaxError();
        if (this.CaseBlock.LexicallyDeclaredNames().also_occurs_in(this.CaseBlock.VarDeclaredNames())) throw EarlySyntaxError();
    },
]);

// 13.12.2
Static_Semantics('ContainsDuplicateLabels', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(labelSet) {
        return this.CaseBlock.ContainsDuplicateLabels(labelSet);
    },

    'CaseBlock: { }',
    function(labelSet) {
        return false;
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(labelSet) {
        if (this.CaseClauses1) {
            var hasDuplicates = this.CaseClauses1.ContainsDuplicateLabels(labelSet);
            if (hasDuplicates === true) return true;
        }
        var hasDuplicates = this.DefaultClause.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        if (!this.CaseClauses2) return false;
        return this.CaseClauses2.ContainsDuplicateLabels(labelSet);
    },

    'CaseClauses: CaseClauses CaseClause',
    function(labelSet) {
        var hasDuplicates = this.CaseClauses.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.CaseClause.ContainsDuplicateLabels(labelSet);
    },

    'CaseClause: case Expression : StatementList[opt]',
    function(labelSet) {
        if (this.StatementList) return this.StatementList.ContainsDuplicateLabels(labelSet);
        else return false;
    },

    'DefaultClause: default : StatementList[opt]',
    function(labelSet) {
        if (this.StatementList) return this.StatementList.ContainsDuplicateLabels(labelSet);
        else return false;
    },
]);

// 13.12.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(labelSet) {
        return this.CaseBlock.ContainsUndefinedBreakTarget(labelSet);
    },

    'CaseBlock: { }',
    function(labelSet) {
        return false;
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(labelSet) {
        if (this.CaseClauses1) {
            var hasUndefinedLabels = this.CaseClauses1.ContainsUndefinedBreakTarget(labelSet);
            if (hasUndefinedLabels === true) return true;
        }
        var hasUndefinedLabels = this.DefaultClause.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        if (!this.CaseClauses2) return false;
        return this.CaseClauses2.ContainsUndefinedBreakTarget(labelSet);
    },

    'CaseClauses: CaseClauses CaseClause',
    function(labelSet) {
        var hasUndefinedLabels = this.CaseClauses.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.CaseClause.ContainsUndefinedBreakTarget(labelSet);
    },

    'CaseClause: case Expression : StatementList[opt]',
    function(labelSet) {
        if (this.StatementList) return this.StatementList.ContainsUndefinedBreakTarget(labelSet);
        else return false;
    },

    'DefaultClause: default : StatementList[opt]',
    function(labelSet) {
        if (this.StatementList) return this.StatementList.ContainsUndefinedBreakTarget(labelSet);
        else return false;
    },
]);

// 13.12.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function(iterationSet, labelSet) {
        return this.CaseBlock.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'CaseBlock: { }',
    function(iterationSet, labelSet) {
        return false;
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(iterationSet, labelSet) {
        if (this.CaseClauses1) {
            var hasUndefinedLabels = this.CaseClauses1.ContainsUndefinedContinueTarget(iterationSet, []);
            if (hasUndefinedLabels === true) return true;
        }
        var hasUndefinedLabels = this.DefaultClause.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        if (!this.CaseClauses2) return false;
        return this.CaseClauses2.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'CaseClauses: CaseClauses CaseClause',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.CaseClauses.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.CaseClause.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'CaseClause: case Expression : StatementList[opt]',
    function(iterationSet, labelSet) {
        if (this.StatementList) return this.StatementList.ContainsUndefinedContinueTarget(iterationSet, []);
        else return false;
    },

    'DefaultClause: default : StatementList[opt]',
    function(iterationSet, labelSet) {
        if (this.StatementList) return this.StatementList.ContainsUndefinedContinueTarget(iterationSet, []);
        else return false;
    },
]);

// 13.12.5
Static_Semantics('LexicallyDeclaredNames', [

    'CaseBlock: { }',
    function() {
        return [];
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function() {
        if (this.CaseClauses1) var names = this.CaseClauses1.LexicallyDeclaredNames();
        else var names = [];
        names.append_elements_of(this.DefaultClause.LexicallyDeclaredNames());
        if (!this.CaseClauses2) return names;
        else return names.concat(this.CaseClauses2.LexicallyDeclaredNames());
    },

    'CaseClauses: CaseClauses CaseClause',
    function() {
        var names = this.CaseClauses1.LexicallyDeclaredNames();
        names.append_elements_of(this.CaseClauses2.LexicallyDeclaredNames());
        return names;
    },

    'CaseClause: case Expression : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.LexicallyDeclaredNames();
        else return [];
    },

    'DefaultClause: default : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.LexicallyDeclaredNames();
        else return [];
    },
]);

// 13.12.6
Static_Semantics('LexicallyScopedDeclarations', [

    'CaseBlock: { }',
    function() {
        return [];
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function() {
        if (this.CaseClauses1) var declarations = this.CaseClauses1.LexicallyScopedDeclarations();
        else var declarations = [];
        declarations.append_elements_of(this.DefaultClause.LexicallyScopedDeclarations());
        if (!this.CaseClauses2) return declarations;
        else return declarations.concat(this.CaseClauses2.LexicallyScopedDeclarations());
    },

    'CaseClauses: CaseClauses CaseClause',
    function() {
        var declarations = this.CaseClauses.LexicallyScopedDeclarations();
        declarations.append_elements_of(this.CaseClause.LexicallyScopedDeclarations());
        return declarations;
    },

    'CaseClause: case Expression : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.LexicallyScopedDeclarations();
        else return [];
    },

    'DefaultClause: default : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.LexicallyScopedDeclarations();
        else return [];
    },
]);

// 13.12.7
Static_Semantics('VarDeclaredNames', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function() {
        return this.CaseBlock.VarDeclaredNames();
    },

    'CaseBlock: { }',
    function() {
        return [];
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function() {
        if (this.CaseClauses1) var names = this.CaseClauses1.VarDeclaredNames();
        else var names = [];
        names.append_elements_of(this.DefaultClause.VarDeclaredNames());
        if (!this.CaseClauses2) return names;
        else return names.concat(this.CaseClauses2.VarDeclaredNames());
    },

    'CaseClauses: CaseClauses CaseClause',
    function() {
        var names = this.CaseClauses.VarDeclaredNames();
        names.append_elements_of(this.CaseClause.VarDeclaredNames());
        return names;
    },

    'CaseClause: case Expression : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.VarDeclaredNames();
        else return [];
    },

    'DefaultClause: default : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.VarDeclaredNames();
        else return [];
    },
]);

// 13.12.8
Static_Semantics('VarScopedDeclarations', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function() {
        return this.CaseBlock.VarScopedDeclarations();
    },

    'CaseBlock: { }',
    function() {
        return [];
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function() {
        if (this.CaseClauses1) var declarations = this.CaseClauses1.VarScopedDeclarations();
        else var declarations = [];
        declarations.append_elements_of(this.DefaultClause.VarScopedDeclarations());
        if (!this.CaseClauses2) return declarations;
        else return declarations.concat(this.CaseClauses2.VarScopedDeclarations());
    },

    'CaseClauses: CaseClauses CaseClause',
    function() {
        var declarations = this.CaseClauses.VarScopedDeclarations();
        declarations.append_elements_of(this.CaseClause.VarScopedDeclarations());
        return declarations;
    },

    'CaseClause: case Expression : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.VarScopedDeclarations();
        else return [];
    },

    'DefaultClause: default : StatementList[opt]',
    function() {
        if (this.StatementList) return this.StatementList.VarScopedDeclarations();
        else return [];
    },
]);

// 13.12.9
Runtime_Semantics('CaseBlockEvaluation', [

    'CaseBlock: { }',
    function(input) {
        return undefined;
    },

    'CaseBlock: { CaseClauses }',
    function(input) {
        var V = undefined;
        var A = ["the List of CaseClause items in CaseClauses, in source text order"]; //TODO
        var found = false;
        for (var C of A) {
            if (found === false) {
                var clauseSelector = concreteCompletion(C.CaseSelectorEvaluation());
                ReturnIfAbrupt(clauseSelector);
                var found = (input === clauseSelector.Value);
            }
            if (found === true) {
                var R = concreteCompletion(C.Evaluation());
                if (R.Value !== empty) var V = R.Value;
                if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
            }
        }
        return V;
    },

    'CaseBlock: { CaseClauses[opt] DefaultClause CaseClauses[opt] }',
    function(input) {
        var V = undefined;
        var A = ["the List of CaseClause items in the CaseClauses1, in source text order"]; //TODO
        var found = false;
        for (var C of A) {
            if (found === false) {
                var clauseSelector = concreteCompletion(C.CaseSelectorEvaluation());
                ReturnIfAbrupt(clauseSelector);
                var found = (input === clauseSelector.Value);
            }
            if (found === true) {
                var R = concreteCompletion(C.Evaluation());
                if (R.Value !== empty) var V = R.Value;
                if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
            }
        }
        var foundInB = false;
        var B = ["the List containing the CaseClause items in the CaseClauses2, in source text order"]; //TODO
        if (found === false) {
            for (var C of B) {
                if (foundInB === false) {
                    var clauseSelector = concreteCompletion(C.CaseSelectorEvaluation());
                    ReturnIfAbrupt(clauseSelector);
                    var foundInB = (input === clauseSelector.Value);
                }
                if (foundInB === true) {
                    var R = concreteCompletion(C.Evaluation());
                    if (R.Value !== empty) var V = R.Value;
                    if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
                }
            }
        }
        if (foundInB === true) return V;
        var R = this.DefaultClause.Evaluation();
        if (R.Value !== empty) var V = R.Value;
        if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
        for (var C of B) {
            var R = concreteCompletion(C.Evaluation());
            if (R.Value !== empty) var V = R.Value;
            if (R.is_an_abrupt_completion()) return resolveCompletion(UpdateEmpty(R, V));
        }
        return V;
    },
]);

// 13.12.10
Runtime_Semantics('CaseSelectorEvaluation', [

    'CaseClause: case Expression : StatementList[opt]',
    function() {
        var exprRef = this.Expression.Evaluation();
        return GetValue(exprRef);
    },
]);

// 13.12.11
Runtime_Semantics('Evaluation', [

    'SwitchStatement: switch ( Expression ) CaseBlock',
    function() {
        var exprRef = this.Expression.Evaluation();
        var switchValue = GetValue(exprRef);
        var oldEnv = the_running_execution_context.LexicalEnvironment;
        var blockEnv = NewDeclarativeEnvironment(oldEnv);
        BlockDeclarationInstantiation(CaseBlock, blockEnv);
        the_running_execution_context.LexicalEnvironment = blockEnv;
        var R = concreteCompletion(this.CaseBlock.CaseBlockEvaluation(switchValue));
        the_running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(R);
    },

    'CaseClause: case Expression :',
    function() {
        return empty;
    },

    'CaseClause: case Expression : StatementList',
    function() {
        return this.StatementList.Evaluation();
    },

    'DefaultClause: default :',
    function() {
        return empty;
    },

    'DefaultClause: default : StatementList',
    function() {
        return this.StatementList.Evaluation();
    },
]);

// 13.13 Labelled Statements

Syntax([
    'LabelledStatement[Yield,Return]: LabelIdentifier[?Yield] : LabelledItem[?Yield,?Return]',
    'LabelledItem[Yield,Return]: Statement[?Yield,?Return]',
    'LabelledItem[Yield,Return]: FunctionDeclaration[?Yield]',
]);

// 13.13.1
Static_Semantics('Early Errors', [

    'LabelledItem: FunctionDeclaration',
    function() {
        throw EarlySyntaxError();
    },
]);

// 13.13.2
Static_Semantics('ContainsDuplicateLabels', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(labelSet) {
        var label = this.LabelIdentifier.StringValue();
        if (label.is_an_element_of(labelSet)) return true;
        var newLabelSet = labelSet.concat(label);
        return this.LabelledItem.ContainsDuplicateLabels(newLabelSet);
    },

    'LabelledItem: FunctionDeclaration',
    function(labelSet) {
        return false;
    },
]);

// 13.13.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(labelSet) {
        var label = this.LabelIdentifier.StringValue();
        var newLabelSet = labelSet.concat(label);
        return this.LabelledItem.ContainsUndefinedBreakTarget(newLabelSet);
    },

    'LabelledItem: FunctionDeclaration',
    function(labelSet) {
        return false;
    },
]);

// 13.13.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(iterationSet, labelSet) {
        var label = this.LabelIdentifier.StringValue();
        var newLabelSet = labelSet.concat(label);
        return this.LabelledItem.ContainsUndefinedContinueTarget(iterationSet, newLabelSet);
    },

    'LabelledItem: FunctionDeclaration',
    function(iterationSet, labelSet) {
        return false;
    },
]);

// 13.13.5
function IsLabelledFunction(stmt) {
    if (!stmt.is('LabelledStatement')) return false;
    var item = stmt.LabelledItem;
    if (item.is('LabelledItem: FunctionDeclaration')) return true;
    var subStmt = item.Statement;
    return IsLabelledFunction(subStmt);
}

// 13.13.6
Static_Semantics('LexicallyDeclaredNames', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.LexicallyDeclaredNames();
    },

    'LabelledItem: Statement',
    function() {
        return [];
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return this.FunctionDeclaration.BoundNames();
    },
]);

// 13.13.7
Static_Semantics('LexicallyScopedDeclarations', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.LexicallyScopedDeclarations();
    },

    'LabelledItem: Statement',
    function() {
        return [];
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return [this.FunctionDeclaration];
    },
]);

// 13.13.8
Static_Semantics('TopLevelLexicallyDeclaredNames', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return [];
    },
]);

// 13.13.9
Static_Semantics('TopLevelLexicallyScopedDeclarations', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return [];
    },

]);

// 13.13.10
Static_Semantics('TopLevelVarDeclaredNames', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.TopLevelVarDeclaredNames();
    },

    'LabelledItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.TopLevelVarDeclaredNames();
        return this.Statement.VarDeclaredNames();
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return this.FunctionDeclaration.BoundNames();
    },
]);

// 13.13.11
Static_Semantics('TopLevelVarScopedDeclarations', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.TopLevelVarScopedDeclarations();
    },

    'LabelledItem: Statement',
    function() {
        if (this.Statement.is('Statement: LabelledStatement')) return this.Statement.TopLevelVarScopedDeclarations();
        return this.Statement.VarScopedDeclarations();
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return [this.FunctionDeclaration];
    },
]);

// 13.13.12
Static_Semantics('VarDeclaredNames', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.VarDeclaredNames();
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return [];
    },
]);

// 13.13.13
Static_Semantics('VarScopedDeclarations', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        return this.LabelledItem.VarScopedDeclarations();
    },

    'LabelledItem: FunctionDeclaration',
    function() {
        return [];
    },
]);

// 13.13.14
Runtime_Semantics('LabelledEvaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function(labelSet) {
        var label = this.LabelIdentifier.StringValue();
        labelSet.push(label);
        var stmtResult = concreteCompletion(this.LabelledItem.LabelledEvaluation(labelSet));
        if (stmtResult.Type === 'break' && SameValue(stmtResult.Target, label) === true) {
            var stmtResult = NormalCompletion(stmtResult.Value);
        }
        return resolveCompletion(stmtResult);
    },

    'LabelledItem: Statement',
    function(labelSet) {
        if (this.Statement.is('LabelledStatement') || this.Statement.is('BreakableStatement')) {
            return this.Statement.LabelledEvaluation(labelSet);
        } else {
            return this.Statement.Evaluation();
        }
    },

    'LabelledItem: FunctionDeclaration',
    function(labelSet) {
        return this.FunctionDeclaration.Evaluation();
    },
]);

// 13.13.15
Runtime_Semantics('Evaluation', [

    'LabelledStatement: LabelIdentifier : LabelledItem',
    function() {
        var newLabelSet = [];
        return this.LabelledEvaluation(newLabelSet);
    },
]);

// 13.14 The throw Statement

Syntax([
    'ThrowStatement[Yield]: throw Expression[In,?Yield] ;',
]);

// 13.14.1
Runtime_Semantics('Evaluation', [

    'ThrowStatement: throw Expression ;',
    function() {
        var exprRef = this.Expression.Evaluation();
        var exprValue = GetValue(exprRef);
        throw Completion({ Type: 'throw', Value: exprValue, Target: empty });
    },
]);

// 13.15 The try Statement

Syntax([
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Catch[?Yield,?Return]',
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Finally[?Yield,?Return]',
    'TryStatement[Yield,Return]: try Block[?Yield,?Return] Catch[?Yield,?Return] Finally[?Yield,?Return]',
    'Catch[Yield,Return]: catch ( CatchParameter[?Yield] ) Block[?Yield,?Return]',
    'Finally[Yield,Return]: finally Block[?Yield,?Return]',
    'CatchParameter[Yield]: BindingIdentifier[?Yield]',
    'CatchParameter[Yield]: BindingPattern[?Yield]',
]);

// 13.15.1
Static_Semantics('Early Errors', [

    'Catch: catch ( CatchParameter ) Block',
    function() {
        if (this.CatchParameter.BoundNames().contains_any_duplicate_elements()) throw EarlySyntaxError();
        if (this.CatchParameter.BoundNames().also_occurs_in(this.Block.LexicallyDeclaredNames())) throw EarlySyntaxError();
        if (this.CatchParameter.BoundNames().also_occurs_in(this.Block.VarDeclaredNames())) throw EarlySyntaxError();
    },
]);

// 13.15.2
Static_Semantics('ContainsDuplicateLabels', [

    'TryStatement: try Block Catch',
    function(labelSet) {
        var hasDuplicates = this.Block.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.Catch.ContainsDuplicateLabels(labelSet);
    },

    'TryStatement: try Block Finally',
    function(labelSet) {
        var hasDuplicates = this.Block.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.Finally.ContainsDuplicateLabels(labelSet);
    },

    'TryStatement: try Block Catch Finally',
    function(labelSet) {
        var hasDuplicates = this.Block.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        var hasDuplicates = this.Catch.ContainsDuplicateLabels(labelSet);
        if (hasDuplicates === true) return true;
        return this.Finally.ContainsDuplicateLabels(labelSet);
    },

    'Catch: catch ( CatchParameter ) Block',
    function(labelSet) {
        return this.Block.ContainsDuplicateLabels(labelSet);
    },
]);

// 13.15.3
Static_Semantics('ContainsUndefinedBreakTarget', [

    'TryStatement: try Block Catch',
    function(labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.Catch.ContainsUndefinedBreakTarget(labelSet);
    },

    'TryStatement: try Block Finally',
    function(labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.Finally.ContainsUndefinedBreakTarget(labelSet);
    },

    'TryStatement: try Block Catch Finally',
    function(labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        var hasUndefinedLabels = this.Catch.ContainsUndefinedBreakTarget(labelSet);
        if (hasUndefinedLabels === true) return true;
        return this.Finally.ContainsUndefinedBreakTarget(labelSet);
    },

    'Catch: catch ( CatchParameter ) Block',
    function(labelSet) {
        return this.Block.ContainsUndefinedBreakTarget(labelSet);
    },
]);

// 13.15.4
Static_Semantics('ContainsUndefinedContinueTarget', [

    'TryStatement: try Block Catch',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.Catch.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'TryStatement: try Block Finally',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.Finally.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'TryStatement: try Block Catch Finally',
    function(iterationSet, labelSet) {
        var hasUndefinedLabels = this.Block.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        var hasUndefinedLabels = this.Catch.ContainsUndefinedContinueTarget(iterationSet, []);
        if (hasUndefinedLabels === true) return true;
        return this.Finally.ContainsUndefinedContinueTarget(iterationSet, []);
    },

    'Catch: catch ( CatchParameter ) Block',
    function(iterationSet, labelSet) {
        return this.Block.ContainsUndefinedContinueTarget(iterationSet, []);
    },
]);

// 13.15.5
Static_Semantics('VarDeclaredNames', [

    'TryStatement: try Block Catch',
    function() {
        var names = this.Block.VarDeclaredNames();
        names.append_elements_of(this.Catch.VarDeclaredNames());
        return names;
    },

    'TryStatement: try Block Finally',
    function() {
        var names = this.Block.VarDeclaredNames();
        names.append_elements_of(this.Finally.VarDeclaredNames());
        return names;
    },

    'TryStatement: try Block Catch Finally',
    function() {
        var names = this.Block.VarDeclaredNames();
        names.append_elements_of(this.Catch.VarDeclaredNames());
        names.append_elements_of(this.Finally.VarDeclaredNames());
        return names;
    },

    'Catch: catch ( CatchParameter ) Block',
    function() {
        return this.Block.VarDeclaredNames();
    },
]);

// 13.15.6
Static_Semantics('VarScopedDeclarations', [

    'TryStatement: try Block Catch',
    function() {
        var declarations = this.Block.VarScopedDeclarations();
        declarations.append_elements_of(this.Catch.VarScopedDeclarations());
        return declarations;
    },

    'TryStatement: try Block Finally',
    function() {
        var declarations = this.Block.VarScopedDeclarations();
        declarations.append_elements_of(this.Finally.VarScopedDeclarations());
        return declarations;
    },

    'TryStatement: try Block Catch Finally',
    function() {
        var declarations = this.Block.VarScopedDeclarations();
        declarations.append_elements_of(this.Catch.VarScopedDeclarations());
        declarations.append_elements_of(this.Finally.VarScopedDeclarations());
        return declarations;
    },

    'Catch: catch ( CatchParameter ) Block',
    function() {
        return this.Block.VarScopedDeclarations();
    },
]);

// 13.15.7
Runtime_Semantics('CatchClauseEvaluation', [

    'Catch: catch ( CatchParameter ) Block',
    function(thrownValue) {
        var oldEnv = the_running_execution_context.LexicalEnvironment;
        var catchEnv = NewDeclarativeEnvironment(oldEnv);
        var catchEnvRec = catchEnv.EnvironmentRecord;
        for (var argName of this.CatchParameter.BoundNames()) {
            catchEnvRec.CreateMutableBinding(argName, false);
        }
        the_running_execution_context.LexicalEnvironment = catchEnv;
        var status = concreteCompletion(this.CatchParameter.BindingInitialization(thrownValue, catchEnv));
        if (status.is_an_abrupt_completion()) {
            the_running_execution_context.LexicalEnvironment = oldEnv;
            return resolveCompletion(status);
        }
        var B = concreteCompletion(this.Block.Evaluation());
        the_running_execution_context.LexicalEnvironment = oldEnv;
        return resolveCompletion(B);
    },
]);

// 13.15.8
Runtime_Semantics('Evaluation', [

    'TryStatement: try Block Catch',
    function() {
        var B = concreteCompletion(this.Block.Evaluation());
        if (B.Type === 'throw') var C = concreteCompletion(this.Catch.CatchClauseEvaluation(B.Value));
        else var C = B;
        return resolveCompletion(UpdateEmpty(C, undefined));
    },

    'TryStatement: try Block Finally',
    function() {
        var B = concreteCompletion(this.Block.Evaluation());
        var F = concreteCompletion(this.Finally.Evaluation());
        if (F.Type === 'normal') var F = B;
        return resolveCompletion(UpdateEmpty(F, undefined));
    },

    'TryStatement: try Block Catch Finally',
    function() {
        var B = concreteCompletion(this.Block.Evaluation());
        if (B.Type === 'throw') var C = concreteCompletion(this.Catch.CatchClauseEvaluation(B.Value));
        else var C = B;
        var F = concreteCompletion(this.Finally.Evaluation());
        if (F.Type === 'normal') var F = C;
        return resolveCompletion(UpdateEmpty(F, undefined));
    },
]);

// 13.16 The debugger Statement

Syntax([
    'DebuggerStatement: debugger ;',
]);

// 13.16.1
Runtime_Semantics('Evaluation', [

    'DebuggerStatement: debugger ;',
    function() {
        return empty;
    },
]);

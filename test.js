test('Truth Combos', function() {
    var symbols = {};
    var symCount = 6;
    // Initialize symbols with default true values
    for (var i = 0; i < symCount; i++) {
        symbols['sym' + i] = true;
    }
    var combos = truth.truthCombos(symbols);
    // Check the correct number of truth combos (2^6)
    assert.equal(combos.length, Math.pow(2, symCount), 'Check number of truth combos.');
});

function testExpr(expr, expectedAst) {
    var result = truth.parse(truth.tokenize(expr));
    var actualAst = result[0];
    // Verify the parsed AST matches the expected AST
    assert.deepEqual(actualAst, expectedAst, 'Verify expression: ' + expr);
}

function assertSameAst(expr1, expr2) {
    var ast1 = truth.parse(truth.tokenize(expr1))[0];
    var ast2 = truth.parse(truth.tokenize(expr2))[0];
    // Compare the ASTs of two expressions
    assert.deepEqual(ast1, ast2, 'Expressions do not parse the same: expr1: ' + expr1 + ' expr2: ' + expr2);
}

test('Parser', function() {
    // Test single token expressions
    testExpr('singletoken', 'singletoken');
    testExpr('(((singletoken)))', 'singletoken');
    testExpr('a&b', ['&', 'a', 'b']);
    testExpr('a & b', ['&', 'a', 'b']);
    testExpr('a & (((((b)))))', ['&', 'a', 'b']);
    testExpr('verylong101symbolname1 & ((b))', ['&', 'verylong101symbolname1', 'b']);
    testExpr('b & (b & (b & (b & b)))', ['&', 'b', ['&', 'b', ['&', 'b', ['&', 'b', 'b']]]]);
    testExpr('b & (b & ((!b) & (b & b)))', ['&', 'b', ['&', 'b', ['&', ['!', 'b'], ['&', 'b', 'b']]]]);
    testExpr('!(a)', ['!', 'a']);
    testExpr('!a', ['!', 'a']);
    testExpr('(!a)', ['!', 'a']);
    testExpr('~a', ['~', 'a']);
    testExpr('(~a)', ['~', 'a']);
    testExpr('(~((a)))', ['~', 'a']);
    testExpr('a & b & c & d', ['&', 'a', ['&', 'b', ['&', 'c', 'd']]]);
});

test('Operator precedence', function() {
    // Check if operator precedence is respected
    assertSameAst('a & b', 'a & b');
    assertSameAst('a & b | c', '(a & b) | c');
    assertSameAst('c | a & b', 'c | (a & b)');
});

test('evalExpr', function() {
    var expr = ['&', 'a', 'b'];
    var bindings = {'a' : true, 'b' : false};
    // Evaluate logical AND expression
    assert.equal(truth.evalExpr(expr, bindings), false);
    
    bindings = {'a' : true, 'b' : true};
    assert.equal(truth.evalExpr(expr, bindings), true);

    expr = ['^', 'a', 'b'];
    bindings = {'a' : true, 'b' : false};
    // Evaluate logical XOR expression
    assert.equal(truth.evalExpr(expr, bindings), true);
    
    bindings = {'a' : true, 'b' : true};
    assert.equal(truth.evalExpr(expr, bindings), false);

    expr = ['!', 'a'];
    bindings = {'a' : true};
    // Evaluate logical NOT expression
    assert.equal(truth.evalExpr(expr, bindings), false);

    expr = ['~', 'a'];
    assert.equal(truth.evalExpr(expr, bindings), false);
});

test('Tokenizer', function() {
    // Test tokenization of different expressions
    assert.deepEqual(truth.tokenize('longsymbol'), ['longsymbol']);
    assert.deepEqual(truth.tokenize('(  longsymbol   | ||'), ['(', 'longsymbol', '|', '|', '|']);
});

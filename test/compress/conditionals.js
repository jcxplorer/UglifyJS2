ifs_1: {
    options = {
        conditionals: true
    };
    input: {
        if (foo) bar();
        if (!foo); else bar();
        if (foo); else bar();
        if (foo); else;
    }
    expect: {
        foo&&bar();
        foo&&bar();
        foo||bar();
        foo;
    }
}

ifs_2: {
    options = {
        conditionals: true
    };
    input: {
        if (foo) {
            x();
        } else if (bar) {
            y();
        } else if (baz) {
            z();
        }

        if (foo) {
            x();
        } else if (bar) {
            y();
        } else if (baz) {
            z();
        } else {
            t();
        }
    }
    expect: {
        foo ? x() : bar ? y() : baz && z();
        foo ? x() : bar ? y() : baz ? z() : t();
    }
}

ifs_3_should_warn: {
    options = {
        conditionals : true,
        dead_code    : true,
        evaluate     : true,
        booleans     : true
    };
    input: {
        var x, y;
        if (x && !(x + "1") && y) { // 1
            var qq;
            foo();
        } else {
            bar();
        }

        if (x || !!(x + "1") || y) { // 2
            foo();
        } else {
            var jj;
            bar();
        }
    }
    expect: {
        var x, y;
        var qq; bar();          // 1
        var jj; foo();          // 2
    }
}

ifs_4: {
    options = {
        conditionals: true
    };
    input: {
        if (foo && bar) {
            x(foo)[10].bar.baz = something();
        } else
            x(foo)[10].bar.baz = something_else();
    }
    expect: {
        foo && bar
            ? x(foo)[10].bar.baz = something()
            : x(foo)[10].bar.baz = something_else();
    }
}

ifs_5: {
    options = {
        if_return: true,
        conditionals: true,
        comparisons: true,
    };
    input: {
        function f() {
            if (foo) return;
            bar();
            baz();
        }
        function g() {
            if (foo) return;
            if (bar) return;
            if (baz) return;
            if (baa) return;
            a();
            b();
        }
    }
    expect: {
        function f() {
            if (!foo) {
                bar();
                baz();
            }
        }
        function g() {
            if (!(foo || bar || baz || baa)) {
                a();
                b();
            }
        }
    }
}

ifs_6: {
    options = {
        conditionals: true,
        comparisons: true
    };
    input: {
        var x;
        if (!foo && !bar && !baz && !boo) {
            x = 10;
        } else {
            x = 20;
        }
    }
    expect: {
        var x;
        x = foo || bar || baz || boo ? 20 : 10;
    }
}

cond_1: {
    options = {
        conditionals: true
    };
    input: {
        var do_something; // if undeclared it's assumed to have side-effects
        if (some_condition()) {
            do_something(x);
        } else {
            do_something(y);
        }
    }
    expect: {
        var do_something;
        do_something(some_condition() ? x : y);
    }
}

cond_2: {
    options = {
        conditionals: true
    };
    input: {
        var x, FooBar;
        if (some_condition()) {
            x = new FooBar(1);
        } else {
            x = new FooBar(2);
        }
    }
    expect: {
        var x, FooBar;
        x = new FooBar(some_condition() ? 1 : 2);
    }
}

cond_3: {
    options = {
        conditionals: true
    };
    input: {
        var FooBar;
        if (some_condition()) {
            new FooBar(1);
        } else {
            FooBar(2);
        }
    }
    expect: {
        var FooBar;
        some_condition() ? new FooBar(1) : FooBar(2);
    }
}

cond_4: {
    options = {
        conditionals: true
    };
    input: {
        var do_something;
        if (some_condition()) {
            do_something();
        } else {
            do_something();
        }
    }
    expect: {
        var do_something;
        some_condition(), do_something();
    }
}

cond_5: {
    options = {
        conditionals: true
    };
    input: {
        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            } else {
                alternate();
            }
        } else {
            alternate();
        }

        if (some_condition()) {
            if (some_other_condition()) {
                do_something();
            }
        }
    }
    expect: {
        some_condition() && some_other_condition() ? do_something() : alternate();
        some_condition() && some_other_condition() && do_something();
    }
}

cond_7: {
    options = {
        conditionals: true,
        evaluate    : true
    };
    input: {
        var x, y, z, a, b;
        // compress these
        if (y) {
            x = 1+1;
        } else {
            x = 2;
        }

        if (y) {
            x = 1+1;
        } else if (z) {
            x = 2;
        } else {
            x = 3-1;
        }

        x = y ? 'foo' : 'fo'+'o';

        x = y ? 'foo' : y ? 'foo' : 'fo'+'o';

        // Compress conditions that have side effects
        if (condition()) {
            x = 10+10;
        } else {
            x = 20;
        }

        if (z) {
            x = 'fuji';
        } else if (condition()) {
            x = 'fu'+'ji';
        } else {
            x = 'fuji';
        }

        x = condition() ? 'foobar' : 'foo'+'bar';

        // don't compress these
        x = y ? a : b;

        x = y ? 'foo' : 'fo';
    }
    expect: {
        var x, y, z, a, b;
        x = 2;
        x = 2;
        x = 'foo';
        x = 'foo';
        x = (condition(), 20);
        x = z ? 'fuji' : (condition(), 'fuji');
        x = (condition(), 'foobar');
        x = y ? a : b;
        x = y ? 'foo' : 'fo';
    }
}

cond_7_1: {
    options = {
        conditionals: true,
        evaluate    : true
    };
    input: {
        var x;
        // access to global should be assumed to have side effects
        if (y) {
            x = 1+1;
        } else {
            x = 2;
        }
    }
    expect: {
        var x;
        x = (y, 2);
    }
}

cond_8: {
    options = {
        conditionals: true,
        evaluate    : true
    };
    input: {
        var a;
        // compress these
        a = condition ? true : false;

        a = !condition ? true : false;

        a = condition() ? true : false;

        if (condition) {
            a = true;
        } else {
            a = false;
        }

        a = condition ? false : true;

        a = !condition ? false : true;

        a = condition() ? false : true;

        if (condition) {
            a = false;
        } else {
            a = true;
        }

        // don't compress these
        a = condition ? 1 : false;

        a = !condition ? true : 0;

        a = condition ? 1 : 0;

    }
    expect: {
        var a;
        a = !!condition;
        a = !condition;
        a = !!condition();
        a = !!condition;
        a = !condition;
        a = !!condition;
        a = !condition();
        a = !condition;
        a = condition ? 1 : false;
        a = condition ? 0 : true;
        a = condition ? 1 : 0;
    }
}

/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const Repeater = require('../repeater');
const Deferred = require('../deferred');

// Defines a Mocha test suite to group tests of similar kind together
suite("Repeater Tests", function () {

    // Defines a Mocha unit test
    test("Repeater executes function returning resolved promise", function (done) {
        const repeater = new Repeater(
            () => {
                return Promise.resolve(123)
                    .then(() => {
                        repeater.dispose();
                        done();
                    });
            },
            () => { return 0.05; }
        );

        repeater.execute();
    });

    test("Repeater executes function returning rejected promise", function (done) {
        const repeater = new Repeater(
            () => {
                return Promise.reject("err")
                    .catch(err => {
                        repeater.dispose();
                        done();
                        throw err;
                    });
            },
            () => { return 0.05; }
        );

        repeater.execute();
    });

    test("Repeater repeats function call after returning resolved promise", function (done) {
        let numberOfExecutions = 0;

        const repeater = new Repeater(
            () => {
                numberOfExecutions++;
                return Promise.resolve(123)
                    .then(() => {
                        if (numberOfExecutions === 2) {
                            repeater.dispose();
                            done();
                        }
                    });
            },
            () => { return 0.05; }
        );

        repeater.execute();
    });

    test("Repeater repeats function call after returning rejected promise", function (done) {
        let numberOfExecutions = 0;
        const deferred = new Deferred();

        const repeater = new Repeater(
            () => {
                numberOfExecutions++;
                if(numberOfExecutions == 2) {
                    deferred.resolve();
                }
                return new Promise((resolve, reject) => {
                    reject("err");
                });
            },
            () => { return 0.05; }
        );

        deferred.getPromise().then(() => { 
            repeater.dispose();
            done(); 
        });

        repeater.execute();
    });
});

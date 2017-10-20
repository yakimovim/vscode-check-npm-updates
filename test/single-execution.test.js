/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const SingleExecution = require('../single-execution');
const Deferred = require("../deferred");

// Defines a Mocha test suite to group tests of similar kind together
suite("Single Execution Tests", function () {

    // Defines a Mocha unit test
    test("Function is executed with resolved promise", function (done) {
        const deferred = new Deferred();
        const singleExecution = new SingleExecution(
            () => { return deferred.getPromise(); },
            () => { assert.fail(0, 1, "There should be no another execution"); }
        );

        singleExecution.execute()
            .then(data => {
                assert.equal(data, 123, "Incorrect resolved data.");
                done();
            })
            .catch(() => {
                assert.fail(0, 1, "Execution should not fail.");
            });

        deferred.resolve(123);
    });

    test("Function is executed with rejected promise", function (done) {
        const deferred = new Deferred();
        const singleExecution = new SingleExecution(
            () => { return deferred.getPromise(); },
            () => { assert.fail(0, 1, "There should be no another execution"); }
        );

        singleExecution.execute()
            .then(() => {
                assert.fail(0, 1, "Execution should fail.");
            })
            .catch(err => {
                assert.equal(err, 123, "Incorrect resolved data.");
                done();
            });

        deferred.reject(123);
    });
    
    test("Function can be re-executed after resolved promise", function (done) {
        const singleExecution = new SingleExecution(
            () => { return Promise.resolve(123); },
            () => { assert.fail(0, 1, "There should be no another execution"); }
        );

        singleExecution.execute()
            .then(() => {
                return singleExecution.execute();
            })
            .then(data => {
                assert.equal(data, 123, "Incorrect resolved data.");
                done();
            })
            .catch(() => {
                assert.fail(0, 1, "Execution should not fail.");
            });;
    });
    
    test("Function can be re-executed after rejected promise", function (done) {
        let firstRun = true;

        const singleExecution = new SingleExecution(
            () => { 
                if(firstRun) {
                    firstRun = false;
                    return Promise.reject("err"); 
                } else {
                    return Promise.resolve(123); 
                }
            },
            () => { assert.fail(0, 1, "There should be no another execution"); }
        );

        singleExecution.execute()
            .catch(err => {
                assert.equal(err, "err", "Incorrect rejected data.");
                return singleExecution.execute();
            })
            .then(data => {
                assert.equal(data, 123, "Incorrect resolved data.");
                done();
            })
            .catch(() => {
                assert.fail(0, 1, "Execution should not fail.");
            });;
    });
    
    test("Function can't be executed again if execution is in progress.", function (done) {

        let alreadyExecutingFunctionIsCalled = false;
        let numberOfExecutions = 0;

        const deferred = new Deferred();
        const singleExecution = new SingleExecution(
            () => 
            { 
                numberOfExecutions++;
                return deferred.getPromise(); 
            },
            () => { alreadyExecutingFunctionIsCalled = true; }
        );

        singleExecution.execute()
            .then(data => {
                assert.equal(data, 123, "Incorrect resolved data.");
                assert.equal(alreadyExecutingFunctionIsCalled, true, "'Already executing' function is not called.")
                assert.equal(numberOfExecutions, 1, "Incorrect number of executions of the main function.")
                done();
            })
            .catch(() => {
                assert.fail(0, 1, "Execution should not fail.");
            });

        singleExecution.execute();
        deferred.resolve(123);
    });
});

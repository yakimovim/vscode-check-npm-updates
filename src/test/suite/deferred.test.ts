/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { Deferred } from "../../deferred";

// Defines a Mocha test suite to group tests of similar kind together
suite("Deferred Object Tests", function() {
  // Defines a Mocha unit test
  test("Resolve works fine", function(done) {
    const deferred = new Deferred();
    const promise = deferred.getPromise();
    promise
      .then(data => {
        assert.equal(data, 123, "Incorrect resolved data");
        done();
      })
      .catch(() => {
        assert.fail(0, 1, "Promise should not fail");
        done();
      });
    deferred.resolve(123);
  });

  // Defines a Mocha unit test
  test("Reject works fine", function(done) {
    const deferred = new Deferred();
    const promise = deferred.getPromise();
    promise
      .then(() => {
        assert.fail(0, 1, "Promise should fail");
        done();
      })
      .catch(err => {
        assert.equal(err, 123, "Incorrect rejected data");
        done();
      });
    deferred.reject(123);
  });
});

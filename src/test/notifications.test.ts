/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as notifications from "../notifications";

// Defines a Mocha test suite to group tests of similar kind together
suite("Notifications Tests", function() {
  // Defines a Mocha unit test
  test("Maximum Number Of Notification Is Not Exceeded", function() {
    assert.equal(
      true,
      notifications.maximumNumberOfNotificationIsNotExceeded(10, -1)
    );
    assert.equal(
      true,
      notifications.maximumNumberOfNotificationIsNotExceeded(0, -1)
    );
    assert.equal(
      false,
      notifications.maximumNumberOfNotificationIsNotExceeded(0, 0)
    );
    assert.equal(
      false,
      notifications.maximumNumberOfNotificationIsNotExceeded(10, 0)
    );
    assert.equal(
      true,
      notifications.maximumNumberOfNotificationIsNotExceeded(9, 10)
    );
    assert.equal(
      false,
      notifications.maximumNumberOfNotificationIsNotExceeded(10, 10)
    );
    assert.equal(
      false,
      notifications.maximumNumberOfNotificationIsNotExceeded(11, 10)
    );
  });
});

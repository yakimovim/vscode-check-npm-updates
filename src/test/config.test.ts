/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import {
  IConfiguration,
  AllowedAutidLevels,
  mergeConfigurations
} from "../config";

suite("Configuration Tests", function() {
  test("Low audit level", function() {
    const partialConfiguration = {
      lowestAuditLevel: "Low"
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.equal(configuration.lowestAuditLevel, AllowedAutidLevels.low);
  });

  test("Moderate audit level", function() {
    const partialConfiguration = {
      lowestAuditLevel: "moDErate"
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.equal(configuration.lowestAuditLevel, AllowedAutidLevels.moderate);
  });

  test("High audit level", function() {
    const partialConfiguration = {
      lowestAuditLevel: "HIGH"
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.equal(configuration.lowestAuditLevel, AllowedAutidLevels.high);
  });

  test("Unknown audit level", function() {
    const partialConfiguration = {
      lowestAuditLevel: "Unknown"
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.equal(configuration.lowestAuditLevel, AllowedAutidLevels.low);
  });

  test("Lowercase packages to skip", function() {
    const partialConfiguration = {
      skip: ["Lodash", "ELECTRON"]
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.deepStrictEqual(configuration.skip, ["lodash", "electron"]);
  });

  test("SkipPatchUpdates boolean", function() {
    const partialConfiguration = {
      skipPatchUpdates: true
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.equal(configuration.skipPatchUpdates, true);
  });

  test("SkipPatchUpdates array", function() {
    const partialConfiguration = {
      skipPatchUpdates: ["Lodash", "ELECTRON"]
    };

    const configuration: IConfiguration = mergeConfigurations(
      partialConfiguration
    );

    assert.deepStrictEqual(configuration.skipPatchUpdates, [
      "lodash",
      "electron"
    ]);
  });
});

/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as packageVersions from "../package-versions";

// Defines a Mocha test suite to group tests of similar kind together
suite("Package Versions Tests", function() {

  test("Get Required Updates Of Outdated Packages. No packages", function() {
    const packages: packageVersions.IPackageVersion[] = [];

    const configuration = {
      disable: false,
      skip: [],
      skipPatchUpdates: false
    };

    const packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
      packages,
      configuration
    );

    assert.deepStrictEqual([], packagesToUpdate);
  });

  test("Get Required Updates Of Outdated Packages. Skip some packages", function() {
    const packages: packageVersions.IPackageVersion[] = [
      {
        packageName: "lodash",
        currentVersion: "4.10.1",
        wantedVersion: "4.11.2"
      },
      {
        packageName: "chai",
        currentVersion: "3.10.1",
        wantedVersion: "3.11.2"
      }
    ];

    const configuration = {
      disable: false,
      skip: [ "lodash" ],
      skipPatchUpdates: false
    };

    const packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
      packages,
      configuration
    );

    assert.deepStrictEqual([ "chai" ], packagesToUpdate);
  });

  test("Get Required Updates Of Outdated Packages. Skip all patch updates", function() {
    const packages: packageVersions.IPackageVersion[] = [
      {
        packageName: "lodash",
        currentVersion: "4.11.1",
        wantedVersion: "4.11.2"
      },
      {
        packageName: "chai",
        currentVersion: "3.10.1",
        wantedVersion: "3.11.2"
      }
    ];

    const configuration = {
      disable: false,
      skip: [],
      skipPatchUpdates: true
    };

    const packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
      packages,
      configuration
    );

    assert.deepStrictEqual([ "chai" ], packagesToUpdate);
  });

  test("Get Required Updates Of Outdated Packages. Skip some patch updates", function() {
    const packages: packageVersions.IPackageVersion[] = [
      {
        packageName: "lodash",
        currentVersion: "4.11.1",
        wantedVersion: "4.11.2"
      },
      {
        packageName: "chai",
        currentVersion: "3.10.1",
        wantedVersion: "3.11.2"
      }
    ];

    const configuration = {
      disable: false,
      skip: [],
      skipPatchUpdates: ["lodash"]
    };

    const packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
      packages,
      configuration
    );

    assert.deepStrictEqual([ "chai" ], packagesToUpdate);
  });
});

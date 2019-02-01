/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { hasAuditProblems } from "../audit-result-analizer";
import { IAuditResult } from "../auditor";
import { IConfiguration, AllowedAutidLevels, getDefaultConfiguration } from "../config";

suite("Audit Result Analisys Tests", function() {
  test("Critical problems", function() {
    const auditResult: IAuditResult = {
      critical: 1,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0
    };

    const configuration: IConfiguration = getDefaultConfiguration();

    configuration.lowestAuditLevel = AllowedAutidLevels.high;
    assert.equal(hasAuditProblems(auditResult, configuration), true);

    configuration.lowestAuditLevel = AllowedAutidLevels.moderate;
    assert.equal(hasAuditProblems(auditResult, configuration), true);

    configuration.lowestAuditLevel = AllowedAutidLevels.low;
    assert.equal(hasAuditProblems(auditResult, configuration), true);
  });

  test("High problems", function() {
    const auditResult: IAuditResult = {
      critical: 0,
      high: 1,
      moderate: 0,
      low: 0,
      info: 0
    };

    const configuration: IConfiguration = getDefaultConfiguration();

    configuration.lowestAuditLevel = AllowedAutidLevels.high;
    assert.equal(hasAuditProblems(auditResult, configuration), true);

    configuration.lowestAuditLevel = AllowedAutidLevels.moderate;
    assert.equal(hasAuditProblems(auditResult, configuration), true);

    configuration.lowestAuditLevel = AllowedAutidLevels.low;
    assert.equal(hasAuditProblems(auditResult, configuration), true);
  });

  test("Moderate problems", function() {
    const auditResult: IAuditResult = {
      critical: 0,
      high: 0,
      moderate: 1,
      low: 0,
      info: 0
    };

    const configuration: IConfiguration = getDefaultConfiguration();

    configuration.lowestAuditLevel = AllowedAutidLevels.high;
    assert.equal(hasAuditProblems(auditResult, configuration), false);

    configuration.lowestAuditLevel = AllowedAutidLevels.moderate;
    assert.equal(hasAuditProblems(auditResult, configuration), true);

    configuration.lowestAuditLevel = AllowedAutidLevels.low;
    assert.equal(hasAuditProblems(auditResult, configuration), true);
  });

  test("Low problems", function() {
    const auditResult: IAuditResult = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 1,
      info: 0
    };

    const configuration: IConfiguration = getDefaultConfiguration();

    configuration.lowestAuditLevel = AllowedAutidLevels.high;
    assert.equal(hasAuditProblems(auditResult, configuration), false);

    configuration.lowestAuditLevel = AllowedAutidLevels.moderate;
    assert.equal(hasAuditProblems(auditResult, configuration), false);

    configuration.lowestAuditLevel = AllowedAutidLevels.low;
    assert.equal(hasAuditProblems(auditResult, configuration), true);
  });

  test("Info problems", function() {
    const auditResult: IAuditResult = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 1
    };

    const configuration: IConfiguration = getDefaultConfiguration();

    configuration.lowestAuditLevel = AllowedAutidLevels.high;
    assert.equal(hasAuditProblems(auditResult, configuration), false);

    configuration.lowestAuditLevel = AllowedAutidLevels.moderate;
    assert.equal(hasAuditProblems(auditResult, configuration), false);

    configuration.lowestAuditLevel = AllowedAutidLevels.low;
    assert.equal(hasAuditProblems(auditResult, configuration), false);
  });
});

import { exec } from "child_process";
import { SequentialExecutor } from "./sequential-executor";
import { PackageManager } from "./package-versions";
import * as logger from "./logger";
import { Deferred } from "./deferred";

export interface IAuditResult {
  info: number;
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

const noAuditProblems: IAuditResult = {
  info: 0,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0
};

export class Auditor {
  private _sequentialExecutor: SequentialExecutor;

  constructor(sequentialExecutor: SequentialExecutor) {
    this._sequentialExecutor = sequentialExecutor;
  }

  public getAuditResult(
    packageManager: PackageManager,
    folder: string
  ): Promise<IAuditResult> {
    return this._sequentialExecutor.executeRequest<IAuditResult>(deferred => {
      if (packageManager === PackageManager.Npm) {
        this._getNpmAuditResult(folder, deferred);
      } else if (packageManager === PackageManager.Yarn) {
        this._getYarnAuditResult(folder, deferred);
      } else {
        deferred.resolve(noAuditProblems);
      }
    });
  }

  private _getNpmAuditResult(folder: string, deferred: Deferred): void {
    logger.logInfo(`Getting audit information in ${folder} by Npm...`);

    exec(
      "npm audit --json",
      {
        cwd: folder
      },
      (error, stdout, stderr) => {
        try {
          const json = JSON.parse(stdout);

          deferred.resolve(
            Object.assign({}, noAuditProblems, json.metadata.vulnerabilities)
          );
        } catch (err) {
          logger.logError(err);
          deferred.resolve(noAuditProblems);
        }
      }
    );
  }

  private _getYarnAuditResult(folder: string, deferred: Deferred): void {
    logger.logInfo(`Getting audit information in ${folder} by Yarn...`);

    exec(
      "yarn audit --json",
      {
        cwd: folder
      },
      (error, stdout, stderr) => {
        try {
          const jsonLines = stdout.split("\n");

          for (const jsonLine of jsonLines) {
            const json = JSON.parse(jsonLine);
            if (json.type === "auditSummary") {
              deferred.resolve(
                Object.assign({}, noAuditProblems, json.data.vulnerabilities)
              );
              return;
            }
          }

          deferred.resolve(noAuditProblems);
        } catch (err) {
          logger.logError(err);
          deferred.resolve(noAuditProblems);
        }
      }
    );
  }
}

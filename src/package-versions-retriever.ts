import { exec } from "child_process";
import * as logger from "./logger";
import { Deferred } from "./deferred";
import { PackageManager, IPackageVersion } from "./package-versions";
import { SequentialExecutor } from "./sequential-executor";

export class OutdatedPackagesRetriever {
  private _sequentialExecutor: SequentialExecutor;

  constructor(sequentialExecutor: SequentialExecutor) {
    this._sequentialExecutor = sequentialExecutor;
  }

  public getOutdatedPackages(
    packageManager: PackageManager,
    folder: string
  ): Promise<IPackageVersion[]> {

    return this._sequentialExecutor.executeRequest<IPackageVersion[]>(
      (deferred) => {
        if (packageManager === PackageManager.npm) {
          this._getOutdatedNpmPackages(folder, deferred);
        } else if (packageManager === PackageManager.yarn) {
          this._getOutdatedYarnPackages(folder, deferred);
        } else {
          deferred.resolve([]);
        }
      }
    );

  }

  private _getOutdatedNpmPackages(folder: string, deferred: Deferred): void {
    logger.logInfo(
      `Getting information about outdated packages in ${folder} by Npm...`
    );

    exec(
      "npm outdated --json",
      {
        cwd: folder
      },
      (error, stdout, stderr) => {
        const outdatedPackages: IPackageVersion[] = [];

        try {
          const json = JSON.parse(stdout);

          for (const packageName in json) {
            const packageInfo = json[packageName];
            if (packageInfo.current !== packageInfo.wanted) {
              outdatedPackages.push({
                packageName: packageName,
                currentVersion: packageInfo.current,
                wantedVersion: packageInfo.wanted
              });
            }
          }

          deferred.resolve(outdatedPackages);
        } catch (err) {
          logger.logError(err);
          deferred.resolve(outdatedPackages);
        }
      }
    );
  }

  private _getOutdatedYarnPackages(folder: string, deferred: Deferred): void {
    logger.logInfo(
      `Getting information about outdated packages in ${folder} by Yarn...`
    );

    exec(
      "yarn outdated --json",
      {
        cwd: folder
      },
      (error, stdout, stderr) => {
        const outdatedPackages: IPackageVersion[] = [];

        try {
          const jsonLines = stdout.split("\n");

          for (const jsonLine of jsonLines) {
            const json = JSON.parse(jsonLine);
            if (json.type === "table") {
              for (const tableRow of json.data.body) {
                if (tableRow[1] !== tableRow[2]) {
                  outdatedPackages.push({
                    packageName: tableRow[0],
                    currentVersion: tableRow[1],
                    wantedVersion: tableRow[2]
                  });
                }
              }

              deferred.resolve(outdatedPackages);
              return;
            }
          }

          deferred.resolve(outdatedPackages);
        } catch (err) {
          logger.logError(err);
          deferred.resolve(outdatedPackages);
        }
      }
    );
  }
}

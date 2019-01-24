import { exec } from "child_process";
import * as logger from "./logger";
import { Deferred } from "./deferred";
import {
  PackageManager,
  IPackageVersion
} from "./package-versions";

interface IOutdatedPackagesRequest {
  packageManager: PackageManager;
  folder: string;
  deferred: Deferred;
}

export class OutdatedPackagesRetriever {
  private _queueOfRequests: IOutdatedPackagesRequest[];

  constructor() {
    this._queueOfRequests = [];
  }

  public getOutdatedPackages(
    packageManager: PackageManager,
    folder: string
  ): Promise<IPackageVersion[]> {
    const deferred = new Deferred();
    this._queueOfRequests.push({
      packageManager: packageManager,
      folder: folder,
      deferred: deferred
    });

    if (this._queueOfRequests.length === 1) {
      this._executeDeferredRequest();
    }

    return deferred.getPromise();
  }

  private async _executeDeferredRequest() {
    if (this._queueOfRequests.length === 0) {
      return;
    }

    const request = this._queueOfRequests[0];

    if(request.packageManager === PackageManager.Npm) {
      this._getOutdatedNpmPackages(request.folder, request.deferred);
      await request.deferred.getPromise();
    } else if(request.packageManager === PackageManager.Yarn) {
      this._getOutdatedYarnPackages(request.folder, request.deferred);
      await request.deferred.getPromise();
    }

    this._queueOfRequests.splice(0, 1);
    this._executeDeferredRequest();
  }

  private _getOutdatedNpmPackages(folder: string, deferred: Deferred): void {
      logger.logInfo(
        `Getting information about outdated packages in ${
          folder
        } by Npm...`
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
        `Getting information about outdated packages in ${
          folder
        } by Yarn...`
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

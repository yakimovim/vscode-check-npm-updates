import * as semver from "semver";
import { IConfiguration } from "./config";

export enum PackageManager {
  Npm,
  Yarn
}

export interface IPackageInfo {
  packageManager: PackageManager;
  packageName: string;
  requestedVersion: string;
  installedVersion?: string;
  availableVersions?: string[];
}

export interface IPackageVersion {
  packageName: string;
  currentVersion: string;
  wantedVersion: string;
}

function updateOfOutdatedPackageRequired(
  outdatedPackage: IPackageVersion,
  configuration: IConfiguration
): boolean {
  if(configuration.skip.includes(outdatedPackage.packageName.toLowerCase())) {
    return false;
  }

  if (
    configuration.skipPatchUpdates === true ||
    (Array.isArray(configuration.skipPatchUpdates) &&
      (<any[]>configuration.skipPatchUpdates).includes(
        outdatedPackage.packageName.toLowerCase()
      ))
  ) {
    const currentMajor = semver.major(outdatedPackage.currentVersion);
    const currentMinor = semver.minor(outdatedPackage.currentVersion);

    const wantedMajor = semver.major(outdatedPackage.wantedVersion);
    const wantedMinor = semver.minor(outdatedPackage.wantedVersion);

    return currentMajor !== wantedMajor || currentMinor !== wantedMinor;
  }

  return true;
}

export function getRequiredUpdatesOfOutdatedPackages(
  outdatedPackages: IPackageVersion[],
  configuration: IConfiguration
): string[] {
  const packagesToUpdate: string[] = [];

  outdatedPackages.forEach(packageVersion => {
    if (updateOfOutdatedPackageRequired(packageVersion, configuration)) {
      packagesToUpdate.push(packageVersion.packageName);
    }
  });

  return packagesToUpdate;
}

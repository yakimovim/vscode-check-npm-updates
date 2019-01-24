import * as fs from "fs";
import * as path from "path";

import * as config from "./config";
import * as logger from "./logger";
import * as packageVersions from "./package-versions";
import { OutdatedPackagesRetriever } from "./package-versions-retriever";

export function createPackagesAnalyser(
  packageVersionsRetriever: OutdatedPackagesRetriever,
  packageFilePath: string
): PackagesAnalyser | null {
  const folderPath = path.dirname(packageFilePath);

  if (fs.existsSync(path.join(folderPath, "package-lock.json"))) {
    return new NpmPackagesAnalyser(packageVersionsRetriever, folderPath);
  }

  if (fs.existsSync(path.join(folderPath, "yarn.lock"))) {
    return new YarnPackagesAnalyser(packageVersionsRetriever, folderPath);
  }

  return null;
}

export abstract class PackagesAnalyser {
  protected _packagesToUpdate: string[] = [];

  constructor(
    public readonly packageManager: packageVersions.PackageManager,
    protected readonly packageVersionsRetriever: OutdatedPackagesRetriever,
    public folderPath: string
  ) {
    this.packageManager = packageManager;
  }

  public abstract async initialize(): Promise<void>;

  public getPackagesToUpdate(): string[] {
    return this._packagesToUpdate;
  }
}

class NpmPackagesAnalyser extends PackagesAnalyser {
  constructor(
    packageVersionsRetriever: OutdatedPackagesRetriever,
    folderPath: string
  ) {
    super(
      packageVersions.PackageManager.Npm,
      packageVersionsRetriever,
      folderPath
    );
  }

  public async initialize(): Promise<void> {
    const packageFilePath = path.join(this.folderPath, "package.json");
    logger.logInfo(`Checking for available updates in ${packageFilePath}`);

    try {
      const configuration = await config.getConfiguration(this.folderPath);
      if (configuration.disable) {
        return;
      }

      const outdatedPackages = await this.packageVersionsRetriever.getOutdatedPackages(
        this.packageManager,
        this.folderPath
      );

      this._packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
        outdatedPackages,
        configuration
      );
    } catch (error) {
      logger.logError(error);
    }
  }
}

class YarnPackagesAnalyser extends PackagesAnalyser {
  constructor(
    packageVersionsRetriever: OutdatedPackagesRetriever,
    folderPath: string
  ) {
    super(
      packageVersions.PackageManager.Yarn,
      packageVersionsRetriever,
      folderPath
    );
  }

  public async initialize(): Promise<void> {
    const packageFilePath = path.join(this.folderPath, "package.json");
    logger.logInfo(`Checking for available updates in ${packageFilePath}`);

    try {
      const configuration = await config.getConfiguration(this.folderPath);
      if (configuration.disable) {
        return;
      }

      const outdatedPackages = await this.packageVersionsRetriever.getOutdatedPackages(
        this.packageManager,
        this.folderPath
      );

      this._packagesToUpdate = packageVersions.getRequiredUpdatesOfOutdatedPackages(
        outdatedPackages,
        configuration
      );
    } catch (error) {
      logger.logError(error);
    }
  }
}

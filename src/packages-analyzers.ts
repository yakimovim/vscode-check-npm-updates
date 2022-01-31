import * as fs from "fs";
import * as path from "path";

import * as config from "./config";
import * as logger from "./logger";
import * as packageVersions from "./package-versions";
import { OutdatedPackagesRetriever } from "./package-versions-retriever";
import { Auditor } from "./auditor";
import { hasAuditProblems } from "./audit-result-analyzer";

export function createPackagesAnalyser(
  packageVersionsRetriever: OutdatedPackagesRetriever,
  auditor: Auditor,
  packageFilePath: string
): PackagesAnalyser | null {
  const folderPath = path.dirname(packageFilePath);

  if (fs.existsSync(path.join(folderPath, "package-lock.json"))) {
    return new NpmPackagesAnalyser(
      packageVersionsRetriever,
      auditor,
      folderPath
    );
  }

  if (fs.existsSync(path.join(folderPath, "yarn.lock"))) {
    return new YarnPackagesAnalyser(
      packageVersionsRetriever,
      auditor,
      folderPath
    );
  }

  return null;
}

export abstract class PackagesAnalyser {
  protected _hasAuditProblems: boolean = false;
  protected _packagesToUpdate: string[] = [];

  constructor(
    public readonly packageManager: packageVersions.PackageManager,
    protected readonly packageVersionsRetriever: OutdatedPackagesRetriever,
    protected readonly auditor: Auditor,
    public folderPath: string
  ) {
    this.packageManager = packageManager;
  }

  public abstract initialize(): Promise<void>;

  public hasAuditProblems(): boolean {
    return this._hasAuditProblems;
  }

  public getPackagesToUpdate(): string[] {
    return this._packagesToUpdate;
  }
}

class NpmPackagesAnalyser extends PackagesAnalyser {
  constructor(
    packageVersionsRetriever: OutdatedPackagesRetriever,
    auditor: Auditor,
    folderPath: string
  ) {
    super(
      packageVersions.PackageManager.npm,
      packageVersionsRetriever,
      auditor,
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

      if (!configuration.disableAudit) {
        const auditResult = await this.auditor.getAuditResult(
          this.packageManager,
          this.folderPath
        );

        this._hasAuditProblems = hasAuditProblems(auditResult, configuration);
        if (this._hasAuditProblems) {
          return;
        }
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
    auditor: Auditor,
    folderPath: string
  ) {
    super(
      packageVersions.PackageManager.yarn,
      packageVersionsRetriever,
      auditor,
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

      if (!configuration.disableAudit) {
        const auditResult = await this.auditor.getAuditResult(
          this.packageManager,
          this.folderPath
        );

        this._hasAuditProblems = hasAuditProblems(auditResult, configuration);
        if (this._hasAuditProblems) {
          return;
        }
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

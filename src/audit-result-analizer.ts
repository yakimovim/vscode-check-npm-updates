import { IAuditResult } from "./auditor";
import { IConfiguration, AllowedAutidLevels } from "./config";

export function hasAuditProblems(auditResult: IAuditResult, configuration: IConfiguration): boolean {
    if(auditResult.critical > 0 || auditResult.high > 0) {
        return true;
    }

    if(auditResult.moderate > 0 && configuration.lowestAuditLevel <= AllowedAutidLevels.moderate) {
        return true;
    }

    if(auditResult.low > 0 && configuration.lowestAuditLevel <= AllowedAutidLevels.low) {
        return true;
    }

    return false;
}
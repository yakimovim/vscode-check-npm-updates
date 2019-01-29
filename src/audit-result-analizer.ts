import { IAuditResult } from "./auditor";
import { IConfiguration } from "./config";

export function hasAuditProblems(auditResult: IAuditResult, configuration: IConfiguration): boolean {
    return false;
}
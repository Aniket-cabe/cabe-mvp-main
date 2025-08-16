#!/usr/bin/env node
/**
 * Audit Run Exporter
 *
 * Exports complete audit run data to CSV or JSON format
 * for admin reports, offline analysis, or evidence backups.
 */
interface ExportOptions {
    runId: string;
    format: 'csv' | 'json';
    outputDir?: string;
    includeMetadata?: boolean;
    flattenResults?: boolean;
}
export declare function exportAuditRun(runId: string, format: 'csv' | 'json', options?: Partial<ExportOptions>): Promise<string>;
declare function cli(): Promise<void>;
export declare function exportMultipleRuns(runIds: string[], format: 'csv' | 'json', options?: Partial<ExportOptions>): Promise<string[]>;
export declare function listAvailableRuns(): Promise<string[]>;
export declare function getExportStats(outputDir?: string): Promise<{
    totalFiles: number;
    csvFiles: number;
    jsonFiles: number;
    totalSize: string;
    recentExports: string[];
}>;
declare const _default: {
    exportAuditRun: typeof exportAuditRun;
    exportMultipleRuns: typeof exportMultipleRuns;
    listAvailableRuns: typeof listAvailableRuns;
    getExportStats: typeof getExportStats;
    cli: typeof cli;
};
export default _default;
//# sourceMappingURL=audit-run-exporter.d.ts.map
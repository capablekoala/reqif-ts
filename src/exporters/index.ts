/**
 * ReqIF Exporters
 *
 * This module provides exporters for various formats from ReqIF content.
 */

// Re-export HTML and CSV exporters
export * from "./html";
export * from "./csv";

// Import main types
import { ReqIFBundle } from "../reqif-bundle";
import { HTMLExportOptions, exportToHTML, exportToHTMLFile } from "./html";
import { CSVExportOptions, exportToCSV, exportToCSVFile } from "./csv";

/**
 * Supported export formats
 */
export type ExportFormat = "html" | "csv" | "excel";

/**
 * Combined export options for all formats
 */
export interface ExportOptions {
  format: ExportFormat;
  html?: HTMLExportOptions;
  csv?: CSVExportOptions;
  // Add more format options as they are implemented
}

/**
 * Export ReqIF content to a specified format
 * @param bundle The ReqIF bundle to export
 * @param options Export options including format
 * @returns Exported content as string or Map of strings
 */
export function exportReqIF(
  bundle: ReqIFBundle,
  options: ExportOptions,
): string | Map<string, string> {
  switch (options.format) {
    case "html":
      return exportToHTML(bundle, options.html);

    case "csv":
      return exportToCSV(bundle, options.csv);

    case "excel":
      // Currently exports as CSV, which Excel can import
      return exportToCSV(bundle, {
        delimiter: ",",
        ...(options.csv || {}),
      });

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export ReqIF content to a file with the specified format
 * @param bundle The ReqIF bundle to export
 * @param filePath The file path to save the exported content
 * @param options Export options including format
 */
export async function exportReqIFToFile(
  bundle: ReqIFBundle,
  filePath: string,
  options: ExportOptions,
): Promise<void> {
  switch (options.format) {
    case "html":
      return await exportToHTMLFile(bundle, filePath, options.html);

    case "csv":
      return await exportToCSVFile(bundle, filePath, options.csv);

    case "excel":
      // For now, create a CSV file that Excel can import
      // Later, this could be replaced with actual Excel export
      if (!filePath.endsWith(".csv")) {
        filePath += ".csv";
      }
      return await exportToCSVFile(bundle, filePath, {
        delimiter: ",",
        ...(options.csv || {}),
      });

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

/**
 * Export command for ReqIF files.
 * Converts ReqIF to other formats like HTML, CSV, etc.
 */

import { Command } from "commander";
import { parse } from "../../parser";
import { exportReqIFToFile, ExportFormat } from "../../exporters";
import path from "path";

/**
 * Execute the export command.
 */
export async function execute(
  inputFile: string,
  outputFile: string,
  options: any,
): Promise<void> {
  try {
    console.log(`Parsing ReqIF file: ${inputFile}`);
    const reqifBundle = await parse(inputFile);

    // Determine output format from file extension or option
    let format: ExportFormat = options.format || "html";

    if (!options.format) {
      // Try to determine format from file extension
      const ext = path.extname(outputFile).toLowerCase();
      if (ext === ".html" || ext === ".htm") {
        format = "html";
      } else if (ext === ".csv") {
        format = "csv";
      } else if (ext === ".xlsx" || ext === ".xls") {
        format = "excel";
      }
    }

    // Apply format-specific options
    const exportOptions = {
      format,
      html: {
        includeHeaderFooter: !options.noHeader,
        includeStyle: !options.noStyle,
        includeScript: !options.noScript,
        includeMetadata: !options.noMetadata,
        title: options.title || "ReqIF Export",
      },
      csv: {
        delimiter: options.delimiter || ",",
        includeHeader: !options.noHeader,
        includeHierarchy: !options.noHierarchy,
        splitSpecifications: options.split,
        extractText: !options.keepHtml,
      },
    };

    console.log(`Exporting to ${format.toUpperCase()} format: ${outputFile}`);
    await exportReqIFToFile(reqifBundle, outputFile, exportOptions);

    console.log("Export completed successfully");
  } catch (error) {
    console.error(
      `Export failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

/**
 * Configure the export command.
 */
export function configureCommand(program: Command): Command {
  return program
    .command("export <input-file> <output-file>")
    .description("Export ReqIF to other formats (HTML, CSV, Excel)")
    .option("-f, --format <format>", "Output format (html, csv, excel)")
    .option("--no-header", "Exclude header/footer in HTML or header row in CSV")
    .option("--no-style", "Exclude CSS styling (HTML only)")
    .option("--no-script", "Exclude JavaScript (HTML only)")
    .option("--no-metadata", "Exclude metadata (HTML only)")
    .option("--title <title>", "Document title (HTML only)")
    .option("--delimiter <char>", "Field delimiter (CSV only)")
    .option("--no-hierarchy", "Exclude hierarchy level information (CSV only)")
    .option("--split", "Split specifications into separate files (CSV only)")
    .option("--keep-html", "Keep HTML markup in CSV output (CSV only)")
    .action(execute);
}

import { parse } from "../../parser";
import { unparse } from "../../unparser";
import { createFileSystem } from "../../helpers/fs-adapter";

/**
 * Command handler for the 'format' command.
 * Formats a ReqIF file by parsing and pretty-printing it.
 */
export async function formatCommand(
  inputFile: string,
  outputFile: string,
): Promise<void> {
  try {
    console.log(`Formatting ReqIF file: ${inputFile}`);

    // Parse the input file
    const reqifBundle = await parse(inputFile);

    // Format (pretty-print) by unparsing
    console.log(`Writing formatted output to: ${outputFile}`);
    const xmlContent = unparse(reqifBundle);

    // Write to output file
    const fs = createFileSystem();
    await fs.writeFile(outputFile, xmlContent);

    console.log("Formatting completed successfully.");
  } catch (error) {
    console.error("Error during formatting:", error);
    process.exit(1);
  }
}

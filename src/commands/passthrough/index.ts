import { parse } from "../../parser";
import { unparse } from "../../unparser";
import { createFileSystem } from "../../helpers/fs-adapter";

/**
 * Command handler for the 'passthrough' command.
 * Parses a ReqIF file and then unparses it to verify the parser works correctly.
 */
export async function passthroughCommand(
  inputFile: string,
  outputFile: string,
): Promise<void> {
  try {
    console.log(`Parsing ReqIF file: ${inputFile}`);
    const reqifBundle = await parse(inputFile);

    console.log(`Unparsing to: ${outputFile}`);
    const xmlContent = unparse(reqifBundle);

    const fs = createFileSystem();
    await fs.writeFile(outputFile, xmlContent);

    console.log("Passthrough completed successfully.");
  } catch (error) {
    console.error("Error during passthrough:", error);
    process.exit(1);
  }
}

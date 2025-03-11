import { parse } from "../../parser";
import { ReqIFError, ReqIFValidationError } from "../../models/error-handling";

interface ValidateCommandOptions {
  useReqifSchema?: boolean;
}

/**
 * Command handler for the 'validate' command.
 * Validates a ReqIF file against internal rules and optionally against the official schema.
 */
export async function validateCommand(
  file: string,
  options: ValidateCommandOptions,
): Promise<void> {
  try {
    console.log(`Validating ReqIF file: ${file}`);

    // Basic parsing validates the file structure
    const reqifBundle = await parse(file);

    // Additional validation
    if (reqifBundle.coreContent.reqIfContent.specifications.length === 0) {
      console.warn("Warning: ReqIF file has no specifications");
    }

    if (reqifBundle.coreContent.reqIfContent.specObjects.length === 0) {
      console.warn("Warning: ReqIF file has no spec objects");
    }

    // Schema validation (optional)
    if (options.useReqifSchema) {
      console.log("Validating against official ReqIF schema...");
      // This would involve validating against the XSD schema
      // In a complete implementation, we would use a schema validation library
      console.log("Schema validation is not yet implemented");
    }

    console.log("ReqIF file is valid.");
  } catch (error: unknown) {
    if (error instanceof ReqIFValidationError || error instanceof ReqIFError) {
      console.error(`Validation failed: ${error.message}`);
    } else {
      console.error(
        "Unexpected error during validation:",
        error instanceof Error ? error.message : String(error),
      );
    }
    process.exit(1);
  }
}

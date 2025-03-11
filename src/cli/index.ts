#!/usr/bin/env node

import { Command } from "commander";
import { version } from "../version";

// Import commands
import { validateCommand } from "../commands/validate";
import { formatCommand } from "../commands/format";
import { passthroughCommand } from "../commands/passthrough";
import { anonymizeCommand } from "../commands/anonymize";
import { dumpCommand } from "../commands/dump";
import { versionCommand } from "../commands/version";
import { configureCommand as configureExport } from "../commands/export";

const program = new Command();

// Setup the program
program
  .name("reqif-ts")
  .description("ReqIF TypeScript library and tools")
  .version(version);

// Register commands
program
  .command("validate")
  .description("Validate a ReqIF file")
  .argument("<file>", "ReqIF file to validate")
  .option("--use-reqif-schema", "Validate against official ReqIF schema")
  .action(validateCommand);

program
  .command("format")
  .description("Format a ReqIF file (pretty-print)")
  .argument("<input>", "Input ReqIF file")
  .argument("<output>", "Output ReqIF file")
  .action(formatCommand);

program
  .command("passthrough")
  .description(
    "Parse and then unparse a ReqIF file (verify parsing works correctly)",
  )
  .argument("<input>", "Input ReqIF file")
  .argument("<output>", "Output ReqIF file")
  .action(passthroughCommand);

program
  .command("anonymize")
  .description("Anonymize a ReqIF file")
  .argument("<input>", "Input ReqIF file")
  .argument("<output>", "Output anonymized ReqIF file")
  .action(anonymizeCommand);

program
  .command("dump")
  .description("Dump ReqIF content to HTML")
  .argument("<input>", "Input ReqIF file")
  .argument("<output>", "Output HTML file")
  .action(dumpCommand);

// Configure export command
configureExport(program);

program
  .command("version")
  .description("Display version information")
  .action(versionCommand);

// Function to run the CLI
export function runCLI(args: string[] = process.argv): void {
  program.parse(args);
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  runCLI();
}

// Main entry point for the reqif-ts library
export { version } from "./version";
export { parse, parseReqIFZ } from "./parser";
export { unparse } from "./unparser";
export { ReqIFBundle } from "./reqif-bundle";
export * from "./models";

// Export formatters and exporters
export * from "./exporters";

// Node.js-only features will be included by CommonJS
// but tree-shaken in browser builds
import { runCLI } from "./cli";
export { runCLI };

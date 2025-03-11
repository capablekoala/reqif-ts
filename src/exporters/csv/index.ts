/**
 * CSV Exporter for ReqIF content.
 * Provides functionality to export ReqIF specifications to CSV format.
 */

import { ReqIFBundle } from "../../reqif-bundle";
import { ReqIFSpecification } from "../../models/reqif-specification";
import { ReqIFSpecHierarchy } from "../../models/reqif-spec-hierarchy";
import { ReqIFAttributeValueKind } from "../../models/reqif-types";
import { createFileSystem } from "../../helpers/fs-adapter";
import { stripXhtmlNamespaces } from "../../helpers/xhtml-helper";

/**
 * CSV export options
 */
export interface CSVExportOptions {
  /** Character used to separate fields */
  delimiter?: string;
  /** Character used to quote fields */
  quoteChar?: string;
  /** Character used to separate lines */
  newline?: string;
  /** Whether to include a header row */
  includeHeader?: boolean;
  /** Whether to include hierarchy level information */
  includeHierarchy?: boolean;
  /** Fields to include in the export (if empty, include all fields) */
  fields?: string[];
  /** Whether to split specifications into separate files */
  splitSpecifications?: boolean;
  /** Extract text from XHTML content (vs. keeping raw XHTML) */
  extractText?: boolean;
}

/**
 * Default CSV export options
 */
const DEFAULT_OPTIONS: CSVExportOptions = {
  delimiter: ",",
  quoteChar: '"',
  newline: "\n",
  includeHeader: true,
  includeHierarchy: true,
  fields: [],
  splitSpecifications: false,
  extractText: true,
};

/**
 * Standard fields for CSV export
 */
const STANDARD_FIELDS = ["ID", "Specification", "Level", "Type", "Content"];

/**
 * CSV Exporter for ReqIF content
 */
export class CSVExporter {
  /**
   * Export a ReqIF bundle to CSV format
   * @param bundle The ReqIF bundle to export
   * @param options Export options
   * @returns CSV string content
   */
  static export(
    bundle: ReqIFBundle,
    options: CSVExportOptions = {},
  ): string | Map<string, string> {
    // Merge with default options
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Handle splitting specifications into separate files if requested
    if (opts.splitSpecifications) {
      return this.exportSplitSpecifications(bundle, opts);
    }

    // Determine fields to include
    const fields = this.determineFields(bundle, opts);

    // Start building CSV
    let csv = "";

    // Add header if requested
    if (opts.includeHeader) {
      csv += this.formatCSVRow(fields, opts);
    }

    // Process all specifications
    const specs = bundle.coreContent.reqIfContent.specifications;
    for (const spec of specs) {
      csv += this.generateSpecificationCSV(bundle, spec, fields, opts);
    }

    return csv;
  }

  /**
   * Export a ReqIF bundle to a CSV file
   * @param bundle The ReqIF bundle to export
   * @param filePath The file path to save the CSV
   * @param options Export options
   */
  static async exportToFile(
    bundle: ReqIFBundle,
    filePath: string,
    options: CSVExportOptions = {},
  ): Promise<void> {
    const csv = this.export(bundle, options);
    const fs = createFileSystem();

    if (typeof csv === "string") {
      // Single file export
      await fs.writeFile(filePath, csv);
    } else {
      // Multiple file export (one per specification)
      const filePathBase = filePath.replace(/\.[^/.]+$/, ""); // Remove extension
      const extension = filePath.split(".").pop() || "csv";

      for (const [specId, content] of csv.entries()) {
        const specFilePath = `${filePathBase}_${this.sanitizeFilename(specId)}.${extension}`;
        await fs.writeFile(specFilePath, content);
      }
    }
  }

  /**
   * Export each specification to a separate CSV file
   * @param bundle The ReqIF bundle
   * @param options Export options
   * @returns Map of specification IDs to CSV content
   */
  private static exportSplitSpecifications(
    bundle: ReqIFBundle,
    options: CSVExportOptions,
  ): Map<string, string> {
    const result = new Map<string, string>();
    const specs = bundle.coreContent.reqIfContent.specifications;

    for (const spec of specs) {
      // Determine fields (may be different for each specification)
      const fields = this.determineFields(bundle, options, spec);

      let csv = "";

      // Add header if requested
      if (options.includeHeader) {
        csv += this.formatCSVRow(fields, options);
      }

      // Generate CSV for this specification
      csv += this.generateSpecificationCSV(bundle, spec, fields, options);

      // Add to result map
      result.set(spec.identifier, csv);
    }

    return result;
  }

  /**
   * Determine fields to include in the CSV export
   * @param bundle The ReqIF bundle
   * @param options Export options
   * @param specification Optional specification to limit field analysis
   * @returns Array of field names
   */
  private static determineFields(
    bundle: ReqIFBundle,
    options: CSVExportOptions,
    _specification?: ReqIFSpecification,
  ): string[] {
    // If fields are explicitly specified, use them
    if (options.fields && options.fields.length > 0) {
      return options.fields;
    }

    // Start with standard fields
    const fields = [...STANDARD_FIELDS];

    // If hierarchy is not included, remove Level
    if (!options.includeHierarchy) {
      const levelIndex = fields.indexOf("Level");
      if (levelIndex !== -1) {
        fields.splice(levelIndex, 1);
      }
    }

    // Get all attribute definitions from all spec object types
    const specObjectTypes =
      bundle.coreContent.reqIfContent.specTypes.specObjectTypes;
    const attributeDefs = new Set<string>();

    for (const type of specObjectTypes) {
      for (const attrDef of type.attributeDefinitions) {
        attributeDefs.add(attrDef.identifier);
      }
    }

    // Add all attribute definitions as fields
    for (const attrDef of attributeDefs) {
      if (!fields.includes(attrDef)) {
        fields.push(attrDef);
      }
    }

    return fields;
  }

  /**
   * Generate CSV for a specification
   * @param bundle The ReqIF bundle
   * @param spec The specification
   * @param fields Fields to include
   * @param options Export options
   * @returns CSV string
   */
  private static generateSpecificationCSV(
    bundle: ReqIFBundle,
    spec: ReqIFSpecification,
    fields: string[],
    options: CSVExportOptions,
  ): string {
    let csv = "";

    // Process all hierarchy elements
    if (spec.children && spec.children.length > 0) {
      for (const hierarchy of bundle.iterateSpecificationHierarchy(spec)) {
        const row = this.generateHierarchyRow(
          bundle,
          hierarchy,
          spec,
          fields,
          options,
        );
        if (row.length > 0) {
          csv += this.formatCSVRow(row, options);
        }
      }
    }

    return csv;
  }

  /**
   * Generate a CSV row for a hierarchy element
   * @param bundle The ReqIF bundle
   * @param hierarchy The hierarchy element
   * @param specification The parent specification
   * @param fields Fields to include
   * @param options Export options
   * @returns Array of field values
   */
  private static generateHierarchyRow(
    bundle: ReqIFBundle,
    hierarchy: ReqIFSpecHierarchy,
    specification: ReqIFSpecification,
    fields: string[],
    options: CSVExportOptions,
  ): string[] {
    // Skip if no spec object reference
    if (!hierarchy.specObjectRef) {
      return [];
    }

    // Get the spec object
    const specObject = bundle.objectLookup.getSpecObject(
      hierarchy.specObjectRef,
    );
    if (!specObject) {
      return [];
    }

    // Create a map to store field values
    const fieldValues: Map<string, string> = new Map();

    // Set standard field values
    fieldValues.set("ID", specObject.identifier);
    fieldValues.set(
      "Specification",
      specification.longName || specification.identifier,
    );

    if (options.includeHierarchy) {
      fieldValues.set("Level", String(hierarchy.level || 0));
    }

    // Set type information
    if (specObject.typeRef) {
      const type = bundle.objectLookup.getSpecObjectType(specObject.typeRef);
      fieldValues.set(
        "Type",
        type ? type.longName || type.identifier : specObject.typeRef,
      );
    } else {
      fieldValues.set("Type", "");
    }

    // Set content field - look for primary content
    let contentValue = "";
    let foundContent = false;

    for (const attrValue of specObject.attributeValues) {
      // Set attribute value in the field map
      const attrName = attrValue.definitionRef;
      let attrValueStr = "";

      switch (attrValue.kind) {
        case ReqIFAttributeValueKind.STRING:
        case ReqIFAttributeValueKind.INTEGER:
        case ReqIFAttributeValueKind.REAL:
        case ReqIFAttributeValueKind.BOOLEAN:
        case ReqIFAttributeValueKind.DATE:
          const value = (attrValue as any).value;
          attrValueStr = value !== null ? String(value) : "";
          break;

        case ReqIFAttributeValueKind.ENUMERATION:
          const values = (attrValue as any).values;
          attrValueStr = values.join(", ");
          break;

        case ReqIFAttributeValueKind.XHTML:
          const xhtmlValue = attrValue as any;
          if (options.extractText) {
            // Extract text without markup
            attrValueStr = this.extractTextFromHTML(xhtmlValue.value || "");
          } else {
            // Just strip namespaces but keep markup
            attrValueStr = stripXhtmlNamespaces(xhtmlValue.value || "");
          }

          // If this is the first XHTML content, use it for the Content field
          if (!foundContent && xhtmlValue.value) {
            contentValue = attrValueStr;
            foundContent = true;
          }
          break;
      }

      // Save the attribute value
      fieldValues.set(attrName, attrValueStr);
    }

    // If no content was explicitly found, use the long name or ID
    if (!contentValue) {
      contentValue = specObject.longName || specObject.identifier;
    }

    // Set the content field
    fieldValues.set("Content", contentValue);

    // Build the row according to the specified fields
    const row: string[] = [];
    for (const field of fields) {
      row.push(fieldValues.get(field) || "");
    }

    return row;
  }

  /**
   * Format a row of data into a CSV string
   * @param row Array of field values
   * @param options Export options
   * @returns CSV row string
   */
  private static formatCSVRow(
    row: string[],
    options: CSVExportOptions,
  ): string {
    const {
      delimiter = ",",
      quoteChar = '"',
      newline = "\n",
    } = { ...DEFAULT_OPTIONS, ...options };

    const formattedRow = row
      .map((field) => {
        // Escape quote characters by doubling them
        const escaped = field.replace(
          new RegExp(quoteChar, "g"),
          quoteChar + quoteChar,
        );

        // Quote the field if it contains delimiter, quote character, or newline
        if (
          escaped.includes(delimiter) ||
          escaped.includes(quoteChar) ||
          escaped.includes("\n") ||
          escaped.includes("\r")
        ) {
          return `${quoteChar}${escaped}${quoteChar}`;
        }

        return escaped;
      })
      .join(delimiter);

    return formattedRow + newline;
  }

  /**
   * Extract plain text from HTML content
   * @param html HTML content
   * @returns Plain text
   */
  private static extractTextFromHTML(html: string): string {
    if (!html) return "";

    try {
      // Use DOMParser in browser, or a placeholder in Node.js
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.body.textContent || "";
    } catch (e) {
      // If parsing fails, do a simple regex replace
      return html
        .replace(/<[^>]*>/g, " ") // Replace tags with spaces
        .replace(/&[^;]+;/g, " ") // Replace entities with spaces
        .replace(/\s+/g, " ") // Replace multiple spaces with one
        .trim();
    }
  }

  /**
   * Sanitize a string for use as a filename
   * @param str The string to sanitize
   * @returns Sanitized string
   */
  private static sanitizeFilename(str: string): string {
    return str
      .replace(/[\/\\:*?"<>|]/g, "_") // Replace illegal characters with underscore
      .replace(/\s+/g, "_") // Replace spaces with underscore
      .replace(/_+/g, "_") // Replace multiple underscores with one
      .toLowerCase()
      .substring(0, 50); // Limit length
  }
}

/**
 * Convenience function to export a ReqIF bundle to CSV
 * @param bundle The ReqIF bundle to export
 * @param options Export options
 * @returns CSV string or Map of CSV strings
 */
export function exportToCSV(
  bundle: ReqIFBundle,
  options: CSVExportOptions = {},
): string | Map<string, string> {
  return CSVExporter.export(bundle, options);
}

/**
 * Convenience function to export a ReqIF bundle to a CSV file
 * @param bundle The ReqIF bundle to export
 * @param filePath The file path to save the CSV
 * @param options Export options
 */
export async function exportToCSVFile(
  bundle: ReqIFBundle,
  filePath: string,
  options: CSVExportOptions = {},
): Promise<void> {
  return CSVExporter.exportToFile(bundle, filePath, options);
}

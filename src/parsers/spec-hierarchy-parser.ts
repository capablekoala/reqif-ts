import { ReqIFError } from "../models/error-handling";
import { ReqIFSpecHierarchy } from "../models/reqif-spec-hierarchy";
import { AttributeValueParser } from "./attribute-value-parser";
import { ReqIFAttributeValue } from "../models/reqif-attribute-value";

/**
 * Parser for ReqIF SPEC-HIERARCHY elements.
 */
export class SpecHierarchyParser {
  /**
   * Parse a SPEC-HIERARCHY element into a ReqIFSpecHierarchy.
   * @param element The SPEC-HIERARCHY XML element
   * @param level The hierarchy level (default: 1)
   * @returns A ReqIFSpecHierarchy instance
   */
  static parse(element: Element, level: number = 1): ReqIFSpecHierarchy {
    // Verify this is a SPEC-HIERARCHY element
    if (element.tagName !== "SPEC-HIERARCHY") {
      throw new ReqIFError(
        `Expected SPEC-HIERARCHY element, got ${element.tagName}`,
      );
    }

    // Get required attributes
    const identifier = element.getAttribute("IDENTIFIER");
    if (!identifier) {
      throw new ReqIFError(
        "SPEC-HIERARCHY element missing required IDENTIFIER attribute",
      );
    }

    // Get optional attributes
    const longName = element.getAttribute("LONG-NAME") || undefined;
    const lastChange = element.getAttribute("LAST-CHANGE") || undefined;
    const desc = element.getAttribute("DESC") || undefined;
    const isEditable = element.getAttribute("IS-EDITABLE") === "true";
    const isTableInternal =
      element.getAttribute("IS-TABLE-INTERNAL") === "true";

    // Get SPEC-OBJECT reference
    const specObjectRefElement = element.querySelector(
      "OBJECT > SPEC-OBJECT-REF",
    );
    if (!specObjectRefElement || !specObjectRefElement.textContent) {
      throw new ReqIFError(
        "SPEC-HIERARCHY element missing OBJECT/SPEC-OBJECT-REF",
      );
    }
    const specObjectRef = specObjectRefElement.textContent;

    // Parse attribute values
    let attributeValues: ReqIFAttributeValue[] = [];
    const valuesElements = element.querySelectorAll("VALUES > *");
    if (valuesElements.length > 0) {
      attributeValues = AttributeValueParser.parseAttributeValues(
        Array.from(valuesElements),
      );
    }

    // Parse children recursively
    const children: ReqIFSpecHierarchy[] = [];
    const childElements = element.querySelectorAll("CHILDREN > SPEC-HIERARCHY");

    if (childElements.length > 0) {
      for (let i = 0; i < childElements.length; i++) {
        const child = SpecHierarchyParser.parse(
          childElements[i] as Element,
          level + 1,
        );
        children.push(child);
      }
    }

    // Create and return the spec hierarchy
    return new ReqIFSpecHierarchy(
      identifier,
      specObjectRef,
      children,
      longName,
      lastChange,
      desc,
      level,
      isEditable,
      isTableInternal,
      attributeValues,
      element,
    );
  }

  /**
   * Unparse a ReqIFSpecHierarchy to XML string.
   * @param hierarchy The spec hierarchy to unparse
   * @returns XML string representation of the spec hierarchy
   */
  static unparse(hierarchy: ReqIFSpecHierarchy): string {
    // Start with the opening tag and attributes
    let result = `<SPEC-HIERARCHY IDENTIFIER="${hierarchy.identifier}"`;

    if (hierarchy.longName) {
      result += ` LONG-NAME="${hierarchy.longName}"`;
    }

    if (hierarchy.lastChange) {
      result += ` LAST-CHANGE="${hierarchy.lastChange}"`;
    }

    if (hierarchy.desc) {
      result += ` DESC="${hierarchy.desc}"`;
    }

    if (hierarchy.isEditable) {
      result += ` IS-EDITABLE="true"`;
    }

    if (hierarchy.isTableInternal) {
      result += ` IS-TABLE-INTERNAL="true"`;
    }

    result += ">\n";

    // Add OBJECT element
    result += `  <OBJECT>\n`;
    result += `    <SPEC-OBJECT-REF>${hierarchy.specObjectRef}</SPEC-OBJECT-REF>\n`;
    result += `  </OBJECT>\n`;

    // Add VALUES if there are attribute values
    if (hierarchy.attributeValues && hierarchy.attributeValues.length > 0) {
      result += "  <VALUES>\n";
      result += AttributeValueParser.unparseAttributeValues(
        hierarchy.attributeValues,
      )
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n");
      result += "\n  </VALUES>\n";
    }

    // Add CHILDREN if there are child hierarchies
    if (hierarchy.children && hierarchy.children.length > 0) {
      result += "  <CHILDREN>\n";

      for (const child of hierarchy.children) {
        result += SpecHierarchyParser.unparse(child)
          .split("\n")
          .map((line) => `    ${line}`)
          .join("\n");
        result += "\n";
      }

      result += "  </CHILDREN>\n";
    }

    // Close the spec hierarchy tag
    result += "</SPEC-HIERARCHY>";

    return result;
  }
}

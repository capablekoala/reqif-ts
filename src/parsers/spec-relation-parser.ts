import { ReqIFSpecRelation } from "../models/reqif-spec-relation";
import { AttributeValueParser } from "./attribute-value-parser";
import { ReqIFAttributeValue } from "../models/reqif-attribute-value";

/**
 * Parser for spec relations in ReqIF.
 */
export class SpecRelationParser {
  /**
   * Parse a spec relation from an XML element.
   */
  static parse(element: Element): ReqIFSpecRelation {
    // Get common attributes
    const identifier = element.getAttribute("IDENTIFIER") || "";
    const longName = element.getAttribute("LONG-NAME") || undefined;
    const lastChange = element.getAttribute("LAST-CHANGE") || undefined;
    const desc = element.getAttribute("DESC") || undefined;

    // Get type reference
    const typeRefElement = element.querySelector(
      "TYPE > SPEC-RELATION-TYPE-REF",
    );
    const typeRef = typeRefElement?.textContent || "";

    // Get source reference
    const sourceRefElement = element.querySelector("SOURCE > SPEC-OBJECT-REF");
    const sourceRef = sourceRefElement?.textContent || "";

    // Get target reference
    const targetRefElement = element.querySelector("TARGET > SPEC-OBJECT-REF");
    const targetRef = targetRefElement?.textContent || "";

    // Parse attribute values
    const attributeValues: ReqIFAttributeValue[] = [];
    const valuesElement = element.querySelector("VALUES");

    if (valuesElement) {
      // Select all attribute value elements
      const attrValueElements = valuesElement.querySelectorAll(
        "ATTRIBUTE-VALUE-BOOLEAN, " +
          "ATTRIBUTE-VALUE-DATE, " +
          "ATTRIBUTE-VALUE-ENUMERATION, " +
          "ATTRIBUTE-VALUE-INTEGER, " +
          "ATTRIBUTE-VALUE-REAL, " +
          "ATTRIBUTE-VALUE-STRING, " +
          "ATTRIBUTE-VALUE-XHTML",
      );

      // Parse each attribute value
      attrValueElements.forEach((attrValueElement) => {
        try {
          const attrValue = AttributeValueParser.parse(
            attrValueElement as Element,
          );
          if (attrValue) {
            attributeValues.push(attrValue);
          }
        } catch (error) {
          console.warn(`Error parsing attribute value: ${error}`);
        }
      });
    }

    return new ReqIFSpecRelation(
      identifier,
      typeRef,
      sourceRef,
      targetRef,
      attributeValues,
      longName,
      lastChange,
      desc,
      element,
    );
  }
}

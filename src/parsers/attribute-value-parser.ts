import {
  ReqIFAttributeValue,
  ReqIFAttributeValueBoolean,
  ReqIFAttributeValueDate,
  ReqIFAttributeValueEnumeration,
  ReqIFAttributeValueInteger,
  ReqIFAttributeValueReal,
  ReqIFAttributeValueString,
  ReqIFAttributeValueXHTML,
} from "../models/reqif-attribute-value";
import { stripXhtmlNamespaces } from "../helpers/xhtml-helper";
import { serializeXML } from "../helpers/xml-parser";

/**
 * Parser for attribute values in ReqIF.
 */
export class AttributeValueParser {
  /**
   * Parse a single attribute value element
   * @param element The attribute value element
   * @returns The parsed attribute value or null if parsing failed
   */
  static parse(element: Element): ReqIFAttributeValue | null {
    // Skip elements that are not attribute values
    if (!element.tagName.startsWith("ATTRIBUTE-VALUE-")) {
      return null;
    }

    const attributeType = element.tagName.replace("ATTRIBUTE-VALUE-", "");
    const defElement = element.querySelector("DEFINITION");

    if (!defElement) {
      console.warn(`Attribute value missing DEFINITION: ${element.outerHTML}`);
      return null;
    }

    // Get definition reference
    const defRefElement = defElement.firstElementChild;
    if (!defRefElement || !defRefElement.textContent) {
      console.warn(
        `Attribute definition missing reference: ${defElement.outerHTML}`,
      );
      return null;
    }

    const definitionRef = defRefElement.textContent;

    // Parse based on attribute type
    switch (attributeType) {
      case "STRING":
        return AttributeValueParser.parseStringAttributeValue(
          element,
          definitionRef,
        );
      case "INTEGER":
        return AttributeValueParser.parseIntegerAttributeValue(
          element,
          definitionRef,
        );
      case "REAL":
        return AttributeValueParser.parseRealAttributeValue(
          element,
          definitionRef,
        );
      case "BOOLEAN":
        return AttributeValueParser.parseBooleanAttributeValue(
          element,
          definitionRef,
        );
      case "DATE":
        return AttributeValueParser.parseDateAttributeValue(
          element,
          definitionRef,
        );
      case "ENUMERATION":
        return AttributeValueParser.parseEnumerationAttributeValue(
          element,
          definitionRef,
        );
      case "XHTML":
        return AttributeValueParser.parseXhtmlAttributeValue(
          element,
          definitionRef,
        );
      default:
        console.warn(`Unsupported attribute type: ${attributeType}`);
        return null;
    }
  }

  /**
   * Parse attribute values from XML nodes.
   * @param valuesElements The VALUES section of a spec object
   * @returns An array of attribute values
   */
  static parseAttributeValues(
    valuesElements: Element[],
  ): ReqIFAttributeValue[] {
    const attributeValues: ReqIFAttributeValue[] = [];

    for (const valueElement of valuesElements) {
      const attrValue = AttributeValueParser.parse(valueElement);
      if (attrValue) {
        attributeValues.push(attrValue);
      }
    }

    return attributeValues;
  }

  /**
   * Parse a string attribute value.
   */
  private static parseStringAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueString {
    const valueElement = element.querySelector("THE-VALUE");
    const value = valueElement ? valueElement.textContent : null;
    return new ReqIFAttributeValueString(definitionRef, value || null);
  }

  /**
   * Parse an integer attribute value.
   */
  private static parseIntegerAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueInteger {
    const valueElement = element.querySelector("THE-VALUE");
    let value: number | null = null;

    if (valueElement && valueElement.textContent) {
      value = parseInt(valueElement.textContent, 10);
      if (isNaN(value)) {
        value = null;
      }
    }

    return new ReqIFAttributeValueInteger(definitionRef, value);
  }

  /**
   * Parse a real attribute value.
   */
  private static parseRealAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueReal {
    const valueElement = element.querySelector("THE-VALUE");
    let value: number | null = null;

    if (valueElement && valueElement.textContent) {
      value = parseFloat(valueElement.textContent);
      if (isNaN(value)) {
        value = null;
      }
    }

    return new ReqIFAttributeValueReal(definitionRef, value);
  }

  /**
   * Parse a boolean attribute value.
   */
  private static parseBooleanAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueBoolean {
    const valueElement = element.querySelector("THE-VALUE");
    let value: boolean | null = null;

    if (valueElement && valueElement.textContent) {
      value = valueElement.textContent.toLowerCase() === "true";
    }

    return new ReqIFAttributeValueBoolean(definitionRef, value);
  }

  /**
   * Parse a date attribute value.
   */
  private static parseDateAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueDate {
    const valueElement = element.querySelector("THE-VALUE");
    const value = valueElement ? valueElement.textContent : null;
    return new ReqIFAttributeValueDate(definitionRef, value || null);
  }

  /**
   * Parse an enumeration attribute value.
   */
  private static parseEnumerationAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueEnumeration {
    const valueRefs: string[] = [];
    const enumValueRefElements = element.querySelectorAll("ENUM-VALUE-REF");

    for (let i = 0; i < enumValueRefElements.length; i++) {
      const enumValueRef = enumValueRefElements[i].textContent;
      if (enumValueRef) {
        valueRefs.push(enumValueRef);
      }
    }

    return new ReqIFAttributeValueEnumeration(definitionRef, valueRefs);
  }

  /**
   * Parse an XHTML attribute value.
   */
  private static parseXhtmlAttributeValue(
    element: Element,
    definitionRef: string,
  ): ReqIFAttributeValueXHTML {
    const valueElement = element.querySelector("THE-VALUE");

    if (!valueElement) {
      return new ReqIFAttributeValueXHTML(definitionRef, null, null);
    }

    // Get the full XHTML content
    let originalContent: string | null = null;

    // Check if there are child elements (if it's actual XHTML content)
    if (valueElement.children.length > 0) {
      // Serialize the XHTML content
      originalContent = "";
      for (let i = 0; i < valueElement.childNodes.length; i++) {
        const node = valueElement.childNodes[i];
        originalContent += serializeXML(node as Node);
      }
    } else {
      // Plain text content
      originalContent = valueElement.textContent;
    }

    // Strip namespaces for a clean version
    const strippedContent = originalContent
      ? stripXhtmlNamespaces(originalContent)
      : null;

    return new ReqIFAttributeValueXHTML(
      definitionRef,
      strippedContent,
      originalContent,
    );
  }

  /**
   * Unparse attribute values to XML string.
   * @param attributeValues Array of attribute values
   * @returns XML string representation of attribute values
   */
  static unparseAttributeValues(
    attributeValues: ReqIFAttributeValue[],
  ): string {
    if (attributeValues.length === 0) {
      return "";
    }

    let result = "";

    for (const attrValue of attributeValues) {
      switch (attrValue.kind) {
        case "STRING":
          result += AttributeValueParser.unparseStringAttributeValue(
            attrValue as ReqIFAttributeValueString,
          );
          break;
        case "INTEGER":
          result += AttributeValueParser.unparseIntegerAttributeValue(
            attrValue as ReqIFAttributeValueInteger,
          );
          break;
        case "REAL":
          result += AttributeValueParser.unparseRealAttributeValue(
            attrValue as ReqIFAttributeValueReal,
          );
          break;
        case "BOOLEAN":
          result += AttributeValueParser.unparseBooleanAttributeValue(
            attrValue as ReqIFAttributeValueBoolean,
          );
          break;
        case "DATE":
          result += AttributeValueParser.unparseDateAttributeValue(
            attrValue as ReqIFAttributeValueDate,
          );
          break;
        case "ENUMERATION":
          result += AttributeValueParser.unparseEnumerationAttributeValue(
            attrValue as ReqIFAttributeValueEnumeration,
          );
          break;
        case "XHTML":
          result += AttributeValueParser.unparseXhtmlAttributeValue(
            attrValue as ReqIFAttributeValueXHTML,
          );
          break;
      }
    }

    return result;
  }

  /**
   * Unparse a string attribute value.
   */
  private static unparseStringAttributeValue(
    attrValue: ReqIFAttributeValueString,
  ): string {
    return `<ATTRIBUTE-VALUE-STRING>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-STRING-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-STRING-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.value !== null ? attrValue.value : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-STRING>`;
  }

  /**
   * Unparse an integer attribute value.
   */
  private static unparseIntegerAttributeValue(
    attrValue: ReqIFAttributeValueInteger,
  ): string {
    return `<ATTRIBUTE-VALUE-INTEGER>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-INTEGER-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-INTEGER-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.value !== null ? attrValue.value : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-INTEGER>`;
  }

  /**
   * Unparse a real attribute value.
   */
  private static unparseRealAttributeValue(
    attrValue: ReqIFAttributeValueReal,
  ): string {
    return `<ATTRIBUTE-VALUE-REAL>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-REAL-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-REAL-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.value !== null ? attrValue.value : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-REAL>`;
  }

  /**
   * Unparse a boolean attribute value.
   */
  private static unparseBooleanAttributeValue(
    attrValue: ReqIFAttributeValueBoolean,
  ): string {
    return `<ATTRIBUTE-VALUE-BOOLEAN>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-BOOLEAN-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-BOOLEAN-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.value !== null ? attrValue.value.toString() : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-BOOLEAN>`;
  }

  /**
   * Unparse a date attribute value.
   */
  private static unparseDateAttributeValue(
    attrValue: ReqIFAttributeValueDate,
  ): string {
    return `<ATTRIBUTE-VALUE-DATE>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-DATE-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-DATE-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.value !== null ? attrValue.value : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-DATE>`;
  }

  /**
   * Unparse an enumeration attribute value.
   */
  private static unparseEnumerationAttributeValue(
    attrValue: ReqIFAttributeValueEnumeration,
  ): string {
    let enumValuesXml = "";
    for (const enumValue of attrValue.values) {
      enumValuesXml += `<ENUM-VALUE-REF>${enumValue}</ENUM-VALUE-REF>\n  `;
    }

    return `<ATTRIBUTE-VALUE-ENUMERATION>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-ENUMERATION-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-ENUMERATION-REF>
  </DEFINITION>
  ${enumValuesXml.length > 0 ? `<VALUES>\n  ${enumValuesXml}</VALUES>` : "<VALUES/>"}
</ATTRIBUTE-VALUE-ENUMERATION>`;
  }

  /**
   * Unparse an XHTML attribute value.
   */
  private static unparseXhtmlAttributeValue(
    attrValue: ReqIFAttributeValueXHTML,
  ): string {
    return `<ATTRIBUTE-VALUE-XHTML>
  <DEFINITION>
    <ATTRIBUTE-DEFINITION-XHTML-REF>${attrValue.definitionRef}</ATTRIBUTE-DEFINITION-XHTML-REF>
  </DEFINITION>
  <THE-VALUE>${attrValue.originalValue !== null ? attrValue.originalValue : ""}</THE-VALUE>
</ATTRIBUTE-VALUE-XHTML>`;
  }
}

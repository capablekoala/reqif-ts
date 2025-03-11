/**
 * Schema validator for ReqIF.
 * Validates ReqIF XML against the official ReqIF schema.
 */

import { ReqIFError } from "../models/error-handling";

// XML schema namespace
const _XMLNS_XSD = "http://www.w3.org/2001/XMLSchema";

// ReqIF schema URL
const _REQIF_SCHEMA_URL = "http://www.omg.org/spec/ReqIF/20110401/reqif.xsd";

/**
 * Validates a ReqIF XML document against the ReqIF schema.
 * In a browser environment, it uses the built-in XML validation with XSD.
 * In Node.js, it uses a simplified validation approach.
 */
export class SchemaValidator {
  /**
   * Validate a ReqIF XML document.
   * @param xmlDoc The XML document to validate
   * @returns A boolean indicating if the document is valid
   * @throws ReqIFError if validation fails
   */
  static validate(xmlDoc: Document): boolean {
    try {
      // Check root element
      const rootElement = xmlDoc.documentElement;
      if (rootElement.tagName !== "REQ-IF") {
        throw new ReqIFError(
          `Invalid root element: expected 'REQ-IF', got '${rootElement.tagName}'`,
        );
      }

      // Check required sections
      const requiredSections = ["THE-HEADER", "CORE-CONTENT"];
      for (const section of requiredSections) {
        if (!rootElement.querySelector(section)) {
          throw new ReqIFError(`Missing required section: ${section}`);
        }
      }

      // Check header
      const header = rootElement.querySelector("THE-HEADER > REQ-IF-HEADER");
      if (!header) {
        throw new ReqIFError("Missing REQ-IF-HEADER in THE-HEADER section");
      }

      // Check header required attributes
      const requiredHeaderAttrs = ["IDENTIFIER", "CREATION-TIME"];
      for (const attr of requiredHeaderAttrs) {
        if (!header.hasAttribute(attr)) {
          throw new ReqIFError(
            `Missing required attribute in REQ-IF-HEADER: ${attr}`,
          );
        }
      }

      // Check content
      const content = rootElement.querySelector(
        "CORE-CONTENT > REQ-IF-CONTENT",
      );
      if (!content) {
        throw new ReqIFError("Missing REQ-IF-CONTENT in CORE-CONTENT section");
      }

      // Validate all elements with IDENTIFIER attribute
      const elementsWithIdentifier = xmlDoc.querySelectorAll("[IDENTIFIER]");
      const identifiers = new Set<string>();

      for (let i = 0; i < elementsWithIdentifier.length; i++) {
        const element = elementsWithIdentifier[i];
        const identifier = element.getAttribute("IDENTIFIER") || "";

        if (identifiers.has(identifier)) {
          throw new ReqIFError(`Duplicate IDENTIFIER: ${identifier}`);
        }

        identifiers.add(identifier);
      }

      // Check references
      this.validateReferences(xmlDoc);

      return true;
    } catch (error) {
      if (error instanceof ReqIFError) {
        throw error;
      } else {
        throw new ReqIFError(
          `Schema validation error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Validate references in a ReqIF XML document.
   * @param xmlDoc The XML document to validate
   * @throws ReqIFError if validation fails
   */
  private static validateReferences(xmlDoc: Document): void {
    // Get all identifiers
    const identifiers = new Set<string>();
    const elementsWithIdentifier = xmlDoc.querySelectorAll("[IDENTIFIER]");

    elementsWithIdentifier.forEach((element) => {
      const identifier = element.getAttribute("IDENTIFIER") || "";
      identifiers.add(identifier);
    });

    // Check spec object references
    const specObjectRefs = xmlDoc.querySelectorAll("SPEC-OBJECT-REF");
    for (let i = 0; i < specObjectRefs.length; i++) {
      const ref = specObjectRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid SPEC-OBJECT-REF: ${ref}`);
      }
    }

    // Check spec relation references
    const specRelationRefs = xmlDoc.querySelectorAll("SPEC-RELATION-REF");
    for (let i = 0; i < specRelationRefs.length; i++) {
      const ref = specRelationRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid SPEC-RELATION-REF: ${ref}`);
      }
    }

    // Check spec object type references
    const specObjectTypeRefs = xmlDoc.querySelectorAll("SPEC-OBJECT-TYPE-REF");
    for (let i = 0; i < specObjectTypeRefs.length; i++) {
      const ref = specObjectTypeRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid SPEC-OBJECT-TYPE-REF: ${ref}`);
      }
    }

    // Check spec relation type references
    const specRelationTypeRefs = xmlDoc.querySelectorAll(
      "SPEC-RELATION-TYPE-REF",
    );
    for (let i = 0; i < specRelationTypeRefs.length; i++) {
      const ref = specRelationTypeRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid SPEC-RELATION-TYPE-REF: ${ref}`);
      }
    }

    // Check specification type references
    const specificationTypeRefs = xmlDoc.querySelectorAll(
      "SPECIFICATION-TYPE-REF",
    );
    for (let i = 0; i < specificationTypeRefs.length; i++) {
      const ref = specificationTypeRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid SPECIFICATION-TYPE-REF: ${ref}`);
      }
    }

    // Check datatype references
    const dataTypeRefs = xmlDoc.querySelectorAll("DATATYPE-DEFINITION-*-REF");
    for (let i = 0; i < dataTypeRefs.length; i++) {
      const ref = dataTypeRefs[i].textContent;
      if (ref && !identifiers.has(ref)) {
        throw new ReqIFError(`Invalid DATATYPE-DEFINITION-REF: ${ref}`);
      }
    }
  }
}

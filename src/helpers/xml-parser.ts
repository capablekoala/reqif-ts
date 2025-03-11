/**
 * Cross-platform XML parsing utilities.
 * Provides consistent XML parsing functionality for both Node.js and browser environments.
 */
import { isBrowser } from "./platform";

/**
 * XML document representation.
 * Abstracts the different XML document implementations across platforms.
 */
export interface XMLDocument {
  documentElement: XMLElement;
  createElement(tagName: string): XMLElement;
  createTextNode(text: string): Node;
}

/**
 * XML element representation.
 * Abstracts the different XML element implementations across platforms.
 */
export interface XMLElement {
  tagName: string;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  hasAttribute(name: string): boolean;
  appendChild(node: Node): Node;
  getElementsByTagName(tagName: string): NodeListOf<Element>;
  querySelectorAll(selector: string): NodeListOf<Element>;
  querySelector(selector: string): Element | null;
  textContent: string | null;
  innerHTML?: string;
  childNodes: NodeListOf<ChildNode>;
}

/**
 * Parse an XML string into a Document object.
 * Works in both Node.js and browser environments.
 */
export function parseXML(xmlString: string): Document {
  if (isBrowser()) {
    // Browser environment
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    // Check for parsing errors
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
      throw new Error(`XML parsing error: ${errorNode.textContent}`);
    }

    return doc;
  } else {
    // Node.js environment
    try {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM(xmlString, { contentType: "application/xml" });
      return dom.window.document;
    } catch (error) {
      console.error("Error parsing XML in Node.js environment", error);
      throw new Error(
        `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Serialize a Document or Node object to an XML string.
 * Works in both Node.js and browser environments.
 *
 * @param node The DOM node or document to serialize
 * @param prettyPrint Whether to format the XML with indentation
 * @returns The serialized XML string
 */
export function serializeXML(
  node: Node | Document,
  prettyPrint: boolean = false,
): string {
  let xmlString: string;

  if (isBrowser()) {
    // Browser environment
    const serializer = new XMLSerializer();
    xmlString = serializer.serializeToString(node);
  } else {
    // Node.js environment
    try {
      const { JSDOM } = require("jsdom");
      const { window } = new JSDOM("<!DOCTYPE html><html></html>");
      const serializer = new window.XMLSerializer();
      xmlString = serializer.serializeToString(node);
    } catch (error) {
      console.error("Error serializing XML in Node.js environment", error);
      throw new Error(
        `Failed to serialize XML: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Format XML if requested (basic indentation)
  if (prettyPrint) {
    try {
      const formattedXml = formatXML(xmlString);
      return formattedXml;
    } catch (error) {
      console.warn("XML formatting failed, returning unformatted XML", error);
      return xmlString;
    }
  }

  return xmlString;
}

/**
 * Format an XML string with proper indentation.
 * @param xmlString The XML string to format
 * @returns The formatted XML string
 */
function formatXML(xmlString: string): string {
  const PADDING = " ".repeat(2); // 2 spaces
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;

  xmlString = xmlString.replace(reg, "$1\n$2$3");

  let formatted = "";
  const lines = xmlString.split("\n");

  for (const line of lines) {
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      // Line contains closing tag
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      // Line contains only a closing tag
      pad -= 1;
      if (pad < 0) pad = 0;
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      // Line contains opening tag but no closing tag
      indent = 1;
    } else {
      // Line doesn't affect indentation
      indent = 0;
    }

    // Apply indentation
    const padding = PADDING.repeat(pad);
    formatted += padding + line + "\n";
    pad += indent;
  }

  return formatted.trim();
}

/**
 * Create a new XML document.
 * Works in both Node.js and browser environments.
 *
 * @param namespace Optional namespace URI for the document
 * @param qualifiedName Optional qualified name for the root element
 * @returns A new XML Document
 */
export function createXMLDocument(
  namespace: string | null = null,
  qualifiedName: string = "",
): Document {
  if (isBrowser()) {
    // Browser environment
    return document.implementation.createDocument(
      namespace,
      qualifiedName,
      null,
    );
  } else {
    // Node.js environment
    try {
      const { JSDOM } = require("jsdom");
      const dom = new JSDOM("<!DOCTYPE html><html></html>", {
        contentType: "application/xhtml+xml",
      });
      return dom.window.document.implementation.createDocument(
        namespace,
        qualifiedName,
        null,
      );
    } catch (error) {
      console.error(
        "Error creating XML document in Node.js environment",
        error,
      );
      throw new Error(
        `Failed to create XML document: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Get namespace-aware attribute value.
 * Handles XML namespace differences across platforms.
 */
export function getNamespaceAttribute(
  element: Element,
  namespaceURI: string,
  localName: string,
): string | null {
  // Try the standard way first
  if (element.getAttributeNS) {
    const value = element.getAttributeNS(namespaceURI, localName);
    if (value) {
      return value;
    }
  }

  // Fall back to checking for prefixed attributes
  const attributes = element.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.namespaceURI === namespaceURI && attr.localName === localName) {
      return attr.value;
    }
  }

  // Try with prefix as a last resort
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.name.endsWith(`:${localName}`)) {
      return attr.value;
    }
  }

  return null;
}

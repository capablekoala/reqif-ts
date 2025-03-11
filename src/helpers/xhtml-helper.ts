/**
 * Helper functions for handling XHTML content in ReqIF files.
 */

const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const REQIF_NAMESPACE = "http://www.omg.org/spec/ReqIF/20110401/reqif.xsd";

/**
 * Converts XHTML content from ReqIF to a plain XHTML string without namespace prefixes.
 *
 * This implementation is more robust and better handles complex XHTML structures:
 * - Retains attributes properly
 * - Preserves self-closing tags
 * - Maintains correct hierarchical structure
 *
 * @param xhtmlContent The XHTML content from ReqIF
 * @returns A string with the XHTML content without namespace prefixes
 */
export function stripXhtmlNamespaces(xhtmlContent: string): string {
  if (!xhtmlContent) return "";

  try {
    // Try to parse as XML first
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<wrapper>${xhtmlContent}</wrapper>`,
      "application/xml",
    );

    // Process all nodes to remove namespaces
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;

        // Process attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          if (attr.name.includes(":") && !attr.name.startsWith("xmlns:")) {
            const localName = attr.name.split(":")[1];
            element.setAttribute(localName, attr.value);
            element.removeAttribute(attr.name);
            // Adjust counter since we modified the attributes collection
            i--;
          } else if (attr.name === "xmlns" || attr.name.startsWith("xmlns:")) {
            element.removeAttribute(attr.name);
            // Adjust counter since we modified the attributes collection
            i--;
          }
        }

        // Process child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          processNode(node.childNodes[i]);
        }
      }
    };

    // Process the document
    processNode(doc.documentElement);

    // Get the content without the wrapper
    return doc.documentElement.innerHTML;
  } catch (e) {
    // Fall back to regex-based approach if parsing fails
    console.warn("Falling back to regex-based XHTML namespace stripping");

    // Remove namespace declarations
    let result = xhtmlContent.replace(/xmlns(:[a-z0-9]+)?="[^"]+"/g, "");

    // Remove namespace prefixes from tags
    result = result.replace(/<\/?([a-z0-9]+:)([a-z0-9]+)/gi, "</$2");

    // Remove namespace prefixes from attributes
    result = result.replace(/([a-z0-9]+):([a-z0-9]+)=/gi, "$2=");

    return result.trim();
  }
}

/**
 * Converts a plain XHTML string to ReqIF-namespaced XHTML.
 *
 * This implementation is more robust:
 * - Properly adds namespaces
 * - Preserves tag attributes
 * - Handles root element detection better
 *
 * @param xhtmlContent The plain XHTML content
 * @returns A string with the XHTML content with proper namespace prefixes
 */
export function addXhtmlNamespaces(xhtmlContent: string): string {
  if (!xhtmlContent) return "";

  try {
    // Try to parse as XML first
    const parser = new DOMParser();
    const doc = parser.parseFromString(xhtmlContent, "application/xml");

    // Add namespace to root element
    const rootElement = doc.documentElement;
    rootElement.setAttribute("xmlns", XHTML_NAMESPACE);
    rootElement.setAttribute("xmlns:reqif", REQIF_NAMESPACE);

    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (e) {
    // Fall back to regex-based approach if parsing fails
    console.warn("Falling back to regex-based XHTML namespace addition");

    // Add namespace declaration to the root element
    const result = xhtmlContent.replace(
      /<([a-z0-9]+)([^>]*)>/i,
      `<$1 xmlns="${XHTML_NAMESPACE}" xmlns:reqif="${REQIF_NAMESPACE}"$2>`,
    );

    return result;
  }
}

/**
 * Properly indents an XHTML string for pretty printing.
 *
 * This implementation is more robust:
 * - Uses DOM parsing for better accuracy
 * - Properly handles nested elements
 * - Preserves text content formatting
 * - Handles self-closing tags correctly
 *
 * @param xhtmlContent The XHTML content
 * @returns Indented XHTML content
 */
export function indentXhtml(xhtmlContent: string): string {
  if (!xhtmlContent) return "";

  // Function to pretty print a node with indentation
  function prettyPrintNode(node: Node, level: number): string {
    const indent = "  ".repeat(level);

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || "";
      if (text === "") {
        return "";
      }
      return `${indent}${text}\n`;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName;

      // Build attributes string
      let attributes = "";
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes += ` ${attr.name}="${attr.value}"`;
      }

      // Handle empty elements
      if (!element.hasChildNodes()) {
        return `${indent}<${tagName}${attributes}/>\n`;
      }

      let result = `${indent}<${tagName}${attributes}>`;

      // Check if there's only text content (no formatting needed)
      if (
        element.childNodes.length === 1 &&
        element.firstChild?.nodeType === Node.TEXT_NODE &&
        element.firstChild.textContent?.trim() !== ""
      ) {
        result += element.firstChild.textContent;
      } else {
        result += "\n";

        // Process child nodes with increased indentation
        for (let i = 0; i < element.childNodes.length; i++) {
          result += prettyPrintNode(element.childNodes[i], level + 1);
        }

        result += indent;
      }

      result += `</${tagName}>\n`;
      return result;
    }

    return "";
  }

  try {
    // Try to parse as XML first
    const parser = new DOMParser();
    const doc = parser.parseFromString(xhtmlContent, "application/xml");

    // Format the document
    return prettyPrintNode(doc.documentElement, 0).trim();
  } catch (e) {
    // Fall back to the simpler approach
    console.warn("Falling back to simple XHTML indentation");

    // Simple indentation fallback
    const lines = xhtmlContent.split(/>\s*</);
    let indent = 0;
    let result = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Closing tag - reduce indent before adding
      if (line.startsWith("/") && indent > 0) {
        indent--;
      }

      // Add proper indentation
      result +=
        (i > 0 ? ">" : "") +
        "\n" +
        "  ".repeat(indent) +
        (i > 0 ? "<" : "") +
        line;

      // Opening tag without self-closing - increase indent after adding
      if (
        !line.startsWith("/") &&
        !line.endsWith("/") &&
        !line.includes("</")
      ) {
        indent++;
      }
    }

    return result.trim();
  }
}

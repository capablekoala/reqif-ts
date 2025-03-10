import { ReqIFError } from '../models/error-handling';
import { ReqIFSpecObject } from '../models/reqif-spec-object';
import { ReqIFAttributeValue } from '../models/reqif-attribute-value';
import { AttributeValueParser } from './attribute-value-parser';

/**
 * Parser for ReqIF SPEC-OBJECT elements.
 */
export class SpecObjectParser {
  /**
   * Parse a SPEC-OBJECT element into a ReqIFSpecObject.
   * @param element The SPEC-OBJECT XML element
   * @returns A ReqIFSpecObject instance
   */
  static parse(element: Element): ReqIFSpecObject {
    // Verify this is a SPEC-OBJECT element
    if (element.tagName !== 'SPEC-OBJECT') {
      throw new ReqIFError(`Expected SPEC-OBJECT element, got ${element.tagName}`);
    }
    
    // Get required attributes
    const identifier = element.getAttribute('IDENTIFIER');
    if (!identifier) {
      throw new ReqIFError('SPEC-OBJECT element missing required IDENTIFIER attribute');
    }
    
    // Get optional attributes
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Get type reference
    const typeElement = element.querySelector('TYPE > SPEC-OBJECT-TYPE-REF');
    if (!typeElement || !typeElement.textContent) {
      throw new ReqIFError('SPEC-OBJECT element missing TYPE/SPEC-OBJECT-TYPE-REF');
    }
    const typeRef = typeElement.textContent;
    
    // Parse attribute values
    let attributeValues: ReqIFAttributeValue[] = [];
    const valuesElements = element.querySelectorAll('VALUES > *');
    if (valuesElements.length > 0) {
      attributeValues = AttributeValueParser.parseAttributeValues(Array.from(valuesElements));
    }
    
    // Create and return the spec object
    return new ReqIFSpecObject(
      identifier,
      typeRef,
      attributeValues,
      longName,
      lastChange,
      desc,
      element
    );
  }
  
  /**
   * Unparse a ReqIFSpecObject to XML string.
   * @param specObject The spec object to unparse
   * @returns XML string representation of the spec object
   */
  static unparse(specObject: ReqIFSpecObject): string {
    // Start with the opening tag and attributes
    let result = `<SPEC-OBJECT IDENTIFIER="${specObject.identifier}"`;
    
    if (specObject.longName) {
      result += ` LONG-NAME="${specObject.longName}"`;
    }
    
    if (specObject.lastChange) {
      result += ` LAST-CHANGE="${specObject.lastChange}"`;
    }
    
    if (specObject.desc) {
      result += ` DESC="${specObject.desc}"`;
    }
    
    result += '>\n';
    
    // Add type element
    result += SpecObjectParser.unparseSpecObjectType(specObject);
    
    // Add values if there are attribute values
    if (specObject.attributeValues.length > 0) {
      result += '  <VALUES>\n';
      result += AttributeValueParser.unparseAttributeValues(specObject.attributeValues)
        .split('\n')
        .map(line => `    ${line}`)
        .join('\n');
      result += '\n  </VALUES>\n';
    }
    
    // Close the spec object tag
    result += '</SPEC-OBJECT>';
    
    return result;
  }
  
  /**
   * Unparse the spec object type section.
   * @param specObject The spec object
   * @returns XML string for the TYPE section
   */
  private static unparseSpecObjectType(specObject: ReqIFSpecObject): string {
    return `  <TYPE>
    <SPEC-OBJECT-TYPE-REF>${specObject.typeRef}</SPEC-OBJECT-TYPE-REF>
  </TYPE>\n`;
  }
}
import { ReqIFError } from '../models/error-handling';
import { ReqIFSpecification } from '../models/reqif-specification';
import { AttributeValueParser } from './attribute-value-parser';
import { SpecHierarchyParser } from './spec-hierarchy-parser';
import { ReqIFAttributeValue } from '../models/reqif-attribute-value';

/**
 * Parser for ReqIF SPECIFICATION elements.
 */
export class SpecificationParser {
  /**
   * Parse a SPECIFICATION element into a ReqIFSpecification.
   * @param element The SPECIFICATION XML element
   * @returns A ReqIFSpecification instance
   */
  static parse(element: Element): ReqIFSpecification {
    // Verify this is a SPECIFICATION element
    if (element.tagName !== 'SPECIFICATION') {
      throw new ReqIFError(`Expected SPECIFICATION element, got ${element.tagName}`);
    }
    
    // Get required attributes
    const identifier = element.getAttribute('IDENTIFIER');
    if (!identifier) {
      throw new ReqIFError('SPECIFICATION element missing required IDENTIFIER attribute');
    }
    
    // Get optional attributes
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Get type reference
    let typeRef: string | undefined;
    const typeElement = element.querySelector('TYPE > SPECIFICATION-TYPE-REF');
    if (typeElement && typeElement.textContent) {
      typeRef = typeElement.textContent;
    }
    
    // Parse attribute values
    let attributeValues: ReqIFAttributeValue[] = [];
    const valuesElements = element.querySelectorAll('VALUES > *');
    if (valuesElements.length > 0) {
      attributeValues = AttributeValueParser.parseAttributeValues(Array.from(valuesElements));
    }
    
    // Parse children
    const children = [];
    const childElements = element.querySelectorAll('CHILDREN > SPEC-HIERARCHY');
    
    if (childElements.length > 0) {
      for (let i = 0; i < childElements.length; i++) {
        const child = SpecHierarchyParser.parse(childElements[i] as Element);
        children.push(child);
      }
    }
    
    // Create and return the specification
    return new ReqIFSpecification(
      identifier,
      typeRef || '',
      children,
      longName,
      lastChange,
      desc,
      attributeValues,
      element
    );
  }
  
  /**
   * Unparse a ReqIFSpecification to XML string.
   * @param specification The specification to unparse
   * @returns XML string representation of the specification
   */
  static unparse(specification: ReqIFSpecification): string {
    // Start with the opening tag and attributes
    let result = `<SPECIFICATION IDENTIFIER="${specification.identifier}"`;
    
    if (specification.longName) {
      result += ` LONG-NAME="${specification.longName}"`;
    }
    
    if (specification.lastChange) {
      result += ` LAST-CHANGE="${specification.lastChange}"`;
    }
    
    if (specification.desc) {
      result += ` DESC="${specification.desc}"`;
    }
    
    result += '>\n';
    
    // Add TYPE element if typeRef is provided
    if (specification.typeRef) {
      result += '  <TYPE>\n';
      result += `    <SPECIFICATION-TYPE-REF>${specification.typeRef}</SPECIFICATION-TYPE-REF>\n`;
      result += '  </TYPE>\n';
    }
    
    // Add VALUES if there are attribute values
    if (specification.attributeValues && specification.attributeValues.length > 0) {
      result += '  <VALUES>\n';
      result += AttributeValueParser.unparseAttributeValues(specification.attributeValues)
        .split('\n')
        .map(line => `    ${line}`)
        .join('\n');
      result += '\n  </VALUES>\n';
    }
    
    // Add CHILDREN if there are child hierarchies
    if (specification.children && specification.children.length > 0) {
      result += '  <CHILDREN>\n';
      
      for (const child of specification.children) {
        result += SpecHierarchyParser.unparse(child)
          .split('\n')
          .map(line => `    ${line}`)
          .join('\n');
        result += '\n';
      }
      
      result += '  </CHILDREN>\n';
    }
    
    // Close the specification tag
    result += '</SPECIFICATION>';
    
    return result;
  }
}
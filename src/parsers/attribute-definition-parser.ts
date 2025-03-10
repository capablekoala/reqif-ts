import { ReqIFDataTypeKind } from '../models/reqif-types';

/**
 * Represents an attribute definition in ReqIF.
 * This is a type-agnostic interface for attribute definitions.
 */
export interface ReqIFAttributeDefinition {
  identifier: string;
  type: ReqIFDataTypeKind;
  typeRef: string;
  longName?: string;
  lastChange?: string;
  desc?: string;
  multiValued?: boolean;
}

/**
 * Parser for attribute definitions in ReqIF.
 */
export class AttributeDefinitionParser {
  /**
   * Parse an attribute definition from an XML element.
   */
  static parse(element: Element): ReqIFAttributeDefinition {
    // Get the tag name to determine the type
    const tagName = element.tagName;
    let type: ReqIFDataTypeKind;
    
    // Determine the type from the tag name
    if (tagName.includes('BOOLEAN')) {
      type = ReqIFDataTypeKind.BOOLEAN;
    } else if (tagName.includes('DATE')) {
      type = ReqIFDataTypeKind.DATE;
    } else if (tagName.includes('ENUMERATION')) {
      type = ReqIFDataTypeKind.ENUMERATION;
    } else if (tagName.includes('INTEGER')) {
      type = ReqIFDataTypeKind.INTEGER;
    } else if (tagName.includes('REAL')) {
      type = ReqIFDataTypeKind.REAL;
    } else if (tagName.includes('STRING')) {
      type = ReqIFDataTypeKind.STRING;
    } else if (tagName.includes('XHTML')) {
      type = ReqIFDataTypeKind.XHTML;
    } else {
      throw new Error(`Unknown attribute definition type: ${tagName}`);
    }
    
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Get multi-valued attribute (for enumerations)
    const multiValued = element.getAttribute('MULTI-VALUED') === 'true';
    
    // Get the datatype reference
    const typeRefElement = element.querySelector(`TYPE > DATATYPE-DEFINITION-${type}-REF`);
    const typeRef = typeRefElement?.textContent || '';
    
    return {
      identifier,
      type,
      typeRef,
      longName,
      lastChange,
      desc,
      multiValued
    };
  }
}
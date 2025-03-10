import { ReqIFSpecObjectType } from '../models/reqif-spec-object-type';
import { ReqIFSpecificationType } from '../models/reqif-specification-type';
import { ReqIFSpecRelationType } from '../models/reqif-spec-relation-type';
import { ReqIFRelationGroupType } from '../models/reqif-relation-group-type';
import { AttributeDefinitionParser, ReqIFAttributeDefinition } from './attribute-definition-parser';

/**
 * Parser for spec object types in ReqIF.
 */
export class SpecObjectTypeParser {
  /**
   * Parse a spec object type from an XML element.
   */
  static parse(element: Element): ReqIFSpecObjectType {
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Parse attribute definitions
    const attributeDefinitions: ReqIFAttributeDefinition[] = [];
    const specAttributesElement = element.querySelector('SPEC-ATTRIBUTES');
    
    if (specAttributesElement) {
      // Select all attribute definition elements
      const attrDefElements = specAttributesElement.querySelectorAll(
        'ATTRIBUTE-DEFINITION-BOOLEAN, ' +
        'ATTRIBUTE-DEFINITION-DATE, ' +
        'ATTRIBUTE-DEFINITION-ENUMERATION, ' +
        'ATTRIBUTE-DEFINITION-INTEGER, ' +
        'ATTRIBUTE-DEFINITION-REAL, ' +
        'ATTRIBUTE-DEFINITION-STRING, ' +
        'ATTRIBUTE-DEFINITION-XHTML'
      );
      
      // Parse each attribute definition
      attrDefElements.forEach(attrDefElement => {
        try {
          const attrDef = AttributeDefinitionParser.parse(attrDefElement as Element);
          attributeDefinitions.push(attrDef);
        } catch (error) {
          console.warn(`Error parsing attribute definition: ${error}`);
        }
      });
    }
    
    return new ReqIFSpecObjectType(
      identifier,
      attributeDefinitions,
      longName,
      lastChange,
      desc,
      element
    );
  }
}

/**
 * Parser for specification types in ReqIF.
 */
export class SpecificationTypeParser {
  /**
   * Parse a specification type from an XML element.
   */
  static parse(element: Element): ReqIFSpecificationType {
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Parse attribute definitions
    const attributeDefinitions: ReqIFAttributeDefinition[] = [];
    const specAttributesElement = element.querySelector('SPEC-ATTRIBUTES');
    
    if (specAttributesElement) {
      // Select all attribute definition elements
      const attrDefElements = specAttributesElement.querySelectorAll(
        'ATTRIBUTE-DEFINITION-BOOLEAN, ' +
        'ATTRIBUTE-DEFINITION-DATE, ' +
        'ATTRIBUTE-DEFINITION-ENUMERATION, ' +
        'ATTRIBUTE-DEFINITION-INTEGER, ' +
        'ATTRIBUTE-DEFINITION-REAL, ' +
        'ATTRIBUTE-DEFINITION-STRING, ' +
        'ATTRIBUTE-DEFINITION-XHTML'
      );
      
      // Parse each attribute definition
      attrDefElements.forEach(attrDefElement => {
        try {
          const attrDef = AttributeDefinitionParser.parse(attrDefElement as Element);
          attributeDefinitions.push(attrDef);
        } catch (error) {
          console.warn(`Error parsing attribute definition: ${error}`);
        }
      });
    }
    
    return new ReqIFSpecificationType(
      identifier,
      attributeDefinitions,
      longName,
      lastChange,
      desc,
      element
    );
  }
}

/**
 * Parser for spec relation types in ReqIF.
 */
export class SpecRelationTypeParser {
  /**
   * Parse a spec relation type from an XML element.
   */
  static parse(element: Element): ReqIFSpecRelationType {
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Parse attribute definitions
    const attributeDefinitions: ReqIFAttributeDefinition[] = [];
    const specAttributesElement = element.querySelector('SPEC-ATTRIBUTES');
    
    if (specAttributesElement) {
      // Select all attribute definition elements
      const attrDefElements = specAttributesElement.querySelectorAll(
        'ATTRIBUTE-DEFINITION-BOOLEAN, ' +
        'ATTRIBUTE-DEFINITION-DATE, ' +
        'ATTRIBUTE-DEFINITION-ENUMERATION, ' +
        'ATTRIBUTE-DEFINITION-INTEGER, ' +
        'ATTRIBUTE-DEFINITION-REAL, ' +
        'ATTRIBUTE-DEFINITION-STRING, ' +
        'ATTRIBUTE-DEFINITION-XHTML'
      );
      
      // Parse each attribute definition
      attrDefElements.forEach(attrDefElement => {
        try {
          const attrDef = AttributeDefinitionParser.parse(attrDefElement as Element);
          attributeDefinitions.push(attrDef);
        } catch (error) {
          console.warn(`Error parsing attribute definition: ${error}`);
        }
      });
    }
    
    return new ReqIFSpecRelationType(
      identifier,
      attributeDefinitions,
      longName,
      lastChange,
      desc,
      element
    );
  }
}

/**
 * Parser for relation group types in ReqIF.
 */
export class RelationGroupTypeParser {
  /**
   * Parse a relation group type from an XML element.
   */
  static parse(element: Element): ReqIFRelationGroupType {
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Parse attribute definitions
    const attributeDefinitions: ReqIFAttributeDefinition[] = [];
    const specAttributesElement = element.querySelector('SPEC-ATTRIBUTES');
    
    if (specAttributesElement) {
      // Select all attribute definition elements
      const attrDefElements = specAttributesElement.querySelectorAll(
        'ATTRIBUTE-DEFINITION-BOOLEAN, ' +
        'ATTRIBUTE-DEFINITION-DATE, ' +
        'ATTRIBUTE-DEFINITION-ENUMERATION, ' +
        'ATTRIBUTE-DEFINITION-INTEGER, ' +
        'ATTRIBUTE-DEFINITION-REAL, ' +
        'ATTRIBUTE-DEFINITION-STRING, ' +
        'ATTRIBUTE-DEFINITION-XHTML'
      );
      
      // Parse each attribute definition
      attrDefElements.forEach(attrDefElement => {
        try {
          const attrDef = AttributeDefinitionParser.parse(attrDefElement as Element);
          attributeDefinitions.push(attrDef);
        } catch (error) {
          console.warn(`Error parsing attribute definition: ${error}`);
        }
      });
    }
    
    return new ReqIFRelationGroupType(
      identifier,
      attributeDefinitions,
      longName,
      lastChange,
      desc,
      element
    );
  }
}
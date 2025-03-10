import { ReqIFRelationGroup } from '../models/reqif-relation-group';
import { AttributeValueParser } from './attribute-value-parser';
import { ReqIFAttributeValue } from '../models/reqif-attribute-value';

/**
 * Parser for relation groups in ReqIF.
 */
export class RelationGroupParser {
  /**
   * Parse a relation group from an XML element.
   */
  static parse(element: Element): ReqIFRelationGroup {
    // Get common attributes
    const identifier = element.getAttribute('IDENTIFIER') || '';
    const longName = element.getAttribute('LONG-NAME') || undefined;
    const lastChange = element.getAttribute('LAST-CHANGE') || undefined;
    const desc = element.getAttribute('DESC') || undefined;
    
    // Get type reference
    const typeRefElement = element.querySelector('TYPE > RELATION-GROUP-TYPE-REF');
    const typeRef = typeRefElement?.textContent || '';
    
    // Get source specification reference
    const sourceSpecRefElement = element.querySelector('SOURCE-SPECIFICATION > SPECIFICATION-REF');
    const sourceSpecificationRef = sourceSpecRefElement?.textContent || undefined;
    
    // Get target specification reference
    const targetSpecRefElement = element.querySelector('TARGET-SPECIFICATION > SPECIFICATION-REF');
    const targetSpecificationRef = targetSpecRefElement?.textContent || undefined;
    
    // Get spec relation references
    const specRelationRefs: string[] = [];
    const relationsElement = element.querySelector('SPEC-RELATIONS');
    
    if (relationsElement) {
      const relationRefElements = relationsElement.querySelectorAll('SPEC-RELATION-REF');
      relationRefElements.forEach(refElement => {
        if (refElement.textContent) {
          specRelationRefs.push(refElement.textContent);
        }
      });
    }
    
    // Parse attribute values
    const attributeValues: ReqIFAttributeValue[] = [];
    const valuesElement = element.querySelector('VALUES');
    
    if (valuesElement) {
      // Select all attribute value elements
      const attrValueElements = valuesElement.querySelectorAll(
        'ATTRIBUTE-VALUE-BOOLEAN, ' +
        'ATTRIBUTE-VALUE-DATE, ' +
        'ATTRIBUTE-VALUE-ENUMERATION, ' +
        'ATTRIBUTE-VALUE-INTEGER, ' +
        'ATTRIBUTE-VALUE-REAL, ' +
        'ATTRIBUTE-VALUE-STRING, ' +
        'ATTRIBUTE-VALUE-XHTML'
      );
      
      // Parse each attribute value
      attrValueElements.forEach(attrValueElement => {
        try {
          const attrValue = AttributeValueParser.parse(attrValueElement as Element);
          if (attrValue) {
            attributeValues.push(attrValue);
          }
        } catch (error) {
          console.warn(`Error parsing attribute value: ${error}`);
        }
      });
    }
    
    return new ReqIFRelationGroup(
      identifier,
      typeRef,
      specRelationRefs,
      attributeValues,
      sourceSpecificationRef,
      targetSpecificationRef,
      longName,
      lastChange,
      desc,
      element
    );
  }
}
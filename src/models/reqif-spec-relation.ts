import { ReqIFIdentifiable } from './reqif-types';
import { ReqIFAttributeValue } from './reqif-attribute-value';

/**
 * Represents a spec relation (relationship between requirements) in ReqIF.
 */
export class ReqIFSpecRelation implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public typeRef: string,
    public sourceRef: string,
    public targetRef: string,
    public attributeValues: ReqIFAttributeValue[] = [],
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public originalXmlNode?: Element
  ) {}
  
  /**
   * Get an attribute value by its definition reference
   */
  getAttributeValue(definitionRef: string): ReqIFAttributeValue | undefined {
    return this.attributeValues.find(attrValue => attrValue.definitionRef === definitionRef);
  }
  
  /**
   * Add an attribute value to the spec relation
   */
  addAttributeValue(attrValue: ReqIFAttributeValue): void {
    this.attributeValues.push(attrValue);
  }
}
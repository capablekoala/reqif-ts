import { ReqIFIdentifiable } from "./reqif-types";
import { ReqIFAttributeValue } from "./reqif-attribute-value";

/**
 * Represents a relation group in ReqIF.
 * Groups related spec relations together.
 */
export class ReqIFRelationGroup implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public typeRef: string,
    public specRelationRefs: string[] = [],
    public attributeValues: ReqIFAttributeValue[] = [],
    public sourceSpecificationRef?: string,
    public targetSpecificationRef?: string,
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public originalXmlNode?: Element,
  ) {}

  /**
   * Get an attribute value by its definition reference
   */
  getAttributeValue(definitionRef: string): ReqIFAttributeValue | undefined {
    return this.attributeValues.find(
      (attrValue) => attrValue.definitionRef === definitionRef,
    );
  }

  /**
   * Add an attribute value to the relation group
   */
  addAttributeValue(attrValue: ReqIFAttributeValue): void {
    this.attributeValues.push(attrValue);
  }
}

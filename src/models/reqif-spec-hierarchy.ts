import { ReqIFIdentifiable } from './reqif-types';
import { ReqIFAttributeValue } from './reqif-attribute-value';

/**
 * Represents a specification hierarchy element in ReqIF.
 * These are used to organize spec objects in a hierarchical structure.
 */
export class ReqIFSpecHierarchy implements ReqIFIdentifiable {
  /**
   * Map of attribute definition references to attribute values for quick lookup
   */
  private _attributeValueMap: Map<string, ReqIFAttributeValue> = new Map();
  
  constructor(
    public identifier: string,
    public specObjectRef: string,
    public children: ReqIFSpecHierarchy[] = [],
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public level: number = 1,
    public isEditable: boolean = false,
    public isTableInternal: boolean = false,
    public attributeValues: ReqIFAttributeValue[] = [],
    /**
     * Optional reference to the original XML node for unparsing
     */
    public originalXmlNode?: Element
  ) {
    // Build the attribute value map for quick lookups
    this.buildAttributeValueMap();
  }
  
  /**
   * Build the attribute value map for quick lookups by definition reference
   */
  private buildAttributeValueMap(): void {
    this._attributeValueMap.clear();
    for (const attrValue of this.attributeValues) {
      this._attributeValueMap.set(attrValue.definitionRef, attrValue);
    }
  }
  
  /**
   * Get an attribute value by its definition reference
   */
  getAttributeValue(definitionRef: string): ReqIFAttributeValue | undefined {
    return this._attributeValueMap.get(definitionRef);
  }
  
  /**
   * Add an attribute value to the spec hierarchy
   */
  addAttributeValue(attrValue: ReqIFAttributeValue): void {
    this.attributeValues.push(attrValue);
    this._attributeValueMap.set(attrValue.definitionRef, attrValue);
  }
}
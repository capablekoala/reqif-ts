import { ReqIFIdentifiable } from "./reqif-types";
import { ReqIFAttributeDefinition } from "../parsers/attribute-definition-parser";

/**
 * Represents a spec object type in ReqIF.
 * Defines the structure and attributes of spec objects (requirements).
 */
export class ReqIFSpecObjectType implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public attributeDefinitions: ReqIFAttributeDefinition[] = [],
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public originalXmlNode?: Element,
  ) {}
}

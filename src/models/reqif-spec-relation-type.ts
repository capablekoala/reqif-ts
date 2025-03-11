import { ReqIFIdentifiable } from "./reqif-types";
import { ReqIFAttributeDefinition } from "../parsers/attribute-definition-parser";

/**
 * Represents a spec relation type in ReqIF.
 * Defines the structure and attributes of spec relations (relationships).
 */
export class ReqIFSpecRelationType implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public attributeDefinitions: ReqIFAttributeDefinition[] = [],
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public originalXmlNode?: Element,
  ) {}
}

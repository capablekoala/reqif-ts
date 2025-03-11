import { ReqIFIdentifiable } from "./reqif-types";
import { ReqIFAttributeDefinition } from "../parsers/attribute-definition-parser";

/**
 * Represents a specification type in ReqIF.
 * Defines the structure and attributes of specifications.
 */
export class ReqIFSpecificationType implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public attributeDefinitions: ReqIFAttributeDefinition[] = [],
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
    public originalXmlNode?: Element,
  ) {}
}

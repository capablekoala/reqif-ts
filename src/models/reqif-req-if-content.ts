import { ReqIFDataType } from "./reqif-data-type";
import { ReqIFSpecObject } from "./reqif-spec-object";
import { ReqIFSpecObjectType } from "./reqif-spec-object-type";
import { ReqIFSpecRelation } from "./reqif-spec-relation";
import { ReqIFSpecRelationType } from "./reqif-spec-relation-type";
import { ReqIFSpecification } from "./reqif-specification";
import { ReqIFSpecificationType } from "./reqif-specification-type";
import { ReqIFRelationGroup } from "./reqif-relation-group";
import { ReqIFRelationGroupType } from "./reqif-relation-group-type";

/**
 * Represents the main content of a ReqIF document.
 * Contains all the requirements, types, specifications, and their relationships.
 */
export class ReqIFReqIFContent {
  constructor(
    public dataTypes: ReqIFDataType[] = [],
    public specTypes: {
      specObjectTypes: ReqIFSpecObjectType[];
      specificationTypes: ReqIFSpecificationType[];
      specRelationTypes: ReqIFSpecRelationType[];
      relationGroupTypes: ReqIFRelationGroupType[];
    } = {
      specObjectTypes: [],
      specificationTypes: [],
      specRelationTypes: [],
      relationGroupTypes: [],
    },
    public specObjects: ReqIFSpecObject[] = [],
    public specifications: ReqIFSpecification[] = [],
    public specRelations: ReqIFSpecRelation[] = [],
    public relationGroups: ReqIFRelationGroup[] = [],
  ) {}
}

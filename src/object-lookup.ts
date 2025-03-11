import { ReqIFDataType } from "./models/reqif-data-type";
import { ReqIFSpecObject } from "./models/reqif-spec-object";
import { ReqIFSpecObjectType } from "./models/reqif-spec-object-type";
import { ReqIFSpecRelation } from "./models/reqif-spec-relation";
import { ReqIFSpecRelationType } from "./models/reqif-spec-relation-type";
import { ReqIFSpecification } from "./models/reqif-specification";
import { ReqIFSpecificationType } from "./models/reqif-specification-type";
import { ReqIFRelationGroup } from "./models/reqif-relation-group";
import { ReqIFRelationGroupType } from "./models/reqif-relation-group-type";

/**
 * Provides lookup tables for accessing ReqIF objects by their IDs.
 * This is used to resolve references and relationships between objects.
 */
export class ObjectLookup {
  private specObjectsById: Map<string, ReqIFSpecObject> = new Map();
  private specObjectTypesById: Map<string, ReqIFSpecObjectType> = new Map();
  private specRelationsById: Map<string, ReqIFSpecRelation> = new Map();
  private specRelationTypesById: Map<string, ReqIFSpecRelationType> = new Map();
  private specificationsById: Map<string, ReqIFSpecification> = new Map();
  private specificationTypesById: Map<string, ReqIFSpecificationType> =
    new Map();
  private dataTypesById: Map<string, ReqIFDataType> = new Map();
  private relationGroupsById: Map<string, ReqIFRelationGroup> = new Map();
  private relationGroupTypesById: Map<string, ReqIFRelationGroupType> =
    new Map();

  registerSpecObject(specObject: ReqIFSpecObject): void {
    this.specObjectsById.set(specObject.identifier, specObject);
  }

  getSpecObject(identifier: string): ReqIFSpecObject | undefined {
    return this.specObjectsById.get(identifier);
  }

  registerSpecObjectType(specObjectType: ReqIFSpecObjectType): void {
    this.specObjectTypesById.set(specObjectType.identifier, specObjectType);
  }

  getSpecObjectType(identifier: string): ReqIFSpecObjectType | undefined {
    return this.specObjectTypesById.get(identifier);
  }

  registerSpecRelation(specRelation: ReqIFSpecRelation): void {
    this.specRelationsById.set(specRelation.identifier, specRelation);
  }

  getSpecRelation(identifier: string): ReqIFSpecRelation | undefined {
    return this.specRelationsById.get(identifier);
  }

  registerSpecRelationType(specRelationType: ReqIFSpecRelationType): void {
    this.specRelationTypesById.set(
      specRelationType.identifier,
      specRelationType,
    );
  }

  getSpecRelationType(identifier: string): ReqIFSpecRelationType | undefined {
    return this.specRelationTypesById.get(identifier);
  }

  registerSpecification(specification: ReqIFSpecification): void {
    this.specificationsById.set(specification.identifier, specification);
  }

  getSpecification(identifier: string): ReqIFSpecification | undefined {
    return this.specificationsById.get(identifier);
  }

  registerSpecificationType(specificationType: ReqIFSpecificationType): void {
    this.specificationTypesById.set(
      specificationType.identifier,
      specificationType,
    );
  }

  getSpecificationType(identifier: string): ReqIFSpecificationType | undefined {
    return this.specificationTypesById.get(identifier);
  }

  registerDataType(dataType: ReqIFDataType): void {
    this.dataTypesById.set(dataType.identifier, dataType);
  }

  getDataType(identifier: string): ReqIFDataType | undefined {
    return this.dataTypesById.get(identifier);
  }

  registerRelationGroup(relationGroup: ReqIFRelationGroup): void {
    this.relationGroupsById.set(relationGroup.identifier, relationGroup);
  }

  getRelationGroup(identifier: string): ReqIFRelationGroup | undefined {
    return this.relationGroupsById.get(identifier);
  }

  registerRelationGroupType(relationGroupType: ReqIFRelationGroupType): void {
    this.relationGroupTypesById.set(
      relationGroupType.identifier,
      relationGroupType,
    );
  }

  getRelationGroupType(identifier: string): ReqIFRelationGroupType | undefined {
    return this.relationGroupTypesById.get(identifier);
  }

  get specObjects(): ReqIFSpecObject[] {
    return Array.from(this.specObjectsById.values());
  }

  get specObjectTypes(): ReqIFSpecObjectType[] {
    return Array.from(this.specObjectTypesById.values());
  }

  get specRelations(): ReqIFSpecRelation[] {
    return Array.from(this.specRelationsById.values());
  }

  get specRelationTypes(): ReqIFSpecRelationType[] {
    return Array.from(this.specRelationTypesById.values());
  }

  get specifications(): ReqIFSpecification[] {
    return Array.from(this.specificationsById.values());
  }

  get specificationTypes(): ReqIFSpecificationType[] {
    return Array.from(this.specificationTypesById.values());
  }

  get dataTypes(): ReqIFDataType[] {
    return Array.from(this.dataTypesById.values());
  }

  get relationGroups(): ReqIFRelationGroup[] {
    return Array.from(this.relationGroupsById.values());
  }

  get relationGroupTypes(): ReqIFRelationGroupType[] {
    return Array.from(this.relationGroupTypesById.values());
  }
}

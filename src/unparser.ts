import { createFileSystem } from './helpers/fs-adapter';
import { createXMLDocument, serializeXML, parseXML } from './helpers/xml-parser';
import { ReqIFBundle } from './reqif-bundle';
import { ReqIFError } from './models/error-handling';
import { ReqIFDataTypeKind, ReqIFAttributeValueKind } from './models/reqif-types';
import { addXhtmlNamespaces } from './helpers/xhtml-helper';

/**
 * The ReqIF unparser class.
 * Converts a ReqIF object tree back into XML format.
 */
export class ReqIFUnparser {
  private static readonly REQIF_NAMESPACE = 'http://www.omg.org/spec/ReqIF/20110401/reqif.xsd';
  private static readonly XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/';

  /**
   * Unparse a ReqIF bundle to XML string.
   */
  static unparse(reqIFBundle: ReqIFBundle): string {
    // Create a new XML document
    const doc = createXMLDocument();
    
    // Create the root REQ-IF element
    const reqIfElement = doc.createElement('REQ-IF');
    doc.appendChild(reqIfElement);
    
    // Set namespaces
    reqIfElement.setAttributeNS(ReqIFUnparser.XMLNS_NAMESPACE, 'xmlns', ReqIFUnparser.REQIF_NAMESPACE);
    reqIfElement.setAttributeNS(ReqIFUnparser.XMLNS_NAMESPACE, 'xmlns:xhtml', 'http://www.w3.org/1999/xhtml');
    
    // Create THE-HEADER section
    const theHeaderElement = doc.createElement('THE-HEADER');
    reqIfElement.appendChild(theHeaderElement);
    
    // Create REQ-IF-HEADER element
    const reqIfHeaderElement = doc.createElement('REQ-IF-HEADER');
    theHeaderElement.appendChild(reqIfHeaderElement);
    
    // Add header attributes
    const header = reqIFBundle.coreContent.reqIfHeader;
    reqIfHeaderElement.setAttribute('IDENTIFIER', header.identifier);
    reqIfHeaderElement.setAttribute('CREATION-TIME', header.creationTime);
    
    if (header.repositoryId) {
      reqIfHeaderElement.setAttribute('REPOSITORY-ID', header.repositoryId);
    }
    
    if (header.reqIfToolId) {
      reqIfHeaderElement.setAttribute('REQ-IF-TOOL-ID', header.reqIfToolId);
    }
    
    if (header.reqIfVersion) {
      reqIfHeaderElement.setAttribute('REQ-IF-VERSION', header.reqIfVersion);
    }
    
    if (header.sourceToolId) {
      reqIfHeaderElement.setAttribute('SOURCE-TOOL-ID', header.sourceToolId);
    }
    
    if (header.title) {
      reqIfHeaderElement.setAttribute('TITLE', header.title);
    }
    
    if (header.comment) {
      // Add COMMENT element with text
      const commentElement = doc.createElement('COMMENT');
      commentElement.textContent = header.comment;
      reqIfHeaderElement.appendChild(commentElement);
    }
    
    // Create CORE-CONTENT section
    const coreContentElement = doc.createElement('CORE-CONTENT');
    reqIfElement.appendChild(coreContentElement);
    
    // Create REQ-IF-CONTENT element
    const reqIfContentElement = doc.createElement('REQ-IF-CONTENT');
    coreContentElement.appendChild(reqIfContentElement);
    
    // Add DATATYPES section if there are data types
    const { reqIfContent } = reqIFBundle.coreContent;
    if (reqIfContent.dataTypes.length > 0) {
      const dataTypesElement = doc.createElement('DATATYPES');
      reqIfContentElement.appendChild(dataTypesElement);
      
      // Add each data type based on its specific kind
      for (const dataType of reqIfContent.dataTypes) {
        let dataTypeElement: Element;
        
        switch (dataType.kind) {
          case ReqIFDataTypeKind.BOOLEAN:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-BOOLEAN');
            break;
          case ReqIFDataTypeKind.DATE:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-DATE');
            break;
          case ReqIFDataTypeKind.ENUMERATION:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-ENUMERATION');
            break;
          case ReqIFDataTypeKind.INTEGER:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-INTEGER');
            break;
          case ReqIFDataTypeKind.REAL:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-REAL');
            break;
          case ReqIFDataTypeKind.STRING:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-STRING');
            break;
          case ReqIFDataTypeKind.XHTML:
            dataTypeElement = doc.createElement('DATATYPE-DEFINITION-XHTML');
            break;
          default:
            continue; // Skip unknown data types
        }
        
        // Set common attributes
        dataTypeElement.setAttribute('IDENTIFIER', dataType.identifier);
        if (dataType.longName) {
          dataTypeElement.setAttribute('LONG-NAME', dataType.longName);
        }
        if (dataType.desc) {
          dataTypeElement.setAttribute('DESC', dataType.desc);
        }
        if (dataType.lastChange) {
          dataTypeElement.setAttribute('LAST-CHANGE', dataType.lastChange);
        }
        
        // Add type-specific attributes
        if (dataType.kind === ReqIFDataTypeKind.ENUMERATION && 'values' in dataType) {
          // Add specified values for enumeration
          const specifiedValuesElement = doc.createElement('SPECIFIED-VALUES');
          dataTypeElement.appendChild(specifiedValuesElement);
          
          // Cast to ReqIFDataTypeEnum to access values
          const enumDataType = dataType as any; // Type assertion to any since we checked 'values' in dataType
          
          if (enumDataType.multiValued) {
            dataTypeElement.setAttribute('MULTI-VALUED', String(enumDataType.multiValued));
          }
          
          for (const value of enumDataType.values) {
            const enumValueElement = doc.createElement('ENUM-VALUE');
            enumValueElement.setAttribute('IDENTIFIER', value.identifier);
            if (value.longName) {
              enumValueElement.setAttribute('LONG-NAME', value.longName);
            }
            if (value.lastChange) {
              enumValueElement.setAttribute('LAST-CHANGE', value.lastChange);
            }
            
            // Add PROPERTIES element if there's a key
            if ('key' in value) {
              const propertiesElement = doc.createElement('PROPERTIES');
              propertiesElement.setAttribute('EMBEDDED-VALUE', String(value.key));
              enumValueElement.appendChild(propertiesElement);
            }
            
            specifiedValuesElement.appendChild(enumValueElement);
          }
        }
        
        // Add the dataTypeElement to the dataTypesElement
        dataTypesElement.appendChild(dataTypeElement);
      }
    }
    
    // Add SPEC-TYPES section if there are spec types
    if (
      reqIfContent.specTypes.specObjectTypes.length > 0 ||
      reqIfContent.specTypes.specificationTypes.length > 0 ||
      reqIfContent.specTypes.specRelationTypes.length > 0 ||
      reqIfContent.specTypes.relationGroupTypes.length > 0
    ) {
      const specTypesElement = doc.createElement('SPEC-TYPES');
      reqIfContentElement.appendChild(specTypesElement);
      
      // Add spec object types
      for (const specObjectType of reqIfContent.specTypes.specObjectTypes) {
        const specObjectTypeElement = doc.createElement('SPEC-OBJECT-TYPE');
        specObjectTypeElement.setAttribute('IDENTIFIER', specObjectType.identifier);
        
        if (specObjectType.longName) {
          specObjectTypeElement.setAttribute('LONG-NAME', specObjectType.longName);
        }
        if (specObjectType.desc) {
          specObjectTypeElement.setAttribute('DESC', specObjectType.desc);
        }
        if (specObjectType.lastChange) {
          specObjectTypeElement.setAttribute('LAST-CHANGE', specObjectType.lastChange);
        }
        
        // Add attribute definitions
        if (specObjectType.attributeDefinitions && specObjectType.attributeDefinitions.length > 0) {
          const specAttributesElement = doc.createElement('SPEC-ATTRIBUTES');
          specObjectTypeElement.appendChild(specAttributesElement);
          
          for (const attrDef of specObjectType.attributeDefinitions) {
            let attrDefElement: Element;
            
            switch (attrDef.type) {
              case 'BOOLEAN':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-BOOLEAN');
                break;
              case 'DATE':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-DATE');
                break;
              case 'ENUMERATION':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-ENUMERATION');
                break;
              case 'INTEGER':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-INTEGER');
                break;
              case 'REAL':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-REAL');
                break;
              case 'STRING':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-STRING');
                break;
              case 'XHTML':
                attrDefElement = doc.createElement('ATTRIBUTE-DEFINITION-XHTML');
                break;
              default:
                continue; // Skip unknown attribute types
            }
            
            attrDefElement.setAttribute('IDENTIFIER', attrDef.identifier);
            if (attrDef.longName) {
              attrDefElement.setAttribute('LONG-NAME', attrDef.longName);
            }
            
            // Add type reference
            if (attrDef.typeRef) {
              const typeElement = doc.createElement('TYPE');
              const typeRefElement = doc.createElement('DATATYPE-DEFINITION-' + attrDef.type + '-REF');
              typeRefElement.textContent = attrDef.typeRef;
              typeElement.appendChild(typeRefElement);
              attrDefElement.appendChild(typeElement);
            }
            
            // Add to spec attributes
            specAttributesElement.appendChild(attrDefElement);
          }
        }
        
        // Add to spec types
        specTypesElement.appendChild(specObjectTypeElement);
      }
      
      // Add specification types
      for (const specificationType of reqIfContent.specTypes.specificationTypes) {
        const specificationTypeElement = doc.createElement('SPECIFICATION-TYPE');
        specificationTypeElement.setAttribute('IDENTIFIER', specificationType.identifier);
        
        if (specificationType.longName) {
          specificationTypeElement.setAttribute('LONG-NAME', specificationType.longName);
        }
        if (specificationType.desc) {
          specificationTypeElement.setAttribute('DESC', specificationType.desc);
        }
        if (specificationType.lastChange) {
          specificationTypeElement.setAttribute('LAST-CHANGE', specificationType.lastChange);
        }
        
        // Add attribute definitions (similar to spec object types)
        if (specificationType.attributeDefinitions && specificationType.attributeDefinitions.length > 0) {
          const specAttributesElement = doc.createElement('SPEC-ATTRIBUTES');
          specificationTypeElement.appendChild(specAttributesElement);
          
          // Similar to the spec object type attribute definitions
          // Simplified for brevity
          for (const attrDef of specificationType.attributeDefinitions) {
            const attrDefElement = doc.createElement(`ATTRIBUTE-DEFINITION-${attrDef.type}`);
            attrDefElement.setAttribute('IDENTIFIER', attrDef.identifier);
            specAttributesElement.appendChild(attrDefElement);
          }
        }
        
        // Add to spec types
        specTypesElement.appendChild(specificationTypeElement);
      }
      
      // Add spec relation types
      for (const specRelationType of reqIfContent.specTypes.specRelationTypes) {
        const specRelationTypeElement = doc.createElement('SPEC-RELATION-TYPE');
        specRelationTypeElement.setAttribute('IDENTIFIER', specRelationType.identifier);
        
        if (specRelationType.longName) {
          specRelationTypeElement.setAttribute('LONG-NAME', specRelationType.longName);
        }
        
        // Add to spec types
        specTypesElement.appendChild(specRelationTypeElement);
      }
      
      // Add relation group types
      for (const relationGroupType of reqIfContent.specTypes.relationGroupTypes) {
        const relationGroupTypeElement = doc.createElement('RELATION-GROUP-TYPE');
        relationGroupTypeElement.setAttribute('IDENTIFIER', relationGroupType.identifier);
        
        if (relationGroupType.longName) {
          relationGroupTypeElement.setAttribute('LONG-NAME', relationGroupType.longName);
        }
        
        // Add to spec types
        specTypesElement.appendChild(relationGroupTypeElement);
      }
    }
    
    // Add SPEC-OBJECTS section if there are spec objects
    if (reqIfContent.specObjects.length > 0) {
      const specObjectsElement = doc.createElement('SPEC-OBJECTS');
      reqIfContentElement.appendChild(specObjectsElement);
      
      // Add each spec object
      for (const specObject of reqIfContent.specObjects) {
        const specObjectElement = doc.createElement('SPEC-OBJECT');
        specObjectElement.setAttribute('IDENTIFIER', specObject.identifier);
        
        if (specObject.longName) {
          specObjectElement.setAttribute('LONG-NAME', specObject.longName);
        }
        if (specObject.desc) {
          specObjectElement.setAttribute('DESC', specObject.desc);
        }
        if (specObject.lastChange) {
          specObjectElement.setAttribute('LAST-CHANGE', specObject.lastChange);
        }
        
        // Add type reference
        if (specObject.typeRef) {
          const typeElement = doc.createElement('TYPE');
          const specObjectTypeRefElement = doc.createElement('SPEC-OBJECT-TYPE-REF');
          specObjectTypeRefElement.textContent = specObject.typeRef;
          typeElement.appendChild(specObjectTypeRefElement);
          specObjectElement.appendChild(typeElement);
        }
        
        // Add attribute values if present
        if (specObject.attributeValues && specObject.attributeValues.length > 0) {
          const valuesElement = doc.createElement('VALUES');
          specObjectElement.appendChild(valuesElement);
          
          for (const attrValue of specObject.attributeValues) {
            let attributeValueElement: Element;
            
            switch (attrValue.kind) {
              case ReqIFAttributeValueKind.BOOLEAN:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-BOOLEAN');
                break;
              case ReqIFAttributeValueKind.DATE:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-DATE');
                break;
              case ReqIFAttributeValueKind.ENUMERATION:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-ENUMERATION');
                break;
              case ReqIFAttributeValueKind.INTEGER:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-INTEGER');
                break;
              case ReqIFAttributeValueKind.REAL:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-REAL');
                break;
              case ReqIFAttributeValueKind.STRING:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-STRING');
                break;
              case ReqIFAttributeValueKind.XHTML:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-XHTML');
                break;
              default:
                continue; // Skip unknown value types
            }
            
            // Set definition reference
            if (attrValue.definitionRef) {
              const defElement = doc.createElement('DEFINITION');
              const defRefElement = doc.createElement(`ATTRIBUTE-DEFINITION-${attrValue.kind}-REF`);
              defRefElement.textContent = attrValue.definitionRef;
              defElement.appendChild(defRefElement);
              attributeValueElement.appendChild(defElement);
            }
            
            // Set value based on attribute value kind
            if ('value' in attrValue && attrValue.value !== null && attrValue.value !== undefined) {
              if (attrValue.kind === ReqIFAttributeValueKind.BOOLEAN || 
                  attrValue.kind === ReqIFAttributeValueKind.INTEGER || 
                  attrValue.kind === ReqIFAttributeValueKind.REAL) {
                attributeValueElement.setAttribute('THE-VALUE', String(attrValue.value));
              } else if (attrValue.kind === ReqIFAttributeValueKind.DATE || 
                         attrValue.kind === ReqIFAttributeValueKind.STRING) {
                attributeValueElement.setAttribute('THE-VALUE', attrValue.value as string);
              } else if (attrValue.kind === ReqIFAttributeValueKind.ENUMERATION) {
                // For enumeration, we need to get the values array
                const enumAttrValue = attrValue as any; // Type assertion since we know it's an enumeration
                if (enumAttrValue.values && enumAttrValue.values.length > 0) {
                  const valueElement = doc.createElement('VALUES');
                  attributeValueElement.appendChild(valueElement);
                  
                  for (const enumValue of enumAttrValue.values) {
                    const enumValueRefElement = doc.createElement('ENUM-VALUE-REF');
                    enumValueRefElement.textContent = enumValue;
                    valueElement.appendChild(enumValueRefElement);
                  }
                }
              } else if (attrValue.kind === ReqIFAttributeValueKind.XHTML) {
                // XHTML content needs special handling
                const xhtmlAttrValue = attrValue as any; // Type assertion since we know it's XHTML
                
                // Use the original value if available (with namespaces), otherwise add them
                const xhtmlContent = xhtmlAttrValue.originalValue || addXhtmlNamespaces(xhtmlAttrValue.value);
                
                const theValueElement = doc.createElement('THE-VALUE');
                
                try {
                  // Try to parse the XHTML content and import it into the document
                  const xhtmlDoc = parseXML(xhtmlContent);
                  const xhtmlNode = doc.importNode(xhtmlDoc.documentElement, true);
                  theValueElement.appendChild(xhtmlNode);
                } catch (e) {
                  // Fallback if parsing fails - just use text content
                  theValueElement.textContent = xhtmlContent;
                }
                
                attributeValueElement.appendChild(theValueElement);
              }
            }
            
            valuesElement.appendChild(attributeValueElement);
          }
        }
        
        specObjectsElement.appendChild(specObjectElement);
      }
    }
    
    // Add SPEC-RELATIONS section if there are spec relations
    if (reqIfContent.specRelations.length > 0) {
      const specRelationsElement = doc.createElement('SPEC-RELATIONS');
      reqIfContentElement.appendChild(specRelationsElement);
      
      // Add each spec relation
      for (const specRelation of reqIfContent.specRelations) {
        const specRelationElement = doc.createElement('SPEC-RELATION');
        specRelationElement.setAttribute('IDENTIFIER', specRelation.identifier);
        
        if (specRelation.longName) {
          specRelationElement.setAttribute('LONG-NAME', specRelation.longName);
        }
        if (specRelation.desc) {
          specRelationElement.setAttribute('DESC', specRelation.desc);
        }
        if (specRelation.lastChange) {
          specRelationElement.setAttribute('LAST-CHANGE', specRelation.lastChange);
        }
        
        // Add type reference
        if (specRelation.typeRef) {
          const typeElement = doc.createElement('TYPE');
          const specRelationTypeRefElement = doc.createElement('SPEC-RELATION-TYPE-REF');
          specRelationTypeRefElement.textContent = specRelation.typeRef;
          typeElement.appendChild(specRelationTypeRefElement);
          specRelationElement.appendChild(typeElement);
        }
        
        // Add source reference
        if (specRelation.sourceRef) {
          const sourceElement = doc.createElement('SOURCE');
          const specObjectRefElement = doc.createElement('SPEC-OBJECT-REF');
          specObjectRefElement.textContent = specRelation.sourceRef;
          sourceElement.appendChild(specObjectRefElement);
          specRelationElement.appendChild(sourceElement);
        }
        
        // Add target reference
        if (specRelation.targetRef) {
          const targetElement = doc.createElement('TARGET');
          const specObjectRefElement = doc.createElement('SPEC-OBJECT-REF');
          specObjectRefElement.textContent = specRelation.targetRef;
          targetElement.appendChild(specObjectRefElement);
          specRelationElement.appendChild(targetElement);
        }
        
        // Note: In the current model, ReqIFSpecRelation doesn't have attribute values
        // If we were to add them in the future, this is where we would serialize them
        
        specRelationsElement.appendChild(specRelationElement);
      }
    }
    
    // Add SPECIFICATIONS section if there are specifications
    if (reqIfContent.specifications.length > 0) {
      const specificationsElement = doc.createElement('SPECIFICATIONS');
      reqIfContentElement.appendChild(specificationsElement);
      
      // Add each specification
      for (const specification of reqIfContent.specifications) {
        const specificationElement = doc.createElement('SPECIFICATION');
        specificationElement.setAttribute('IDENTIFIER', specification.identifier);
        
        if (specification.longName) {
          specificationElement.setAttribute('LONG-NAME', specification.longName);
        }
        if (specification.desc) {
          specificationElement.setAttribute('DESC', specification.desc);
        }
        if (specification.lastChange) {
          specificationElement.setAttribute('LAST-CHANGE', specification.lastChange);
        }
        
        // Add type reference
        if (specification.typeRef) {
          const typeElement = doc.createElement('TYPE');
          const specificationTypeRefElement = doc.createElement('SPECIFICATION-TYPE-REF');
          specificationTypeRefElement.textContent = specification.typeRef;
          typeElement.appendChild(specificationTypeRefElement);
          specificationElement.appendChild(typeElement);
        }
        
        // Add attribute values if present
        if (specification.attributeValues && specification.attributeValues.length > 0) {
          const valuesElement = doc.createElement('VALUES');
          specificationElement.appendChild(valuesElement);
          
          // Similar to spec object values
          for (const attrValue of specification.attributeValues) {
            let attributeValueElement: Element;
            
            switch (attrValue.kind) {
              case ReqIFAttributeValueKind.BOOLEAN:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-BOOLEAN');
                break;
              case ReqIFAttributeValueKind.DATE:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-DATE');
                break;
              case ReqIFAttributeValueKind.ENUMERATION:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-ENUMERATION');
                break;
              case ReqIFAttributeValueKind.INTEGER:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-INTEGER');
                break;
              case ReqIFAttributeValueKind.REAL:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-REAL');
                break;
              case ReqIFAttributeValueKind.STRING:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-STRING');
                break;
              case ReqIFAttributeValueKind.XHTML:
                attributeValueElement = doc.createElement('ATTRIBUTE-VALUE-XHTML');
                break;
              default:
                continue; // Skip unknown value types
            }
            
            // Set definition reference
            if (attrValue.definitionRef) {
              const defElement = doc.createElement('DEFINITION');
              const defRefElement = doc.createElement(`ATTRIBUTE-DEFINITION-${attrValue.kind}-REF`);
              defRefElement.textContent = attrValue.definitionRef;
              defElement.appendChild(defRefElement);
              attributeValueElement.appendChild(defElement);
            }
            
            // Set value based on attribute value kind (similar to spec objects)
            if ('value' in attrValue && attrValue.value !== null && attrValue.value !== undefined) {
              if (attrValue.kind === ReqIFAttributeValueKind.BOOLEAN || 
                  attrValue.kind === ReqIFAttributeValueKind.INTEGER || 
                  attrValue.kind === ReqIFAttributeValueKind.REAL) {
                attributeValueElement.setAttribute('THE-VALUE', String(attrValue.value));
              } else if (attrValue.kind === ReqIFAttributeValueKind.DATE || 
                         attrValue.kind === ReqIFAttributeValueKind.STRING) {
                attributeValueElement.setAttribute('THE-VALUE', attrValue.value as string);
              }
            }
            
            valuesElement.appendChild(attributeValueElement);
          }
        }
        
        // Add children (hierarchy)
        if (specification.children && specification.children.length > 0) {
          const childrenElement = doc.createElement('CHILDREN');
          specificationElement.appendChild(childrenElement);
          
          // Helper function to recursively add spec hierarchy elements
          const addSpecHierarchy = (parent: Element, hierarchy: any) => {
            const specHierarchyElement = doc.createElement('SPEC-HIERARCHY');
            specHierarchyElement.setAttribute('IDENTIFIER', hierarchy.identifier);
            
            if (hierarchy.longName) {
              specHierarchyElement.setAttribute('LONG-NAME', hierarchy.longName);
            }
            if (hierarchy.lastChange) {
              specHierarchyElement.setAttribute('LAST-CHANGE', hierarchy.lastChange);
            }
            if (hierarchy.isTableInternal !== undefined) {
              specHierarchyElement.setAttribute('IS-TABLE-INTERNAL', String(hierarchy.isTableInternal));
            }
            
            // Add spec object reference
            if (hierarchy.specObjectRef) {
              const objectElement = doc.createElement('OBJECT');
              const specObjectRefElement = doc.createElement('SPEC-OBJECT-REF');
              specObjectRefElement.textContent = hierarchy.specObjectRef;
              objectElement.appendChild(specObjectRefElement);
              specHierarchyElement.appendChild(objectElement);
            }
            
            // Recursively add children
            if (hierarchy.children && hierarchy.children.length > 0) {
              const nestedChildrenElement = doc.createElement('CHILDREN');
              specHierarchyElement.appendChild(nestedChildrenElement);
              
              for (const child of hierarchy.children) {
                addSpecHierarchy(nestedChildrenElement, child);
              }
            }
            
            parent.appendChild(specHierarchyElement);
          };
          
          // Start the recursion with the top-level children
          for (const child of specification.children) {
            addSpecHierarchy(childrenElement, child);
          }
        }
        
        specificationsElement.appendChild(specificationElement);
      }
    }
    
    // Add SPEC-RELATION-GROUPS section if there are relation groups
    if (reqIfContent.relationGroups.length > 0) {
      const relationGroupsElement = doc.createElement('SPEC-RELATION-GROUPS');
      reqIfContentElement.appendChild(relationGroupsElement);
      
      // Add each relation group
      for (const relationGroup of reqIfContent.relationGroups) {
        const relationGroupElement = doc.createElement('SPEC-RELATION-GROUP');
        relationGroupElement.setAttribute('IDENTIFIER', relationGroup.identifier);
        
        if (relationGroup.longName) {
          relationGroupElement.setAttribute('LONG-NAME', relationGroup.longName);
        }
        if (relationGroup.desc) {
          relationGroupElement.setAttribute('DESC', relationGroup.desc);
        }
        if (relationGroup.lastChange) {
          relationGroupElement.setAttribute('LAST-CHANGE', relationGroup.lastChange);
        }
        
        // Add type reference
        if (relationGroup.typeRef) {
          const typeElement = doc.createElement('TYPE');
          const relationGroupTypeRefElement = doc.createElement('RELATION-GROUP-TYPE-REF');
          relationGroupTypeRefElement.textContent = relationGroup.typeRef;
          typeElement.appendChild(relationGroupTypeRefElement);
          relationGroupElement.appendChild(typeElement);
        }
        
        // Add source specification reference
        if (relationGroup.sourceSpecificationRef) {
          const sourceElement = doc.createElement('SOURCE-SPECIFICATION');
          const specificationRefElement = doc.createElement('SPECIFICATION-REF');
          specificationRefElement.textContent = relationGroup.sourceSpecificationRef;
          sourceElement.appendChild(specificationRefElement);
          relationGroupElement.appendChild(sourceElement);
        }
        
        // Add target specification reference
        if (relationGroup.targetSpecificationRef) {
          const targetElement = doc.createElement('TARGET-SPECIFICATION');
          const specificationRefElement = doc.createElement('SPECIFICATION-REF');
          specificationRefElement.textContent = relationGroup.targetSpecificationRef;
          targetElement.appendChild(specificationRefElement);
          relationGroupElement.appendChild(targetElement);
        }
        
        // Add relation references
        if (relationGroup.specRelationRefs && relationGroup.specRelationRefs.length > 0) {
          const relationsElement = doc.createElement('SPEC-RELATIONS');
          relationGroupElement.appendChild(relationsElement);
          
          for (const relationRef of relationGroup.specRelationRefs) {
            const relationRefElement = doc.createElement('SPEC-RELATION-REF');
            relationRefElement.textContent = relationRef;
            relationsElement.appendChild(relationRefElement);
          }
        }
        
        // Note: In the current model, ReqIFRelationGroup doesn't have attribute values
        // If we were to add them in the future, this is where we would serialize them
        
        relationGroupsElement.appendChild(relationGroupElement);
      }
    }
    
    // Serialize the document to XML with pretty printing
    const xmlString = serializeXML(doc, true);
    
    // Add XML declaration
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>\n';
    
    return xmlDeclaration + xmlString;
  }
  
  /**
   * Unparse a ReqIF bundle to a file.
   */
  static async unparseToFile(reqIFBundle: ReqIFBundle, filePath: string): Promise<void> {
    const xmlContent = ReqIFUnparser.unparse(reqIFBundle);
    
    const fs = createFileSystem();
    await fs.writeFile(filePath, xmlContent);
  }
}

// Export convenience function
export const unparse = ReqIFUnparser.unparse;
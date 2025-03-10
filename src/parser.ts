import { createFileSystem } from './helpers/fs-adapter';
import { parseXML } from './helpers/xml-parser';
import { ReqIFBundle } from './reqif-bundle';
import { ObjectLookup } from './object-lookup';
import { ReqIFError } from './models/error-handling';
import { SchemaValidator } from './validation/schema-validator';
import { ReqIFCoreContent } from './models/reqif-core-content';
import { ReqIFReqIFContent } from './models/reqif-req-if-content';
import { ReqIFReqIFHeader } from './models/reqif-reqif-header';
import { ReqIFSpecObjectType } from './models/reqif-spec-object-type';
import { ReqIFSpecificationType } from './models/reqif-specification-type';
import { ReqIFSpecRelation } from './models/reqif-spec-relation';
import { ReqIFSpecRelationType } from './models/reqif-spec-relation-type';
import { ReqIFSpecification } from './models/reqif-specification';
import { ReqIFRelationGroup } from './models/reqif-relation-group';
import { ReqIFRelationGroupType } from './models/reqif-relation-group-type';

// Import parsers
import { HeaderParser } from './parsers/header-parser';
import { DataTypeParser } from './parsers/data-type-parser';
import { SpecObjectParser } from './parsers/spec-object-parser';
import { SpecificationParser } from './parsers/specification-parser';
import { SpecHierarchyParser } from './parsers/spec-hierarchy-parser';
import { SpecObjectTypeParser, SpecificationTypeParser, SpecRelationTypeParser, RelationGroupTypeParser } from './parsers/spec-type-parser';
import { SpecRelationParser } from './parsers/spec-relation-parser';
import { RelationGroupParser } from './parsers/relation-group-parser';

/**
 * The main ReqIF parser class.
 * Responsible for parsing ReqIF files into object trees.
 */
export class ReqIFParser {
  private static readonly REQIF_NAMESPACE = 'http://www.omg.org/spec/ReqIF/20110401/reqif.xsd';
  
  /**
   * Parse a ReqIF file from a file path or content string.
   * This is a convenience method that returns a Promise.
   * @param input The file path or XML content
   * @param validateSchema Whether to validate the content against the ReqIF schema
   */
  static async parse(input: string, validateSchema: boolean = true): Promise<ReqIFBundle> {
    // If input looks like a file path, read the file first
    if (input.trim().startsWith('<')) {
      // Input is already XML content
      return ReqIFParser.parseContent(input, validateSchema);
    } else {
      // Input is a file path, read it first
      const fs = createFileSystem();
      const content = await fs.readFile(input);
      return ReqIFParser.parseContent(content, validateSchema);
    }
  }
  
  /**
   * Parse ReqIF content directly from an XML string.
   * This is a synchronous method and doesn't rely on file system access.
   * @param xmlContent The ReqIF XML content to parse
   * @param validateSchema Whether to validate the content against the ReqIF schema
   */
  static parseContent(xmlContent: string, validateSchema: boolean = true): ReqIFBundle {
    // Parse XML
    let doc: Document;
    try {
      doc = parseXML(xmlContent);
    } catch (error) {
      throw new ReqIFError(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Validate against the ReqIF schema
    if (validateSchema) {
      try {
        SchemaValidator.validate(doc);
      } catch (error) {
        throw new ReqIFError(`Schema validation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Validate that this is a ReqIF document
    const rootElement = doc.documentElement;
    if (rootElement.tagName !== 'REQ-IF') {
      throw new ReqIFError(`Invalid ReqIF file: Root element is not REQ-IF but ${rootElement.tagName}`);
    }
    
    // Create object lookup for reference resolution
    const objectLookup = new ObjectLookup();
    
    // Parse header
    const headerElement = rootElement.querySelector('THE-HEADER');
    if (!headerElement) {
      throw new ReqIFError('Invalid ReqIF file: Missing THE-HEADER element');
    }
    
    const reqIfHeaderElement = headerElement.querySelector('REQ-IF-HEADER');
    if (!reqIfHeaderElement) {
      throw new ReqIFError('Invalid ReqIF file: Missing REQ-IF-HEADER element');
    }
    
    const header = HeaderParser.parse(reqIfHeaderElement as Element);
    
    // Parse content section
    const coreContentElement = rootElement.querySelector('CORE-CONTENT');
    if (!coreContentElement) {
      throw new ReqIFError('Invalid ReqIF file: Missing CORE-CONTENT element');
    }
    
    const reqIfContentElement = coreContentElement.querySelector('REQ-IF-CONTENT');
    if (!reqIfContentElement) {
      throw new ReqIFError('Invalid ReqIF file: Missing REQ-IF-CONTENT element');
    }
    
    // Parse data types
    const dataTypes = Array.from(reqIfContentElement.querySelectorAll(
      'DATATYPES > DATATYPE-DEFINITION-BOOLEAN, ' +
      'DATATYPES > DATATYPE-DEFINITION-DATE, ' +
      'DATATYPES > DATATYPE-DEFINITION-ENUMERATION, ' +
      'DATATYPES > DATATYPE-DEFINITION-INTEGER, ' +
      'DATATYPES > DATATYPE-DEFINITION-REAL, ' +
      'DATATYPES > DATATYPE-DEFINITION-STRING, ' +
      'DATATYPES > DATATYPE-DEFINITION-XHTML'
    )).map(element => DataTypeParser.parse(element as Element));
    
    // Register data types in object lookup
    dataTypes.forEach(dataType => {
      objectLookup.registerDataType(dataType);
    });
    
    // Parse spec object types
    const specObjectTypes = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-TYPES > SPEC-OBJECT-TYPE'
    )).map(element => {
      const specObjectType = SpecObjectTypeParser.parse(element as Element);
      objectLookup.registerSpecObjectType(specObjectType);
      return specObjectType;
    });
    
    // Parse specification types
    const specificationTypes = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-TYPES > SPECIFICATION-TYPE'
    )).map(element => {
      const specificationType = SpecificationTypeParser.parse(element as Element);
      objectLookup.registerSpecificationType(specificationType);
      return specificationType;
    });
    
    // Parse spec relation types
    const specRelationTypes = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-TYPES > SPEC-RELATION-TYPE'
    )).map(element => {
      const specRelationType = SpecRelationTypeParser.parse(element as Element);
      objectLookup.registerSpecRelationType(specRelationType);
      return specRelationType;
    });
    
    // Parse relation group types
    const relationGroupTypes = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-TYPES > RELATION-GROUP-TYPE'
    )).map(element => {
      const relationGroupType = RelationGroupTypeParser.parse(element as Element);
      objectLookup.registerRelationGroupType(relationGroupType);
      return relationGroupType;
    });
    
    // Parse spec objects
    const specObjects = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-OBJECTS > SPEC-OBJECT'
    )).map(element => {
      const specObject = SpecObjectParser.parse(element as Element);
      objectLookup.registerSpecObject(specObject);
      return specObject;
    });
    
    // Parse specifications
    const specifications = Array.from(reqIfContentElement.querySelectorAll(
      'SPECIFICATIONS > SPECIFICATION'
    )).map(element => {
      const specification = SpecificationParser.parse(element as Element);
      objectLookup.registerSpecification(specification);
      return specification;
    });
    
    // Parse spec relations
    const specRelations = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-RELATIONS > SPEC-RELATION'
    )).map(element => {
      const specRelation = SpecRelationParser.parse(element as Element);
      objectLookup.registerSpecRelation(specRelation);
      return specRelation;
    });
    
    // Parse relation groups
    const relationGroups = Array.from(reqIfContentElement.querySelectorAll(
      'SPEC-RELATION-GROUPS > SPEC-RELATION-GROUP'
    )).map(element => {
      const relationGroup = RelationGroupParser.parse(element as Element);
      objectLookup.registerRelationGroup(relationGroup);
      return relationGroup;
    });
    
    // Create ReqIF content
    const reqIfContent = new ReqIFReqIFContent(
      dataTypes,
      {
        specObjectTypes,
        specificationTypes,
        specRelationTypes,
        relationGroupTypes
      },
      specObjects,
      specifications,
      specRelations,
      relationGroups
    );
    
    // Create core content with header and content
    const coreContent = new ReqIFCoreContent(header, reqIfContent);
    
    // Create and return the ReqIF bundle
    return new ReqIFBundle(coreContent, objectLookup);
  }
}

/**
 * Parser for ReqIFZ (zipped ReqIF) files.
 */
export class ReqIFZParser {
  /**
   * Parse a ReqIFZ file from a file path.
   */
  static async parse(filePath: string): Promise<any> {
    // In a complete implementation, this would unzip the ReqIFZ file
    // and parse its contents. For now, we'll just throw an error.
    throw new ReqIFError('ReqIFZ parsing is not yet implemented');
  }
}

// Export convenience functions
export const parse = ReqIFParser.parse;
export const parseReqIFZ = ReqIFZParser.parse;
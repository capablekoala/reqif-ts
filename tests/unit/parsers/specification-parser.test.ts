import { JSDOM } from 'jsdom';
import { SpecificationParser } from '../../../src/parsers/specification-parser';
import { ReqIFSpecification } from '../../../src/models/reqif-specification';
import { ReqIFError } from '../../../src/models/error-handling';
import { ReqIFSpecHierarchy } from '../../../src/models/reqif-spec-hierarchy';

describe('SpecificationParser', () => {
  let dom: JSDOM;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html></html>', {
      contentType: 'application/xml',
    });
  });
  
  describe('parse', () => {
    it('should parse a basic specification', () => {
      const document = dom.window.document;
      
      // Create a specification element
      const element = document.createElement('SPECIFICATION');
      element.setAttribute('IDENTIFIER', 'spec-123');
      element.setAttribute('LONG-NAME', 'Test Specification');
      element.setAttribute('LAST-CHANGE', '2023-01-01T12:00:00Z');
      
      // Add type reference
      const typeElement = document.createElement('TYPE');
      const typeRefElement = document.createElement('SPECIFICATION-TYPE-REF');
      typeRefElement.textContent = 'spec-type-123';
      typeElement.appendChild(typeRefElement);
      element.appendChild(typeElement);
      
      const specification = SpecificationParser.parse(element);
      
      expect(specification).toBeInstanceOf(ReqIFSpecification);
      expect(specification.identifier).toBe('spec-123');
      expect(specification.longName).toBe('Test Specification');
      expect(specification.lastChange).toBe('2023-01-01T12:00:00Z');
      expect(specification.typeRef).toBe('spec-type-123');
      expect(specification.children.length).toBe(0);
    });
    
    it('should parse a specification with children', () => {
      const document = dom.window.document;
      
      // Create a specification element
      const element = document.createElement('SPECIFICATION');
      element.setAttribute('IDENTIFIER', 'spec-123');
      
      // Add type reference
      const typeElement = document.createElement('TYPE');
      const typeRefElement = document.createElement('SPECIFICATION-TYPE-REF');
      typeRefElement.textContent = 'spec-type-123';
      typeElement.appendChild(typeRefElement);
      element.appendChild(typeElement);
      
      // Create children section
      const childrenElement = document.createElement('CHILDREN');
      
      // Create a child spec hierarchy element
      const hierarchyElement = document.createElement('SPEC-HIERARCHY');
      hierarchyElement.setAttribute('IDENTIFIER', 'hier-123');
      
      // Add object reference to hierarchy
      const objectElement = document.createElement('OBJECT');
      const specObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      specObjectRefElement.textContent = 'spec-obj-123';
      objectElement.appendChild(specObjectRefElement);
      hierarchyElement.appendChild(objectElement);
      
      // Add hierarchy to children
      childrenElement.appendChild(hierarchyElement);
      
      // Add children to specification
      element.appendChild(childrenElement);
      
      const specification = SpecificationParser.parse(element);
      
      expect(specification).toBeInstanceOf(ReqIFSpecification);
      expect(specification.identifier).toBe('spec-123');
      expect(specification.typeRef).toBe('spec-type-123');
      expect(specification.children.length).toBe(1);
      
      const hierarchy = specification.children[0];
      expect(hierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(hierarchy.identifier).toBe('hier-123');
      expect(hierarchy.specObjectRef).toBe('spec-obj-123');
    });
    
    it('should handle missing TYPE element', () => {
      const document = dom.window.document;
      
      // Create a specification element
      const element = document.createElement('SPECIFICATION');
      element.setAttribute('IDENTIFIER', 'spec-123');
      
      const specification = SpecificationParser.parse(element);
      
      expect(specification).toBeInstanceOf(ReqIFSpecification);
      expect(specification.identifier).toBe('spec-123');
      expect(specification.typeRef).toBe('');
    });
    
    it('should throw an error for non-SPECIFICATION elements', () => {
      const document = dom.window.document;
      const element = document.createElement('NOT-SPECIFICATION');
      
      expect(() => SpecificationParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecificationParser.parse(element)).toThrow('Expected SPECIFICATION element');
    });
    
    it('should throw an error for missing IDENTIFIER', () => {
      const document = dom.window.document;
      const element = document.createElement('SPECIFICATION');
      
      expect(() => SpecificationParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecificationParser.parse(element)).toThrow('missing required IDENTIFIER attribute');
    });
  });
  
  describe('unparse', () => {
    it('should unparse a specification to XML', () => {
      const specification = new ReqIFSpecification(
        'spec-123',
        'spec-type-123',
        [],
        'Test Specification',
        '2023-01-01T12:00:00Z'
      );
      
      const xml = SpecificationParser.unparse(specification);
      
      expect(xml).toContain('<SPECIFICATION IDENTIFIER="spec-123" LONG-NAME="Test Specification" LAST-CHANGE="2023-01-01T12:00:00Z">');
      expect(xml).toContain('<TYPE>');
      expect(xml).toContain('<SPECIFICATION-TYPE-REF>spec-type-123</SPECIFICATION-TYPE-REF>');
      expect(xml).toContain('</SPECIFICATION>');
    });
    
    it('should unparse a specification with children', () => {
      const hierarchy = new ReqIFSpecHierarchy(
        'hier-123',
        'spec-obj-123',
        [],
        'Test Hierarchy'
      );
      
      const specification = new ReqIFSpecification(
        'spec-123',
        'spec-type-123',
        [hierarchy],
        'Test Specification'
      );
      
      const xml = SpecificationParser.unparse(specification);
      
      expect(xml).toContain('<SPECIFICATION IDENTIFIER="spec-123" LONG-NAME="Test Specification">');
      expect(xml).toContain('<CHILDREN>');
      expect(xml).toContain('<SPEC-HIERARCHY IDENTIFIER="hier-123" LONG-NAME="Test Hierarchy">');
      expect(xml).toContain('<SPEC-OBJECT-REF>spec-obj-123</SPEC-OBJECT-REF>');
    });
    
    it('should not include TYPE element if typeRef is empty', () => {
      const specification = new ReqIFSpecification(
        'spec-123',
        '',
        [],
        'Test Specification'
      );
      
      const xml = SpecificationParser.unparse(specification);
      
      expect(xml).toContain('<SPECIFICATION IDENTIFIER="spec-123" LONG-NAME="Test Specification">');
      expect(xml).not.toContain('<TYPE>');
      expect(xml).not.toContain('SPECIFICATION-TYPE-REF');
    });
  });
});
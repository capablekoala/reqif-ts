import { JSDOM } from 'jsdom';
import { SpecHierarchyParser } from '../../../src/parsers/spec-hierarchy-parser';
import { ReqIFSpecHierarchy } from '../../../src/models/reqif-spec-hierarchy';
import { ReqIFError } from '../../../src/models/error-handling';

describe('SpecHierarchyParser', () => {
  let dom: JSDOM;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html></html>', {
      contentType: 'application/xml',
    });
  });
  
  describe('parse', () => {
    it('should parse a basic spec hierarchy', () => {
      const document = dom.window.document;
      
      // Create a spec hierarchy element
      const element = document.createElement('SPEC-HIERARCHY');
      element.setAttribute('IDENTIFIER', 'hier-123');
      element.setAttribute('LONG-NAME', 'Test Hierarchy');
      element.setAttribute('LAST-CHANGE', '2023-01-01T12:00:00Z');
      
      // Add object reference
      const objectElement = document.createElement('OBJECT');
      const specObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      specObjectRefElement.textContent = 'spec-obj-123';
      objectElement.appendChild(specObjectRefElement);
      element.appendChild(objectElement);
      
      const hierarchy = SpecHierarchyParser.parse(element);
      
      expect(hierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(hierarchy.identifier).toBe('hier-123');
      expect(hierarchy.longName).toBe('Test Hierarchy');
      expect(hierarchy.lastChange).toBe('2023-01-01T12:00:00Z');
      expect(hierarchy.specObjectRef).toBe('spec-obj-123');
      expect(hierarchy.children.length).toBe(0);
      expect(hierarchy.level).toBe(1);
    });
    
    it('should parse a spec hierarchy with children', () => {
      const document = dom.window.document;
      
      // Create a parent spec hierarchy element
      const parentElement = document.createElement('SPEC-HIERARCHY');
      parentElement.setAttribute('IDENTIFIER', 'parent-123');
      
      // Add object reference to parent
      const parentObjectElement = document.createElement('OBJECT');
      const parentSpecObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      parentSpecObjectRefElement.textContent = 'parent-obj-123';
      parentObjectElement.appendChild(parentSpecObjectRefElement);
      parentElement.appendChild(parentObjectElement);
      
      // Create children section
      const childrenElement = document.createElement('CHILDREN');
      
      // Create a child spec hierarchy element
      const childElement = document.createElement('SPEC-HIERARCHY');
      childElement.setAttribute('IDENTIFIER', 'child-123');
      
      // Add object reference to child
      const childObjectElement = document.createElement('OBJECT');
      const childSpecObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      childSpecObjectRefElement.textContent = 'child-obj-123';
      childObjectElement.appendChild(childSpecObjectRefElement);
      childElement.appendChild(childObjectElement);
      
      // Add child to children
      childrenElement.appendChild(childElement);
      
      // Add children to parent
      parentElement.appendChild(childrenElement);
      
      const hierarchy = SpecHierarchyParser.parse(parentElement);
      
      expect(hierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(hierarchy.identifier).toBe('parent-123');
      expect(hierarchy.specObjectRef).toBe('parent-obj-123');
      expect(hierarchy.children.length).toBe(1);
      
      const childHierarchy = hierarchy.children[0];
      expect(childHierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(childHierarchy.identifier).toBe('child-123');
      expect(childHierarchy.specObjectRef).toBe('child-obj-123');
      expect(childHierarchy.level).toBe(2);
    });
    
    it('should parse a spec hierarchy with IS-EDITABLE attribute', () => {
      const document = dom.window.document;
      
      // Create a spec hierarchy element
      const element = document.createElement('SPEC-HIERARCHY');
      element.setAttribute('IDENTIFIER', 'hier-123');
      element.setAttribute('IS-EDITABLE', 'true');
      
      // Add object reference
      const objectElement = document.createElement('OBJECT');
      const specObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      specObjectRefElement.textContent = 'spec-obj-123';
      objectElement.appendChild(specObjectRefElement);
      element.appendChild(objectElement);
      
      const hierarchy = SpecHierarchyParser.parse(element);
      
      expect(hierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(hierarchy.isEditable).toBe(true);
    });
    
    it('should parse a spec hierarchy with IS-TABLE-INTERNAL attribute', () => {
      const document = dom.window.document;
      
      // Create a spec hierarchy element
      const element = document.createElement('SPEC-HIERARCHY');
      element.setAttribute('IDENTIFIER', 'hier-123');
      element.setAttribute('IS-TABLE-INTERNAL', 'true');
      
      // Add object reference
      const objectElement = document.createElement('OBJECT');
      const specObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      specObjectRefElement.textContent = 'spec-obj-123';
      objectElement.appendChild(specObjectRefElement);
      element.appendChild(objectElement);
      
      const hierarchy = SpecHierarchyParser.parse(element);
      
      expect(hierarchy).toBeInstanceOf(ReqIFSpecHierarchy);
      expect(hierarchy.isTableInternal).toBe(true);
    });
    
    it('should throw an error for non-SPEC-HIERARCHY elements', () => {
      const document = dom.window.document;
      const element = document.createElement('NOT-SPEC-HIERARCHY');
      
      expect(() => SpecHierarchyParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecHierarchyParser.parse(element)).toThrow('Expected SPEC-HIERARCHY element');
    });
    
    it('should throw an error for missing IDENTIFIER', () => {
      const document = dom.window.document;
      const element = document.createElement('SPEC-HIERARCHY');
      
      // Add object reference
      const objectElement = document.createElement('OBJECT');
      const specObjectRefElement = document.createElement('SPEC-OBJECT-REF');
      specObjectRefElement.textContent = 'spec-obj-123';
      objectElement.appendChild(specObjectRefElement);
      element.appendChild(objectElement);
      
      expect(() => SpecHierarchyParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecHierarchyParser.parse(element)).toThrow('missing required IDENTIFIER attribute');
    });
    
    it('should throw an error for missing OBJECT/SPEC-OBJECT-REF', () => {
      const document = dom.window.document;
      const element = document.createElement('SPEC-HIERARCHY');
      element.setAttribute('IDENTIFIER', 'hier-123');
      
      expect(() => SpecHierarchyParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecHierarchyParser.parse(element)).toThrow('missing OBJECT/SPEC-OBJECT-REF');
    });
  });
  
  describe('unparse', () => {
    it('should unparse a spec hierarchy to XML', () => {
      const hierarchy = new ReqIFSpecHierarchy(
        'hier-123',
        'spec-obj-123',
        [],
        'Test Hierarchy',
        '2023-01-01T12:00:00Z'
      );
      
      const xml = SpecHierarchyParser.unparse(hierarchy);
      
      expect(xml).toContain('<SPEC-HIERARCHY IDENTIFIER="hier-123" LONG-NAME="Test Hierarchy" LAST-CHANGE="2023-01-01T12:00:00Z">');
      expect(xml).toContain('<OBJECT>');
      expect(xml).toContain('<SPEC-OBJECT-REF>spec-obj-123</SPEC-OBJECT-REF>');
      expect(xml).toContain('</SPEC-HIERARCHY>');
      expect(xml).not.toContain('IS-EDITABLE');
      expect(xml).not.toContain('IS-TABLE-INTERNAL');
    });
    
    it('should unparse a spec hierarchy with children', () => {
      const childHierarchy = new ReqIFSpecHierarchy(
        'child-123',
        'child-obj-123',
        [],
        'Child Hierarchy'
      );
      
      const parentHierarchy = new ReqIFSpecHierarchy(
        'parent-123',
        'parent-obj-123',
        [childHierarchy],
        'Parent Hierarchy'
      );
      
      const xml = SpecHierarchyParser.unparse(parentHierarchy);
      
      expect(xml).toContain('<SPEC-HIERARCHY IDENTIFIER="parent-123" LONG-NAME="Parent Hierarchy">');
      expect(xml).toContain('<CHILDREN>');
      expect(xml).toContain('<SPEC-HIERARCHY IDENTIFIER="child-123" LONG-NAME="Child Hierarchy">');
      expect(xml).toContain('<SPEC-OBJECT-REF>child-obj-123</SPEC-OBJECT-REF>');
    });
    
    it('should unparse a spec hierarchy with IS-EDITABLE attribute', () => {
      const hierarchy = new ReqIFSpecHierarchy(
        'hier-123',
        'spec-obj-123',
        [],
        undefined,
        undefined,
        undefined,
        1,
        true
      );
      
      const xml = SpecHierarchyParser.unparse(hierarchy);
      
      expect(xml).toContain('IS-EDITABLE="true"');
    });
    
    it('should unparse a spec hierarchy with IS-TABLE-INTERNAL attribute', () => {
      const hierarchy = new ReqIFSpecHierarchy(
        'hier-123',
        'spec-obj-123',
        [],
        undefined,
        undefined,
        undefined,
        1,
        false,
        true
      );
      
      const xml = SpecHierarchyParser.unparse(hierarchy);
      
      expect(xml).toContain('IS-TABLE-INTERNAL="true"');
    });
  });
});
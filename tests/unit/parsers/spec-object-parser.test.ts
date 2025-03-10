import { JSDOM } from 'jsdom';
import { SpecObjectParser } from '../../../src/parsers/spec-object-parser';
import { ReqIFSpecObject } from '../../../src/models/reqif-spec-object';
import { ReqIFError } from '../../../src/models/error-handling';
import { 
  ReqIFAttributeValueString,
  ReqIFAttributeValueXHTML 
} from '../../../src/models/reqif-attribute-value';

describe('SpecObjectParser', () => {
  let dom: JSDOM;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html></html>', {
      contentType: 'application/xml',
    });
  });
  
  describe('parse', () => {
    it('should parse a basic spec object', () => {
      const document = dom.window.document;
      
      // Create a spec object element
      const element = document.createElement('SPEC-OBJECT');
      element.setAttribute('IDENTIFIER', 'spec-obj-123');
      element.setAttribute('LONG-NAME', 'Test Spec Object');
      element.setAttribute('LAST-CHANGE', '2023-01-01T12:00:00Z');
      
      // Add type reference
      const typeElement = document.createElement('TYPE');
      const typeRefElement = document.createElement('SPEC-OBJECT-TYPE-REF');
      typeRefElement.textContent = 'type-ref-123';
      typeElement.appendChild(typeRefElement);
      element.appendChild(typeElement);
      
      const specObject = SpecObjectParser.parse(element);
      
      expect(specObject).toBeInstanceOf(ReqIFSpecObject);
      expect(specObject.identifier).toBe('spec-obj-123');
      expect(specObject.longName).toBe('Test Spec Object');
      expect(specObject.lastChange).toBe('2023-01-01T12:00:00Z');
      expect(specObject.typeRef).toBe('type-ref-123');
      expect(specObject.attributeValues.length).toBe(0);
    });
    
    it('should parse a spec object with attribute values', () => {
      const document = dom.window.document;
      
      // Create a spec object element
      const element = document.createElement('SPEC-OBJECT');
      element.setAttribute('IDENTIFIER', 'spec-obj-123');
      
      // Add type reference
      const typeElement = document.createElement('TYPE');
      const typeRefElement = document.createElement('SPEC-OBJECT-TYPE-REF');
      typeRefElement.textContent = 'type-ref-123';
      typeElement.appendChild(typeRefElement);
      element.appendChild(typeElement);
      
      // Add values section
      const valuesElement = document.createElement('VALUES');
      
      // Add a string attribute value
      const stringAttrElement = document.createElement('ATTRIBUTE-VALUE-STRING');
      const stringDefElement = document.createElement('DEFINITION');
      const stringDefRefElement = document.createElement('ATTRIBUTE-DEFINITION-STRING-REF');
      stringDefRefElement.textContent = 'string-def';
      stringDefElement.appendChild(stringDefRefElement);
      const stringValueElement = document.createElement('THE-VALUE');
      stringValueElement.textContent = 'String value';
      stringAttrElement.appendChild(stringDefElement);
      stringAttrElement.appendChild(stringValueElement);
      
      // Add an XHTML attribute value
      const xhtmlAttrElement = document.createElement('ATTRIBUTE-VALUE-XHTML');
      const xhtmlDefElement = document.createElement('DEFINITION');
      const xhtmlDefRefElement = document.createElement('ATTRIBUTE-DEFINITION-XHTML-REF');
      xhtmlDefRefElement.textContent = 'xhtml-def';
      xhtmlDefElement.appendChild(xhtmlDefRefElement);
      const xhtmlValueElement = document.createElement('THE-VALUE');
      const p = document.createElement('p');
      p.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      p.textContent = 'XHTML content';
      xhtmlValueElement.appendChild(p);
      xhtmlAttrElement.appendChild(xhtmlDefElement);
      xhtmlAttrElement.appendChild(xhtmlValueElement);
      
      valuesElement.appendChild(stringAttrElement);
      valuesElement.appendChild(xhtmlAttrElement);
      element.appendChild(valuesElement);
      
      const specObject = SpecObjectParser.parse(element);
      
      expect(specObject).toBeInstanceOf(ReqIFSpecObject);
      expect(specObject.identifier).toBe('spec-obj-123');
      expect(specObject.typeRef).toBe('type-ref-123');
      expect(specObject.attributeValues.length).toBe(2);
      
      // Check string attribute
      const stringAttr = specObject.getAttributeValue('string-def');
      expect(stringAttr).toBeInstanceOf(ReqIFAttributeValueString);
      expect((stringAttr as ReqIFAttributeValueString).value).toBe('String value');
      
      // Check XHTML attribute
      const xhtmlAttr = specObject.getAttributeValue('xhtml-def');
      expect(xhtmlAttr).toBeInstanceOf(ReqIFAttributeValueXHTML);
      expect((xhtmlAttr as ReqIFAttributeValueXHTML).value).toContain('XHTML content');
    });
    
    it('should throw an error for non-SPEC-OBJECT elements', () => {
      const document = dom.window.document;
      const element = document.createElement('NOT-SPEC-OBJECT');
      
      expect(() => SpecObjectParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecObjectParser.parse(element)).toThrow('Expected SPEC-OBJECT element');
    });
    
    it('should throw an error for missing IDENTIFIER', () => {
      const document = dom.window.document;
      const element = document.createElement('SPEC-OBJECT');
      
      // Add type reference
      const typeElement = document.createElement('TYPE');
      const typeRefElement = document.createElement('SPEC-OBJECT-TYPE-REF');
      typeRefElement.textContent = 'type-ref-123';
      typeElement.appendChild(typeRefElement);
      element.appendChild(typeElement);
      
      expect(() => SpecObjectParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecObjectParser.parse(element)).toThrow('missing required IDENTIFIER attribute');
    });
    
    it('should throw an error for missing TYPE/SPEC-OBJECT-TYPE-REF', () => {
      const document = dom.window.document;
      const element = document.createElement('SPEC-OBJECT');
      element.setAttribute('IDENTIFIER', 'spec-obj-123');
      
      expect(() => SpecObjectParser.parse(element)).toThrow(ReqIFError);
      expect(() => SpecObjectParser.parse(element)).toThrow('missing TYPE/SPEC-OBJECT-TYPE-REF');
    });
  });
  
  describe('unparse', () => {
    it('should unparse a spec object to XML', () => {
      const specObject = new ReqIFSpecObject(
        'spec-obj-123',
        'type-ref-123',
        [],
        'Test Spec Object',
        '2023-01-01T12:00:00Z'
      );
      
      const xml = SpecObjectParser.unparse(specObject);
      
      expect(xml).toContain('<SPEC-OBJECT IDENTIFIER="spec-obj-123" LONG-NAME="Test Spec Object" LAST-CHANGE="2023-01-01T12:00:00Z">');
      expect(xml).toContain('<TYPE>');
      expect(xml).toContain('<SPEC-OBJECT-TYPE-REF>type-ref-123</SPEC-OBJECT-TYPE-REF>');
      expect(xml).toContain('</SPEC-OBJECT>');
      expect(xml).not.toContain('<VALUES>');
    });
    
    it('should unparse a spec object with attribute values', () => {
      const stringAttr = new ReqIFAttributeValueString('string-def', 'String value');
      const xhtmlAttr = new ReqIFAttributeValueXHTML('xhtml-def', '<p>XHTML content</p>', '<p xmlns="http://www.w3.org/1999/xhtml">XHTML content</p>');
      
      const specObject = new ReqIFSpecObject(
        'spec-obj-123',
        'type-ref-123',
        [stringAttr, xhtmlAttr]
      );
      
      const xml = SpecObjectParser.unparse(specObject);
      
      expect(xml).toContain('<SPEC-OBJECT IDENTIFIER="spec-obj-123">');
      expect(xml).toContain('<VALUES>');
      expect(xml).toContain('<ATTRIBUTE-VALUE-STRING>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-STRING-REF>string-def</ATTRIBUTE-DEFINITION-STRING-REF>');
      expect(xml).toContain('<THE-VALUE>String value</THE-VALUE>');
      expect(xml).toContain('<ATTRIBUTE-VALUE-XHTML>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-XHTML-REF>xhtml-def</ATTRIBUTE-DEFINITION-XHTML-REF>');
      expect(xml).toContain('<p xmlns="http://www.w3.org/1999/xhtml">XHTML content</p>');
    });
  });
});
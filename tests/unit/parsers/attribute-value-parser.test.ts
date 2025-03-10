import { JSDOM } from 'jsdom';
import { AttributeValueParser } from '../../../src/parsers/attribute-value-parser';
import { 
  ReqIFAttributeValueString,
  ReqIFAttributeValueInteger,
  ReqIFAttributeValueBoolean,
  ReqIFAttributeValueXHTML,
  ReqIFAttributeValueEnumeration
} from '../../../src/models/reqif-attribute-value';

describe('AttributeValueParser', () => {
  let dom: JSDOM;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html></html>', {
      contentType: 'application/xml',
    });
  });
  
  describe('parseAttributeValues', () => {
    it('should parse string attribute values', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-STRING');
      const definitionElement = document.createElement('DEFINITION');
      const definitionRefElement = document.createElement('ATTRIBUTE-DEFINITION-STRING-REF');
      definitionRefElement.textContent = 'def-123';
      definitionElement.appendChild(definitionRefElement);
      
      const valueElement = document.createElement('THE-VALUE');
      valueElement.textContent = 'Test value';
      
      element.appendChild(definitionElement);
      element.appendChild(valueElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(1);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueString);
      expect(attributeValues[0].definitionRef).toBe('def-123');
      expect((attributeValues[0] as ReqIFAttributeValueString).value).toBe('Test value');
    });
    
    it('should parse integer attribute values', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-INTEGER');
      const definitionElement = document.createElement('DEFINITION');
      const definitionRefElement = document.createElement('ATTRIBUTE-DEFINITION-INTEGER-REF');
      definitionRefElement.textContent = 'def-123';
      definitionElement.appendChild(definitionRefElement);
      
      const valueElement = document.createElement('THE-VALUE');
      valueElement.textContent = '42';
      
      element.appendChild(definitionElement);
      element.appendChild(valueElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(1);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueInteger);
      expect(attributeValues[0].definitionRef).toBe('def-123');
      expect((attributeValues[0] as ReqIFAttributeValueInteger).value).toBe(42);
    });
    
    it('should parse boolean attribute values', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-BOOLEAN');
      const definitionElement = document.createElement('DEFINITION');
      const definitionRefElement = document.createElement('ATTRIBUTE-DEFINITION-BOOLEAN-REF');
      definitionRefElement.textContent = 'def-123';
      definitionElement.appendChild(definitionRefElement);
      
      const valueElement = document.createElement('THE-VALUE');
      valueElement.textContent = 'true';
      
      element.appendChild(definitionElement);
      element.appendChild(valueElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(1);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueBoolean);
      expect(attributeValues[0].definitionRef).toBe('def-123');
      expect((attributeValues[0] as ReqIFAttributeValueBoolean).value).toBe(true);
    });
    
    it('should parse XHTML attribute values', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-XHTML');
      const definitionElement = document.createElement('DEFINITION');
      const definitionRefElement = document.createElement('ATTRIBUTE-DEFINITION-XHTML-REF');
      definitionRefElement.textContent = 'def-123';
      definitionElement.appendChild(definitionRefElement);
      
      const valueElement = document.createElement('THE-VALUE');
      const p = document.createElement('p');
      p.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
      p.textContent = 'Test paragraph';
      valueElement.appendChild(p);
      
      element.appendChild(definitionElement);
      element.appendChild(valueElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(1);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueXHTML);
      expect(attributeValues[0].definitionRef).toBe('def-123');
      expect((attributeValues[0] as ReqIFAttributeValueXHTML).value).toContain('Test paragraph');
    });
    
    it('should parse enumeration attribute values', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-ENUMERATION');
      const definitionElement = document.createElement('DEFINITION');
      const definitionRefElement = document.createElement('ATTRIBUTE-DEFINITION-ENUMERATION-REF');
      definitionRefElement.textContent = 'def-123';
      definitionElement.appendChild(definitionRefElement);
      
      const valuesElement = document.createElement('VALUES');
      const ref1 = document.createElement('ENUM-VALUE-REF');
      ref1.textContent = 'enum-1';
      const ref2 = document.createElement('ENUM-VALUE-REF');
      ref2.textContent = 'enum-2';
      valuesElement.appendChild(ref1);
      valuesElement.appendChild(ref2);
      
      element.appendChild(definitionElement);
      element.appendChild(valuesElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(1);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueEnumeration);
      expect(attributeValues[0].definitionRef).toBe('def-123');
      expect((attributeValues[0] as ReqIFAttributeValueEnumeration).values).toEqual(['enum-1', 'enum-2']);
    });
    
    it('should handle missing definition element', () => {
      const document = dom.window.document;
      const element = document.createElement('ATTRIBUTE-VALUE-STRING');
      const valueElement = document.createElement('THE-VALUE');
      valueElement.textContent = 'Test value';
      element.appendChild(valueElement);
      
      // Capture console.warn calls
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const attributeValues = AttributeValueParser.parseAttributeValues([element]);
      
      expect(attributeValues.length).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
    
    it('should handle multiple attribute values', () => {
      const document = dom.window.document;
      
      // String attribute
      const stringElement = document.createElement('ATTRIBUTE-VALUE-STRING');
      const stringDefElement = document.createElement('DEFINITION');
      const stringDefRefElement = document.createElement('ATTRIBUTE-DEFINITION-STRING-REF');
      stringDefRefElement.textContent = 'string-def';
      stringDefElement.appendChild(stringDefRefElement);
      const stringValueElement = document.createElement('THE-VALUE');
      stringValueElement.textContent = 'String value';
      stringElement.appendChild(stringDefElement);
      stringElement.appendChild(stringValueElement);
      
      // Boolean attribute
      const booleanElement = document.createElement('ATTRIBUTE-VALUE-BOOLEAN');
      const booleanDefElement = document.createElement('DEFINITION');
      const booleanDefRefElement = document.createElement('ATTRIBUTE-DEFINITION-BOOLEAN-REF');
      booleanDefRefElement.textContent = 'boolean-def';
      booleanDefElement.appendChild(booleanDefRefElement);
      const booleanValueElement = document.createElement('THE-VALUE');
      booleanValueElement.textContent = 'false';
      booleanElement.appendChild(booleanDefElement);
      booleanElement.appendChild(booleanValueElement);
      
      const attributeValues = AttributeValueParser.parseAttributeValues([stringElement, booleanElement]);
      
      expect(attributeValues.length).toBe(2);
      expect(attributeValues[0]).toBeInstanceOf(ReqIFAttributeValueString);
      expect(attributeValues[1]).toBeInstanceOf(ReqIFAttributeValueBoolean);
      expect((attributeValues[0] as ReqIFAttributeValueString).value).toBe('String value');
      expect((attributeValues[1] as ReqIFAttributeValueBoolean).value).toBe(false);
    });
  });
  
  describe('unparseAttributeValues', () => {
    it('should unparse string attribute values', () => {
      const attrValue = new ReqIFAttributeValueString('def-123', 'Test value');
      const xml = AttributeValueParser.unparseAttributeValues([attrValue]);
      
      expect(xml).toContain('<ATTRIBUTE-VALUE-STRING>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-STRING-REF>def-123</ATTRIBUTE-DEFINITION-STRING-REF>');
      expect(xml).toContain('<THE-VALUE>Test value</THE-VALUE>');
    });
    
    it('should unparse boolean attribute values', () => {
      const attrValue = new ReqIFAttributeValueBoolean('def-123', true);
      const xml = AttributeValueParser.unparseAttributeValues([attrValue]);
      
      expect(xml).toContain('<ATTRIBUTE-VALUE-BOOLEAN>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-BOOLEAN-REF>def-123</ATTRIBUTE-DEFINITION-BOOLEAN-REF>');
      expect(xml).toContain('<THE-VALUE>true</THE-VALUE>');
    });
    
    it('should unparse enumeration attribute values', () => {
      const attrValue = new ReqIFAttributeValueEnumeration('def-123', ['enum-1', 'enum-2']);
      const xml = AttributeValueParser.unparseAttributeValues([attrValue]);
      
      expect(xml).toContain('<ATTRIBUTE-VALUE-ENUMERATION>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-ENUMERATION-REF>def-123</ATTRIBUTE-DEFINITION-ENUMERATION-REF>');
      expect(xml).toContain('<VALUES>');
      expect(xml).toContain('<ENUM-VALUE-REF>enum-1</ENUM-VALUE-REF>');
      expect(xml).toContain('<ENUM-VALUE-REF>enum-2</ENUM-VALUE-REF>');
    });
    
    it('should handle empty enumeration values', () => {
      const attrValue = new ReqIFAttributeValueEnumeration('def-123', []);
      const xml = AttributeValueParser.unparseAttributeValues([attrValue]);
      
      expect(xml).toContain('<ATTRIBUTE-VALUE-ENUMERATION>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-ENUMERATION-REF>def-123</ATTRIBUTE-DEFINITION-ENUMERATION-REF>');
      expect(xml).toContain('<VALUES/>');
    });
    
    it('should handle multiple attribute values', () => {
      const stringAttr = new ReqIFAttributeValueString('string-def', 'String value');
      const booleanAttr = new ReqIFAttributeValueBoolean('boolean-def', false);
      
      const xml = AttributeValueParser.unparseAttributeValues([stringAttr, booleanAttr]);
      
      expect(xml).toContain('<ATTRIBUTE-VALUE-STRING>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-STRING-REF>string-def</ATTRIBUTE-DEFINITION-STRING-REF>');
      expect(xml).toContain('<THE-VALUE>String value</THE-VALUE>');
      expect(xml).toContain('<ATTRIBUTE-VALUE-BOOLEAN>');
      expect(xml).toContain('<ATTRIBUTE-DEFINITION-BOOLEAN-REF>boolean-def</ATTRIBUTE-DEFINITION-BOOLEAN-REF>');
      expect(xml).toContain('<THE-VALUE>false</THE-VALUE>');
    });
  });
});
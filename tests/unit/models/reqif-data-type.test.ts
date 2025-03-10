import {
  ReqIFDataTypeBoolean,
  ReqIFDataTypeDate,
  ReqIFDataTypeEnum,
  ReqIFDataTypeInteger,
  ReqIFDataTypeReal,
  ReqIFDataTypeString,
  ReqIFDataTypeXHTML
} from '../../../src/models/reqif-data-type';
import { ReqIFDataTypeKind } from '../../../src/models/reqif-types';

describe('ReqIF Data Types', () => {
  describe('ReqIFDataTypeBoolean', () => {
    it('should initialize with required properties', () => {
      const dataType = new ReqIFDataTypeBoolean('boolean-123');
      
      expect(dataType.identifier).toBe('boolean-123');
      expect(dataType.kind).toBe(ReqIFDataTypeKind.BOOLEAN);
      expect(dataType.longName).toBeUndefined();
      expect(dataType.lastChange).toBeUndefined();
      expect(dataType.desc).toBeUndefined();
    });
    
    it('should initialize with all properties', () => {
      const dataType = new ReqIFDataTypeBoolean(
        'boolean-123',
        'Boolean Type',
        '2023-01-01T12:00:00Z',
        'A boolean data type'
      );
      
      expect(dataType.identifier).toBe('boolean-123');
      expect(dataType.kind).toBe(ReqIFDataTypeKind.BOOLEAN);
      expect(dataType.longName).toBe('Boolean Type');
      expect(dataType.lastChange).toBe('2023-01-01T12:00:00Z');
      expect(dataType.desc).toBe('A boolean data type');
    });
  });
  
  describe('ReqIFDataTypeEnum', () => {
    it('should initialize with required properties and default values', () => {
      const dataType = new ReqIFDataTypeEnum('enum-123');
      
      expect(dataType.identifier).toBe('enum-123');
      expect(dataType.kind).toBe(ReqIFDataTypeKind.ENUMERATION);
      expect(dataType.values).toEqual([]);
      expect(dataType.multiValued).toBe(false);
    });
    
    it('should initialize with all properties', () => {
      const values = [
        { identifier: 'enum-value-1', key: 1, longName: 'Value 1' },
        { identifier: 'enum-value-2', key: 2, longName: 'Value 2' }
      ];
      
      const dataType = new ReqIFDataTypeEnum(
        'enum-123',
        values,
        true,
        'Enumeration Type',
        '2023-01-01T12:00:00Z',
        'An enumeration data type'
      );
      
      expect(dataType.identifier).toBe('enum-123');
      expect(dataType.kind).toBe(ReqIFDataTypeKind.ENUMERATION);
      expect(dataType.values).toEqual(values);
      expect(dataType.multiValued).toBe(true);
      expect(dataType.longName).toBe('Enumeration Type');
      expect(dataType.lastChange).toBe('2023-01-01T12:00:00Z');
      expect(dataType.desc).toBe('An enumeration data type');
    });
  });
  
  // Additional tests for other data types could be added here
});
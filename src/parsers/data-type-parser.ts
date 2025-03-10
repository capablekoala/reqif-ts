import {
  ReqIFDataType,
  ReqIFDataTypeBoolean,
  ReqIFDataTypeDate,
  ReqIFDataTypeEnum,
  ReqIFDataTypeInteger,
  ReqIFDataTypeReal,
  ReqIFDataTypeString,
  ReqIFDataTypeXHTML,
  ReqIFEnumValue
} from '../models/reqif-data-type';

/**
 * Parser for ReqIF data types.
 */
export class DataTypeParser {
  /**
   * Parse a data type element into a ReqIFDataType object.
   */
  static parse(element: Element): ReqIFDataType {
    const tagName = element.tagName;
    
    // Extract common attributes
    const identifier = element.getAttribute('IDENTIFIER');
    if (!identifier) {
      throw new Error(`${tagName} element missing required IDENTIFIER attribute`);
    }
    
    const longName = element.getAttribute('LONG-NAME');
    const lastChange = element.getAttribute('LAST-CHANGE');
    const desc = element.getAttribute('DESC');
    
    // Parse different data types based on tag name
    switch (tagName) {
      case 'DATATYPE-DEFINITION-BOOLEAN':
        return new ReqIFDataTypeBoolean(identifier, longName || undefined, lastChange || undefined, desc || undefined);
        
      case 'DATATYPE-DEFINITION-DATE':
        return new ReqIFDataTypeDate(identifier, longName || undefined, lastChange || undefined, desc || undefined);
        
      case 'DATATYPE-DEFINITION-ENUMERATION':
        // Get multi-valued setting
        const multiValued = element.getAttribute('MULTI-VALUED') === 'true';
        
        // Parse enum values
        const values: ReqIFEnumValue[] = [];
        const enumValueElements = element.querySelectorAll('ENUM-VALUE');
        
        for (let i = 0; i < enumValueElements.length; i++) {
          const enumValueElement = enumValueElements[i];
          
          const enumIdentifier = enumValueElement.getAttribute('IDENTIFIER');
          if (!enumIdentifier) {
            throw new Error('ENUM-VALUE element missing required IDENTIFIER attribute');
          }
          
          const keyStr = enumValueElement.getAttribute('KEY');
          if (!keyStr) {
            throw new Error('ENUM-VALUE element missing required KEY attribute');
          }
          
          const key = parseInt(keyStr, 10);
          const enumLongName = enumValueElement.getAttribute('LONG-NAME');
          const enumLastChange = enumValueElement.getAttribute('LAST-CHANGE');
          const otherContent = enumValueElement.getAttribute('OTHER-CONTENT');
          
          values.push({
            identifier: enumIdentifier,
            key,
            longName: enumLongName || undefined,
            lastChange: enumLastChange || undefined,
            otherContent: otherContent || undefined
          });
        }
        
        return new ReqIFDataTypeEnum(
          identifier,
          values,
          multiValued,
          longName || undefined,
          lastChange || undefined,
          desc || undefined
        );
        
      case 'DATATYPE-DEFINITION-INTEGER':
        const minInt = element.getAttribute('MIN');
        const maxInt = element.getAttribute('MAX');
        
        return new ReqIFDataTypeInteger(
          identifier,
          minInt ? parseInt(minInt, 10) : undefined,
          maxInt ? parseInt(maxInt, 10) : undefined,
          longName || undefined,
          lastChange || undefined,
          desc || undefined
        );
        
      case 'DATATYPE-DEFINITION-REAL':
        const minReal = element.getAttribute('MIN');
        const maxReal = element.getAttribute('MAX');
        const accuracy = element.getAttribute('ACCURACY');
        
        return new ReqIFDataTypeReal(
          identifier,
          minReal ? parseFloat(minReal) : undefined,
          maxReal ? parseFloat(maxReal) : undefined,
          accuracy ? parseInt(accuracy, 10) : undefined,
          longName || undefined,
          lastChange || undefined,
          desc || undefined
        );
        
      case 'DATATYPE-DEFINITION-STRING':
        const maxLength = element.getAttribute('MAX-LENGTH');
        
        return new ReqIFDataTypeString(
          identifier,
          maxLength ? parseInt(maxLength, 10) : undefined,
          longName || undefined,
          lastChange || undefined,
          desc || undefined
        );
        
      case 'DATATYPE-DEFINITION-XHTML':
        return new ReqIFDataTypeXHTML(
          identifier,
          longName || undefined,
          lastChange || undefined,
          desc || undefined
        );
        
      default:
        throw new Error(`Unknown data type element: ${tagName}`);
    }
  }
}
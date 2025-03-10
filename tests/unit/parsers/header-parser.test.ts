import { JSDOM } from 'jsdom';
import { HeaderParser } from '../../../src/parsers/header-parser';
import { ReqIFReqIFHeader } from '../../../src/models/reqif-reqif-header';

describe('HeaderParser', () => {
  let dom: JSDOM;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html></html>', {
      contentType: 'application/xml',
    });
  });
  
  it('should parse a header with required attributes', () => {
    const document = dom.window.document;
    const element = document.createElement('REQ-IF-HEADER');
    element.setAttribute('IDENTIFIER', 'header-123');
    element.setAttribute('CREATION-TIME', '2023-01-01T12:00:00Z');
    
    const header = HeaderParser.parse(element);
    
    expect(header).toBeInstanceOf(ReqIFReqIFHeader);
    expect(header.identifier).toBe('header-123');
    expect(header.creationTime).toBe('2023-01-01T12:00:00Z');
    expect(header.repositoryId).toBeUndefined();
    expect(header.reqIfToolId).toBeUndefined();
    expect(header.reqIfVersion).toBeUndefined();
    expect(header.sourceToolId).toBeUndefined();
    expect(header.title).toBeUndefined();
    expect(header.comment).toBeUndefined();
  });
  
  it('should parse a header with all attributes', () => {
    const document = dom.window.document;
    const element = document.createElement('REQ-IF-HEADER');
    element.setAttribute('IDENTIFIER', 'header-123');
    element.setAttribute('CREATION-TIME', '2023-01-01T12:00:00Z');
    element.setAttribute('REPOSITORY-ID', 'repo-123');
    element.setAttribute('REQ-IF-TOOL-ID', 'tool-123');
    element.setAttribute('REQ-IF-VERSION', '1.0');
    element.setAttribute('SOURCE-TOOL-ID', 'source-123');
    element.setAttribute('TITLE', 'Test Header');
    
    const commentElement = document.createElement('COMMENT');
    commentElement.textContent = 'This is a test comment';
    element.appendChild(commentElement);
    
    const header = HeaderParser.parse(element);
    
    expect(header).toBeInstanceOf(ReqIFReqIFHeader);
    expect(header.identifier).toBe('header-123');
    expect(header.creationTime).toBe('2023-01-01T12:00:00Z');
    expect(header.repositoryId).toBe('repo-123');
    expect(header.reqIfToolId).toBe('tool-123');
    expect(header.reqIfVersion).toBe('1.0');
    expect(header.sourceToolId).toBe('source-123');
    expect(header.title).toBe('Test Header');
    expect(header.comment).toBe('This is a test comment');
  });
  
  it('should throw an error if IDENTIFIER is missing', () => {
    const document = dom.window.document;
    const element = document.createElement('REQ-IF-HEADER');
    element.setAttribute('CREATION-TIME', '2023-01-01T12:00:00Z');
    
    expect(() => HeaderParser.parse(element)).toThrow('REQ-IF-HEADER element missing required IDENTIFIER attribute');
  });
  
  it('should throw an error if CREATION-TIME is missing', () => {
    const document = dom.window.document;
    const element = document.createElement('REQ-IF-HEADER');
    element.setAttribute('IDENTIFIER', 'header-123');
    
    expect(() => HeaderParser.parse(element)).toThrow('REQ-IF-HEADER element missing required CREATION-TIME attribute');
  });
});
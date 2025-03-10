import { ReqIFReqIFHeader } from '../models/reqif-reqif-header';

/**
 * Parser for ReqIF header information.
 */
export class HeaderParser {
  /**
   * Parse a REQ-IF-HEADER element into a ReqIFReqIFHeader object.
   */
  static parse(element: Element): ReqIFReqIFHeader {
    // Extract required attributes
    const identifier = element.getAttribute('IDENTIFIER');
    const creationTime = element.getAttribute('CREATION-TIME');
    
    if (!identifier) {
      throw new Error('REQ-IF-HEADER element missing required IDENTIFIER attribute');
    }
    
    if (!creationTime) {
      throw new Error('REQ-IF-HEADER element missing required CREATION-TIME attribute');
    }
    
    // Extract optional attributes
    const repositoryId = element.getAttribute('REPOSITORY-ID');
    const reqIfToolId = element.getAttribute('REQ-IF-TOOL-ID');
    const reqIfVersion = element.getAttribute('REQ-IF-VERSION');
    const sourceToolId = element.getAttribute('SOURCE-TOOL-ID');
    const title = element.getAttribute('TITLE');
    
    // Extract comment if present
    let comment: string | undefined;
    const commentElement = element.querySelector('COMMENT');
    if (commentElement && commentElement.textContent) {
      comment = commentElement.textContent;
    }
    
    // Create and return the header object
    return new ReqIFReqIFHeader(
      identifier,
      creationTime,
      repositoryId || undefined,
      reqIfToolId || undefined,
      reqIfVersion || undefined,
      sourceToolId || undefined,
      title || undefined,
      comment
    );
  }
}
/**
 * Base interface for all ReqIF objects with an identifier.
 */
export interface ReqIFIdentifiable {
  identifier: string;
  longName?: string;
  lastChange?: string;
  desc?: string;
}

/**
 * Enumeration of ReqIF data type kinds.
 */
export enum ReqIFDataTypeKind {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  INTEGER = 'INTEGER',
  REAL = 'REAL',
  STRING = 'STRING',
  XHTML = 'XHTML'
}

/**
 * Enumeration of ReqIF attribute value kinds.
 */
export enum ReqIFAttributeValueKind {
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  ENUMERATION = 'ENUMERATION',
  INTEGER = 'INTEGER',
  REAL = 'REAL',
  STRING = 'STRING',
  XHTML = 'XHTML'
}
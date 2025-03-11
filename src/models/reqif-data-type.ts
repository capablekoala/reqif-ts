import { ReqIFDataTypeKind, ReqIFIdentifiable } from "./reqif-types";

/**
 * Base class for all ReqIF data types.
 */
export abstract class ReqIFDataType implements ReqIFIdentifiable {
  constructor(
    public identifier: string,
    public kind: ReqIFDataTypeKind,
    public longName?: string,
    public lastChange?: string,
    public desc?: string,
  ) {}
}

/**
 * Represents a boolean data type in ReqIF.
 */
export class ReqIFDataTypeBoolean extends ReqIFDataType {
  constructor(
    identifier: string,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.BOOLEAN, longName, lastChange, desc);
  }
}

/**
 * Represents a date data type in ReqIF.
 */
export class ReqIFDataTypeDate extends ReqIFDataType {
  constructor(
    identifier: string,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.DATE, longName, lastChange, desc);
  }
}

/**
 * Represents an enumeration value in a ReqIF enumeration data type.
 */
export interface ReqIFEnumValue {
  key: number;
  otherContent?: string;
  longName?: string;
  lastChange?: string;
  identifier: string;
}

/**
 * Represents an enumeration data type in ReqIF.
 */
export class ReqIFDataTypeEnum extends ReqIFDataType {
  constructor(
    identifier: string,
    public values: ReqIFEnumValue[] = [],
    public multiValued: boolean = false,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(
      identifier,
      ReqIFDataTypeKind.ENUMERATION,
      longName,
      lastChange,
      desc,
    );
  }
}

/**
 * Represents an integer data type in ReqIF.
 */
export class ReqIFDataTypeInteger extends ReqIFDataType {
  constructor(
    identifier: string,
    public min?: number,
    public max?: number,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.INTEGER, longName, lastChange, desc);
  }
}

/**
 * Represents a real (floating-point) data type in ReqIF.
 */
export class ReqIFDataTypeReal extends ReqIFDataType {
  constructor(
    identifier: string,
    public min?: number,
    public max?: number,
    public accuracy?: number,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.REAL, longName, lastChange, desc);
  }
}

/**
 * Represents a string data type in ReqIF.
 */
export class ReqIFDataTypeString extends ReqIFDataType {
  constructor(
    identifier: string,
    public maxLength?: number,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.STRING, longName, lastChange, desc);
  }
}

/**
 * Represents an XHTML data type in ReqIF.
 */
export class ReqIFDataTypeXHTML extends ReqIFDataType {
  constructor(
    identifier: string,
    longName?: string,
    lastChange?: string,
    desc?: string,
  ) {
    super(identifier, ReqIFDataTypeKind.XHTML, longName, lastChange, desc);
  }
}

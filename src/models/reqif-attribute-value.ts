import { ReqIFAttributeValueKind } from "./reqif-types";

/**
 * Base interface for all attribute values.
 */
export interface ReqIFAttributeValue {
  /**
   * The kind of attribute value
   */
  readonly kind: ReqIFAttributeValueKind;

  /**
   * The reference to the attribute definition
   */
  readonly definitionRef: string;
}

/**
 * String attribute value.
 */
export class ReqIFAttributeValueString implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.STRING;

  constructor(
    public readonly definitionRef: string,
    public readonly value: string | null = null,
  ) {}
}

/**
 * Integer attribute value.
 */
export class ReqIFAttributeValueInteger implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.INTEGER;

  constructor(
    public readonly definitionRef: string,
    public readonly value: number | null = null,
  ) {}
}

/**
 * Real attribute value.
 */
export class ReqIFAttributeValueReal implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.REAL;

  constructor(
    public readonly definitionRef: string,
    public readonly value: number | null = null,
  ) {}
}

/**
 * Boolean attribute value.
 */
export class ReqIFAttributeValueBoolean implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.BOOLEAN;

  constructor(
    public readonly definitionRef: string,
    public readonly value: boolean | null = null,
  ) {}
}

/**
 * Date attribute value.
 */
export class ReqIFAttributeValueDate implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.DATE;

  constructor(
    public readonly definitionRef: string,
    public readonly value: string | null = null,
  ) {}
}

/**
 * XHTML attribute value.
 */
export class ReqIFAttributeValueXHTML implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.XHTML;

  constructor(
    public readonly definitionRef: string,
    public readonly value: string | null = null,
    /**
     * The original XHTML content with namespace declarations
     */
    public readonly originalValue: string | null = null,
  ) {}
}

/**
 * Enumeration attribute value.
 */
export class ReqIFAttributeValueEnumeration implements ReqIFAttributeValue {
  readonly kind = ReqIFAttributeValueKind.ENUMERATION;

  constructor(
    public readonly definitionRef: string,
    public readonly values: string[] = [],
  ) {}
}

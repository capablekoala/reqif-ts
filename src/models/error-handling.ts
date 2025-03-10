/**
 * Custom error class for ReqIF parsing errors.
 */
export class ReqIFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReqIFError';
    
    // This part is needed in TypeScript to maintain the prototype chain
    Object.setPrototypeOf(this, ReqIFError.prototype);
  }
}

/**
 * Error thrown when a ReqIF validation fails.
 */
export class ReqIFValidationError extends ReqIFError {
  constructor(message: string) {
    super(message);
    this.name = 'ReqIFValidationError';
    
    Object.setPrototypeOf(this, ReqIFValidationError.prototype);
  }
}

/**
 * Error thrown when a ReqIF schema validation fails.
 */
export class ReqIFSchemaError extends ReqIFError {
  constructor(message: string) {
    super(message);
    this.name = 'ReqIFSchemaError';
    
    Object.setPrototypeOf(this, ReqIFSchemaError.prototype);
  }
}
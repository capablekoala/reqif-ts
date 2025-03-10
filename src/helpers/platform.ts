/**
 * Helper functions for detecting and handling platform differences.
 */

/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Check if the code is running in a Node.js environment.
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Get a platform-specific implementation of a feature.
 * 
 * @param browserImpl The browser implementation
 * @param nodeImpl The Node.js implementation
 * @returns The appropriate implementation for the current platform
 */
export function getPlatformImpl<T>(browserImpl: T, nodeImpl: T): T {
  return isBrowser() ? browserImpl : nodeImpl;
}

/**
 * A mapping of platform-specific implementations.
 */
export interface PlatformImplementations<T> {
  browser: T;
  node: T;
}

/**
 * Get the appropriate implementation for the current platform.
 * 
 * @param implementations Object with browser and node implementations
 * @returns The appropriate implementation for the current platform
 */
export function getImplementation<T>(implementations: PlatformImplementations<T>): T {
  return isBrowser() ? implementations.browser : implementations.node;
}
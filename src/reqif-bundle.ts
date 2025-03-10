import { ReqIFCoreContent } from './models/reqif-core-content';
import { ReqIFSpecHierarchy } from './models/reqif-spec-hierarchy';
import { ReqIFSpecification } from './models/reqif-specification';
import { ObjectLookup } from './object-lookup';

/**
 * Main container for parsed ReqIF content.
 * Provides access to all ReqIF objects and utilities for traversing them.
 */
export class ReqIFBundle {
  constructor(
    public coreContent: ReqIFCoreContent,
    public objectLookup: ObjectLookup
  ) {}

  /**
   * Iterates through the specification hierarchy of a given specification.
   * Uses depth-first traversal to visit all nodes in the hierarchy.
   * The level property represents the depth in the hierarchy (0-based).
   * 
   * Note: The traversal handles duplicate identifiers in different positions
   * by using both the identifier and the reference to the object in the visited set.
   */
  *iterateSpecificationHierarchy(specification: ReqIFSpecification): Generator<ReqIFSpecHierarchy> {
    if (!specification.children) {
      return;
    }

    // Use depth-first traversal to visit all nodes in the hierarchy
    // Start with level 0 for top-level elements
    for (const child of specification.children) {
      // Set the level to 0 for top-level items
      child.level = 0;
      yield child;
      
      // Continue to children (if any)
      if (child.children && child.children.length > 0) {
        yield* this.iterateChildren(child, 1); // Next level is 1
      }
    }
  }

  /**
   * Helper method to recursively iterate through children of a hierarchy element.
   * @param hierarchy The current hierarchy element
   * @param level The current level in the hierarchy (depth)
   */
  private *iterateChildren(
    hierarchy: ReqIFSpecHierarchy, 
    level: number
  ): Generator<ReqIFSpecHierarchy> {
    if (!hierarchy.children || hierarchy.children.length === 0) {
      return;
    }

    for (const child of hierarchy.children) {
      // Set the level property before yielding
      child.level = level;
      yield child;
      
      // Continue recursion with next level (if the child has children)
      if (child.children && child.children.length > 0) {
        yield* this.iterateChildren(child, level + 1);
      }
    }
  }
}
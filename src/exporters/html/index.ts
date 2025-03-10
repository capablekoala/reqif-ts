/**
 * HTML Exporter for ReqIF content.
 * Provides functionality to export ReqIF specifications to HTML format.
 */

import { ReqIFBundle } from '../../reqif-bundle';
import { ReqIFSpecification } from '../../models/reqif-specification';
import { ReqIFSpecHierarchy } from '../../models/reqif-spec-hierarchy';
import { ReqIFSpecObject } from '../../models/reqif-spec-object';
import { ReqIFAttributeValueKind } from '../../models/reqif-types';
import { createFileSystem } from '../../helpers/fs-adapter';

/**
 * HTML export options
 */
export interface HTMLExportOptions {
  /** Include CSS styling in the HTML */
  includeStyle?: boolean;
  /** Include JavaScript for interactivity */
  includeScript?: boolean;
  /** Include header and footer sections */
  includeHeaderFooter?: boolean;
  /** Format of the output (pretty or compact) */
  format?: 'pretty' | 'compact';
  /** Title for the HTML document */
  title?: string;
  /** Include attribute metadata */
  includeMetadata?: boolean;
}

/**
 * Default HTML export options
 */
const DEFAULT_OPTIONS: HTMLExportOptions = {
  includeStyle: true,
  includeScript: true,
  includeHeaderFooter: true,
  format: 'pretty',
  title: 'ReqIF Export',
  includeMetadata: true,
};

/**
 * HTML Exporter for ReqIF content
 */
export class HTMLExporter {
  /**
   * Export a ReqIF bundle to HTML format
   * @param bundle The ReqIF bundle to export
   * @param options Export options
   * @returns HTML string content
   */
  static export(bundle: ReqIFBundle, options: HTMLExportOptions = {}): string {
    // Merge with default options
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // Start building HTML
    let html = '';
    
    // Add HTML header
    if (opts.includeHeaderFooter) {
      html += this.generateHTMLHeader(opts);
    }
    
    // Add document container
    html += '<div class="reqif-document">';
    
    // Add title
    html += `<h1 class="reqif-title">${opts.title}</h1>`;
    
    // Add specifications
    const specs = bundle.coreContent.reqIfContent.specifications;
    for (const spec of specs) {
      html += this.generateSpecificationHTML(bundle, spec, opts);
    }
    
    // Close document container
    html += '</div>';
    
    // Add HTML footer
    if (opts.includeHeaderFooter) {
      html += this.generateHTMLFooter(opts);
    }
    
    return html;
  }
  
  /**
   * Export a ReqIF bundle to an HTML file
   * @param bundle The ReqIF bundle to export
   * @param filePath The file path to save the HTML
   * @param options Export options
   */
  static async exportToFile(bundle: ReqIFBundle, filePath: string, options: HTMLExportOptions = {}): Promise<void> {
    const html = this.export(bundle, options);
    const fs = createFileSystem();
    await fs.writeFile(filePath, html);
  }
  
  /**
   * Generate HTML for a specification
   * @param bundle The ReqIF bundle
   * @param spec The specification
   * @param options Export options
   * @returns HTML string
   */
  private static generateSpecificationHTML(bundle: ReqIFBundle, spec: ReqIFSpecification, options: HTMLExportOptions): string {
    let html = '';
    
    // Start specification section
    html += '<section class="specification">';
    
    // Add specification header
    html += `<div class="specification-header">
      <h2 class="specification-title">${spec.longName || spec.identifier}</h2>
    </div>`;
    
    // Add specification metadata if requested
    if (options.includeMetadata) {
      html += `<div class="specification-metadata">
        <dl>
          <dt>Identifier</dt>
          <dd>${spec.identifier}</dd>
          ${spec.lastChange ? `<dt>Last Change</dt><dd>${spec.lastChange}</dd>` : ''}
          ${spec.desc ? `<dt>Description</dt><dd>${spec.desc}</dd>` : ''}
        </dl>
      </div>`;
    }
    
    // Add specification content - hierarchy of requirements
    html += '<div class="specification-content">';
    
    // Create a table for requirements
    html += '<table class="requirements-table">';
    html += `<thead>
      <tr>
        <th>ID</th>
        <th>Requirement</th>
        ${options.includeMetadata ? '<th>Metadata</th>' : ''}
      </tr>
    </thead>`;
    
    // Table body
    html += '<tbody>';
    
    // Add requirements from hierarchy
    if (spec.children && spec.children.length > 0) {
      for (const hierarchy of bundle.iterateSpecificationHierarchy(spec)) {
        html += this.generateHierarchyHTML(bundle, hierarchy, options);
      }
    } else {
      html += '<tr><td colspan="3">No requirements found</td></tr>';
    }
    
    html += '</tbody></table>';
    html += '</div>'; // Close specification-content
    
    // End specification section
    html += '</section>';
    
    return html;
  }
  
  /**
   * Generate HTML for a hierarchy element
   * @param bundle The ReqIF bundle
   * @param hierarchy The hierarchy element
   * @param options Export options
   * @returns HTML string
   */
  private static generateHierarchyHTML(bundle: ReqIFBundle, hierarchy: ReqIFSpecHierarchy, options: HTMLExportOptions): string {
    if (!hierarchy.specObjectRef) {
      return '';
    }
    
    // Get the spec object
    const specObject = bundle.objectLookup.getSpecObject(hierarchy.specObjectRef);
    if (!specObject) {
      return '';
    }
    
    // Generate HTML for the spec object
    return this.generateSpecObjectHTML(bundle, specObject, hierarchy, options);
  }
  
  /**
   * Generate HTML for a spec object
   * @param bundle The ReqIF bundle
   * @param specObject The spec object
   * @param hierarchy The hierarchy element containing the spec object
   * @param options Export options
   * @returns HTML string
   */
  private static generateSpecObjectHTML(bundle: ReqIFBundle, specObject: ReqIFSpecObject, hierarchy: ReqIFSpecHierarchy, options: HTMLExportOptions): string {
    // Calculate indentation based on hierarchy level
    const indentClass = hierarchy.level ? `indent-level-${hierarchy.level}` : '';
    
    // Start table row
    let html = `<tr class="requirement ${indentClass}">`;
    
    // ID column
    html += `<td class="requirement-id">${specObject.identifier}</td>`;
    
    // Content column - look for the primary content attribute (usually XHTML content)
    let contentHTML = '';
    let foundContent = false;
    
    for (const attrValue of specObject.attributeValues) {
      if (attrValue.kind === ReqIFAttributeValueKind.XHTML) {
        const xhtmlValue = attrValue as any; // Type assertion
        if (xhtmlValue.value) {
          contentHTML = xhtmlValue.value;
          foundContent = true;
          break;
        }
      } else if (attrValue.kind === ReqIFAttributeValueKind.STRING && !foundContent) {
        const stringValue = attrValue as any; // Type assertion
        if (stringValue.value) {
          contentHTML = `<p>${stringValue.value}</p>`;
          foundContent = true;
          // Don't break here, continue looking for XHTML content
        }
      }
    }
    
    // If no content was found, use the long name or identifier
    if (!foundContent) {
      contentHTML = `<p>${specObject.longName || specObject.identifier}</p>`;
    }
    
    // Add content column
    html += `<td class="requirement-content">${contentHTML}</td>`;
    
    // Add metadata column if requested
    if (options.includeMetadata) {
      html += '<td class="requirement-metadata">';
      html += '<div class="metadata-details">';
      
      // Add type information
      if (specObject.typeRef) {
        const type = bundle.objectLookup.getSpecObjectType(specObject.typeRef);
        if (type) {
          html += `<div class="metadata-item"><b>Type:</b> ${type.longName || type.identifier}</div>`;
        }
      }
      
      // Add other attributes excluding the content attribute
      for (const attrValue of specObject.attributeValues) {
        // Skip the content attribute we already displayed
        if (attrValue.kind === ReqIFAttributeValueKind.XHTML && foundContent) {
          continue;
        }
        
        // Get attribute definition name if possible
        let attrName = attrValue.definitionRef;
        
        // Format the value based on its type
        let attrValueHtml = '';
        
        switch (attrValue.kind) {
          case ReqIFAttributeValueKind.STRING:
          case ReqIFAttributeValueKind.INTEGER:
          case ReqIFAttributeValueKind.REAL:
          case ReqIFAttributeValueKind.BOOLEAN:
          case ReqIFAttributeValueKind.DATE:
            const value = (attrValue as any).value;
            attrValueHtml = value !== null ? String(value) : '';
            break;
          
          case ReqIFAttributeValueKind.ENUMERATION:
            const values = (attrValue as any).values;
            attrValueHtml = values.join(', ');
            break;
          
          case ReqIFAttributeValueKind.XHTML:
            attrValueHtml = '(XHTML content)';
            break;
        }
        
        html += `<div class="metadata-item"><b>${attrName}:</b> ${attrValueHtml}</div>`;
      }
      
      html += '</div>'; // Close metadata-details
      html += '</td>';
    }
    
    // End table row
    html += '</tr>';
    
    return html;
  }
  
  /**
   * Generate HTML header
   * @param options Export options
   * @returns HTML header string
   */
  private static generateHTMLHeader(options: HTMLExportOptions): string {
    let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
    html += `  <meta charset="UTF-8">\n`;
    html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    html += `  <title>${options.title}</title>\n`;
    
    // Add CSS if requested
    if (options.includeStyle) {
      html += `  <style>\n${this.getDefaultCSS()}\n  </style>\n`;
    }
    
    // Add JavaScript if requested
    if (options.includeScript) {
      html += `  <script>\n${this.getDefaultScript()}\n  </script>\n`;
    }
    
    html += '</head>\n<body>\n';
    return html;
  }
  
  /**
   * Generate HTML footer
   * @param options Export options
   * @returns HTML footer string
   */
  private static generateHTMLFooter(options: HTMLExportOptions): string {
    return '\n</body>\n</html>';
  }
  
  /**
   * Get default CSS styling
   * @returns CSS string
   */
  private static getDefaultCSS(): string {
    return `
    /* ReqIF HTML Export Default Styling */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
      background-color: #f9f9f9;
    }
    
    .reqif-document {
      max-width: 1200px;
      margin: 0 auto;
      background-color: #fff;
      padding: 2em;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .reqif-title {
      font-size: 2em;
      margin-bottom: 1em;
      text-align: center;
      color: #2c3e50;
    }
    
    .specification {
      margin-bottom: 3em;
    }
    
    .specification-header {
      margin-bottom: 1em;
    }
    
    .specification-title {
      font-size: 1.5em;
      color: #3498db;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5em;
    }
    
    .specification-metadata {
      background-color: #f8f9fa;
      padding: 1em;
      margin-bottom: 1em;
      border-radius: 4px;
    }
    
    .specification-metadata dl {
      display: grid;
      grid-template-columns: max-content auto;
      gap: 0.5em 1em;
    }
    
    .specification-metadata dt {
      font-weight: bold;
      color: #555;
    }
    
    .requirements-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2em;
    }
    
    .requirements-table th, 
    .requirements-table td {
      padding: 0.75em;
      border: 1px solid #ddd;
      text-align: left;
      vertical-align: top;
    }
    
    .requirements-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    
    .requirements-table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    .requirements-table tr:hover {
      background-color: #f5f5f5;
    }
    
    .requirement-id {
      width: 120px;
      word-break: break-all;
      font-family: monospace;
    }
    
    .requirement-content {
      /* Allow content to expand */
    }
    
    .requirement-metadata {
      width: 200px;
      font-size: 0.9em;
    }
    
    .metadata-item {
      margin-bottom: 0.5em;
    }
    
    /* Indentation levels for hierarchy */
    .indent-level-1 td:first-child {
      padding-left: 2em;
    }
    .indent-level-2 td:first-child {
      padding-left: 4em;
    }
    .indent-level-3 td:first-child {
      padding-left: 6em;
    }
    .indent-level-4 td:first-child {
      padding-left: 8em;
    }
    .indent-level-5 td:first-child {
      padding-left: 10em;
    }
    
    /* XHTML content styling */
    .requirement-content table {
      border-collapse: collapse;
      margin: 1em 0;
    }
    
    .requirement-content th, 
    .requirement-content td {
      border: 1px solid #ddd;
      padding: 0.5em;
    }
    
    .requirement-content img {
      max-width: 100%;
    }
    
    .requirement-content pre {
      background-color: #f5f5f5;
      padding: 0.5em;
      border-radius: 4px;
      overflow-x: auto;
    }
    
    @media print {
      body {
        padding: 0;
        background-color: #fff;
      }
      
      .reqif-document {
        box-shadow: none;
        max-width: none;
        padding: 0;
      }
      
      .requirements-table {
        page-break-inside: avoid;
      }
      
      .requirement {
        page-break-inside: avoid;
      }
    }
    `;
  }
  
  /**
   * Get default JavaScript for interactivity
   * @returns JavaScript string
   */
  private static getDefaultScript(): string {
    return `
    // ReqIF HTML Export Default JavaScript
    document.addEventListener('DOMContentLoaded', function() {
      // Add functionality to expand/collapse sections if needed
      // Add filtering capabilities if needed
      
      // Example: Make metadata sections expandable
      const metadataItems = document.querySelectorAll('.requirement-metadata');
      metadataItems.forEach(function(item) {
        const detailsDiv = item.querySelector('.metadata-details');
        if (detailsDiv) {
          // Create toggle element
          const toggle = document.createElement('div');
          toggle.className = 'metadata-toggle';
          toggle.textContent = 'Show metadata';
          toggle.style.cursor = 'pointer';
          toggle.style.color = '#3498db';
          toggle.style.fontWeight = 'bold';
          toggle.style.marginBottom = '0.5em';
          
          // Hide details by default
          detailsDiv.style.display = 'none';
          
          // Add toggle functionality
          toggle.addEventListener('click', function() {
            if (detailsDiv.style.display === 'none') {
              detailsDiv.style.display = 'block';
              toggle.textContent = 'Hide metadata';
            } else {
              detailsDiv.style.display = 'none';
              toggle.textContent = 'Show metadata';
            }
          });
          
          // Insert toggle before details
          item.insertBefore(toggle, detailsDiv);
        }
      });
    });
    `;
  }
}

/**
 * Convenience function to export a ReqIF bundle to HTML
 * @param bundle The ReqIF bundle to export
 * @param options Export options
 * @returns HTML string
 */
export function exportToHTML(bundle: ReqIFBundle, options: HTMLExportOptions = {}): string {
  return HTMLExporter.export(bundle, options);
}

/**
 * Convenience function to export a ReqIF bundle to an HTML file
 * @param bundle The ReqIF bundle to export
 * @param filePath The file path to save the HTML
 * @param options Export options
 */
export async function exportToHTMLFile(bundle: ReqIFBundle, filePath: string, options: HTMLExportOptions = {}): Promise<void> {
  return HTMLExporter.exportToFile(bundle, filePath, options);
}
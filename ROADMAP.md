# ReqIF-TS Library Roadmap

This document outlines the planned features and improvements for the ReqIF-TS library.

## 1. Implement Excel Native Format Exporter

### Overview
Create a proper Excel exporter that produces native .xlsx files instead of CSV files that Excel can import.

### Implementation Details
- Add ExcelJS as a dependency: `yarn add exceljs`
- Create a new exporter module in `/src/exporters/excel/index.ts`
- Implement the ExcelExporter class with similar structure to the existing CSV and HTML exporters
- Create proper worksheet formatting, including:
  - Header styling (bold, background color)
  - Cell formatting based on data types (dates, numbers, text)
  - Auto-column width
  - Freezing the header row
  - Multiple worksheets (one per specification)
  - Hierarchical indentation or outline levels
  - Formula support for derived fields

### Integration
- Update the `/src/exporters/index.ts` file to use the native Excel exporter
- Update the CLI command in `/src/commands/export/index.ts` to handle Excel-specific options
- Add Excel-specific options such as:
  - Worksheet naming
  - Formula generation
  - Cell styling options
  - Image handling for XHTML content with embedded images

## 2. Enhance HTML Export with Interactive Features

### Overview
Improve the HTML exporter to provide more interactivity and better visualization of requirements.

### Implementation Details
- Expand JavaScript functionality in the HTML exporter:
  - Add filtering capabilities (by type, ID, content)
  - Implement sorting options
  - Add collapsible sections for hierarchical requirements
  - Implement search functionality
  - Add highlighting for search results
- Improve visualization:
  - Add expandable images/diagrams
  - Create a table of contents with navigation
  - Implement customizable themes/styling
  - Add print-friendly views
  - Support for exporting to PDF from the HTML
- Add support for custom templates:
  - Allow users to provide their own HTML templates
  - Support placeholders for dynamic content

## 3. Improve CSV/Excel Export with Better Field Mapping

### Overview
Enhance the CSV and Excel exporters with improved field mapping and customization options.

### Implementation Details
- Implement customizable field mapping:
  - Allow users to specify which attributes map to which columns
  - Support renaming fields for export
  - Add support for computed/derived fields
- Add transformation capabilities:
  - Format conversion for dates, numbers, etc.
  - Custom formatters for specific field types
  - Value normalization options
- Improve XHTML content handling:
  - Better text extraction from XHTML
  - Option to preserve formatting in Excel
  - Extract images from XHTML content

## 4. Add Comprehensive Test Coverage for Exporters

### Overview
Increase test coverage for all exporters to ensure reliability and consistency.

### Implementation Details
- Create unit tests for each exporter:
  - Test core functionality of HTML, CSV, and Excel exporters
  - Test edge cases (empty data, large files, special characters)
  - Test internationalization support (UTF-8, right-to-left languages)
- Implement integration tests:
  - End-to-end tests for the export command
  - Tests with real ReqIF files of various complexity
  - Validation of output files against expected content
- Add performance tests:
  - Benchmark exporters with large files
  - Memory usage monitoring
  - Optimization opportunities

### Testing Tools
- Use Jest for unit tests
- Create test fixtures with different ReqIF content types
- Add validation utilities to verify export output

## 5. Implement ReqIFZ (Zipped ReqIF) Support

### Overview
Add support for ReqIFZ format, which is a zipped collection of ReqIF files often containing attachments.

### Implementation Details
- Create a ReqIFZ parser:
  - Extract and parse the main ReqIF file
  - Handle embedded files and attachments
  - Support for XHTML with referenced images
- Implement ReqIFZ creation:
  - Create a utility to package ReqIF with attachments
  - Handle file references in XHTML content
- Add CLI support:
  - Commands to unpack and pack ReqIFZ files
  - Options to extract specific attachments

### Integration
- Update the main parser to detect and handle ReqIFZ files
- Add ReqIFZ-specific options to export commands
- Ensure exporters can handle embedded resources

## 6. Complete Anonymization Functionality

### Overview
Enhance the anonymization feature to safely remove or obfuscate sensitive information from ReqIF files.

### Implementation Details
- Implement configurable anonymization:
  - Allow users to specify what gets anonymized
  - Support different anonymization strategies (hashing, replacement, etc.)
  - Preserve references and relationships when anonymizing
- Add support for selective anonymization:
  - Anonymize specific attribute types
  - Keep structure while anonymizing content
  - Preserve certain patterns or parts
- Create detailed reporting:
  - Generate a mapping file for anonymized elements
  - Provide statistics on anonymized content

### Integration
- Complete the implementation in `/src/commands/anonymize/index.ts`
- Add more options to the CLI command
- Create unit tests for anonymization functionality

## Priority and Timeline

### Phase 1 (High Priority)
1. Native Excel Export - Delivers immediate value for users needing proper Excel exports
2. Comprehensive Test Coverage - Ensures reliability of existing and new features

### Phase 2 (Medium Priority)
3. Improved Field Mapping - Enhances flexibility of existing exporters
4. Enhanced HTML Export - Improves usability of HTML exports

### Phase 3 (Lower Priority)
5. ReqIFZ Support - Adds support for a less common but important format
6. Complete Anonymization - Finishes a partially implemented feature

## Technical Considerations

- Maintain browser compatibility for all features
- Ensure all new code has proper TypeScript typings
- Keep the library size manageable (consider making some dependencies optional)
- Document all new features in README.md and with JSDoc comments
- Follow existing code style and architecture patterns
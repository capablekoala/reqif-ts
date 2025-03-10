# ReqIF-TS

A TypeScript implementation of the Requirements Interchange Format (ReqIF) standard, providing parsing, validation, and manipulation capabilities for ReqIF documents.

## Acknowledgment

This project is a TypeScript port of the [reqif](https://github.com/strictdoc-project/reqif) Python library developed by Stanislav Pankevich and contributors. The original project served as the foundation and specification for this TypeScript implementation. We maintain compatibility with the original project's file formats and test cases.

## Features

- Parse and generate ReqIF/ReqIFz documents
- Validate ReqIF files against the schema
- Format and pretty-print ReqIF files
- Anonymize ReqIF documents
- Works in both Node.js and browser environments

## Installation

```bash
yarn add reqif-ts
```

## Usage

### Node.js

```typescript
import { parse, unparse, ReqIFBundle } from 'reqif-ts';

// Parse ReqIF file
const reqifBundle = await parse('path/to/file.reqif');

// Access specifications
for (const specification of reqifBundle.coreContent.reqIfContent.specifications) {
  console.log(specification.longName);
  
  // Iterate through hierarchy
  for (const hierarchy of reqifBundle.iterateSpecificationHierarchy(specification)) {
    console.log(hierarchy);
  }
}

// Generate ReqIF output
const reqifOutput = unparse(reqifBundle);
```

### Browser

```html
<script src="https://unpkg.com/reqif-ts/dist/browser/index.js"></script>
<script>
  async function processReqIF() {
    const fileInput = document.getElementById('reqifFile');
    const file = fileInput.files[0];
    
    // Parse file content
    const text = await file.text();
    const reqifBundle = ReqIF.parse(text);
    
    // Process the bundle...
    
    // Generate output
    const output = ReqIF.unparse(reqifBundle);
    
    // Save or display output
    const blob = new Blob([output], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.reqif';
    a.click();
  }
</script>
```

### CLI Usage

```bash
# Install globally
yarn global add reqif-ts

# Validate a ReqIF file
reqif-ts validate sample.reqif

# Format a ReqIF file
reqif-ts format input.reqif output.reqif

# Anonymize a ReqIF file
reqif-ts anonymize input.reqif anonymized.reqif
```

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/reqif-ts.git
cd reqif-ts

# Install dependencies
yarn install

# Build the project
yarn build

# Run tests
yarn test

# Run integration tests
yarn test:integration
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
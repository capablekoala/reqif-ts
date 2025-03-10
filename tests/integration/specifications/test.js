const { parse, unparse } = require('../../../dist/cjs/index');

// Parse a ReqIF file with specifications and hierarchies
const filePath = __dirname + '/test.reqif';
const outputFilePath = __dirname + '/output.reqif';

async function testSpecifications() {
  try {
    console.log(`Parsing file: ${filePath}`);
    const reqifBundle = await parse(filePath);
    
    console.log('Successfully parsed ReqIF file');
    console.log(`Header identifier: ${reqifBundle.coreContent.reqIfHeader.identifier}`);
    console.log(`Data types: ${reqifBundle.coreContent.reqIfContent.dataTypes.length}`);
    console.log(`Specifications: ${reqifBundle.coreContent.reqIfContent.specifications.length}`);
    
    // Iterate over specifications and their hierarchies
    for (const spec of reqifBundle.coreContent.reqIfContent.specifications) {
      console.log(`\nSpecification: ${spec.identifier}`);
      console.log(`  Type: ${spec.typeRef}`);
      console.log(`  Children: ${spec.children.length}`);
      
      // Print the raw hierarchy structure
      console.log('\nRaw Hierarchy Structure:');
      const printHierarchy = (hierarchies, indent = '') => {
        for (const h of hierarchies) {
          console.log(`${indent}Hierarchy: ${h.identifier}, Object: ${h.specObjectRef}`);
          if (h.children && h.children.length > 0) {
            printHierarchy(h.children, indent + '  ');
          }
        }
      };
      
      printHierarchy(spec.children);
      
      // Iterate through hierarchy
      console.log('\nTraversal Result:');
      const visited = new Set();
      for (const hierarchy of reqifBundle.iterateSpecificationHierarchy(spec)) {
        const status = visited.has(hierarchy.identifier) ? 'DUPLICATE' : 'OK';
        visited.add(hierarchy.identifier);
        console.log(`  Hierarchy: ${hierarchy.identifier} (Level: ${hierarchy.level}) - ${status}`);
        console.log(`    Object: ${hierarchy.specObjectRef}`);
      }
    }
    
    // Unparse back to ReqIF
    console.log(`\nUnparsing to: ${outputFilePath}`);
    const reqifXml = unparse(reqifBundle);
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync(outputFilePath, reqifXml);
    
    console.log('Test completed successfully');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

testSpecifications()
  .then(success => process.exit(success ? 0 : 1));

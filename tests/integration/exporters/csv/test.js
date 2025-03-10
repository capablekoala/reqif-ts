const { parse } = require('../../../../dist/cjs/parser');
const { exportToCSVFile } = require('../../../../dist/cjs/exporters');
const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFile = path.join(__dirname, '../../specifications/test.reqif');
const outputFile = path.join(__dirname, 'output.csv');

async function testCSVExport() {
  try {
    console.log(`Parsing ReqIF file: ${inputFile}`);
    const reqifBundle = await parse(inputFile);
    
    console.log('Successfully parsed ReqIF file');
    console.log(`Specifications: ${reqifBundle.coreContent.reqIfContent.specifications.length}`);
    
    // Export to CSV
    console.log(`Exporting to CSV: ${outputFile}`);
    await exportToCSVFile(reqifBundle, outputFile, {
      includeHeader: true,
      includeHierarchy: true,
      extractText: true
    });
    
    // Verify the output file exists
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      console.log(`CSV file created successfully (${stats.size} bytes)`);
      
      // Read the first few lines to verify content
      const content = fs.readFileSync(outputFile, 'utf8').slice(0, 200);
      console.log('CSV file preview:');
      console.log(content + '...');
      
      console.log('Test completed successfully');
      return true;
    } else {
      console.error('CSV file was not created');
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Run the test
testCSVExport()
  .then(success => process.exit(success ? 0 : 1));
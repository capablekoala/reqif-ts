const { parse } = require('../../../../dist/cjs/parser');
const { exportToHTMLFile } = require('../../../../dist/cjs/exporters');
const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFile = path.join(__dirname, '../../specifications/test.reqif');
const outputFile = path.join(__dirname, 'output.html');

async function testHTMLExport() {
  try {
    console.log(`Parsing ReqIF file: ${inputFile}`);
    const reqifBundle = await parse(inputFile);
    
    console.log('Successfully parsed ReqIF file');
    console.log(`Specifications: ${reqifBundle.coreContent.reqIfContent.specifications.length}`);
    
    // Export to HTML
    console.log(`Exporting to HTML: ${outputFile}`);
    await exportToHTMLFile(reqifBundle, outputFile, {
      title: 'ReqIF HTML Export Test',
      includeMetadata: true
    });
    
    // Verify the output file exists
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      console.log(`HTML file created successfully (${stats.size} bytes)`);
      
      // Read the first few lines to verify content
      const content = fs.readFileSync(outputFile, 'utf8').slice(0, 200);
      console.log('HTML file preview:');
      console.log(content + '...');
      
      console.log('Test completed successfully');
      return true;
    } else {
      console.error('HTML file was not created');
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Run the test
testHTMLExport()
  .then(success => process.exit(success ? 0 : 1));
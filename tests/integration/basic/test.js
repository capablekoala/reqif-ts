const { parse } = require('../../../dist/cjs/parser');

// Parse a simple ReqIF file
const filePath = __dirname + '/../commands/passthrough/01_basic_example/sample.reqif';

async function testBasicParsing() {
  try {
    console.log(`Parsing file: ${filePath}`);
    const reqifBundle = await parse(filePath);
    
    console.log('Successfully parsed ReqIF file');
    console.log(`Header identifier: ${reqifBundle.coreContent.reqIfHeader.identifier}`);
    console.log(`Data types: ${reqifBundle.coreContent.reqIfContent.dataTypes.length}`);
    console.log(`Spec objects: ${reqifBundle.coreContent.reqIfContent.specObjects.length}`);

    return true;
  } catch (error) {
    console.error('Error parsing ReqIF file:', error);
    return false;
  }
}

testBasicParsing()
  .then(success => process.exit(success ? 0 : 1));

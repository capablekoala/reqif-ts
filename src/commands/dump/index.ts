import { parse } from '../../parser';
import { createFileSystem } from '../../helpers/fs-adapter';

/**
 * Command handler for the 'dump' command.
 * Dumps the content of a ReqIF file to HTML format.
 */
export async function dumpCommand(inputFile: string, outputFile: string): Promise<void> {
  try {
    console.log(`Dumping ReqIF file to HTML: ${inputFile}`);
    
    // Parse the input file
    const reqifBundle = await parse(inputFile);
    
    // Generate a simple HTML representation
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ReqIF Dump</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .section { margin-bottom: 20px; }
    .item { margin: 10px 0; padding: 5px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>ReqIF Document Dump</h1>
  
  <div class="section">
    <h2>Header</h2>
    <div class="item">
      <p><strong>Identifier:</strong> ${reqifBundle.coreContent.reqIfHeader.identifier}</p>
      <p><strong>Creation Time:</strong> ${reqifBundle.coreContent.reqIfHeader.creationTime}</p>
      ${reqifBundle.coreContent.reqIfHeader.title ? `<p><strong>Title:</strong> ${reqifBundle.coreContent.reqIfHeader.title}</p>` : ''}
      ${reqifBundle.coreContent.reqIfHeader.comment ? `<p><strong>Comment:</strong> ${reqifBundle.coreContent.reqIfHeader.comment}</p>` : ''}
    </div>
  </div>
  
  <div class="section">
    <h2>Data Types</h2>
    ${reqifBundle.coreContent.reqIfContent.dataTypes.length === 0 ? 
      '<p>No data types defined.</p>' : 
      reqifBundle.coreContent.reqIfContent.dataTypes.map((dataType: any) => `
        <div class="item">
          <p><strong>Type:</strong> ${dataType.kind}</p>
          <p><strong>Identifier:</strong> ${dataType.identifier}</p>
          ${dataType.longName ? `<p><strong>Long Name:</strong> ${dataType.longName}</p>` : ''}
        </div>
      `).join('')
    }
  </div>
  
  <div class="section">
    <h2>Specifications</h2>
    ${reqifBundle.coreContent.reqIfContent.specifications.length === 0 ? 
      '<p>No specifications defined.</p>' : 
      '<p>Specifications exist but are not fully displayed in this version.</p>'
    }
  </div>
  
  <div class="section">
    <h2>Spec Objects</h2>
    ${reqifBundle.coreContent.reqIfContent.specObjects.length === 0 ? 
      '<p>No spec objects defined.</p>' : 
      '<p>Spec objects exist but are not fully displayed in this version.</p>'
    }
  </div>
</body>
</html>`;
    
    // Write to output file
    const fs = createFileSystem();
    await fs.writeFile(outputFile, html);
    
    console.log(`HTML dump written to: ${outputFile}`);
  } catch (error) {
    console.error('Error during dump:', error);
    process.exit(1);
  }
}
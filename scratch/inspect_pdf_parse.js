const { PDFParse } = require('pdf-parse');

async function run() {
  // Let's create a minimal PDF buffer or see if we can instantiate it
  try {
    const parser = new PDFParse({ data: Buffer.from([]) });
    console.log("PDFParse instance created successfully");
    console.log("getText method:", typeof parser.getText);
    console.log("destroy method:", typeof parser.destroy);
  } catch (err) {
    console.log("Error creating instance:", err);
  }
}

run();

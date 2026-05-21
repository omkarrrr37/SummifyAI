const fetch = require('node-fetch');

async function test() {
  const res = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // We will need authentication, so this might fail unless we simulate it or inspect local logs.
    },
    body: JSON.stringify({
      prompt: "This is a test document to summarize.",
      option: "summary",
      length: "short"
    })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}

test().catch(console.error);

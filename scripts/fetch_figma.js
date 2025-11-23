const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const nodeId = '1159-12640'; // Encoding usually needed for IDs with ':', but '-' is fine.
const token = 'figd_KciMbTczUxReER16IFYrgGe25Nxs75sZ5DdLtHRd';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${nodeId}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': token
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      fs.writeFileSync('figma_node.json', data);
      console.log('Success: Data saved to figma_node.json');
    } else {
      console.error(`Error: ${res.statusCode} - ${data}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();


const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const token = 'figd_KciMbTczUxReER16IFYrgGe25Nxs75sZ5DdLtHRd';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': token
  }
};

console.log('Searching for nodes with specific text...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        const found = [];
        
        // Text to look for in the target layout
        const targetTexts = ['Документооборот', 'Штрихкоды', 'Остатки'];

        function search(node) {
            if (node.name && targetTexts.some(t => node.name.includes(t))) {
                 found.push({ id: node.id, name: node.name, type: node.type, parentId: node.parent ? node.parent.id : 'unknown' });
            }
            // Also check text characters if available (not always in file summary, usually need node details)
            // But frames often are named after their content or sections.
            
            if (node.children) {
                node.children.forEach(child => search(child));
            }
        }
        
        if (json.document) {
            search(json.document);
        }

        console.log('Found potential nodes:', found);
        fs.writeFileSync('found_text_nodes.json', JSON.stringify(found, null, 2));
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    } else {
      console.error(`Error: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();


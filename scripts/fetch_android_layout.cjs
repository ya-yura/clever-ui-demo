const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const token = 'figd_KciMbTczUxReER16IFYrgGe25Nxs75sZ5DdLtHRd';
const nodeId = '11547:229';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${nodeId}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': token
  }
};

console.log(`Fetching node ${nodeId}...`);

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      const node = json.nodes[nodeId] || json.nodes[nodeId.replace(':', '-')];
      
      if (node) {
        console.log('Node found:', node.document.name);
        fs.writeFileSync('android_layout.json', JSON.stringify(node.document, null, 2));
        
        // Analyze colors
        const colors = new Set();
        function traverse(n) {
            if (n.fills) {
                n.fills.forEach(fill => {
                    if (fill.type === 'SOLID' && fill.visible !== false) {
                        const { r, g, b, a } = fill.color;
                        const hex = '#' + [r, g, b].map(x => {
                            const hex = Math.round(x * 255).toString(16);
                            return hex.length === 1 ? '0' + hex : hex;
                        }).join('');
                        colors.add(hex);
                    }
                });
            }
            if (n.backgroundColor) {
                 const { r, g, b, a } = n.backgroundColor;
                 const hex = '#' + [r, g, b].map(x => {
                    const hex = Math.round(x * 255).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                colors.add(hex);
            }
            if (n.children) n.children.forEach(traverse);
        }
        traverse(node.document);
        console.log('Colors:', Array.from(colors));
      } else {
        console.error('Node not found in file.');
      }
    } else {
      console.error(`Error: ${res.statusCode}`);
    }
  });
});

req.end();


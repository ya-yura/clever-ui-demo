const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const token = 'figd_KciMbTczUxReER16IFYrgGe25Nxs75sZ5DdLtHRd';
const nodeId = '5583:45126'; // Colors Default (Light Theme)

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
      try {
        const json = JSON.parse(data);
        const nodeData = json.nodes[nodeId] || json.nodes[nodeId.replace(':', '-')];

        if (nodeData) {
             function rgbaToHex(r, g, b, a) {
                const toHex = (n) => {
                    const hex = Math.round(n * 255).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };
                return `#${toHex(r)}${toHex(g)}${toHex(b)}${a !== undefined && a < 1 ? toHex(a) : ''}`;
            }

            const colors = [];

            function traverse(node) {
                if (node.fills) {
                    node.fills.forEach(fill => {
                        if (fill.type === 'SOLID' && fill.visible !== false) {
                            const { r, g, b, a } = fill.color;
                            const hex = rgbaToHex(r, g, b, fill.opacity !== undefined ? fill.opacity : a);
                            colors.push({ name: node.name, hex: hex });
                        }
                    });
                }
                if (node.children) {
                    node.children.forEach(traverse);
                }
            }

            traverse(nodeData.document);
            
            fs.writeFileSync('light_theme_colors.json', JSON.stringify(colors, null, 2));
            console.log('Light theme colors saved.');

        } else {
            console.error('Node not found');
        }
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


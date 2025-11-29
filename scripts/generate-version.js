const fs = require('fs');
const packageJson = require('../package.json');

const args = process.argv.slice(2);
const mode = args[0] || 'dev'; // 'dev' ou 'prod'

const timestamp = new Date().toISOString();

const content = `export const environment = {
  mode: '${mode}',
  version: '${packageJson.version}',
  buildTime: '${timestamp}'
};
`;

const filePath = `src/environments/environment${mode === 'dev' ? '' : '.prod'}.ts`;
fs.writeFileSync(filePath, content);

console.log(`Generated ${filePath}`);

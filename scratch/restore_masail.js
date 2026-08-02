import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverMasailPath = path.join(__dirname, '..', '..', 'server', 'masail.json');
const clientMasailPath = path.join(__dirname, '..', 'public', 'masail.json');

const serverData = fs.readFileSync(serverMasailPath, 'utf8');
fs.writeFileSync(clientMasailPath, serverData, 'utf8');

const parsed = JSON.parse(serverData);
console.log(`✅ Successfully restored all ${parsed.length} masail items to client/public/masail.json!`);

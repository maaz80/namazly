import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const masailPath = path.join(__dirname, '..', 'public', 'masail.json');
const rawData = JSON.parse(fs.readFileSync(masailPath, 'utf8'));

console.log(`Original total masail count: ${rawData.length}`);

const uniqueMasail = [];
const duplicateMap = {}; // oldSlug -> primarySlug
const seenContent = new Map(); // key -> primaryMasla

rawData.forEach((item) => {
  // Normalize question title by removing " - Sawaal #123" suffix
  let cleanQuestion = item.question.replace(/\s*-\s*Sawaal\s*#?\d+\??/gi, '').trim();
  if (!cleanQuestion.endsWith('?')) {
    cleanQuestion += '?';
  }

  // Create a unique key based on normalized question and normalized answer
  const normQ = cleanQuestion.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normA = item.answer.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100);
  const key = `${normQ}_${normA}`;

  if (!seenContent.has(key)) {
    const primaryItem = {
      ...item,
      question: cleanQuestion,
    };
    seenContent.set(key, primaryItem);
    uniqueMasail.push(primaryItem);
    duplicateMap[item.slug] = primaryItem.slug;
  } else {
    const primaryItem = seenContent.get(key);
    duplicateMap[item.slug] = primaryItem.slug;
  }
});

console.log(`Deduplicated masail count: ${uniqueMasail.length}`);
console.log(`Mapped duplicate URLs: ${Object.keys(duplicateMap).length}`);

// Save deduplicated masail.json
fs.writeFileSync(masailPath, JSON.stringify(uniqueMasail, null, 2), 'utf8');

// Save duplicate mapping table
const mapPath = path.join(__dirname, '..', 'src', 'data', 'masailDuplicateMap.json');
fs.writeFileSync(mapPath, JSON.stringify(duplicateMap, null, 2), 'utf8');

console.log(`✅ Cleaned masail.json & saved duplicate map to ${mapPath}`);

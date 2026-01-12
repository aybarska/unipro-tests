const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data/uniproProducts.json');
const htmlPath = path.join(__dirname, 'offline-search-standalone.html');

console.log('Reading files...');

// Read JSON source
let jsonData;
try {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8');
    jsonData = JSON.parse(jsonContent);
} catch (e) {
    console.error(`Error reading or parsing ${jsonPath}:`, e.message);
    process.exit(1);
}

const jsonBoxCodes = new Set(jsonData.map(p => p.boxCode));

// Read HTML source
let htmlContent;
try {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
} catch (e) {
    console.error(`Error reading ${htmlPath}:`, e.message);
    process.exit(1);
}

// Extract uniproProducts from HTML
// Looking for: const uniproProducts = [...];
// Using a regex that captures everything between [ and ] inclusive, stopping at the first ];
const match = htmlContent.match(/const uniproProducts\s*=\s*(\[[\s\S]*?\]);/);

if (!match) {
    console.error("Could not find 'const uniproProducts = [...]' in HTML file.");
    process.exit(1);
}

let htmlProducts;
try {
    htmlProducts = JSON.parse(match[1]);
} catch (e) {
    console.error("Failed to parse JSON extracted from HTML. The array might contain non-JSON JavaScript or syntax errors.");
    console.error("Snippet:", match[1].substring(0, 100) + "...");
    process.exit(1);
}

const htmlBoxCodes = new Set(htmlProducts.map(p => p.boxCode));

// Check for discrepancies
const missingInHtml = [...jsonBoxCodes].filter(x => !htmlBoxCodes.has(x));
const extraInHtml = [...htmlBoxCodes].filter(x => !jsonBoxCodes.has(x));

console.log('---------------------------------------------------');
console.log(`Source JSON products count: ${jsonData.length}`);
console.log(`Target HTML products count: ${htmlProducts.length}`);
console.log('---------------------------------------------------');

let hasErrors = false;

if (missingInHtml.length > 0) {
    hasErrors = true;
    console.log(`\n❌ MISSING ${missingInHtml.length} boxCodes in HTML (Present in JSON but not HTML):`);
    missingInHtml.forEach(code => console.log(` - "${code}"`));
} else {
    console.log("\n✅ All products from JSON are present in HTML.");
}

if (extraInHtml.length > 0) {
    console.log(`\n⚠️ FOUND ${extraInHtml.length} EXTRA boxCodes in HTML (Present in HTML but not JSON):`);
    extraInHtml.forEach(code => console.log(` - "${code}"`));
} else {
    console.log("✅ No extra products in HTML.");
}

console.log('---------------------------------------------------');
if (!hasErrors) {
    console.log("SUCCESS: Data is synchronized.");
} else {
    console.log("FAILURE: Data is not matching.");
    process.exit(1);
}

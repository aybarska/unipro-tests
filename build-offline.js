const fs = require('fs');

// Read the JSON data
const mobileModels = JSON.parse(fs.readFileSync('data/mobileModels.json', 'utf8'));
const uniproProducts = JSON.parse(fs.readFileSync('data/uniproProducts.json', 'utf8'));

// Read the HTML template
const htmlTemplate = fs.readFileSync('offline-search.html', 'utf8');

// Create embedded data script
const embeddedData = `
    <script>
        // Embedded data - no external files needed
        const mobileModels = ${JSON.stringify(mobileModels)};
        const uniproProducts = ${JSON.stringify(uniproProducts)};
        
        // Initialize stats
        document.getElementById('mc').textContent = mobileModels.length;
        document.getElementById('pc').textContent = uniproProducts.length;
    </script>`;

// Replace the data loading section with embedded data
const output = htmlTemplate.replace(
    /<script src="data\/mobileModels\.js"><\/script>\s*<script src="data\/uniproProducts\.js"><\/script>\s*<script>[\s\S]*?<\/script>/,
    embeddedData
);

// Write the standalone file
fs.writeFileSync('offline-search-standalone.html', output, 'utf8');

console.log('✅ Created offline-search-standalone.html');
console.log(`📊 Loaded ${mobileModels.length} models and ${uniproProducts.length} products`);

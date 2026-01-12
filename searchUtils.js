/**
 * UNIPRO Search Utility
 * Extracted from https://unipro.gz.cn/ for offline use
 * 
 * This module provides functionality to search for mobile devices
 * and find matching UNIPRO products.
 */

// Import data (adjust paths as needed for your environment)
let mobileModels = [];
let uniproProducts = [];

/**
 * Initialize the search utility with data
 * @param {Array} models - Array of mobile model strings for autocomplete
 * @param {Array} products - Array of UNIPRO product mappings
 */
function initSearch(models, products) {
    mobileModels = models || [];
    uniproProducts = products || [];
}

/**
 * Load data from JSON files (for Node.js environment)
 */
async function loadDataFromFiles() {
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        
        const modelsPath = path.join(__dirname, 'data', 'mobileModels.json');
        const productsPath = path.join(__dirname, 'data', 'uniproProducts.json');
        
        mobileModels = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));
        uniproProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    }
}

/**
 * Search for mobile models matching a keyword (autocomplete)
 * @param {string} keyword - Search keyword
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} Matching mobile model names
 */
function searchMobileModels(keyword, limit = 10) {
    if (!keyword || keyword.trim() === '') {
        return [];
    }
    
    const searchTerm = keyword.toLowerCase().trim();
    
    return mobileModels
        .filter(model => model.toLowerCase().includes(searchTerm))
        .slice(0, limit);
}

/**
 * Find UNIPRO products that support a specific mobile model
 * @param {string} mobileModel - The mobile model to search for
 * @returns {Array} Array of matching UNIPRO products with boxCode and title
 */
function findProductsForMobile(mobileModel) {
    if (!mobileModel || mobileModel.trim() === '') {
        return [];
    }
    
    const searchTerm = mobileModel.toUpperCase().trim();
    const results = [];
    
    for (const product of uniproProducts) {
        const matches = product.mobiles.some(mobile => {
            const normalizedMobile = mobile.toUpperCase().trim();
            return normalizedMobile === searchTerm || 
                   normalizedMobile.includes(searchTerm) ||
                   searchTerm.includes(normalizedMobile);
        });
        
        if (matches) {
            results.push({
                boxCode: product.boxCode,
                title: product.title,
                category: product.category || 'UNIPRO TEMPERED GLASS'
            });
        }
    }
    
    return results;
}

/**
 * Search for products by keyword (searches both mobile models and product titles)
 * @param {string} keyword - Search keyword
 * @returns {Object} Object containing matching mobiles and products
 */
function search(keyword) {
    if (!keyword || keyword.trim() === '') {
        return { mobiles: [], products: [] };
    }
    
    const searchTerm = keyword.toLowerCase().trim();
    
    // Find matching mobile models
    const matchingMobiles = searchMobileModels(keyword, 20);
    
    // Find products that match the keyword directly (by mobile or title)
    const matchingProducts = [];
    
    for (const product of uniproProducts) {
        // Check if product title matches
        const titleMatch = product.title.toLowerCase().includes(searchTerm);
        
        // Check if any mobile in product matches
        const mobileMatch = product.mobiles.some(mobile => 
            mobile.toLowerCase().includes(searchTerm)
        );
        
        if (titleMatch || mobileMatch) {
            matchingProducts.push({
                boxCode: product.boxCode,
                title: product.title,
                matchedMobiles: product.mobiles.filter(m => 
                    m.toLowerCase().includes(searchTerm)
                )
            });
        }
    }
    
    return {
        mobiles: matchingMobiles,
        products: matchingProducts
    };
}

/**
 * Get all UNIPRO products
 * @returns {Array} All UNIPRO products
 */
function getAllProducts() {
    return uniproProducts.map(p => ({
        boxCode: p.boxCode,
        title: p.title,
        mobileCount: p.mobiles.length
    }));
}

/**
 * Get product details by box code
 * @param {string} boxCode - The UNIPRO box code (e.g., "UNIPRO H01")
 * @returns {Object|null} Product details or null if not found
 */
function getProductByBoxCode(boxCode) {
    return uniproProducts.find(p => 
        p.boxCode.toUpperCase() === boxCode.toUpperCase()
    ) || null;
}

/**
 * iOS Device Detection (from device.js)
 * Detects iPhone model based on screen resolution
 */
const iOSDevices = [
    { gpu: 'a11', resolution: '1125x2436', models: ['iPhone X', 'iPhone Xs', 'iPhone 11 Pro'] },
    { gpu: 'a12', resolution: '828x1792', models: ['iPhone Xr', 'iPhone 11'] },
    { gpu: 'a12', resolution: '1242x2688', models: ['iPhone Xs Max', 'iPhone 11 Pro Max'] },
    { gpu: 'a13', resolution: '750x1334', models: ['iPhone SE 2', 'iPhone SE 3'] },
    { gpu: 'a14', resolution: '1080x2340', models: ['iPhone 12 mini', 'iPhone 13 mini'] },
    { gpu: 'a14', resolution: '1170x2532', models: ['iPhone 12', 'iPhone 12 Pro', 'iPhone 13', 'iPhone 13 Pro', 'iPhone 14'] },
    { gpu: 'a14', resolution: '1284x2778', models: ['iPhone 12 Pro Max', 'iPhone 13 Pro Max', 'iPhone 14 Plus'] },
    { gpu: 'a16', resolution: '1179x2556', models: ['iPhone 14 Pro', 'iPhone 15', 'iPhone 15 Pro', 'iPhone 16'] },
    { gpu: 'a16', resolution: '1290x2796', models: ['iPhone 14 Pro Max', 'iPhone 15 Plus', 'iPhone 15 Pro Max', 'iPhone 16 Plus'] },
    { gpu: 'a17', resolution: '1206x2622', models: ['iPhone 16 Pro'] },
    { gpu: 'a17', resolution: '1320x2868', models: ['iPhone 16 Pro Max'] }
];

/**
 * Detect iOS device model from screen resolution (browser only)
 * @returns {Array} Possible iPhone models based on screen resolution
 */
function detectiOSDevice() {
    if (typeof window === 'undefined' || typeof screen === 'undefined') {
        return ['unknown'];
    }
    
    const ratio = window.devicePixelRatio || 1;
    const resolution = (Math.min(screen.width, screen.height) * ratio) + 
                       'x' + (Math.max(screen.width, screen.height) * ratio);
    
    for (const device of iOSDevices) {
        if (device.resolution === resolution) {
            return device.models;
        }
    }
    
    return ['unknown'];
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSearch,
        loadDataFromFiles,
        searchMobileModels,
        findProductsForMobile,
        search,
        getAllProducts,
        getProductByBoxCode,
        detectiOSDevice,
        iOSDevices
    };
}

// For browser usage
if (typeof window !== 'undefined') {
    window.UniproSearch = {
        initSearch,
        searchMobileModels,
        findProductsForMobile,
        search,
        getAllProducts,
        getProductByBoxCode,
        detectiOSDevice,
        iOSDevices
    };
}

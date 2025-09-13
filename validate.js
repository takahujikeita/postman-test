const fs = require('fs');
const path = require('path');

function validateCollection(filePath, serviceName) {
    console.log(`\n=== Validating ${serviceName} Collection ===`);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            return false;
        }
        
        const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // 基本構造の確認
        console.log(`✓ Collection name: ${collection.info?.name || 'N/A'}`);
        console.log(`✓ Schema version: ${collection.info?.schema || 'N/A'}`);
        
        // 変数の確認
        if (collection.variable) {
            const baseUrlVar = collection.variable.find(v => v.key === 'baseUrl');
            if (baseUrlVar) {
                console.log(`✓ baseUrl variable: ${baseUrlVar.value}`);
                if (baseUrlVar.value !== 'https://api.saasus.io') {
                    console.warn(`⚠️  Expected baseUrl: https://api.saasus.io, found: ${baseUrlVar.value}`);
                }
            } else {
                console.warn(`⚠️  baseUrl variable not found`);
            }
        }
        
        // アイテム（エンドポイント）の確認
        let endpointCount = 0;
        if (collection.item) {
            endpointCount = collection.item.length;
            console.log(`✓ Endpoints found: ${endpointCount}`);
            
            collection.item.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.name || 'Unnamed endpoint'}`);
                
                if (item.request && item.request.url) {
                    let url = '';
                    if (typeof item.request.url === 'string') {
                        url = item.request.url;
                    } else if (item.request.url.raw) {
                        url = item.request.url.raw;
                    }
                    
                    console.log(`     Method: ${item.request.method || 'N/A'}`);
                    console.log(`     URL: ${url}`);
                    
                    // URL構造の検証
                    const expectedPattern = `{{baseUrl}}/v1/${serviceName.toLowerCase()}`;
                    if (url.includes(expectedPattern)) {
                        console.log(`     ✓ URL structure is correct`);
                    } else {
                        console.warn(`     ⚠️  Expected URL to contain: ${expectedPattern}`);
                    }
                }
            });
        } else {
            console.warn(`⚠️  No endpoints found`);
        }
        
        return endpointCount > 0;
        
    } catch (error) {
        console.error(`❌ Error validating ${serviceName}:`, error.message);
        return false;
    }
}

function validateCombinedCollection() {
    console.log(`\n=== Validating Combined Collection ===`);
    
    const filePath = './output/combined-collection.json';
    
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Combined collection not found: ${filePath}`);
            return false;
        }
        
        const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`✓ Collection name: ${collection.info?.name || 'N/A'}`);
        
        // 変数の確認
        if (collection.variable) {
            const baseUrlVar = collection.variable.find(v => v.key === 'baseUrl');
            if (baseUrlVar) {
                console.log(`✓ baseUrl variable: ${baseUrlVar.value}`);
            }
        }
        
        // フォルダー構造の確認
        if (collection.item) {
            console.log(`✓ Folders found: ${collection.item.length}`);
            
            let totalEndpoints = 0;
            collection.item.forEach((folder, index) => {
                const endpointCount = folder.item ? folder.item.length : 0;
                totalEndpoints += endpointCount;
                console.log(`  ${index + 1}. ${folder.name || 'Unnamed folder'} (${endpointCount} endpoints)`);
                
                if (folder.item) {
                    folder.item.forEach((endpoint, epIndex) => {
                        console.log(`     ${epIndex + 1}. ${endpoint.name || 'Unnamed endpoint'}`);
                    });
                }
            });
            
            console.log(`✓ Total endpoints: ${totalEndpoints}`);
            return totalEndpoints > 0;
        }
        
        return false;
        
    } catch (error) {
        console.error(`❌ Error validating combined collection:`, error.message);
        return false;
    }
}

function generateSummaryReport() {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`POSTMAN COLLECTION VALIDATION SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    
    const results = {
        auth: validateCollection('./output/auth.json', 'Auth'),
        pricing: validateCollection('./output/pricing.json', 'Pricing'),
        combined: validateCombinedCollection()
    };
    
    console.log(`\n=== Overall Results ===`);
    console.log(`Auth Collection: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Pricing Collection: ${results.pricing ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Combined Collection: ${results.combined ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = results.auth && results.pricing && results.combined;
    console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log(`\n📝 Next Steps:`);
        console.log(`1. Import ./output/combined-collection.json into Postman`);
        console.log(`2. Verify folder structure (Auth, Pricing)`);
        console.log(`3. Test API movement between folders`);
        console.log(`4. Confirm URLs are correctly formatted`);
    }
    
    return allPassed;
}

// メイン実行
if (require.main === module) {
    generateSummaryReport();
}

module.exports = {
    validateCollection,
    validateCombinedCollection,
    generateSummaryReport
};

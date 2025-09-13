const Converter = require('openapi-to-postmanv2');
const fs = require('fs');
const path = require('path');

async function convertYamlToPostman(yamlPath, outputPath, serviceName) {
    console.log(`Converting ${serviceName}...`);
    
    try {
        const yamlContent = fs.readFileSync(yamlPath, 'utf8');
        
        Converter.convert({
            type: 'string',
            data: yamlContent
        }, {}, (err, conversionResult) => {
            if (err) {
                console.error(`Error converting ${serviceName}:`, err);
                return;
            }
            
            if (!conversionResult.result) {
                console.error(`Conversion failed for ${serviceName}`);
                console.error('Conversion details:', conversionResult);
                return;
            }
            
            let collection = conversionResult.output[0].data;
            
            // baseURL統一化処理
            if (collection.variable) {
                collection.variable.forEach(variable => {
                    if (variable.key === 'baseUrl') {
                        variable.value = 'https://api.saasus.io';
                    }
                });
            } else {
                // variableが存在しない場合は作成
                collection.variable = [
                    {
                        key: 'baseUrl',
                        value: 'https://api.saasus.io',
                        type: 'string'
                    }
                ];
            }
            
            // URL書き換え処理
            function updateUrls(item) {
                if (item.request && item.request.url) {
                    if (typeof item.request.url === 'string') {
                        item.request.url = item.request.url.replace(
                            '{{baseUrl}}',
                            `{{baseUrl}}/v1/${serviceName.toLowerCase()}`
                        );
                    } else if (item.request.url.raw) {
                        item.request.url.raw = item.request.url.raw.replace(
                            '{{baseUrl}}',
                            `{{baseUrl}}/v1/${serviceName.toLowerCase()}`
                        );
                    } else {
                        // URLオブジェクト形式の場合
                        // URLのhost部分も更新
                        if (item.request.url.host) {
                            item.request.url.host = ['{{baseUrl}}'];
                        }
                        // pathを更新 - v1/serviceNameを先頭に追加
                        if (item.request.url.path && Array.isArray(item.request.url.path)) {
                            // 既存のv1, serviceNameを除去してから新しく追加
                            const cleanPath = item.request.url.path.filter(p => 
                                p !== 'v1' && 
                                p !== serviceName.toLowerCase() && 
                                p !== serviceName.toUpperCase() &&
                                p.toLowerCase() !== serviceName.toLowerCase()
                            );
                            item.request.url.path = ['v1', serviceName.toLowerCase(), ...cleanPath];
                        }
                        // rawフィールドを更新
                        if (item.request.url.host && item.request.url.path) {
                            const hostStr = item.request.url.host.join('');
                            const pathStr = item.request.url.path.join('/');
                            item.request.url.raw = `${hostStr}/${pathStr}`;
                        }
                    }
                }
                
                if (item.item) {
                    item.item.forEach(updateUrls);
                }
            }
            
            if (collection.item) {
                collection.item.forEach(updateUrls);
            }
            
            // サービス名をコレクション名に設定
            collection.info.name = serviceName;
            
            fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
            console.log(`✓ Converted ${serviceName} to ${outputPath}`);
        });
    } catch (error) {
        console.error(`Error reading or converting ${serviceName}:`, error);
    }
}

function combineCollections() {
    console.log('Combining collections...');
    
    try {
        const authCollection = JSON.parse(fs.readFileSync('./output/auth.json', 'utf8'));
        const pricingCollection = JSON.parse(fs.readFileSync('./output/pricing.json', 'utf8'));
        
        const combinedCollection = {
            info: {
                name: "SaaSus API",
                description: "Combined SaaSus API Collection",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            variable: [
                {
                    key: "baseUrl",
                    value: "https://api.saasus.io",
                    type: "string"
                }
            ],
            item: [
                {
                    name: "Auth",
                    description: "SaaSus Auth API endpoints",
                    item: authCollection.item || []
                },
                {
                    name: "Pricing",
                    description: "SaaSus Pricing API endpoints", 
                    item: pricingCollection.item || []
                }
            ]
        };
        
        fs.writeFileSync('./output/combined-collection.json', JSON.stringify(combinedCollection, null, 2));
        console.log('✓ Combined collection created: ./output/combined-collection.json');
        
        // 結果のサマリーを表示
        console.log('\n=== Conversion Summary ===');
        console.log(`Auth API endpoints: ${authCollection.item ? authCollection.item.length : 0}`);
        console.log(`Pricing API endpoints: ${pricingCollection.item ? pricingCollection.item.length : 0}`);
        console.log(`Total endpoints in combined collection: ${combinedCollection.item.reduce((sum, folder) => sum + (folder.item ? folder.item.length : 0), 0)}`);
        
    } catch (error) {
        console.error('Error combining collections:', error);
    }
}

async function main() {
    console.log('Starting OpenAPI to Postman conversion...\n');
    
    // 出力ディレクトリが存在することを確認
    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output', { recursive: true });
    }
    
    // 個別の変換を実行
    await convertYamlToPostman('./input/auth-api.yml', './output/auth.json', 'Auth');
    await convertYamlToPostman('./input/pricing-api.yml', './output/pricing.json', 'Pricing');
    
    // 変換完了を待ってから結合
    setTimeout(() => {
        combineCollections();
        console.log('\n=== Conversion Complete ===');
        console.log('Import ./output/combined-collection.json into Postman to test!');
    }, 2000);
}

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch(console.error);

const fs = require('fs');
const https = require('https');

/**
 * Postman APIを使ってコレクションを操作するユーティリティクラス
 */
class PostmanAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.getpostman.com';
    }

    /**
     * HTTPリクエストを実行する共通メソッド
     */
    async makeRequest(method, path, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.getpostman.com',
                path: path,
                method: method,
                headers: {
                    'X-API-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(responseData);
                        resolve({
                            statusCode: res.statusCode,
                            data: parsedData
                        });
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            data: responseData
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    /**
     * ワークスペース内のコレクション一覧を取得
     */
    async getCollections(workspaceId) {
        const path = `/collections?workspace=${workspaceId}`;
        return await this.makeRequest('GET', path);
    }

    /**
     * 特定のコレクションの詳細を取得
     */
    async getCollection(collectionId) {
        const path = `/collections/${collectionId}`;
        return await this.makeRequest('GET', path);
    }

    /**
     * コレクションを更新
     */
    async updateCollection(collectionId, collectionData) {
        const path = `/collections/${collectionId}`;
        return await this.makeRequest('PUT', path, { collection: collectionData });
    }

    /**
     * 新しいコレクションを作成
     */
    async createCollection(collectionData, workspaceId) {
        const path = `/collections?workspace=${workspaceId}`;
        return await this.makeRequest('POST', path, { collection: collectionData });
    }

    /**
     * ワークスペースの情報を取得
     */
    async getWorkspace(workspaceId) {
        const path = `/workspaces/${workspaceId}`;
        return await this.makeRequest('GET', path);
    }
}

/**
 * メイン処理
 */
async function syncToPostman() {
    console.log('🚀 Starting Postman synchronization...');
    
    // 環境変数の取得
    const apiKey = process.env.POSTMAN_API_KEY;
    const collectionUid = process.env.POSTMAN_COLLECTION_UID;
    const workspaceId = process.env.POSTMAN_WORKSPACE_ID;
    
    if (!apiKey) {
        console.error('❌ POSTMAN_API_KEY environment variable is required');
        process.exit(1);
    }
    
    const postman = new PostmanAPI(apiKey);
    
    try {
        // 生成されたコレクションファイルを読み込み
        const collectionPath = './output/combined-collection.json';
        
        if (!fs.existsSync(collectionPath)) {
            console.error(`❌ Collection file not found: ${collectionPath}`);
            console.log('💡 Please run "npm run convert" first to generate the collection');
            process.exit(1);
        }
        
        const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        console.log(`📄 Loaded collection: ${collectionData.info.name}`);
        
        // ワークスペースの確認
        if (workspaceId) {
            console.log('🔍 Checking workspace...');
            const workspaceResponse = await postman.getWorkspace(workspaceId);
            
            if (workspaceResponse.statusCode === 200) {
                console.log(`✅ Workspace found: ${workspaceResponse.data.workspace.name}`);
            } else {
                console.warn(`⚠️ Workspace check failed: ${workspaceResponse.statusCode}`);
            }
        }
        
        let result;
        
        if (collectionUid) {
            // 既存のコレクションを更新
            console.log(`🔄 Updating existing collection: ${collectionUid}`);
            
            // 既存のコレクションIDを保持
            collectionData.info._postman_id = collectionUid;
            
            result = await postman.updateCollection(collectionUid, collectionData);
            
            if (result.statusCode === 200) {
                console.log('✅ Collection updated successfully');
                console.log(`📊 Collection: ${result.data.collection.info.name}`);
                console.log(`🆔 UID: ${result.data.collection.info._postman_id}`);
            } else {
                console.error(`❌ Failed to update collection: ${result.statusCode}`);
                console.error('Response:', result.data);
                
                if (result.statusCode === 404) {
                    console.log('💡 Collection not found. Creating a new one...');
                    result = await createNewCollection(postman, collectionData, workspaceId);
                } else {
                    process.exit(1);
                }
            }
        } else {
            // 新しいコレクションを作成
            result = await createNewCollection(postman, collectionData, workspaceId);
        }
        
        // 成功時の情報出力
        if (result.statusCode === 200 || result.statusCode === 201) {
            const collection = result.data.collection;
            console.log('\n🎉 Synchronization completed successfully!');
            console.log(`📋 Collection Name: ${collection.info.name}`);
            console.log(`🆔 Collection UID: ${collection.info._postman_id}`);
            console.log(`🔗 View in Postman: https://app.postman.com/`);
            
            // 次回のために環境変数の設定をログ出力
            if (!collectionUid) {
                console.log('\n💡 For future automated updates, set this environment variable:');
                console.log(`POSTMAN_COLLECTION_UID=${collection.info._postman_id}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error during synchronization:', error.message);
        process.exit(1);
    }
}

/**
 * 新しいコレクションを作成
 */
async function createNewCollection(postman, collectionData, workspaceId) {
    console.log('🆕 Creating new collection...');
    
    if (!workspaceId) {
        console.error('❌ POSTMAN_WORKSPACE_ID is required for creating new collections');
        process.exit(1);
    }
    
    const result = await postman.createCollection(collectionData, workspaceId);
    
    if (result.statusCode === 200 || result.statusCode === 201) {
        console.log('✅ New collection created successfully');
    } else {
        console.error(`❌ Failed to create collection: ${result.statusCode}`);
        console.error('Response:', result.data);
        process.exit(1);
    }
    
    return result;
}

/**
 * コレクション情報を取得して表示
 */
async function getCollectionInfo() {
    const apiKey = process.env.POSTMAN_API_KEY;
    const workspaceId = process.env.POSTMAN_WORKSPACE_ID;
    
    if (!apiKey) {
        console.error('❌ POSTMAN_API_KEY environment variable is required');
        process.exit(1);
    }
    
    const postman = new PostmanAPI(apiKey);
    
    try {
        if (workspaceId) {
            console.log('📋 Getting collections in workspace...');
            const collections = await postman.getCollections(workspaceId);
            
            if (collections.statusCode === 200) {
                console.log(`✅ Found ${collections.data.collections.length} collections:`);
                collections.data.collections.forEach((col, index) => {
                    console.log(`  ${index + 1}. ${col.name} (UID: ${col.uid})`);
                });
            } else {
                console.error(`❌ Failed to get collections: ${collections.statusCode}`);
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// スクリプトが直接実行された場合のメイン処理
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'sync':
            syncToPostman();
            break;
        case 'info':
            getCollectionInfo();
            break;
        default:
            syncToPostman();
    }
}

module.exports = { PostmanAPI, syncToPostman, getCollectionInfo };

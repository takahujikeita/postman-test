# Postman API Key 取得手順

## 1. Postmanでの設定

### API Key の生成
1. Postman Web App ([https://app.postman.com/](https://app.postman.com/)) にログイン
2. 右上のプロフィールアイコン → **Settings**
3. 左メニュー → **API Keys**  
4. **Generate API Key** をクリック
5. キー名を入力 (例: "GitHub Actions Integration")
6. **Generate** をクリック
7. ⚠️ **表示されたキーを必ずコピーして保存** (再表示不可)

### Workspace ID の取得
1. 使用したいワークスペースを開く
2. URL から ID を確認:
   ```
   https://app.postman.com/workspace/[WORKSPACE_ID]/overview
   ```
3. または、ワークスペース設定 → **Info** → **Workspace ID** をコピー

### Collection ID の取得 (既存コレクションがある場合)
1. 更新したいコレクションを開く
2. コレクション名の隣の **⋯** → **Settings**
3. **Info** タブ → **Collection ID** をコピー

---

## 2. GitHub Secrets の設定

### 設定手順
1. GitHubリポジトリページを開く
2. **Settings** タブをクリック
3. 左メニュー → **Secrets and variables** → **Actions**
4. **New repository secret** をクリック

### 必要なSecrets

#### 必須: POSTMAN_API_KEY
- **Name**: `POSTMAN_API_KEY`
- **Secret**: [上記で生成したAPI Key]

#### 必須: POSTMAN_WORKSPACE_ID  
- **Name**: `POSTMAN_WORKSPACE_ID`
- **Secret**: [取得したワークスペースID]

#### オプション: POSTMAN_COLLECTION_UID
- **Name**: `POSTMAN_COLLECTION_UID`
- **Secret**: [既存コレクションのID]
- ⚠️ 設定しない場合は新しいコレクションが自動作成されます

---

## 3. 動作確認

### ローカルテスト (オプション)
```bash
# 環境変数を設定
export POSTMAN_API_KEY='your_api_key_here'
export POSTMAN_WORKSPACE_ID='your_workspace_id_here'

# 接続テスト
npm run postman:info
```

### GitHub Actions テスト
1. OpenAPI ファイルを変更
2. コミット & プッシュ
3. Actions タブで実行結果を確認

---

## 4. トラブルシューティング

### よくあるエラー

| エラー | 原因 | 解決方法 |
|--------|------|----------|
| `401 Unauthorized` | API Key が無効 | 新しいキーを生成し直す |
| `404 Workspace not found` | Workspace ID が間違い | URLから正しいIDを確認 |
| `403 Forbidden` | 権限不足 | ワークスペースの管理者権限を確認 |

### 確認コマンド
```bash
# Secrets が正しく設定されているか確認
# (GitHub Actions ログで確認可能)
echo "API Key length: ${#POSTMAN_API_KEY}"
echo "Workspace ID: $POSTMAN_WORKSPACE_ID"
```

---

## 5. セキュリティ注意事項

- ⚠️ API Key は絶対にコード内やログに含めない
- ✅ GitHub Secrets に保存して環境変数経由で使用
- 🔄 定期的にAPI Key をローテーション
- 👥 必要最小限の権限でワークスペースアクセスを制限

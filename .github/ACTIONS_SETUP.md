# GitHub Actions環境変数とシークレット設定ガイド

## 必要な環境設定

### 1. Repository Secrets (Postman API連携用)

PostmanのAPIと連携してコレクションを自動更新するために以下のシークレットを設定:

```
POSTMAN_API_KEY=your_postman_api_key_here
POSTMAN_COLLECTION_UID=your_collection_uid_here
POSTMAN_WORKSPACE_ID=your_workspace_id_here
```

**設定手順:**
1. Postmanで[API Key](https://web.postman.co/settings/me/api-keys)を生成
2. GitHubリポジトリの Settings → Secrets and variables → Actions
3. "New repository secret" で上記3つを追加

### 2. Repository Variables (オプション)
```
DEFAULT_BASE_URL=https://api.saasus.io
COLLECTION_NAME=SaaSus API Collection
```

## ワークフロートリガー

### 自動実行
- `input/` ディレクトリ内のOpenAPIファイル（.yml, .yaml, .json）が変更された時
- main ブランチへのpush
- Pull Request作成時

### 手動実行
- Actions タブから "OpenAPI to Postman Converter" を選択
- "Run workflow" ボタンをクリック
- オプション: "Force rebuild all collections" をチェックすると強制再生成

## 出力

### Artifacts
- `postman-collections`: 生成されたすべてのPostmanコレクションファイル
- `validation-report`: 検証レポート（Markdown形式）

### Git Commits
変更がある場合、自動的に以下をコミット:
- output/auth.json
- output/pricing.json  
- output/combined-collection.json

### Releases (タグ作成時)
タグを作成すると自動的にリリースが作成され、Postmanコレクションが添付されます。

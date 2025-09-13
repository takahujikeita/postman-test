# GitHub Actions環境変数とシークレット設定ガイド

## 必要な環境設定

### 1. Repository Secrets (必要に応じて)
もし将来的にPostman APIとの連携や外部サービスへのデプロイが必要な場合:

```
POSTMAN_API_KEY=your_postman_api_key_here
SLACK_WEBHOOK_URL=your_slack_webhook_for_notifications
```

### 2. Repository Variables
```
POSTMAN_WORKSPACE_ID=your_postman_workspace_id
DEFAULT_BASE_URL=https://api.saasus.io
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

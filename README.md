# postman-test

[![OpenAPI to Postman Converter](https://github.com/takahujikeita/postman-test/actions/workflows/openapi-to-postman.yml/badge.svg)](https://github.com/takahujikeita/postman-test/actions/workflows/openapi-to-postman.yml)

OpenAPI仕様からPostmanコレクションを生成する自動化パイプライン

## 概要

このプロジェクトは、SaaSus APIのOpenAPI仕様ファイルからPostmanコレクションを自動生成し、GitHub Actionsを使ってCI/CDパイプラインで管理します。

## 🚀 GitHub Actions自動化

### 自動実行トリガー
- `input/` ディレクトリ内のOpenAPIファイル変更時
- main ブランチへのpush
- Pull Request作成時

### 手動実行
1. GitHub の **Actions** タブを開く
2. **"OpenAPI to Postman Converter"** ワークフローを選択
3. **"Run workflow"** をクリック
4. オプション: **"Force rebuild all collections"** で強制再生成

### 🤖 Postman API連携 (NEW!)

**自動化レベル**: API仕様変更 → Postmanコレクション自動更新

#### セットアップ手順
```bash
# セットアップガイドを実行
./scripts/setup-postman.sh
```

#### 必要なシークレット
- `POSTMAN_API_KEY`: PostmanのAPI Key
- `POSTMAN_WORKSPACE_ID`: 対象ワークスペースのID  
- `POSTMAN_COLLECTION_UID`: 更新対象コレクションのID (オプション)

#### 動作フロー
1. **OpenAPI変更検出**: input/ディレクトリの変更を監視
2. **コレクション生成**: 最新のPostmanコレクションを生成
3. **Postman同期**: Postman APIを使って自動更新
4. **GitHub同期**: postman/collections/ディレクトリにも保存

#### ローカルテスト
```bash
# Postman APIとの接続確認
npm run postman:info

# 完全同期 (変換 + Postman更新)
npm run sync
```

### 出力
- **Artifacts**: 生成されたPostmanコレクション（30日間保持）
- **Auto-commit**: 変更があれば自動でoutput/ファイルをコミット
- **Releases**: タグ作成時に自動リリース作成

## 📁 ファイル構成

```
postman-test/
├── .github/
│   ├── workflows/
│   │   └── openapi-to-postman.yml    # GitHub Actionsワークフロー
│   └── ACTIONS_SETUP.md               # Actions設定ガイド
├── input/                             # OpenAPI仕様ファイル
│   ├── auth-api.yml                  # SaaSus Auth API仕様
│   └── pricing-api.yml               # SaaSus Pricing API仕様
├── output/                           # 生成されるPostmanコレクション
│   ├── auth.json                    # Auth API用コレクション
│   ├── pricing.json                 # Pricing API用コレクション
│   └── combined-collection.json      # 統合コレクション ⭐
├── convert.js                       # 変換スクリプト
├── validate.js                      # 検証スクリプト
└── package.json
```

## セットアップ

### 前提条件

- Node.js v16以上
- npm

### インストール

```bash
# 依存関係のインストール
npm install

# または手動でパッケージをインストール
npm install openapi-to-postmanv2
```

## ファイル構成

```
postman-test/
├── input/                     # OpenAPI仕様ファイル
│   ├── auth-api.yml          # SaaSus Auth API仕様
│   └── pricing-api.yml       # SaaSus Pricing API仕様
├── output/                   # 生成されるPostmanコレクション
│   ├── auth.json            # Auth API用コレクション
│   ├── pricing.json         # Pricing API用コレクション
│   └── combined-collection.json # 統合コレクション
├── convert.js               # 変換スクリプト
└── package.json
```

## 使用方法

### 1. OpenAPIからPostmanコレクションへの変換

```bash
# 変換実行
npm run convert

# または直接実行
node convert.js
```

### 2. 生成されたファイルの確認

```bash
# 出力ファイル一覧
ls -la output/

# 統合コレクションの内容確認（最初の20行）
head -20 output/combined-collection.json
```

### 3. Postmanでのテスト

1. Postmanアプリケーションを開く
2. **Import** > **Upload Files** を選択
3. `output/combined-collection.json` をインポート
4. フォルダー構造を確認:
   - Auth フォルダー
   - Pricing フォルダー
5. API移動テストを実行:
   - 各フォルダーのAPIを他フォルダーにコピー
   - URLが正しく `{{baseUrl}}/v1/サービス名/` 形式になっているか確認

## 検証ポイント

### ✅ 確認項目

- [ ] **フォルダー構造**: Auth, Pricingフォルダーが正しく作成されている
- [ ] **baseURL統一**: 全てのAPIで `https://api.saasus.io` が設定されている
- [ ] **URL構造**: `/v1/auth/userinfo`, `/v1/pricing/plans` のように正しいパスになっている
- [ ] **API移動テスト**: APIをフォルダー間でコピーしても正常に動作する

#### 🔧 トラブルシューティング

#### GitHub Actions が失敗する場合

**1. 基本チェック**
```bash
# ローカル環境での事前チェック
./scripts/troubleshoot.sh

# 依存関係の再インストール
npm ci
npm run build
```

**2. よくあるエラーと対処法**

| エラー | 原因 | 対処法 |
|--------|------|--------|
| `exit code 128` | Git認証エラー | ワークフローの権限設定を確認 |
| `Artifact not found` | 前のジョブが失敗 | 最初のジョブのログを確認 |
| `npm ci failed` | package-lock.jsonの問題 | ローカルで`npm install`後コミット |
| `Collection validation failed` | OpenAPI仕様エラー | `input/`ディレクトリのファイルを確認 |

**3. 手動実行での確認**
- GitHub Actions タブから手動実行
- "Force rebuild all collections" オプションを有効化
- ログでエラー詳細を確認

**4. ローカルでのデバッグ**
```bash
# 変換テスト
npm run convert

# 検証テスト  
npm run validate

# 統合テスト
npm run build
```

## 📊 プロジェクト統計

- **変換対象**: OpenAPI 3.0仕様ファイル
- **出力形式**: Postman Collection v2.1
- **サポートサービス**: Auth, Pricing
- **自動化レベル**: 完全自動化（CI/CD）
- **品質保証**: Newman + カスタム検証
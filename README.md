# レシート家計簿アプリ

レシート画像をアップロードするだけで、Gemini 2.5 Flash が内容を自動読み取りし、支出を記録・管理できる Web アプリです。

## 機能

- **レシート自動読み取り**: Gemini 2.5 Flash による商品名・金額・日付・店名の抽出
- **カテゴリ自動分類**: 食費・外食・日用品・交通費など 8 カテゴリに自動分類
- **支出一覧表示**: 月別フィルタリングで登録済みレシートを一覧表示
- **グラフ表示**: カテゴリ別円グラフ・月別棒グラフ（過去 6 ヶ月）
- **データ永続化**: ローカルストレージに保存し、リロード後もデータを維持
- **入力検証**: 負の金額の警告、重複レシートの検出

## 技術スタック

| 区分 | 技術 |
|------|------|
| フロントエンド | React 18 / Vite |
| バックエンド | Node.js / Express |
| AI | Google Gemini 2.5 Flash |
| グラフ | Chart.js |
| 画像転送 | multer（base64 変換して Gemini へ送信） |

## 前提条件

- Node.js 18 以上
- Google AI Studio の Gemini API キー

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/ShinCom1974/kakeibo-app.git
cd kakeibo-app
```

### 2. 依存パッケージをインストール

```bash
npm run install:all
```

### 3. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、API キーを設定します。

```bash
cp .env.example .env
```

`.env` を編集：

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

| サーバー | URL |
|---------|-----|
| フロントエンド | http://localhost:5173 |
| バックエンド | http://localhost:3001 |

## 使い方

1. **「📷 読み込み」タブ**でレシート画像をアップロード（ドラッグ&ドロップ可）
2. **「🤖 レシートを解析する」**ボタンを押して Gemini に解析させる
3. 読み取り結果を確認し、**「✅ 保存する」**で登録
4. **「📋 一覧」タブ**で支出一覧を確認
5. **「📊 グラフ」タブ**でカテゴリ別・月別の集計グラフを確認

## ディレクトリ構成

```
kakeibo-app/
├── .env.example
├── .gitignore
├── package.json          # ルート（サーバー依存 + 起動スクリプト）
├── server/
│   └── index.js          # Express サーバー / Gemini API 呼び出し
└── client/
    ├── index.html
    ├── vite.config.js     # /api を :3001 へプロキシ
    ├── package.json
    └── src/
        ├── App.jsx        # ルートコンポーネント・状態管理
        ├── App.css
        ├── main.jsx
        ├── components/
        │   ├── ReceiptUpload.jsx    # アップロード・解析・確認
        │   ├── ExpenseList.jsx      # 支出一覧
        │   ├── Charts.jsx           # Chart.js グラフ
        │   └── CategorySummary.jsx  # カテゴリ別集計カード
        └── utils/
            └── categories.js        # カテゴリ定義・色・アイコン
```

## カテゴリ一覧

| カテゴリ | 対象 |
|---------|------|
| 🛒 食費 | 食材・飲料（スーパー・コンビニ） |
| 🍽️ 外食 | レストラン・カフェ・ファストフード |
| 🧴 日用品 | 洗剤・シャンプー・文具など |
| 🚃 交通費 | 電車・バス・タクシー・ガソリン |
| 👕 衣料品 | 服・靴・バッグ |
| 💊 医療費 | 薬・病院・サプリメント |
| 🎮 娯楽 | 映画・ゲーム・書籍 |
| 📦 その他 | 上記以外 |

## 注意事項

- `.env` ファイルは `.gitignore` により Git 管理対象外です。API キーをリポジトリにコミットしないでください。
- レシート画像はバックエンドで base64 に変換されてから Gemini API へ送信されます。画像がサーバー外部に保存されることはありません。
- データはブラウザのローカルストレージに保存されます。ブラウザのデータを消去すると記録も削除されます。

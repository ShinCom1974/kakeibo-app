require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Gemini クライアントを初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.use(cors());
app.use(express.json());

// 画像アップロード設定（メモリに一時保存）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 上限
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイルのみアップロード可能です'));
    }
  },
});

// レシート解析エンドポイント
app.post('/api/analyze-receipt', upload.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '画像ファイルが必要です' });
  }

  // 受け取った画像を base64 に変換して Gemini へ渡す
  const imageBase64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  const prompt = `このレシート画像から情報を抽出し、以下の JSON 形式のみで返してください。
マークダウンや説明文は一切含めず、JSON だけを返してください。

{
  "date": "購入日（YYYY-MM-DD 形式。読み取れない場合は今日の日付）",
  "storeName": "店名（読み取れない場合は「不明」）",
  "items": [
    {
      "name": "商品名",
      "price": 金額（数値のみ）,
      "category": "カテゴリ名"
    }
  ],
  "total": 合計金額（数値のみ）
}

カテゴリは必ず以下のいずれかを選択してください:
食費, 外食, 日用品, 交通費, 衣料品, 医療費, 娯楽, その他

カテゴリ判断基準:
- 食費: 食材・飲料（スーパー・コンビニでの購入）
- 外食: レストラン・カフェ・ファストフード・弁当
- 日用品: 洗剤・シャンプー・トイレットペーパー・文具など
- 交通費: 電車・バス・タクシー・ガソリン・駐車場
- 衣料品: 服・靴・バッグ・アクセサリー
- 医療費: 薬・病院・サプリメント
- 娯楽: 映画・ゲーム・書籍・音楽
- その他: 上記に当てはまらないもの`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const responseText = result.response.text();

    // JSON 部分のみ抽出（```json ... ``` 形式にも対応）
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('レスポンスから JSON を抽出できませんでした');
    }

    const receiptData = JSON.parse(jsonMatch[0]);

    // 一意な ID と作成日時を付与
    receiptData.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    receiptData.createdAt = new Date().toISOString();

    res.json(receiptData);
  } catch (err) {
    console.error('レシート解析エラー:', err);
    res.status(500).json({ error: `解析に失敗しました: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});

import { useState, useRef } from 'react';
import { getCategoryIcon } from '../utils/categories';

// レシート画像のアップロード・Gemini 解析・確認・保存を担うコンポーネント
function ReceiptUpload({ onReceiptAdded }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);

  // ファイル選択時の共通処理
  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) {
      setError('画像ファイル（JPG・PNG など）を選択してください');
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setExtractedData(null);
    setError(null);
    setSaved(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // バックエンド経由で Gemini にレシート解析を依頼
  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await fetch('/api/analyze-receipt', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const data = await res.json();
      setExtractedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (extractedData) {
      onReceiptAdded(extractedData);
      setSaved(true);
    }
  };

  // 状態を全リセットして次のレシートを登録できる状態に戻す
  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setError(null);
    setSaved(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="upload-container">
      {/* ドラッグ&ドロップ / クリックで画像選択 */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="preview-wrapper">
            <img src={previewUrl} alt="レシートプレビュー" className="preview-image" />
            <button
              className="remove-btn"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-hint">
            <span className="drop-icon">📷</span>
            <p>クリックまたはドラッグ&ドロップで<br />レシート画像をアップロード</p>
            <span className="drop-sub">JPG・PNG・HEIC など対応</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {error && <div className="error-msg">⚠️ {error}</div>}

      {/* 解析ボタン: ファイル選択済み・未解析・未保存のときに表示 */}
      {file && !extractedData && !saved && (
        <button
          className="btn btn-primary btn-lg"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" /> Gemini が解析中...</>
          ) : (
            '🤖 レシートを解析する'
          )}
        </button>
      )}

      {/* 抽出結果の確認・保存 */}
      {extractedData && !saved && (
        <div className="extracted-card">
          <h3>📄 読み取り結果</h3>

          <div className="extracted-meta">
            <div className="meta-item">
              <span className="meta-label">店名</span>
              <span className="meta-value">{extractedData.storeName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">日付</span>
              <span className="meta-value">{extractedData.date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">合計</span>
              <span className="meta-value total-value">
                ¥{extractedData.total?.toLocaleString()}
              </span>
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>商品名</th>
                <th>カテゴリ</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {extractedData.items?.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>
                    <span className="category-badge">
                      {getCategoryIcon(item.category)} {item.category}
                    </span>
                  </td>
                  <td className="price-cell">¥{item.price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="action-btns">
            <button className="btn btn-success" onClick={handleSave}>
              ✅ 保存する
            </button>
            <button className="btn btn-outline" onClick={handleReset}>
              🔄 やり直す
            </button>
          </div>
        </div>
      )}

      {/* 保存完了メッセージ */}
      {saved && (
        <div className="success-card">
          <span className="success-icon">✅</span>
          <p>保存しました！</p>
          <button className="btn btn-primary" onClick={handleReset}>
            続けて登録する
          </button>
        </div>
      )}
    </div>
  );
}

export default ReceiptUpload;

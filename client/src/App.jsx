import { useState, useEffect } from 'react';
import ReceiptUpload from './components/ReceiptUpload';
import ExpenseList from './components/ExpenseList';
import Charts from './components/Charts';
import CategorySummary from './components/CategorySummary';
import './App.css';

// ローカルストレージのキー
const STORAGE_KEY = 'kakeibo-receipts';

function App() {
  // 初期値はローカルストレージから復元（ページリロード後もデータを保持）
  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 表示する月（YYYY-MM 形式）
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [activeTab, setActiveTab] = useState('upload');

  // receipts が変わるたびにローカルストレージへ永続化
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  }, [receipts]);

  const addReceipt = (data) => {
    setReceipts((prev) => [data, ...prev]);
  };

  const deleteReceipt = (id) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  // 選択月に絞り込んだレシート一覧
  const filteredReceipts = receipts.filter((r) =>
    r.date.startsWith(selectedMonth)
  );

  // 選択月の合計支出額
  const totalAmount = filteredReceipts
    .flatMap((r) => r.items || [])
    .reduce((sum, item) => sum + item.price, 0);

  const tabs = [
    { id: 'upload', label: '📷 読み込み' },
    { id: 'list',   label: '📋 一覧' },
    { id: 'charts', label: '📊 グラフ' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 レシート家計簿</h1>
        <p>レシートを読み取って賢く家計管理</p>
      </header>

      {/* 月選択バー */}
      <div className="month-bar">
        <label htmlFor="month-input">表示月</label>
        <input
          id="month-input"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <div className="month-summary">
          <span className="month-count">{filteredReceipts.length} 件</span>
          <span className="month-total">合計 ¥{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* タブナビゲーション */}
      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'upload' && (
          <ReceiptUpload onReceiptAdded={addReceipt} receipts={receipts} />
        )}
        {activeTab === 'list' && (
          <ExpenseList receipts={filteredReceipts} onDelete={deleteReceipt} />
        )}
        {activeTab === 'charts' && (
          <>
            <CategorySummary receipts={filteredReceipts} />
            <Charts receipts={receipts} selectedMonth={selectedMonth} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

import { getCategoryColor, getCategoryIcon } from '../utils/categories';

// 選択月のレシート一覧を表示するコンポーネント
function ExpenseList({ receipts, onDelete }) {
  if (receipts.length === 0) {
    return (
      <div className="empty-state">
        <span>📭</span>
        <p>この月のデータはまだありません</p>
        <p className="empty-sub">「📷 読み込み」からレシートを登録してください</p>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="receipt-card">
          <div className="receipt-header">
            <div>
              <h3 className="store-name">{receipt.storeName}</h3>
              <span className="receipt-date">{receipt.date}</span>
            </div>
            <div className="receipt-right">
              <span className="receipt-total">
                ¥{receipt.total?.toLocaleString()}
              </span>
              <button
                className="delete-btn"
                onClick={() => onDelete(receipt.id)}
                title="このレシートを削除"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* 商品チップ一覧 */}
          <div className="items-grid">
            {receipt.items?.map((item, i) => (
              <div key={i} className="item-chip">
                <span
                  className="item-category-dot"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <span className="item-name">
                  {getCategoryIcon(item.category)} {item.name}
                </span>
                <span className="item-price">¥{item.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;

import { CATEGORIES } from '../utils/categories';

// 選択月のカテゴリ別支出カードを表示するコンポーネント
function CategorySummary({ receipts }) {
  // 全 items を走査してカテゴリ別合計を計算
  const totals = {};
  receipts.forEach((r) => {
    r.items?.forEach((item) => {
      totals[item.category] = (totals[item.category] || 0) + item.price;
    });
  });

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  // 金額の多い順に並べ、0 円のカテゴリは非表示
  const sorted = CATEGORIES
    .filter((c) => totals[c.name])
    .sort((a, b) => (totals[b.name] || 0) - (totals[a.name] || 0));

  if (sorted.length === 0) return null;

  return (
    <div className="category-summary">
      <h2>カテゴリ別集計</h2>
      <div className="category-grid">
        {sorted.map((cat) => {
          const amount = totals[cat.name] || 0;
          const pct = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
          return (
            <div key={cat.name} className="category-card">
              <div className="cat-icon">{cat.icon}</div>
              <div className="cat-name">{cat.name}</div>
              <div className="cat-amount">¥{amount.toLocaleString()}</div>
              <div className="cat-bar-wrap">
                <div
                  className="cat-bar"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
              <div className="cat-pct">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySummary;

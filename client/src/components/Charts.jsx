import { useRef, useEffect } from 'react';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { getCategoryColor } from '../utils/categories';

// 使用する Chart.js 要素を登録（ツリーシェイキング対応）
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// 現在月から count ヶ月分の YYYY-MM 文字列配列を生成
function getPastMonths(count) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  return months;
}

// カテゴリ別円グラフ（選択月）と月別棒グラフ（過去6ヶ月）を描画するコンポーネント
function Charts({ receipts, selectedMonth }) {
  const pieRef = useRef(null);
  const barRef = useRef(null);
  const pieChart = useRef(null);
  const barChart = useRef(null);

  useEffect(() => {
    // --- 円グラフ: 選択月のカテゴリ別支出 ---
    const monthReceipts = receipts.filter((r) => r.date.startsWith(selectedMonth));
    const catTotals = {};
    monthReceipts.forEach((r) => {
      r.items?.forEach((item) => {
        catTotals[item.category] = (catTotals[item.category] || 0) + item.price;
      });
    });

    const pieLabels = Object.keys(catTotals);
    const pieData   = Object.values(catTotals);
    const pieColors = pieLabels.map((l) => getCategoryColor(l));

    // 既存グラフを破棄してから再描画
    if (pieChart.current) pieChart.current.destroy();
    if (pieRef.current && pieLabels.length > 0) {
      pieChart.current = new Chart(pieRef.current, {
        type: 'pie',
        data: {
          labels: pieLabels,
          datasets: [{
            data: pieData,
            backgroundColor: pieColors,
            borderWidth: 2,
            borderColor: '#fff',
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            title: {
              display: true,
              text: `${selectedMonth} カテゴリ別支出`,
              font: { size: 14 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ¥${ctx.parsed.toLocaleString()}`,
              },
            },
          },
        },
      });
    }

    // --- 棒グラフ: 過去6ヶ月の月別支出合計 ---
    const months = getPastMonths(6);
    const monthlyTotals = months.map((m) =>
      receipts
        .filter((r) => r.date.startsWith(m))
        .flatMap((r) => r.items || [])
        .reduce((sum, item) => sum + item.price, 0)
    );

    if (barChart.current) barChart.current.destroy();
    if (barRef.current) {
      barChart.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: months.map((m) => `${m.slice(5)}月`),
          datasets: [{
            label: '支出合計',
            data: monthlyTotals,
            // 選択中の月を濃い紫、その他を薄い紫で表示
            backgroundColor: months.map((m) =>
              m === selectedMonth ? '#4f46e5' : '#a5b4fc'
            ),
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: '月別支出（過去6ヶ月）',
              font: { size: 14 },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ¥${ctx.parsed.y.toLocaleString()}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { callback: (v) => `¥${v.toLocaleString()}` },
            },
          },
        },
      });
    }

    // アンマウント時にグラフを破棄してメモリリークを防ぐ
    return () => {
      if (pieChart.current) pieChart.current.destroy();
      if (barChart.current) barChart.current.destroy();
    };
  }, [receipts, selectedMonth]);

  return (
    <div className="charts-container">
      <div className="chart-card">
        <canvas ref={pieRef} />
      </div>
      <div className="chart-card">
        <canvas ref={barRef} />
      </div>
    </div>
  );
}

export default Charts;

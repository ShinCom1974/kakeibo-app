// カテゴリの定義・色・アイコン一覧
export const CATEGORIES = [
  { name: '食費',   color: '#FF6384', icon: '🛒' },
  { name: '外食',   color: '#FF9F40', icon: '🍽️' },
  { name: '日用品', color: '#FFCD56', icon: '🧴' },
  { name: '交通費', color: '#4BC0C0', icon: '🚃' },
  { name: '衣料品', color: '#36A2EB', icon: '👕' },
  { name: '医療費', color: '#9966FF', icon: '💊' },
  { name: '娯楽',   color: '#FF6B6B', icon: '🎮' },
  { name: 'その他', color: '#C9CBCF', icon: '📦' },
];

export const getCategoryColor = (name) => {
  const cat = CATEGORIES.find((c) => c.name === name);
  return cat ? cat.color : '#C9CBCF';
};

export const getCategoryIcon = (name) => {
  const cat = CATEGORIES.find((c) => c.name === name);
  return cat ? cat.icon : '📦';
};

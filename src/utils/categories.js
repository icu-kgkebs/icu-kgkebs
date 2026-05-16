export const CATEGORIES = {
  worship: { label: '礼拝',       color: '#E07A5F', bg: 'rgba(224,122,95,0.13)',  border: '#C96849' },
  prayer:  { label: '祈り',       color: '#6B9E78', bg: 'rgba(107,158,120,0.13)', border: '#5A8A66' },
  study:   { label: '聖書研究',   color: '#9B87C7', bg: 'rgba(155,135,199,0.13)', border: '#8A74BA' },
  event:   { label: 'イベント',   color: '#C9A84C', bg: 'rgba(201,168,76,0.13)',  border: '#B8943C' },
  practice:{ label: '練習',       color: '#5B8DB8', bg: 'rgba(91,141,184,0.13)',  border: '#4A7AA6' },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, val]) => ({
  value: key,
  ...val,
}));

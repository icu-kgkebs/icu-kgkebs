import { CATEGORIES } from '../utils/categories';

const fmt = (date) =>
  date?.toLocaleString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'short', hour: '2-digit', minute: '2-digit',
  }) ?? '';

export default function EventModal({ event, onClose }) {
  if (!event) return null;

  const { title, start, end, extendedProps = {} } = event;
  const { location, description, assignee, category, photoUrls = [] } = extendedProps;
  const cat = CATEGORIES[category] ?? CATEGORIES.event;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        <span
          className="category-badge"
          style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
        >
          <span style={{
            display: 'inline-block', width: 7, height: 7,
            borderRadius: '50%', background: cat.color,
          }} />
          {cat.label}
        </span>

        {photoUrls.length > 0 && (
          <div className="event-photos">
            {photoUrls.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={`写真 ${i + 1}`} className="event-photo" />
              </a>
            ))}
          </div>
        )}

        <div className="detail-row">
          <span className="detail-icon">📅</span>
          <div>
            <span className="detail-label">開始</span>
            <span className="detail-value">{fmt(start)}</span>
          </div>
        </div>

        {end && (
          <div className="detail-row">
            <span className="detail-icon">🔚</span>
            <div>
              <span className="detail-label">終了</span>
              <span className="detail-value">{fmt(end)}</span>
            </div>
          </div>
        )}

        {location && (
          <div className="detail-row">
            <span className="detail-icon">📍</span>
            <div>
              <span className="detail-label">場所</span>
              <span className="detail-value">{location}</span>
            </div>
          </div>
        )}

        {assignee && (
          <div className="detail-row">
            <span className="detail-icon">👤</span>
            <div>
              <span className="detail-label">担当者</span>
              <span className="detail-value">{assignee}</span>
            </div>
          </div>
        )}

        {description && (
          <div className="detail-row">
            <span className="detail-icon">📝</span>
            <div>
              <span className="detail-label">説明</span>
              <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{description}</span>
            </div>
          </div>
        )}

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  );
}

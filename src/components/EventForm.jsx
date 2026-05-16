import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES, CATEGORY_OPTIONS } from '../utils/categories';

function toDatetimeLocal(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate?.() ?? date;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

const EMPTY = { title: '', start: '', end: '', location: '', description: '', assignee: '', category: 'worship' };

export default function EventForm({ initialData, onClose }) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title:       initialData.title       ?? '',
        start:       toDatetimeLocal(initialData.start),
        end:         toDatetimeLocal(initialData.end),
        location:    initialData.location    ?? '',
        description: initialData.description ?? '',
        assignee:    initialData.assignee    ?? '',
        category:    initialData.category    ?? 'worship',
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('活動名は必須です'); return; }
    if (!form.start)        { setError('開始日時は必須です'); return; }
    if (!form.end)          { setError('終了日時は必須です'); return; }

    setLoading(true);
    setError('');
    try {
      const payload = {
        title:       form.title.trim(),
        start:       Timestamp.fromDate(new Date(form.start)),
        end:         Timestamp.fromDate(new Date(form.end)),
        location:    form.location.trim(),
        description: form.description.trim(),
        assignee:    form.assignee.trim(),
        category:    form.category,
      };
      if (isEdit) {
        await updateDoc(doc(db, 'events', initialData.id), payload);
      } else {
        await addDoc(collection(db, 'events'), { ...payload, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この活動を削除しますか？')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'events', initialData.id));
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const cat = CATEGORIES[form.category] ?? CATEGORIES.worship;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '活動を編集' : '新しい活動を追加'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">カテゴリ</label>
            <select className="form-control" value={form.category} onChange={set('category')}
              style={{ borderColor: cat.color, color: cat.color, fontWeight: 600 }}>
              {CATEGORY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">活動名 *</label>
            <input className="form-control" value={form.title} onChange={set('title')}
              placeholder="例：日曜礼拝" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">開始日時 *</label>
              <input type="datetime-local" className="form-control"
                value={form.start} onChange={set('start')} required />
            </div>
            <div className="form-group">
              <label className="form-label">終了日時 *</label>
              <input type="datetime-local" className="form-control"
                value={form.end} onChange={set('end')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">場所</label>
            <input className="form-control" value={form.location} onChange={set('location')}
              placeholder="例：チャペル" />
          </div>

          <div className="form-group">
            <label className="form-label">担当者</label>
            <input className="form-control" value={form.assignee} onChange={set('assignee')}
              placeholder="例：田中 太郎" />
          </div>

          <div className="form-group">
            <label className="form-label">説明</label>
            <textarea className="form-control" value={form.description} onChange={set('description')}
              placeholder="活動の詳細を入力..." />
          </div>

          {isEdit ? (
            <div className="btn-row-between">
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                削除
              </button>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  キャンセル
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '保存中...' : '更新'}
                </button>
              </div>
            </div>
          ) : (
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                キャンセル
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '保存中...' : '追加'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

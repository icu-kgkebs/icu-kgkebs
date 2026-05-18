import { useState, useEffect, useRef } from 'react';
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

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );
  if (!res.ok) throw new Error('画像のアップロードに失敗しました');
  const data = await res.json();
  return data.secure_url;
}

const EMPTY = {
  title: '', start: '', end: '', location: '',
  description: '', assignee: '', category: 'worship', photoUrls: [],
};

export default function EventForm({ initialData, onClose }) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(EMPTY);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
        photoUrls:   initialData.photoUrls   ?? [],
      });
    } else {
      setForm(EMPTY);
    }
    setPendingFiles([]);
  }, [initialData]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const removePending = (index) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExisting = (index) =>
    setForm((prev) => ({ ...prev, photoUrls: prev.photoUrls.filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('活動名は必須です'); return; }
    if (!form.start)        { setError('開始日時は必須です'); return; }
    if (!form.end)          { setError('終了日時は必須です'); return; }

    setLoading(true);
    setError('');
    try {
      let newUrls = [];
      if (pendingFiles.length > 0) {
        newUrls = await Promise.all(pendingFiles.map(uploadToCloudinary));
      }

      const payload = {
        title:       form.title.trim(),
        start:       Timestamp.fromDate(new Date(form.start)),
        end:         Timestamp.fromDate(new Date(form.end)),
        location:    form.location.trim(),
        description: form.description.trim(),
        assignee:    form.assignee.trim(),
        category:    form.category,
        photoUrls:   [...form.photoUrls, ...newUrls],
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

          {/* ===== 写真アップロード ===== */}
          <div className="form-group">
            <label className="form-label">写真</label>

            {/* 既存の保存済み写真 */}
            {form.photoUrls.length > 0 && (
              <div className="photo-preview-grid">
                {form.photoUrls.map((url, i) => (
                  <div key={url} className="photo-thumb-wrap">
                    <img src={url} alt={`写真 ${i + 1}`} className="photo-thumb" />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => removeExisting(i)}
                      aria-label="削除"
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {/* 追加予定の写真（未アップロード） */}
            {pendingFiles.length > 0 && (
              <div className="photo-preview-grid">
                {pendingFiles.map((file, i) => (
                  <div key={i} className="photo-thumb-wrap">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="photo-thumb" />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => removePending(i)}
                      aria-label="削除"
                    >×</button>
                    <span className="photo-pending-badge">未保存</span>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn btn-secondary photo-add-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              + 写真を追加
            </button>
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
                  {loading ? (pendingFiles.length > 0 ? 'アップロード中...' : '保存中...') : '更新'}
                </button>
              </div>
            </div>
          ) : (
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                キャンセル
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (pendingFiles.length > 0 ? 'アップロード中...' : '保存中...') : '追加'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

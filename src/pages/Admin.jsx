import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES, CATEGORY_OPTIONS } from '../utils/categories';
import EventForm from '../components/EventForm';

function docToFCEvent(doc) {
  const d = doc.data();
  const cat = CATEGORIES[d.category] ?? CATEGORIES.event;
  return {
    id: doc.id,
    title: d.title,
    start: d.start?.toDate(),
    end: d.end?.toDate(),
    backgroundColor: cat.color,
    borderColor: cat.color,
    textColor: '#fff',
    extendedProps: {
      location:    d.location,
      description: d.description,
      assignee:    d.assignee,
      category:    d.category,
      photoUrls:   d.photoUrls ?? [],
    },
  };
}

function fcEventToFormData(fcEvent) {
  return {
    id:          fcEvent.id,
    title:       fcEvent.title,
    start:       fcEvent.start,
    end:         fcEvent.end,
    ...fcEvent.extendedProps,
  };
}

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(null); // null = closed

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start'));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(docToFCEvent));
    });
  }, []);

  const openAdd = (dateRange) => {
    const start = dateRange?.start ?? new Date();
    const end   = dateRange?.end   ?? new Date(start.getTime() + 60 * 60 * 1000);
    setFormData({ start, end });
  };

  const openEdit = (fcEvent) => {
    setFormData(fcEventToFormData(fcEvent));
  };

  return (
    <div className="page-container">
      <div className="admin-toolbar">
        <div className="page-header" style={{ margin: 0 }}>
          <h1 className="page-title">管理者ページ</h1>
          <p className="page-subtitle">活動の追加・編集・削除</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd(null)}>
          + 新しい活動を追加
        </button>
      </div>

      <div className="legend">
        {CATEGORY_OPTIONS.map(({ value, label, color }) => (
          <span key={value} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek',
          }}
          buttonText={{ today: '今日', month: '月', week: '週' }}
          locale={jaLocale}
          events={events}
          selectable
          selectMirror
          select={openAdd}
          eventClick={({ event }) => openEdit(event)}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
          eventContent={(arg) => (
            <div style={{ padding: '1px 3px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 600, marginRight: 2 }}>✎</span>
              {arg.event.title}
            </div>
          )}
        />
      </div>

      {formData !== null && (
        <EventForm
          initialData={formData}
          onClose={() => setFormData(null)}
        />
      )}
    </div>
  );
}

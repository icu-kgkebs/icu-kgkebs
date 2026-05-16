import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES, CATEGORY_OPTIONS } from '../utils/categories';
import EventModal from '../components/EventModal';

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
    },
  };
}

export default function PublicCalendar() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('start'));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(docToFCEvent));
    });
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">活動カレンダー</h1>
        <p className="page-subtitle">礼拝・活動スケジュール一覧</p>
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
          eventClick={({ event }) => setSelected(event)}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

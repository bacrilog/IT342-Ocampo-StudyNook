import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';

const pad = (v) => String(v).padStart(2, '0');
const toInputDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Dashboard({ setUser }) {
  const user = JSON.parse(localStorage.getItem('user'));

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [bookingRoomId, setBookingRoomId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('07:30-09:30');

  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 1, 1));

  const timeSlots = [
    { value: '07:30-09:30', start: '07:30:00', end: '09:30:00' },
    { value: '09:30-11:30', start: '09:30:00', end: '11:30:00' },
    { value: '11:30-13:30', start: '11:30:00', end: '13:30:00' },
    { value: '13:30-15:30', start: '13:30:00', end: '15:30:00' },
    { value: '15:30-17:30', start: '15:30:00', end: '17:30:00' },
    { value: '17:30-19:30', start: '17:30:00', end: '19:30:00' },
    { value: '19:30-21:30', start: '19:30:00', end: '21:30:00' },
  ];

  const fetchRooms = async () => {
    const response = await fetch('http://localhost:8080/api/rooms');
    if (!response.ok) throw new Error('Failed to load rooms');
    setRooms(await response.json());
  };

  const fetchReservations = async () => {
    if (!user?.email) return;
    const response = await fetch(`http://localhost:8080/api/reservations/user?email=${encodeURIComponent(user.email)}`);
    if (!response.ok) throw new Error('Failed to load reservations');
    setReservations(await response.json());
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await fetchRooms();
        await fetchReservations();
      } catch {
        setMessage({ type: 'error', text: 'Could not load booking data. Please check backend server.' });
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSelectRoom = (roomId) => {
    const now = new Date();
    setBookingRoomId(String(roomId));
    if (!bookingDate) setBookingDate(toInputDate(now));
    setActiveTab('availability');
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();

    if (!bookingRoomId || !bookingDate || !selectedSlot) {
      setMessage({ type: 'error', text: 'Please select room, date, and timeslot.' });
      return;
    }

    const slot = timeSlots.find((s) => s.value === selectedSlot);
    if (!slot) {
      setMessage({ type: 'error', text: 'Invalid timeslot selected.' });
      return;
    }

    const startTime = `${bookingDate}T${slot.start}`;
    const endTime = `${bookingDate}T${slot.end}`;

    try {
      const response = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          roomId: bookingRoomId,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to book room.' });
        return;
      }

      setMessage({ type: 'success', text: 'Room booking successful.' });
      setBookingRoomId('');
      setBookingDate('');
      setSelectedSlot('07:30-09:30');
      await fetchRooms();
      await fetchReservations();
    } catch {
      setMessage({ type: 'error', text: 'Booking failed. Backend might be offline.' });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to cancel reservation.' });
        return;
      }

      setMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
      await fetchRooms();
      await fetchReservations();
    } catch {
      setMessage({ type: 'error', text: 'Could not cancel reservation. Backend might be offline.' });
    }
  };

  const visibleRooms = useMemo(() => rooms.filter((r) => r.status !== 'Under Maintenance'), [rooms]);
  const featuredRooms = useMemo(() => visibleRooms.slice(0, 4), [visibleRooms]);

  const activeSessions = useMemo(() => reservations.filter((r) => r.status === 'Booked').length, [reservations]);
  const todayBookings = useMemo(
    () =>
      reservations.filter((r) => {
        if (!r.startTime || r.status !== 'Booked') return false;
        return new Date(r.startTime).toDateString() === new Date().toDateString();
      }).length,
    [reservations]
  );

  const reservedDateKeys = useMemo(() => {
    return new Set(
      reservations
        .filter((r) => r.status === 'Booked' && r.startTime)
        .map((r) => toInputDate(new Date(r.startTime)))
    );
  }, [reservations]);

  const calendarTitle = useMemo(
    () => calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    [calendarMonth]
  );

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length < 42) cells.push(null);
    return cells;
  }, [calendarMonth]);

  const goPrevMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const selectCalendarDate = (d) => {
    setBookingDate(toInputDate(d));
    setActiveTab('availability');
  };

  const formattedDate = 'Friday, February 27, 2026';

  return (
    <div className="minimal-page">
      <div className="minimal-shell">
        <header className="minimal-header">
          <div className="brand-inline">
            <img src="/images/cit.png" alt="CIT Logo" />
            <div>
              <h1>StudyNook</h1>
              <p>CIT-U LRAC</p>
            </div>
          </div>

          <div className="top-right">
            <input className="search-input" placeholder="Search rooms..." />
            <span className="avatar-pill">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
          </div>
        </header>

        <nav className="tab-nav">
          <button className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'browse' ? 'tab active' : 'tab'} onClick={() => setActiveTab('browse')}>Browse Rooms</button>
          <button className={activeTab === 'availability' ? 'tab active' : 'tab'} onClick={() => setActiveTab('availability')}>Availability</button>
          <button className={activeTab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('bookings')}>My Bookings</button>
        </nav>

        <main className="minimal-content">
          <div className="title-row">
            <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'browse' ? 'Browse Rooms' : activeTab === 'availability' ? 'Availability' : 'My Bookings'}</h2>
            <p>{formattedDate}</p>
          </div>

          {message.text && (
            <div className={message.type === 'error' ? 'toast error' : 'toast success'}>{message.text}</div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <section 
                className="hero-clean"
                style={{
                  backgroundImage: `linear-gradient(rgba(139, 31, 31, 0.75), rgba(139, 31, 31, 0.75)), url('${process.env.PUBLIC_URL}/images/lrac.jpg')`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              >
                <div>
                  <small>WELCOME BACK</small>
                  <h3>Ready to book your study space?</h3>
                  <p>{visibleRooms.length} rooms available right now</p>
                </div>
                <button onClick={() => setActiveTab('browse')}>Browse Rooms</button>
              </section>

              <section className="stats-clean">
                <div className="stat-clean"><span>Available Now</span><strong>{visibleRooms.length}</strong></div>
                <div className="stat-clean"><span>Active Sessions</span><strong>{activeSessions}</strong></div>
                <div className="stat-clean"><span>Today's Bookings</span><strong>{todayBookings}</strong></div>
              </section>

              <section className="dashboard-grid-clean">
                <div className="calendar-clean">
                  <div className="calendar-top">
                    <h4>{calendarTitle}</h4>
                    <div>
                      <button type="button" onClick={goPrevMonth}>‹</button>
                      <button type="button" onClick={goNextMonth}>›</button>
                    </div>
                  </div>

                  <div className="weekdays">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                  </div>

                  <div className="days-grid">
                    {calendarCells.map((d, idx) => {
                      if (!d) return <span key={`e-${idx}`} className="day-box empty" />;
                      const key = toInputDate(d);
                      const isSelected = bookingDate === key;
                      const hasBooking = reservedDateKeys.has(key);
                      const cls = `day-box ${isSelected ? 'selected' : ''} ${hasBooking ? 'has-booking' : ''}`.trim();
                      return (
                        <button key={key} type="button" className={cls} onClick={() => selectCalendarDate(d)}>
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="section-row">
                    <h3>Available Rooms Today</h3>
                    <button className="link-mini" onClick={() => setActiveTab('browse')}>View all</button>
                  </div>

                  <div className="room-grid-clean">
                    {loading ? <p>Loading rooms...</p> : featuredRooms.map((room) => (
                      <article key={room.id} className="room-clean">
                        <div className="room-top" />
                        <div className="room-body-clean">
                          <h4>{room.name}</h4>
                          <p>{room.type} • {room.status}</p>
                          <button onClick={() => handleSelectRoom(room.id)}>Book Now</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'browse' && (
            <div className="room-grid-clean three">
              {loading ? <p>Loading rooms...</p> : visibleRooms.map((room) => (
                <article key={room.id} className="room-clean">
                  <div className="room-top" />
                  <div className="room-body-clean">
                    <h4>{room.name}</h4>
                    <p>{room.type} • {room.status}</p>
                    <button onClick={() => handleSelectRoom(room.id)}>Book Now</button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'availability' && (
            <section className="booking-clean">
              <h3>Book Selected Room</h3>
              <form onSubmit={handleBookRoom}>
                <label>Room</label>
                <select value={bookingRoomId} onChange={(e) => setBookingRoomId(e.target.value)}>
                  <option value="">Select a room</option>
                  {visibleRooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name} ({room.type})</option>
                  ))}
                </select>

                <label>Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />

                <label>Fixed 2-hour timeslot</label>
                <select value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                  {timeSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.value}</option>)}
                </select>

                <button type="submit">Confirm Booking</button>
              </form>
            </section>
          )}

          {activeTab === 'bookings' && (
            <div className="booking-list-clean">
              {reservations.length === 0 ? <p>No reservations yet.</p> : reservations.map((r) => (
                <article key={r.id} className="booking-item-clean">
                  <h4>{r.room?.name || 'Room'}</h4>
                  <p><strong>Start:</strong> {new Date(r.startTime).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(r.endTime).toLocaleString()}</p>
                  <p><strong>Status:</strong> {r.status}</p>
                  {r.status === 'Booked' && (
                    <button onClick={() => handleCancelReservation(r.id)}>Cancel Reservation</button>
                  )}
                </article>
              ))}
            </div>
          )}

          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>Logout</button>
        </main>
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn-modal-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

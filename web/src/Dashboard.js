import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';

const pad = (v) => String(v).padStart(2, '0');
const toInputDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Dashboard({ setUser }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = (user?.role || '').toUpperCase() === 'ADMIN';

  const isUpcomingBooking = (reservation) => {
    if (!reservation?.startTime || reservation?.status !== 'Booked') return false;
    return new Date(reservation.startTime).getTime() > Date.now();
  };

  const [activeTab, setActiveTab] = useState(isAdmin ? 'adminOverview' : 'dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [bookingRoomId, setBookingRoomId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('07:30-09:30');
  const [newRoomType, setNewRoomType] = useState('Discussion Room');
  const [adminFilterDate, setAdminFilterDate] = useState('');
  const [adminFilterRoomId, setAdminFilterRoomId] = useState('');

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

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

  const fetchReservations = React.useCallback(async () => {
    if (!user?.email) return;
    const response = await fetch(`http://localhost:8080/api/reservations/user?email=${encodeURIComponent(user.email)}`);
    if (!response.ok) throw new Error('Failed to load reservations');
    setReservations(await response.json());
  }, [user?.email]);

  const fetchAllReservations = React.useCallback(async () => {
    const response = await fetch('http://localhost:8080/api/reservations');
    if (!response.ok) throw new Error('Failed to load all reservations');
    setAllReservations(await response.json());
  }, []);

  // Keep reservation views in sync: user reservations for My Bookings and global reservations for availability.
  const memoizedRefreshReservations = React.useCallback(async () => {
    await Promise.all([fetchReservations(), fetchAllReservations()]);
  }, [fetchReservations, fetchAllReservations]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await fetchRooms();
        await memoizedRefreshReservations();
      } catch {
        setMessage({ type: 'error', text: 'Could not load booking data. Please check backend server.' });
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [memoizedRefreshReservations]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-refresh reservations every 2 seconds when on Availability tab to prevent stale data
  useEffect(() => {
    if (activeTab === 'availability') {
      const interval = setInterval(() => {
        memoizedRefreshReservations();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab, memoizedRefreshReservations]);

  // Also auto-refresh on My Bookings tab so cancellations are visible to other users checking availability
  useEffect(() => {
    if (activeTab === 'bookings') {
      const interval = setInterval(() => {
        memoizedRefreshReservations();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab, memoizedRefreshReservations]);

  // Also refresh on Dashboard and Browse Rooms so real-time availability is always synced
  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'browse' || activeTab === 'roomCatalog' || activeTab === 'reservationManagement') {
      const interval = setInterval(() => {
        memoizedRefreshReservations();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, memoizedRefreshReservations]);

  useEffect(() => {
    if (isAdmin && ['dashboard', 'browse', 'availability', 'bookings'].includes(activeTab)) {
      setActiveTab('adminOverview');
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (!bookingRoomId) return;
    const stillExists = rooms.some((room) => String(room.id) === String(bookingRoomId));
    if (!stillExists) {
      setBookingRoomId('');
    }
  }, [rooms, bookingRoomId]);

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
        const backendError = errorData.error || 'Failed to book room.';
        if (backendError.toLowerCase().includes('room not found')) {
          setBookingRoomId('');
          await fetchRooms();
          setMessage({ type: 'error', text: 'Selected room is outdated. Please reselect a room and try again.' });
        } else {
          setMessage({ type: 'error', text: backendError });
        }
        // Refresh availability to show updated state
        await memoizedRefreshReservations();
        return;
      }

      setMessage({ type: 'success', text: 'Room booking successful! Your reservation is confirmed.' });
      setBookingRoomId('');
      setBookingDate('');
      setSelectedSlot('07:30-09:30');
      await fetchRooms();
      await memoizedRefreshReservations();
    } catch {
      setMessage({ type: 'error', text: 'Booking failed. Backend might be offline.' });
    }
  };

  const handleCancelReservation = async (reservationId) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    if (!reservation || !isUpcomingBooking(reservation)) {
      setMessage({ type: 'error', text: 'Only upcoming booked reservations can be cancelled.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to cancel reservation.' });
        return;
      }

      setMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
      await fetchRooms();
      await memoizedRefreshReservations();
    } catch {
      setMessage({ type: 'error', text: 'Could not cancel reservation. Backend might be offline.' });
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    const generatedName = nextRoomNameForType;
    const capacity = newRoomType === 'Discussion Room' ? 5 : 4;

    if (!generatedName || !newRoomType) {
      setMessage({ type: 'error', text: 'Could not generate room name. Please retry.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedName,
          type: newRoomType,
          capacity,
          status: 'Available',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to add room.' });
        return;
      }

      setMessage({ type: 'success', text: 'Room added successfully.' });
      setNewRoomType('Discussion Room');
      await fetchRooms();
    } catch {
      setMessage({ type: 'error', text: 'Could not add room. Backend might be offline.' });
    }
  };

  const handleUpdateRoomStatus = async (roomId, status) => {
    if (!status) return;

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to update room status.' });
        return;
      }

      setMessage({ type: 'success', text: `Room status updated to ${status}.` });
      await fetchRooms();
      await memoizedRefreshReservations();
    } catch {
      setMessage({ type: 'error', text: 'Could not update room status. Backend might be offline.' });
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

  const filteredAdminReservations = useMemo(() => {
    return allReservations
      .filter((reservation) => {
        if (!reservation.startTime || !reservation.room?.id) return false;

        const matchesDate = !adminFilterDate || toInputDate(new Date(reservation.startTime)) === adminFilterDate;
        const matchesRoom = !adminFilterRoomId || String(reservation.room.id) === adminFilterRoomId;

        return matchesDate && matchesRoom;
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [allReservations, adminFilterDate, adminFilterRoomId]);

  const adminMetrics = useMemo(() => {
    const bookedReservations = allReservations.filter((r) => r.status === 'Booked');
    const underMaintenanceCount = rooms.filter((r) => r.status === 'Under Maintenance').length;
    const activeToday = bookedReservations.filter((r) => {
      if (!r.startTime) return false;
      return new Date(r.startTime).toDateString() === new Date().toDateString();
    }).length;

    return {
      totalRooms: rooms.length,
      underMaintenanceCount,
      totalBookings: bookedReservations.length,
      activeToday,
    };
  }, [rooms, allReservations]);

  // AC-3: Filter available rooms for selected date and time slot
  const availableRoomsForSlot = useMemo(() => {
    if (!bookingDate) return visibleRooms;

    const slot = timeSlots.find((s) => s.value === selectedSlot);
    if (!slot) return visibleRooms;

    const slotStart = `${bookingDate}T${slot.start}`;
    const slotEnd = `${bookingDate}T${slot.end}`;

    return visibleRooms.filter((room) => {
      // Check if room has any conflicting reservations for this time slot
      const hasConflict = allReservations.some((res) => {
        if (res.status !== 'Booked' || !res.startTime || !res.endTime) return false;
        
        const resStart = new Date(res.startTime).getTime();
        const resEnd = new Date(res.endTime).getTime();
        const slotStartTime = new Date(slotStart).getTime();
        const slotEndTime = new Date(slotEnd).getTime();

        // Check for time overlap
        return resStart < slotEndTime && resEnd > slotStartTime && res.room?.id === room.id;
      });

      return !hasConflict;
    });
  }, [bookingDate, selectedSlot, visibleRooms, allReservations, timeSlots]);

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

  const formattedDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    []
  );

  const fixedCapacityForNewRoom = newRoomType === 'Discussion Room' ? 5 : 4;

  const nextRoomNameForType = useMemo(() => {
    const prefix = newRoomType;
    const nextNumber = rooms
      .filter((room) => room.type === newRoomType)
      .map((room) => room.name || '')
      .filter((name) => name.startsWith(`${prefix} `))
      .map((name) => Number.parseInt(name.slice(prefix.length + 1), 10))
      .filter((n) => Number.isFinite(n))
      .reduce((max, n) => Math.max(max, n), 0) + 1;

    return `${prefix} ${nextNumber}`;
  }, [rooms, newRoomType]);

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
            <input className="search-input" placeholder={isAdmin ? 'Search admin data...' : 'Search rooms...'} />
            <span className="avatar-pill">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
          </div>
        </header>

        <nav className="tab-nav">
          {isAdmin ? (
            <>
              <button className={activeTab === 'adminOverview' ? 'tab active' : 'tab'} onClick={() => setActiveTab('adminOverview')}>Admin Overview</button>
              <button className={activeTab === 'roomCatalog' ? 'tab active' : 'tab'} onClick={() => setActiveTab('roomCatalog')}>Room Catalog</button>
              <button className={activeTab === 'reservationManagement' ? 'tab active' : 'tab'} onClick={() => setActiveTab('reservationManagement')}>Reservation Management</button>
            </>
          ) : (
            <>
              <button className={activeTab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              <button className={activeTab === 'browse' ? 'tab active' : 'tab'} onClick={() => setActiveTab('browse')}>Browse Rooms</button>
              <button className={activeTab === 'availability' ? 'tab active' : 'tab'} onClick={() => setActiveTab('availability')}>Availability</button>
              <button className={activeTab === 'bookings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('bookings')}>My Bookings</button>
            </>
          )}
        </nav>

        <main className="minimal-content">
          <div className="title-row" style={{ marginBottom: '30px' }}>
            <h2>{
              activeTab === 'adminOverview'
                ? 'Admin Control Center'
                : activeTab === 'dashboard'
                ? 'Dashboard'
                : activeTab === 'browse'
                ? 'Browse Rooms'
                : activeTab === 'availability'
                ? 'Availability'
                : activeTab === 'bookings'
                ? 'My Bookings'
                : activeTab === 'roomCatalog'
                ? 'Room Catalog'
                : 'Reservation Management'
            }</h2>
            <p>{isAdmin ? `Administrator • ${formattedDate}` : formattedDate}</p>
          </div>

          {message.text && (
            <div className={message.type === 'error' ? 'toast error' : 'toast success'}>{message.text}</div>
          )}

          {!isAdmin && activeTab === 'dashboard' && (
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

          {!isAdmin && activeTab === 'browse' && (
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

          {!isAdmin && activeTab === 'availability' && (
            <section className="booking-clean">
              <h3>Check Room Availability</h3>
              <form onSubmit={handleBookRoom}>
                <label>Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />

                <label>Time Slot</label>
                <select 
                  value={selectedSlot} 
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '20px',
                    paddingRight: '35px'
                  }}
                >
                  {timeSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.value}</option>)}
                </select>

                {bookingDate && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, padding: '12px', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
                      <strong style={{ color: '#155724' }}>{availableRoomsForSlot.length} Available</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#155724' }}>
                        {new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedSlot}
                      </p>
                    </div>
                    {visibleRooms.length > availableRoomsForSlot.length && (
                      <div style={{ flex: 1, padding: '12px', backgroundColor: '#f8d7da', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
                        <strong style={{ color: '#721c24' }}>{visibleRooms.length - availableRoomsForSlot.length} Booked</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#721c24' }}>
                          Unavailable
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <label>Available Rooms</label>
                <select 
                  value={bookingRoomId} 
                  onChange={(e) => setBookingRoomId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '20px',
                    paddingRight: '35px'
                  }}
                  disabled={availableRoomsForSlot.length === 0}
                >
                  <option value="" disabled>
                    {availableRoomsForSlot.length === 0
                      ? 'No rooms available for this slot'
                      : `Select a room`}
                  </option>
                  {availableRoomsForSlot.map((room) => (
                    <option key={room.id} value={room.id}>{room.name} ({room.type})</option>
                  ))}
                </select>

                <button type="submit" disabled={availableRoomsForSlot.length === 0}>Confirm Booking</button>
              </form>

              {visibleRooms.length > availableRoomsForSlot.length && bookingDate && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                  <strong>Fully Booked Rooms for this time slot:</strong>
                  <ul style={{ marginTop: '8px' }}>
                    {visibleRooms
                      .filter((room) => !availableRoomsForSlot.find((r) => r.id === room.id))
                      .map((room) => (
                        <li key={room.id}>{room.name} ({room.type})</li>
                      ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {!isAdmin && activeTab === 'bookings' && (
            <div className="booking-list-clean" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {reservations.length === 0 ? <p>No reservations yet.</p> : reservations.map((r) => (
                <article key={r.id} className="booking-item-clean" style={{ padding: '20px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px' }}>{r.room?.name || 'Room'}</h4>
                  <p style={{ marginBottom: '8px' }}><strong>Start:</strong> {new Date(r.startTime).toLocaleString()}</p>
                  <p style={{ marginBottom: '8px' }}><strong>End:</strong> {new Date(r.endTime).toLocaleString()}</p>
                  <p style={{ marginBottom: '12px' }}><strong>Status:</strong> {r.status}</p>
                  {isUpcomingBooking(r) && (
                    <button onClick={() => handleCancelReservation(r.id)}>Cancel Reservation</button>
                  )}
                </article>
              ))}
            </div>
          )}

          {isAdmin && activeTab === 'adminOverview' && (
            <section className="booking-clean" style={{ maxWidth: '980px', borderTop: '4px solid #1f3a5f' }}>
              <h3>Admin Overview</h3>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '16px' }}>
                <div style={{ padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa' }}>
                  <strong>Total Rooms</strong>
                  <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 700 }}>{adminMetrics.totalRooms}</p>
                </div>
                <div style={{ padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa' }}>
                  <strong>Under Maintenance</strong>
                  <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 700 }}>{adminMetrics.underMaintenanceCount}</p>
                </div>
                <div style={{ padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa' }}>
                  <strong>Booked Sessions</strong>
                  <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 700 }}>{adminMetrics.totalBookings}</p>
                </div>
                <div style={{ padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', background: '#f6f8fa' }}>
                  <strong>Bookings Today</strong>
                  <p style={{ margin: '6px 0 0 0', fontSize: '22px', fontWeight: 700 }}>{adminMetrics.activeToday}</p>
                </div>
              </div>
              <p style={{ margin: 0, color: '#475569' }}>Use Room Catalog to add rooms or set maintenance. Use Reservation Management to audit and filter all bookings.</p>
            </section>
          )}

          {isAdmin && activeTab === 'roomCatalog' && (
            <section className="booking-clean" style={{ maxWidth: '900px' }}>
              <h3>Add New Room</h3>
              <form onSubmit={handleAddRoom}>
                <label>Room Name</label>
                <input
                  type="text"
                  value={nextRoomNameForType}
                  readOnly
                  disabled
                />

                <label>Room Type</label>
                <select value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)}>
                  <option value="Discussion Room">Discussion Room</option>
                  <option value="Laboratory Hub">Laboratory Hub</option>
                </select>

                <label>Capacity</label>
                <input
                  type="number"
                  value={fixedCapacityForNewRoom}
                  readOnly
                  disabled
                />

                <button type="submit">Add Room</button>
              </form>

              <h3 style={{ marginTop: '24px' }}>Manage Room Status</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong>{room.name}</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{room.type} • Capacity {room.capacity} • Current: {room.status}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button type="button" onClick={() => handleUpdateRoomStatus(room.id, 'Available')}>Set Available</button>
                      <button type="button" onClick={() => handleUpdateRoomStatus(room.id, 'Under Maintenance')}>Set Under Maintenance</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {isAdmin && activeTab === 'reservationManagement' && (
            <section className="booking-clean" style={{ maxWidth: '980px' }}>
              <h3>All Student Bookings</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
                  <label>Filter by Date</label>
                  <input type="date" value={adminFilterDate} onChange={(e) => setAdminFilterDate(e.target.value)} />
                </div>
                <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
                  <label>Filter by Room</label>
                  <select value={adminFilterRoomId} onChange={(e) => setAdminFilterRoomId(e.target.value)}>
                    <option value="">All rooms</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredAdminReservations.length === 0 ? (
                <p>No reservations found for selected filters.</p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {filteredAdminReservations.map((reservation) => (
                    <article
                      key={reservation.id}
                      style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '12px', backgroundColor: '#f9f9f9' }}
                    >
                      <p style={{ margin: 0 }}><strong>Student:</strong> {reservation.userEmail}</p>
                      <p style={{ margin: '6px 0 0 0' }}><strong>Room:</strong> {reservation.room?.name || 'N/A'} ({reservation.room?.type || 'N/A'})</p>
                      <p style={{ margin: '6px 0 0 0' }}><strong>Start:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
                      <p style={{ margin: '6px 0 0 0' }}><strong>End:</strong> {new Date(reservation.endTime).toLocaleString()}</p>
                      <p style={{ margin: '6px 0 0 0' }}><strong>Status:</strong> {reservation.status}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
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

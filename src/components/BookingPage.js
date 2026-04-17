// src/components/BookingPage.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import AdminControls from './AdminControls';
import StudentControls from './StudentControls';

// 获取西雅图日期字符串 YYYY-MM-DD
const toSeattleDateString = (date) => {
  return date.toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });
};

const BookingPage = ({ user, onLogout }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [materialsChecked, setMaterialsChecked] = useState(false);
  const [pmChecked, setPMChecked] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [disabledDates, setDisabledDates] = useState([]); // 这里现在存储对象数组 [{date, am, pm}]
  const [isAdminMode, setIsAdminMode] = useState(false);
  const adminDirtyRef = useRef(false);

  // 管理员设置不可用状态的临时状态
  const [adminAmUnavailable, setAdminAmUnavailable] = useState(false);
  const [adminPmUnavailable, setAdminPmUnavailable] = useState(false);

  const materialsStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '3px',
    padding: '2px 4px',
    marginLeft: '4px',
  };

  const amStyle = {
    backgroundColor: '#2196F3',
    color: 'white',
    borderRadius: '3px',
    padding: '2px 4px',
    marginLeft: '4px',
  };

  const pmStyle = {
    backgroundColor: '#FF9800',
    color: 'white',
    borderRadius: '3px',
    padding: '2px 4px',
    marginLeft: '4px',
  };

  useEffect(() => {
    if (user?.email === 'megumi.schacher@gmail.com') {
      setIsAdminMode(true);
    }
  }, [user]);

  // 获取未来的周三和周六
  const getFutureDates = () => {
    const dates = [];
    const today = new Date();
    let current = new Date(today);
    while (current.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short' }) !== 'Wed') {
      current.setDate(current.getDate() + 1 - 3);
    }
    for (let i = 0; i < 12; i++) {
      const wed = new Date(current);
      wed.setDate(current.getDate() + i * 7);
      const sat = new Date(wed);
      sat.setDate(wed.getDate() + 3);
      dates.push(wed, sat);
    }
    return dates;
  };

  const fetchDisabledDates = async () => {
    const { data, error } = await supabase.from('dates').select('date, am, pm');
    if (!error) {
      setDisabledDates(data);
    }
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select(`id, date, materials, am, users!inner (name, email)`)
      .order('date', { ascending: true })
      .order('am', { ascending: false })
      .order('id', { ascending: true });

    if (!error) {
      const transformedData = data.map((course) => ({
        ...course,
        name: course.users.name,
        email: course.users.email,
      }));
      setBookedDates(transformedData);
    }
  };

  // 管理员保存不可用设置
  const handleAdminUpdateStatus = async () => {
    if (!selectedDate) return;
    const dateStr = toSeattleDateString(selectedDate);

    // 如果am和pm都没勾选为不可用，则从表中删除该日期记录（表示完全Available）
    if (!adminAmUnavailable && !adminPmUnavailable) {
      await supabase.from('dates').delete().eq('date', dateStr);
    } else {
      const { error } = await supabase.from('dates').upsert(
        {
          date: dateStr,
          am: adminAmUnavailable,
          pm: adminPmUnavailable,
        },
        { onConflict: 'date' },
      );
      console.log('upsert error', error);
    }
    adminDirtyRef.current = false;
    await fetchDisabledDates();
  };

  const renderActionButton = (currentDisabledStatus) => {
    if (!isAdminMode) {
      const isPeriodDisabled = pmChecked ? currentDisabledStatus?.pm : currentDisabledStatus?.am;
      return (
        <button
          onClick={isCancelMode ? handleCancel : handleBooking}
          disabled={isWithinOneWeek(selectedDate) || isPastDate(selectedDate) || (!isCancelMode && isPeriodDisabled)}
          style={{
            padding: '10px 20px',
            backgroundColor:
              isWithinOneWeek(selectedDate) || isPastDate(selectedDate) || (!isCancelMode && isPeriodDisabled)
                ? '#ccc'
                : isCancelMode
                  ? '#ff4d4d'
                  : '#64B5F6',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%',
            transition: 'background-color 0.3s ease',
            opacity: isPastDate(selectedDate) ? 0.6 : 1,
          }}
        >
          {isCancelMode ? 'Cancel Booking' : isPeriodDisabled ? 'Unavailable' : 'Book'}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleAdminUpdateStatus}
          style={{
            backgroundColor: '#64B5F6',
            padding: '10px 20px',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%',
            transition: 'background-color 0.3s ease',
          }}
        >
          Update Availability
        </button>
      );
    }
  };

  const handleBooking = async () => {
    if (!selectedDate) return;
    if (isPastDate(selectedDate)) {
      alert('Cannot book past dates');
      return;
    }

    const dateStr = toSeattleDateString(selectedDate);
    // 检查管理员是否设置了该时段不可用
    const dateStatus = disabledDates.find((d) => d.date === dateStr);
    if ((!pmChecked && dateStatus?.am) || (pmChecked && dateStatus?.pm)) {
      alert('This period is set to unavailable by teacher');
      return;
    }

    const amCount = bookedDates.filter((b) => b.date === dateStr && b.am === true).length;
    const pmCount = bookedDates.filter((b) => b.date === dateStr && b.am === false).length;
    const targetPeriod = pmChecked ? 'pm' : 'am';

    if ((targetPeriod === 'am' && amCount >= 10) || (targetPeriod === 'pm' && pmCount >= 10)) {
      alert(`This ${targetPeriod} course is full`);
      return;
    }

    const { error } = await supabase.from('courses').insert([
      {
        date: dateStr,
        email: user.email,
        materials: materialsChecked,
        am: !pmChecked,
      },
    ]);

    if (!error) {
      await fetchBookings();
    }
  };

  const handleCancel = async () => {
    if (!selectedDate) return;
    if (isPastDate(selectedDate)) {
      alert('Cannot cancel past bookings');
      return;
    }
    const dateStr = toSeattleDateString(selectedDate);
    const { error } = await supabase.from('courses').delete().eq('date', dateStr).eq('email', user.email);
    if (!error) {
      await fetchBookings();
    } else {
      alert('Failed to cancel booking');
    }
  };

  const isBooked = (date) => {
    const dateStr = toSeattleDateString(date);
    return bookedDates.some((b) => b.date === dateStr);
  };

  const getBookingInfo = (date) => {
    const dateStr = toSeattleDateString(date);
    return bookedDates
      .filter((b) => b.date === dateStr)
      .sort((a, b) => {
        if (a.am === b.am) return a.id - b.id;
        return a.am ? -1 : 1;
      });
  };

  const isPastDate = (date) => {
    const todayStr = toSeattleDateString(new Date());
    const dateStr = toSeattleDateString(date);
    return dateStr < todayStr;
  };

  const isWithinOneWeek = (date) => {
    const now = new Date();
    const target = new Date(date);
    const nowSeattleStr = toSeattleDateString(now);
    const targetSeattleStr = toSeattleDateString(target);
    const nowSeattle = new Date(nowSeattleStr);
    const targetSeattle = new Date(targetSeattleStr);
    const diffMs = targetSeattle - nowSeattle;
    return diffMs < 8 * 24 * 60 * 60 * 1000 && diffMs >= 0;
  };

  const getDayOfWeek = (date) => {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday: 'short',
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchDisabledDates();
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!selectedDate || !isAdminMode) return;

    const dateStr = toSeattleDateString(selectedDate);
    const existingStatus = disabledDates.find((d) => d.date === dateStr);

    console.log('adminDirtyRef', adminDirtyRef.current);
    console.log('nowtest', existingStatus);

    adminDirtyRef.current = false;

    setAdminAmUnavailable(!!existingStatus?.am);
    setAdminPmUnavailable(!!existingStatus?.pm);
  }, [selectedDate, isAdminMode, disabledDates]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = toSeattleDateString(selectedDate);
      const isUserBooked = bookedDates.some((booking) => booking.date === dateStr && booking.email === user.email);

      if (isUserBooked && isWithinOneWeek(selectedDate)) {
        setDisabledMessage('Cannot cancel book in one week.');
      } else if (!isUserBooked && isWithinOneWeek(selectedDate)) {
        setDisabledMessage('Date is too close to book.');
      } else {
        setDisabledMessage('');
      }
    }
  }, [selectedDate, bookedDates, isAdminMode, disabledDates, user.email]);

  const isCancelMode =
    selectedDate && bookedDates.some((booking) => toSeattleDateString(selectedDate) === booking.date && booking.email === user.email);

  const dates = getFutureDates();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', maxWidth: '100vw', overflowX: 'hidden' }}>
      <header style={{ padding: '20px', textAlign: 'right' }}>
        <button onClick={onLogout}>Logout</button>
      </header>
      <h2 style={{ marginBottom: '20px' }}>Booking Page</h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`, gap: '10px', justifyContent: 'center' }}>
        {dates.map((date, index) => {
          const isPast = isPastDate(date);
          const isDateBooked = isBooked(date);
          const bookingInfo = getBookingInfo(date);
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const seattleDateStr = toSeattleDateString(date);

          // 获取当前日期的不可用状态
          const status = disabledDates.find((d) => d.date === seattleDateStr);
          const isAmUnavailable = status?.am;
          const isPmUnavailable = status?.pm;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                width: 'auto',
                minWidth: isMobile ? 'unset' : '120px',
                margin: isMobile ? '5px 0' : '0',
                border: `2px solid ${isSelected ? '#90CAF9' : '#ccc'}`,
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#f0f8ff' : isAmUnavailable && isPmUnavailable ? '#eee' : '#fff',
                textAlign: 'left',
                boxShadow: isSelected ? '0 0 10px rgba(144, 202, 249, 0.8)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setSelectedDate(date)}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: isPast ? '#9e9e9e' : '#333' }}>{getDayOfWeek(date)}</div>
              <div style={{ marginBottom: '10px', color: '#555' }}>{date.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })}</div>

              {/* 展示时段不可用状态 */}
              <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                {isAmUnavailable && <span style={{ color: '#d32f2f', marginRight: '5px' }}>AM Unavailable</span>}
                {isPmUnavailable && <span style={{ color: '#d32f2f' }}>PM Unavailable</span>}
              </div>

              {isPast && <div style={{ color: '#d32f2f', fontSize: 12 }}>Past</div>}

              {isDateBooked && (
                <div style={{ maxHeight: '700px', overflowY: 'auto', marginTop: '10px' }}>
                  {bookingInfo.map((booking, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && booking.am !== bookingInfo[idx - 1].am && <hr style={{ margin: '8px 0', borderColor: '#ddd' }} />}
                      <p
                        style={{
                          margin: '5px 0',
                          fontSize: '12px',
                          color: '#777',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>
                          {booking.name} ({booking.email})
                        </span>
                        {booking.materials && <span style={materialsStyle}>Materials</span>}
                        <span style={booking.am ? amStyle : pmStyle}>{booking.am ? 'am' : 'pm'}</span>
                      </p>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {isSelected && (
                <div style={{ marginTop: 'auto' }}>
                  {isAdminMode ? (
                    <AdminControls
                      adminAmUnavailable={adminAmUnavailable}
                      adminPmUnavailable={adminPmUnavailable}
                      setAdminAmUnavailable={setAdminAmUnavailable}
                      setAdminPmUnavailable={setAdminPmUnavailable}
                      onUpdate={handleAdminUpdateStatus}
                      adminDirtyRef={adminDirtyRef}
                    />
                  ) : (
                    <StudentControls
                      isCancelMode={isCancelMode}
                      isPast={isPast}
                      materialsChecked={materialsChecked}
                      setMaterialsChecked={setMaterialsChecked}
                      pmChecked={pmChecked}
                      setPMChecked={setPMChecked}
                      renderActionButton={renderActionButton}
                      disabledMessage={disabledMessage}
                      status={status}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingPage;

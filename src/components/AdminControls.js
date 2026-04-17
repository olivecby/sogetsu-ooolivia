// src/components/AdminControls.js
import React from 'react';

const AdminControls = ({ adminAmUnavailable, adminPmUnavailable, setAdminAmUnavailable, setAdminPmUnavailable, onUpdate, adminDirtyRef }) => {
  return (
    <div style={{ marginBottom: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Set Unavailable:</p>

      <div
        onClick={(e) => {
          e.stopPropagation();
          adminDirtyRef.current = true;
          setAdminAmUnavailable(!adminAmUnavailable);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '4px 0',
          width: '100%',
          height: '30px',
          backgroundColor: adminAmUnavailable ? '#d32f2f' : '#ccc',
          color: 'white',
          borderRadius: '15px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: adminAmUnavailable ? '90%' : '3%',
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s ease',
          }}
        />
        <span style={{ fontSize: '12px' }}>AM Unavailable</span>
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          adminDirtyRef.current = true;
          setAdminPmUnavailable(!adminPmUnavailable);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '30px',
          backgroundColor: adminPmUnavailable ? '#d32f2f' : '#ccc',
          color: 'white',
          borderRadius: '15px',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: adminPmUnavailable ? '90%' : '3%',
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s ease',
          }}
        />
        <span style={{ fontSize: '12px' }}>PM Unavailable</span>
      </div>

      <button
        onClick={onUpdate}
        style={{
          marginTop: '10px',
          backgroundColor: '#64B5F6',
          padding: '10px 20px',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '100%',
        }}
      >
        Update Availability
      </button>
    </div>
  );
};

export default AdminControls;

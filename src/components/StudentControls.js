// src/components/StudentControls.js
import React from 'react';

const StudentControls = ({
  isCancelMode,
  isPast,
  materialsChecked,
  setMaterialsChecked,
  pmChecked,
  setPMChecked,
  renderActionButton,
  disabledMessage,
  status,
}) => {
  if (isCancelMode || isPast) {
    return (
      <>
        {renderActionButton(status)}
        {disabledMessage && <p style={{ color: '#d32f2f', marginTop: '8px', fontSize: '12px' }}>{disabledMessage}</p>}
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <div
          onClick={() => setMaterialsChecked(!materialsChecked)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '4px 0',
            width: '100%',
            height: '30px',
            backgroundColor: materialsChecked ? '#4CAF50' : 'grey',
            color: 'white',
            borderRadius: '15px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: materialsChecked ? '90%' : '3%',
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s ease',
            }}
          />
          <span style={{ fontSize: '12px' }}>{materialsChecked ? 'Material Need' : 'No Material Need'}</span>
        </div>

        <div
          onClick={() => setPMChecked(!pmChecked)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '30px',
            backgroundColor: pmChecked ? '#FF9800' : '#2196F3',
            color: 'white',
            borderRadius: '15px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: pmChecked ? '90%' : '3%',
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s ease',
            }}
          />
          <span style={{ fontSize: '12px' }}>{pmChecked ? 'PM' : 'AM'}</span>
        </div>
      </div>

      {renderActionButton(status)}

      {disabledMessage && <p style={{ color: '#d32f2f', marginTop: '8px', fontSize: '12px' }}>{disabledMessage}</p>}
    </>
  );
};

export default StudentControls;

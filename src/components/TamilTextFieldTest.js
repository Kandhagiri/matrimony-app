import React, { useEffect, useRef, useState } from 'react';

function TamilTextFieldTest() {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (inputRef.current && window.pramukhIME) {
      window.pramukhIME.setLanguage("tamil", "pramukhindic");
      //window.pramukhIME.enable();
      //window.pramukhIME.enable([inputRef.current]);
      console.log('PramukhIME enabled on test input');
    }
  }, []);

  return (
    <div style={{ padding: '20px', border: '2px solid blue' }}>
      <h3>Test Input (Plain HTML)</h3>
      <input
        ref={inputRef}
        type="text"
        style={{ width: '100%', padding: '10px', fontSize: '1.4rem' }}
        onChange={(e) => {
          console.log('Test input value:', e.target.value);
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          console.log('Test input blur:', e.target.value);
        }}
      />
      <p>Current value: {value}</p>
      <p>Type "vanakkam" to test Tamil transliteration</p>
    </div>
  );
}

export default TamilTextFieldTest;

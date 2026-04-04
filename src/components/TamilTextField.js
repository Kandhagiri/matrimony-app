import React, { useState, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';

const TamilTextField = ({ label, value, onChange, helperText, error, required, ...props }) => {
  const inputRef = useRef(null);
  const nativeInputRef = useRef(null);
  const isKeymanUpdatingRef = useRef(false);
  const lastSyncedValueRef = useRef(value || '');
  const internalValueRef = useRef(value || '');
  const syncTimeoutRef = useRef(null);

  // Use internal state to track the actual input value
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    // Wait for Keyman and Tamil keyboard to be ready
    const timer = setTimeout(() => {
      if (inputRef.current && window.keyman) {
        // Get the actual native input element from Material-UI
        let actualInput = inputRef.current;
        
        // Material-UI's inputRef points to the input element directly
        if (actualInput.tagName !== 'INPUT' && actualInput.tagName !== 'TEXTAREA') {
          actualInput = actualInput.querySelector?.('input') || actualInput.querySelector?.('textarea');
        }
        
        // FIX: Accept both INPUT and TEXTAREA elements
        if (actualInput && (actualInput.tagName === 'INPUT' || actualInput.tagName === 'TEXTAREA')) {
          nativeInputRef.current = actualInput;
          
          try {
            // Ensure className is a string for Keyman Web compatibility
            if (actualInput.className && typeof actualInput.className !== 'string') {
              const classList = actualInput.classList;
              if (classList && classList.length > 0) {
                actualInput.className = Array.from(classList).join(' ');
              } else {
                actualInput.className = actualInput.getAttribute('class') || '';
              }
            }
            
            // Manually attach Keyman Web to this input/textarea
            window.keyman.attachToControl(actualInput);
            
            // Function to activate Tamil keyboard
            const activateTamilKeyboard = (retryCount = 0) => {
              if (!window.keyman) return;
              
              if (!window.tamilKeyboardReady || !window.tamilKeyboardId) {
                if (retryCount < 10) {
                  setTimeout(() => activateTamilKeyboard(retryCount + 1), 200);
                }
                return;
              }
              
              try {
                // Just try to activate - let Keyman handle the stub internally
                // If stub isn't ready, catch the error and retry
                window.keyman.setActiveKeyboard(window.tamilKeyboardId);
                console.log('✅ Tamil keyboard activated for', actualInput.tagName);
              } catch (error) {
                // If it's a stub error, the keyboard isn't fully loaded yet
                if (error.message && (error.message.includes('stub') || error.message.includes('No matching stub'))) {
                  if (retryCount < 30) {
                    // Increase retry count and delay for stub registration
                    if (retryCount === 0 || retryCount % 5 === 0) {
                      console.log('[Keyman] Waiting for keyboard stub to register... Attempt:', retryCount + 1);
                    }
                    setTimeout(() => activateTamilKeyboard(retryCount + 1), 500);
                  } else {
                    console.error('[Keyman] ❌ Failed to activate keyboard after', retryCount, 'attempts - stub never registered');
                  }
                } else {
                  // Other errors - log but don't retry
                  console.error('[Keyman] Activation error (not stub-related):', error);
                }
              }
            };
            
            // Sync function that updates both React state and parent
            const syncValueToReact = (newValue) => {
              if (newValue === lastSyncedValueRef.current) return;
              
              lastSyncedValueRef.current = newValue;
              internalValueRef.current = newValue;
              isKeymanUpdatingRef.current = true;
              
              // Update internal state immediately
              setInternalValue(newValue);
              
              // Notify parent component
              if (onChange) {
                onChange({
                  target: { value: newValue },
                  currentTarget: { value: newValue },
                  preventDefault: () => {},
                  stopPropagation: () => {}
                });
              }
              
              // Reset flag
              setTimeout(() => {
                isKeymanUpdatingRef.current = false;
              }, 50);
            };
            
            // Listen for ALL value changes (Keyman, typing, paste, etc.)
            const handleInput = (e) => {
              const newValue = e.target.value || '';
              syncValueToReact(newValue);
            };
            
            // Listen for input events
            actualInput.addEventListener('input', handleInput, true); // Use capture phase
            
            // Listen for keydown to catch changes early
            const handleKeyDown = (e) => {
              // Let Keyman process first, then sync
              setTimeout(() => {
                const currentValue = actualInput.value || '';
                if (currentValue !== lastSyncedValueRef.current) {
                  syncValueToReact(currentValue);
                }
              }, 0);
            };
            actualInput.addEventListener('keydown', handleKeyDown, true);
            
            // Listen for keyup as backup
            const handleKeyUp = (e) => {
              setTimeout(() => {
                const currentValue = actualInput.value || '';
                if (currentValue !== lastSyncedValueRef.current) {
                  syncValueToReact(currentValue);
                }
              }, 10);
            };
            actualInput.addEventListener('keyup', handleKeyUp, true);
            
            // Critical: Sync on blur to ensure value is saved
            const handleBlur = () => {
              const currentValue = actualInput.value || '';
              if (currentValue !== lastSyncedValueRef.current) {
                syncValueToReact(currentValue);
              }
            };
            actualInput.addEventListener('blur', handleBlur, true);
            
            // Monitor value changes continuously (polling as last resort)
            const valueMonitor = setInterval(() => {
              if (nativeInputRef.current && !isKeymanUpdatingRef.current) {
                const currentValue = nativeInputRef.current.value || '';
                if (currentValue !== lastSyncedValueRef.current && currentValue !== internalValueRef.current) {
                  syncValueToReact(currentValue);
                }
              }
            }, 100);
            
            // Store cleanup function
            actualInput._keymanCleanup = () => {
              clearInterval(valueMonitor);
              actualInput.removeEventListener('input', handleInput, true);
              actualInput.removeEventListener('keydown', handleKeyDown, true);
              actualInput.removeEventListener('keyup', handleKeyUp, true);
              actualInput.removeEventListener('blur', handleBlur, true);
            };
            
            // Activate Tamil keyboard on focus
            const handleFocus = () => {
              setTimeout(() => activateTamilKeyboard(), 50);
            };
            actualInput.addEventListener('focus', handleFocus);
            
            console.log('✅ Keyman Web attached to', actualInput.tagName, ':', actualInput);
          } catch (error) {
            console.error('❌ Error attaching Keyman Web:', error);
          }
        } else {
          console.warn('⚠️ Element is not INPUT or TEXTAREA:', actualInput?.tagName);
        }
      }
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      if (nativeInputRef.current && nativeInputRef.current._keymanCleanup) {
        nativeInputRef.current._keymanCleanup();
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [onChange]);

  // Sync external value changes to internal state (but don't overwrite if Keyman has different value)
  useEffect(() => {
    if (nativeInputRef.current && !isKeymanUpdatingRef.current) {
      const currentDomValue = nativeInputRef.current.value || '';
      const propValue = value || '';
      
      // Only update if:
      // 1. Prop value changed externally AND
      // 2. DOM value matches what we last synced (no unsaved Keyman changes)
      if (propValue !== lastSyncedValueRef.current && currentDomValue === lastSyncedValueRef.current) {
        nativeInputRef.current.value = propValue;
        internalValueRef.current = propValue;
        lastSyncedValueRef.current = propValue;
        setInternalValue(propValue);
      } else if (currentDomValue !== propValue && propValue !== internalValueRef.current) {
        // DOM has different value - prefer DOM value (Keyman might have modified it)
        // But update our refs to match DOM
        internalValueRef.current = currentDomValue;
        lastSyncedValueRef.current = currentDomValue;
        setInternalValue(currentDomValue);
      }
    } else if (!nativeInputRef.current && value !== internalValueRef.current) {
      // Input not attached yet, just update state
      internalValueRef.current = value;
      lastSyncedValueRef.current = value;
      setInternalValue(value);
    }
  }, [value]);

  // Handle React's onChange (user typing without Keyman, or programmatic changes)
  const handleReactChange = (e) => {
    const newValue = e.target.value;
    internalValueRef.current = newValue;
    lastSyncedValueRef.current = newValue;
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
    
    // Also update DOM if it's different (shouldn't happen, but safety)
    if (nativeInputRef.current && nativeInputRef.current.value !== newValue) {
      nativeInputRef.current.value = newValue;
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      value={internalValue}
      onChange={handleReactChange}
      fullWidth
      helperText={helperText }
      {...props}
    />
  );
};

export default TamilTextField;




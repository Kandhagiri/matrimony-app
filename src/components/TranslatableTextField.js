import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { Language } from '@mui/icons-material';

const TranslatableTextField = ({ label, value, onChange, helperText, ...props }) => {
  const [tamilEnabled, setTamilEnabled] = useState(false); // Default to English (disabled)
  const inputRef = useRef(null);
  const nativeInputRef = useRef(null);
  const isKeymanUpdatingRef = useRef(false);
  const lastSyncedValueRef = useRef(value || '');
  const internalValueRef = useRef(value || '');
  const [internalValue, setInternalValue] = useState(value || '');

  // Helper function to get the actual native input element
  const getNativeInput = (element) => {
    if (!element) return null;
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return element;
    }
    return element.querySelector?.('input') || element.querySelector?.('textarea') || null;
  };

  // Attach Keyman Web and set up event handlers
  useEffect(() => {
    const setupKeyman = () => {
      if (!inputRef.current || !window.keyman) {
        // Retry if Keyman or input not ready
        setTimeout(setupKeyman, 200);
        return;
      }

      let actualInput = getNativeInput(inputRef.current);
      if (!actualInput) {
        setTimeout(setupKeyman, 200);
        return;
      }

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

        // Attach Keyman Web to this input
        window.keyman.attachToControl(actualInput);

        // Function to activate/deactivate Tamil keyboard
        const activateTamilKeyboard = (enable, retryCount = 0) => {
          if (!window.keyman) return;

          if (enable) {
            if (!window.tamilKeyboardReady || !window.tamilKeyboardId) {
              if (retryCount < 10) {
                setTimeout(() => activateTamilKeyboard(enable, retryCount + 1), 200);
              }
              return;
            }

            try {
              // Just try to activate - let Keyman handle the stub internally
              window.keyman.setActiveKeyboard(window.tamilKeyboardId);
            } catch (error) {
              // If it's a stub error, retry
              if (error.message && (error.message.includes('stub') || error.message.includes('No matching stub'))) {
                if (retryCount < 30) {
                  if (retryCount === 0 || retryCount % 5 === 0) {
                    console.log('[Keyman] Waiting for keyboard stub... Attempt:', retryCount + 1);
                  }
                  setTimeout(() => activateTamilKeyboard(enable, retryCount + 1), 500);
                } else {
                  console.error('[Keyman] ❌ Failed to activate keyboard after', retryCount, 'attempts');
                }
              } else {
                console.error('[Keyman] Activation error:', error);
              }
            }
          } else {
            // Switch to English keyboard
            try {
              window.keyman.setActiveKeyboard('');
            } catch (error) {
              // Ignore errors when disabling
            }
          }
        };

        // Sync function that updates both React state and parent
        const syncValueToReact = (newValue) => {
          if (newValue === lastSyncedValueRef.current) return;

          lastSyncedValueRef.current = newValue;
          internalValueRef.current = newValue;
          isKeymanUpdatingRef.current = true;

          setInternalValue(newValue);

          if (onChange) {
            onChange({
              target: { value: newValue },
              currentTarget: { value: newValue },
              preventDefault: () => {},
              stopPropagation: () => {}
            });
          }

          setTimeout(() => {
            isKeymanUpdatingRef.current = false;
          }, 50);
        };

        // Listen for ALL value changes
        const handleInput = (e) => {
          const newValue = e.target.value || '';
          syncValueToReact(newValue);
        };
        actualInput.addEventListener('input', handleInput, true);

        const handleKeyDown = (e) => {
          setTimeout(() => {
            const currentValue = actualInput.value || '';
            if (currentValue !== lastSyncedValueRef.current) {
              syncValueToReact(currentValue);
            }
          }, 0);
        };
        actualInput.addEventListener('keydown', handleKeyDown, true);

        const handleKeyUp = (e) => {
          setTimeout(() => {
            const currentValue = actualInput.value || '';
            if (currentValue !== lastSyncedValueRef.current) {
              syncValueToReact(currentValue);
            }
          }, 10);
        };
        actualInput.addEventListener('keyup', handleKeyUp, true);

        const handleBlur = () => {
          const currentValue = actualInput.value || '';
          if (currentValue !== lastSyncedValueRef.current) {
            syncValueToReact(currentValue);
          }
        };
        actualInput.addEventListener('blur', handleBlur, true);

        // Monitor value changes continuously
        const valueMonitor = setInterval(() => {
          if (nativeInputRef.current && !isKeymanUpdatingRef.current) {
            const currentValue = nativeInputRef.current.value || '';
            if (currentValue !== lastSyncedValueRef.current && currentValue !== internalValueRef.current) {
              syncValueToReact(currentValue);
            }
          }
        }, 100);

        // Activate/deactivate keyboard on focus based on toggle state
        const handleFocus = () => {
          setTimeout(() => {
            activateTamilKeyboard(tamilEnabled);
          }, 50);
        };
        actualInput.addEventListener('focus', handleFocus);

        // Store cleanup function
        actualInput._keymanCleanup = () => {
          clearInterval(valueMonitor);
          actualInput.removeEventListener('input', handleInput, true);
          actualInput.removeEventListener('keydown', handleKeyDown, true);
          actualInput.removeEventListener('keyup', handleKeyUp, true);
          actualInput.removeEventListener('blur', handleBlur, true);
          actualInput.removeEventListener('focus', handleFocus);
        };

        // Initial activation if Tamil is enabled
        if (tamilEnabled) {
          activateTamilKeyboard(true);
        }

        console.log('✅ Keyman Web attached to TranslatableTextField:', actualInput);
      } catch (error) {
        console.error('❌ Error attaching Keyman Web:', error);
      }
    };

    // Wait a bit longer for Accordion content to render
    const timer = setTimeout(setupKeyman, 500);

    return () => {
      clearTimeout(timer);
      if (nativeInputRef.current && nativeInputRef.current._keymanCleanup) {
        nativeInputRef.current._keymanCleanup();
      }
    };
  }, [tamilEnabled, onChange]); // Re-run when Tamil toggle changes

  // Sync external value changes to internal state
  useEffect(() => {
    if (nativeInputRef.current && !isKeymanUpdatingRef.current) {
      const currentDomValue = nativeInputRef.current.value || '';
      const propValue = value || '';

      if (propValue !== lastSyncedValueRef.current && currentDomValue === lastSyncedValueRef.current) {
        nativeInputRef.current.value = propValue;
        internalValueRef.current = propValue;
        lastSyncedValueRef.current = propValue;
        setInternalValue(propValue);
      } else if (currentDomValue !== propValue && propValue !== internalValueRef.current) {
        internalValueRef.current = currentDomValue;
        lastSyncedValueRef.current = currentDomValue;
        setInternalValue(currentDomValue);
      }
    } else if (!nativeInputRef.current && value !== internalValueRef.current) {
      internalValueRef.current = value;
      lastSyncedValueRef.current = value;
      setInternalValue(value);
    }
  }, [value]);

  const toggleTamil = () => {
    // Sync current value before toggling
    if (nativeInputRef.current) {
      const currentValue = nativeInputRef.current.value || '';
      if (currentValue !== lastSyncedValueRef.current && onChange) {
        lastSyncedValueRef.current = currentValue;
        internalValueRef.current = currentValue;
        setInternalValue(currentValue);
        onChange({
          target: { value: currentValue },
          currentTarget: { value: currentValue }
        });
      }
    }
    setTamilEnabled(!tamilEnabled);
  };

  // Handle React's onChange
  const handleReactChange = (e) => {
    const newValue = e.target.value;
    internalValueRef.current = newValue;
    lastSyncedValueRef.current = newValue;
    setInternalValue(newValue);

    if (onChange) {
      onChange(e);
    }

    if (nativeInputRef.current && nativeInputRef.current.value !== newValue) {
      nativeInputRef.current.value = newValue;
    }
  };

  // Update keyboard when toggle changes and input is focused
  useEffect(() => {
    if (nativeInputRef.current && document.activeElement === nativeInputRef.current) {
      if (tamilEnabled && window.keyman && window.tamilKeyboardReady && window.tamilKeyboardId) {
        try {
          window.keyman.setActiveKeyboard(window.tamilKeyboardId);
        } catch (error) {
          // Silently handle stub errors - they'll retry on next focus
          if (!error.message || !error.message.includes('stub')) {
            console.error('Error activating Tamil keyboard:', error);
          }
        }
      } else if (!tamilEnabled && window.keyman) {
        try {
          window.keyman.setActiveKeyboard('');
        } catch (error) {
          // Ignore
        }
      }
    }
  }, [tamilEnabled]);

  return (
    <TextField
      inputRef={inputRef}
      label={label}
      value={internalValue}
      onChange={handleReactChange}
      onFocus={(e) => {
        // Activate keyboard based on toggle state when focused
        if (tamilEnabled && window.keyman && window.tamilKeyboardReady && window.tamilKeyboardId) {
          setTimeout(() => {
            try {
              window.keyman.setActiveKeyboard(window.tamilKeyboardId);
            } catch (error) {
              // Silently handle stub errors
              if (!error.message || !error.message.includes('stub')) {
                console.error('Error activating Tamil keyboard on focus:', error);
              }
            }
          }, 50);
        } else if (!tamilEnabled && window.keyman) {
          setTimeout(() => {
            try {
              window.keyman.setActiveKeyboard('');
            } catch (error) {
              // Ignore
            }
          }, 50);
        }
      }}
      fullWidth
      helperText={helperText || (tamilEnabled ? 'தமிழ் பிழையுணர்தல் செயல்படுத்தப்பட்டது' : 'ஐகானைக் கிளிக் செய்து தமிழ் பிழையுணர்தலை இயக்கவும்')}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={toggleTamil}
              color={tamilEnabled ? 'primary' : 'default'}
              edge="end"
            >
              <Language />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderColor: tamilEnabled ? '#1976d2' : undefined,
            borderWidth: tamilEnabled ? 2 : 1,
          },
        },
      }}
      {...props}
    />
  );
};

export default TranslatableTextField;




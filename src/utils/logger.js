/**
 * Logger utility for renderer process
 * Uses electron-log if available, falls back to console
 */

const logger = {
  error: (...args) => {
    if (window.electronLog) {
      window.electronLog.error(...args);
    } else {
      console.error(...args);
    }
  },
  
  warn: (...args) => {
    if (window.electronLog) {
      window.electronLog.warn(...args);
    } else {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (window.electronLog) {
      window.electronLog.info(...args);
    } else {
      console.info(...args);
    }
  },
  
  verbose: (...args) => {
    if (window.electronLog) {
      window.electronLog.verbose(...args);
    } else {
      console.log('[VERBOSE]', ...args);
    }
  },
  
  debug: (...args) => {
    if (window.electronLog) {
      window.electronLog.debug(...args);
    } else {
      console.debug(...args);
    }
  },
  
  silly: (...args) => {
    if (window.electronLog) {
      window.electronLog.silly(...args);
    } else {
      console.log('[SILLY]', ...args);
    }
  },
};

export default logger;




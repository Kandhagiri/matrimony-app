/**
 * Tamil transliteration utilities using Pramukh IME
 */

/**
 * Initialize Pramukh IME for Tamil transliteration
 */
export function initializePramukhIME() {
  console.log('Initializing PramukhIME...', typeof window, typeof window.pramukhIME);
  
  if (typeof window !== 'undefined' && window.pramukhIME) {
    try {
      console.log('PramukhIME found, setting language to Tamil');
      // Set language to Tamil using pramukhindic keyboard
      window.pramukhIME.setLanguage('tamil', 'pramukhindic');
      //window.pramukhIME.enable();
      //window.pramukhIME.setLanguage("tamil", "tamil");
      // Configure settings
     // window.pramukhIME.setSe(true);
      console.log('READY: type vanakkam → வணக்கம்');
      
      console.log('PramukhIME initialized successfully');
    } catch (error) {
      console.error('Error initializing Pramukh IME:', error);
    }
  } else {
    console.warn('PramukhIME not found on window object');
  }
}

/**
 * Enable Pramukh IME on an element or globally
 * @param {HTMLElement} [element] - Optional element to enable IME on
 */
export function enablePramukhIME(element) {
  console.log('[enablePramukhIME] Called', element ? 'with element' : 'globally');
  
  if (typeof window !== 'undefined' && window.pramukhIME) {
    try {
      // Initialize if not already done
      const currentLang = window.pramukhIME.getLanguage();
      console.log('[enablePramukhIME] Current language:', currentLang);
      
      if (!currentLang || currentLang.language !== 'tamil') {
        console.log('[enablePramukhIME] Initializing Tamil language...');
        initializePramukhIME();
      }
      
      // If no element provided, enable globally
      // If element provided but global enable is better in production, enable globally anyway
      if (!element) {
        console.log('[enablePramukhIME] Enabling globally');
        //window.pramukhIME.enable();
      } else {
        // In Electron production, per-element enable might fail
        // Try global enable first, which works more reliably
        console.log('[enablePramukhIME] Enabling globally (per-element may fail in Electron)');
        //window.pramukhIME.enable();
      }
      
      console.log('[enablePramukhIME] ✅ Enabled successfully');
    } catch (error) {
      console.error('[enablePramukhIME] ❌ Error:', error);
    }
  } else {
    console.warn('[enablePramukhIME] Cannot enable - PramukhIME not found on window');
  }
}

/**
 * Disable Pramukh IME on an element or globally
 * @param {HTMLElement} [element] - Optional element to disable IME on
 */
export function disablePramukhIME(element) {
  if (typeof window !== 'undefined' && window.pramukhIME) {
    try {
      if (element) {
        window.pramukhIME.disable(element);
      } else {
        window.pramukhIME.disable();
      }
    } catch (error) {
      console.error('Error disabling Pramukh IME:', error);
    }
  }
}


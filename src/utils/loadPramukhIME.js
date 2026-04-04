/**
 * Dynamically load PramukhIME script
 * This ensures it loads correctly in both dev and packaged Electron apps
 */
const SCRIPT_SEQUENCE = [
  { attr: 'common', path: 'js/pramukhime-common.js' },
  { attr: 'i18n', path: 'js/pramukhindic-i18n.js' },
  { attr: 'core', path: 'js/pramukhime.js' },
];

let loadingPromise = null;

function getBasePaths() {
  const protocol = window.location.protocol;
  if (protocol === 'http:' || protocol === 'https:') {
    return Promise.resolve({
      resolver: (relativePath) => `/` + relativePath.replace(/^\/+/, ''),
    });
  }

  if (window.electronAPI && typeof window.electronAPI.getResourcePath === 'function') {
    return Promise.resolve({
      resolver: (relativePath) => window.electronAPI.getResourcePath(relativePath)
        .then((resolved) => resolved || relativePath),
    });
  }

  const currentPath = window.location.pathname;
  let basePath = currentPath.replace(/\/index\.html$/i, '');
  if (basePath.includes('main_window')) {
    basePath = basePath.replace(/\/main_window.*$/, '');
  }

  return Promise.resolve({
    resolver: (relativePath) => `${basePath}/${relativePath}`.replace(/\/+/g, '/'),
  });
}

function scriptAlreadyLoaded(attr) {
  return Boolean(document.querySelector(`script[data-pramukhime-${attr}]`));
}

function appendScript(srcPromise, attr) {
  return srcPromise.then((scriptSrc) => new Promise((resolve, reject) => {
    if (scriptAlreadyLoaded(attr)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute(`data-pramukhime-${attr}`, 'true');

    script.onload = () => resolve();
    script.onerror = (error) => {
      console.error(`Failed to load PramukhIME script ${scriptSrc}`, error);
      reject(new Error(`Failed to load PramukhIME script: ${scriptSrc}`));
    };

    script.src = scriptSrc;
    document.head.appendChild(script);
  }));
}

export function loadPramukhIME() {
  if (window.pramukhIME) {
    return Promise.resolve(window.pramukhIME);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = getBasePaths()
    .then(({ resolver }) => {
      const resolvePath = (relativePath) => {
        const resolved = resolver(relativePath);
        // resolver may return a promise (electron IPC) or a string
        return resolved instanceof Promise ? resolved : Promise.resolve(resolved);
      };

      return SCRIPT_SEQUENCE.reduce((chain, { attr, path }) => {
        return chain.then(() => appendScript(resolvePath(path), attr));
      }, Promise.resolve());
    })
    .then(() => {
      if (!window.pramukhIME) {
        throw new Error('PramukhIME scripts loaded but window.pramukhIME is undefined');
      }
      console.log('PramukhIME scripts loaded successfully');
      return window.pramukhIME;
    })
    .catch((error) => {
      console.error('Failed to load PramukhIME scripts:', error);
      throw error;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
}

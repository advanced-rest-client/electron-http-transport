
class DomHelper {
  static inkjectPolyfills() {
    const s = document.createElement('script');
    s.src = '../bower_components/webcomponentsjs/webcomponents-loader.js';
    document.head.appendChild(s);
  }

  static injectElement() {
    return DomHelper._importHref('../../../electron-http-transport.html');
  }

  static addElement() {
    const e = document.createElement('electron-http-transport');
    document.body.appendChild(e);
    return e;
  }

  static removeElement() {
    const nodes = document.querySelector('electron-http-transport');
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  static getElement() {
    return document.querySelector('electron-http-transport');
  }

  static fire(detail, type) {
    type = type || 'transport-request';
    const e = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail
    });
    document.body.dispatchEvent(e);
    return e;
  }

  static _importHref(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'import';
      link.href = href;
      link.setAttribute('import-href', '');
      link.setAttribute('async', '');
      const callbacks = {
        load: function() {
          callbacks.cleanup();
          resolve();
        },
        error: function() {
          callbacks.cleanup();
          reject(new Error(`Unable to load module ${href}`));
        },
        cleanup: function() {
          link.removeEventListener('load', callbacks.load);
          link.removeEventListener('error', callbacks.error);
        }
      };
      link.addEventListener('load', callbacks.load);
      link.addEventListener('error', callbacks.error);
      document.head.appendChild(link);
    });
  }
}

module.exports.DomHelper = DomHelper;

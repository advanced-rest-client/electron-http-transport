const {DomHelper} = require('./dom-helper');
const assert = require('chai').assert;

describe('Configuration tests', function() {
  before(() => {
    return DomHelper.injectElement();
  });

  describe('_prepareRequestOptions()', () => {
    describe('Default request settings', () => {
      let element;
      beforeEach(() => {
        element = DomHelper.addElement();
      });
      afterEach(() => DomHelper.removeElement());

      it('Timeout is 0', () => {
        const opts = element._prepareRequestOptions({});
        assert.equal(opts.timeout, 0);
      });

      it('validateCertificates is false', () => {
        const opts = element._prepareRequestOptions({});
        assert.isFalse(opts.validateCertificates);
      });

      it('followRedirects is false', () => {
        const opts = element._prepareRequestOptions({});
        assert.isFalse(opts.followRedirects);
      });

      it('sentMessageLimit is undefined', () => {
        const opts = element._prepareRequestOptions({});
        assert.isUndefined(opts.sentMessageLimit);
      });
    });

    describe('Element attributes settings', () => {
      let element;
      beforeEach(() => {
        element = DomHelper.addElement();
      });
      afterEach(() => DomHelper.removeElement());

      it('Sets timeout from attribute', () => {
        element.setAttribute('request-timeout', '1000');
        const opts = element._prepareRequestOptions({});
        assert.equal(opts.timeout, 1000);
      });

      it('Multiplies timout by 1000', () => {
        element.setAttribute('request-timeout', '1');
        const opts = element._prepareRequestOptions({});
        assert.equal(opts.timeout, 1000);
      });

      it('validateCertificates is true', () => {
        element.setAttribute('validate-certificates', '');
        const opts = element._prepareRequestOptions({});
        assert.isTrue(opts.validateCertificates);
      });

      it('followRedirects is true', () => {
        element.setAttribute('follow-redirects', '');
        const opts = element._prepareRequestOptions({});
        assert.isTrue(opts.followRedirects);
      });

      it('sentMessageLimit is set', () => {
        element.setAttribute('sent-message-limit', '250');
        const opts = element._prepareRequestOptions({});
        assert.equal(opts.sentMessageLimit, 250);
      });
    });

    describe('Request config', () => {
      let config;
      let element;
      beforeEach(() => {
        element = DomHelper.addElement();
        config = {
          timeout: 2000,
          validateCertificates: true,
          followRedirects: true,
          sentMessageLimit: 50
        };
      });
      afterEach(() => DomHelper.removeElement());

      it('Sets timeout from request config', () => {
        element.setAttribute('request-timeout', '1000');
        const opts = element._prepareRequestOptions({
          config
        });
        assert.equal(opts.timeout, 2000);
      });

      it('Multiplies timout by 1000', () => {
        config.timeout = 2;
        element.setAttribute('request-timeout', '1');
        const opts = element._prepareRequestOptions({
          config
        });
        assert.equal(opts.timeout, 2000);
      });

      it('validateCertificates is true', () => {
        const opts = element._prepareRequestOptions({
          config
        });
        assert.isTrue(opts.validateCertificates);
      });

      it('followRedirects is true', () => {
        const opts = element._prepareRequestOptions({
          config
        });
        assert.isTrue(opts.followRedirects);
      });

      it('sentMessageLimit is set', () => {
        element.setAttribute('sent-message-limit', '250');
        const opts = element._prepareRequestOptions({
          config
        });
        assert.equal(opts.sentMessageLimit, 50);
      });
    });

    describe('Function call config', () => {
      let rConfig;
      let fConfig;
      let element;
      beforeEach(() => {
        element = DomHelper.addElement();
        rConfig = {
          timeout: 2000,
          validateCertificates: true,
          followRedirects: true,
          sentMessageLimit: 50
        };

        fConfig = {
          timeout: 3000,
          validateCertificates: false,
          followRedirects: false,
          sentMessageLimit: 350
        };
      });
      afterEach(() => DomHelper.removeElement());

      it('Sets timeout from request config', () => {
        element.setAttribute('request-timeout', '1000');
        const opts = element._prepareRequestOptions({
          config: rConfig
        }, fConfig);
        assert.equal(opts.timeout, 3000);
      });

      it('Multiplies timout by 1000', () => {
        rConfig.timeout = 3;
        element.setAttribute('request-timeout', '1');
        const opts = element._prepareRequestOptions({
          config: rConfig
        }, fConfig);
        assert.equal(opts.timeout, 3000);
      });

      it('validateCertificates is true', () => {
        const opts = element._prepareRequestOptions({
          config: rConfig
        }, fConfig);
        assert.isFalse(opts.validateCertificates);
      });

      it('followRedirects is true', () => {
        const opts = element._prepareRequestOptions({
          config: rConfig
        }, fConfig);
        assert.isFalse(opts.followRedirects);
      });

      it('sentMessageLimit is set', () => {
        element.setAttribute('sent-message-limit', '250');
        const opts = element._prepareRequestOptions({
          config: rConfig
        }, fConfig);
        assert.equal(opts.sentMessageLimit, 350);
      });
    });
  });
});

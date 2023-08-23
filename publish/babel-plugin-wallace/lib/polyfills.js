/**
 * Polyfill for TextEncoder which is required by JSDOM but no longer bundled with it.
 * Must do this before importing other modules which require JSDOM.
 */
const { TextEncoder, TextDecoder } = require( 'util');
Object.assign(global, { TextDecoder, TextEncoder });

module.exports = {
  polyfills: "OK"
}
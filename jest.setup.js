import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

global.fetch = async () =>
  Promise.resolve({
    ok: true,
    json: async () => ({ username: 'guest' }),
  });

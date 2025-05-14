import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv();

Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      importKey: () => new Promise((resolve) => resolve({})),
      encrypt: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      decrypt: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      exportKey: () => new Promise((resolve) => resolve({})),
      generateKey: () => new Promise((resolve) => resolve({})),
      sign: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      verify: () => new Promise((resolve) => resolve(true)),
      digest: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      wrapKey: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      unwrapKey: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
      deriveKey: () => new Promise((resolve) => resolve({})),
      deriveBits: () => new Promise((resolve) => resolve(new ArrayBuffer(0))),
    },
    getRandomValues: () => new Uint32Array(10), // Mock getRandomValues
  },
});
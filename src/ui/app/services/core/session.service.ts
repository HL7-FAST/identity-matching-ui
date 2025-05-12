import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '@/ui/environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private sessionKey: CryptoKey | null = null;
  private keyString = 'mySuperDuperSecureKey';
  private iv: Uint8Array = new Uint8Array(16);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initKey();
    }
  }

  private async initKey() {
    // Use TextEncoder to convert string to Uint8Array
    const enc = new TextEncoder();
    const keyMaterial = enc.encode(this.keyString.padEnd(32, '0').slice(0, 32));
    this.sessionKey = await window.crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async storeItem(key: string, value: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.sessionKey) await this.initKey();

    const enc = new TextEncoder();
    const data = enc.encode(value);

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: this.iv },
      this.sessionKey as CryptoKey,
      data
    );
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    sessionStorage.setItem(key, encryptedBase64);

    if (!environment.production) {
      sessionStorage.setItem(key.concat('-dev'), value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    if (!this.sessionKey) await this.initKey();

    const encryptedBase64 = sessionStorage.getItem(key);
    if (!encryptedBase64) return null;

    const encryptedBytes = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: this.iv },
        this.sessionKey as CryptoKey,
        encryptedBytes
      );
      return new TextDecoder().decode(decrypted);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(key);
    }
  }

  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }
  }
}
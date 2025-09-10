import CryptoJS from 'crypto-js';

export interface TOTPAccount {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  digits?: number;
  period?: number;
  algorithm?: string;
}

// Convert base32 to hex
function base32ToHex(base32: string): string {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";
  
  base32 = base32.replace(/=+$/, "");
  
  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) throw new Error("Invalid base32 character");
    bits += val.toString(2).padStart(5, '0');
  }
  
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  
  return hex;
}

// Generate TOTP code
export function generateTOTP(secret: string, digits: number = 6, period: number = 30): string {
  try {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = Math.floor(epoch / period).toString(16).padStart(16, '0');
    
    const hmacHex = base32ToHex(secret.replace(/\s+/g, ''));
    const hmacKey = CryptoJS.enc.Hex.parse(hmacHex);
    const timeHex = CryptoJS.enc.Hex.parse(time);
    
    const hmac = CryptoJS.HmacSHA1(timeHex, hmacKey);
    const hmacStr = hmac.toString(CryptoJS.enc.Hex);
    
    const offset = parseInt(hmacStr.slice(-1), 16);
    const otp = (parseInt(hmacStr.substr(offset * 2, 8), 16) & 0x7fffffff) % Math.pow(10, digits);
    
    return otp.toString().padStart(digits, '0');
  } catch (error) {
    return '000000';
  }
}

// Get remaining seconds until next code
export function getRemainingSeconds(period: number = 30): number {
  const epoch = Math.round(new Date().getTime() / 1000.0);
  return period - (epoch % period);
}

// Parse TOTP URI (otpauth://totp/...)
export function parseTOTPUri(uri: string): Partial<TOTPAccount> {
  try {
    const url = new URL(uri);
    if (url.protocol !== 'otpauth:' || url.hostname !== 'totp') {
      throw new Error('Invalid TOTP URI');
    }

    const pathParts = url.pathname.slice(1).split(':');
    const issuer = pathParts.length > 1 ? pathParts[0] : url.searchParams.get('issuer') || '';
    const name = pathParts.length > 1 ? pathParts[1] : pathParts[0];
    const secret = url.searchParams.get('secret');
    
    if (!secret) throw new Error('No secret found in URI');

    return {
      name,
      issuer,
      secret,
      digits: parseInt(url.searchParams.get('digits') || '6'),
      period: parseInt(url.searchParams.get('period') || '30'),
      algorithm: url.searchParams.get('algorithm') || 'SHA1'
    };
  } catch (error) {
    throw new Error('Invalid TOTP URI format');
  }
}
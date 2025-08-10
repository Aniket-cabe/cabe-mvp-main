import crypto from 'crypto';

export class EncryptionService {
  private static algorithm = 'aes-256-gcm';
  private static keyLength = 32;
  private static ivLength = 16;
  private static saltLength = 64;
  private static tagLength = 16;

  static encrypt(text: string, key: string): string {
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    const derivedKey = crypto.pbkdf2Sync(
      key,
      salt,
      100000,
      this.keyLength,
      'sha256'
    );

    const cipher = crypto.createCipherGCM(this.algorithm, derivedKey, iv);
    cipher.setAAD(Buffer.from('cabe-arena', 'utf8'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return (
      salt.toString('hex') +
      ':' +
      iv.toString('hex') +
      ':' +
      tag.toString('hex') +
      ':' +
      encrypted
    );
  }

  static decrypt(encryptedText: string, key: string): string {
    const parts = encryptedText.split(':');
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];

    const derivedKey = crypto.pbkdf2Sync(
      key,
      salt,
      100000,
      this.keyLength,
      'sha256'
    );

    const decipher = crypto.createDecipherGCM(this.algorithm, derivedKey, iv);
    decipher.setAAD(Buffer.from('cabe-arena', 'utf8'));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

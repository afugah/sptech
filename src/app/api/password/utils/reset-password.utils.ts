import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.AUTH_SECRET;

interface TokenPayload {
  contactId: string;
}

export function createToken(contactId: string): string {
  const payload: TokenPayload = { contactId };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
  return token;
}

export function verifyToken(token: string): TokenPayload | null {
  const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
  return decoded;
}

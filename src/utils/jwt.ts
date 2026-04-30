import config from "config";
import jwt from "jsonwebtoken";
import fs from "fs";

// const publicKey = Buffer.from(
//   config.get<string>("publicKey"),
//   "base64"
// ).toString("ascii");
// const privateKey = Buffer.from(
//   config.get<string>("privateKey"),
//   "base64"
// ).toString("ascii");

// const publicKey = fs.readFileSync('public_key.pem');  // get public key
// const privateKey = fs.readFileSync('private_key.pem');  // get private key

const Secretkey = process.env.PUBLIC_KEY

export interface JwtPayload {
  _id: string;
  email: string;
  name: string;
  role: string;
  club?: {
    _id: string;
    name: string;
  };
}

export function signJwt(payload: JwtPayload): string {
  if (!Secretkey) {
    throw new Error('JWT Secret key (PUBLIC_KEY) is not set in environment variables');
  }
  return jwt.sign(payload, Secretkey, {
    expiresIn: '180m', // 3 hours - allows completion of complex workflows like event result entry
    // algorithm: "PS256",
  });
}

export function verifyJwt<T>(token: string): T | null {
  try {
    if (!Secretkey) {
      console.error('JWT Secret key (PUBLIC_KEY) is not set in environment variables');
      return null;
    }
    
    if (!token) {
      console.warn('No token provided to verifyJwt');
      return null;
    }
    
    const decoded = jwt.verify(token, Secretkey) as T;
    return decoded;
  } catch (e) {
    console.error('JWT verification failed:', {
      error: e instanceof Error ? e.message : e,
      tokenLength: token?.length || 0,
      hasSecretKey: !!Secretkey
    });
    return null;
  }
}
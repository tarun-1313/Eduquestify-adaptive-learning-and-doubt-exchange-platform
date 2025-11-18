import jwt from "jsonwebtoken";

// Load environment variables from .env.local using dynamic import
import('dotenv').then((dotenv) => {
  dotenv.config({ path: '.env.local' });

  function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing JWT_SECRET");
    return secret;
  }

  function signToken(payload) {
    const secret = getJwtSecret();
    return jwt.sign(payload, secret, { expiresIn: "7d" });
  }

  function verifyToken(token) {
    try {
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch {
      return null;
    }
  }

  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
  if (process.env.JWT_SECRET) {
    console.log("JWT_SECRET length:", process.env.JWT_SECRET.length);
  }

  // Test token creation and verification
  try {
    const testToken = signToken({ id: 1, role: "Student", email: "test@example.com", name: "Test User" });
    console.log("Token created successfully, length:", testToken.length);

    const decoded = verifyToken(testToken);
    console.log("Token verified successfully:", !!decoded);
    if (decoded) {
      console.log("Decoded payload:", JSON.stringify(decoded, null, 2));
    }
  } catch (err) {
    console.error("JWT error:", err.message);
  }
}).catch(err => {
  console.error("Failed to load dotenv:", err.message);
});

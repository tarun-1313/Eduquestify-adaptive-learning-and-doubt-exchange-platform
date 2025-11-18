import jwt from "jsonwebtoken";

// Check if JWT_SECRET exists in environment
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
  console.log("JWT_SECRET length:", process.env.JWT_SECRET.length);
  console.log("JWT_SECRET preview:", process.env.JWT_SECRET.substring(0, 20) + "...");
} else {
  console.log("JWT_SECRET not found in environment variables");
  console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('MYSQL')));
}

// Test setup: set environment variables
process.env.GROQ_API_KEY = "test-groq-key";
process.env.UNSPLASH_ACCESS_KEY = "test-unsplash-key";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/slideOS_test";
process.env.PORT = "5001";

// Mock global fetch
global.fetch = jest.fn();

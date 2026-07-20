import mongoose from "mongoose";
import User from "../../models/users.js";

// In-memory fallback used only when MongoDB is NOT connected.
// Keeps the app runnable (auth + presentations) without a local Mongo instance.
const memory = {
  users: new Map(), // email -> user record
  presentations: new Map(), // id -> presentation record
  counters: { presentations: 1 },
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const dbStatus = () => (isMongoConnected() ? "mongodb" : "memory");

/* ---------------- Users ---------------- */

export async function findUserByEmail(email) {
  if (isMongoConnected()) {
    return User.findOne({ email: email.toLowerCase() });
  }
  return memory.users.get(email.toLowerCase()) || null;
}

export async function createUser({ name, email, password }) {
  const lowerEmail = email.toLowerCase();
  if (isMongoConnected()) {
    return User.create({ name, email: lowerEmail, password });
  }
  if (memory.users.has(lowerEmail)) {
    const err = new Error("Email already registered");
    err.code = 11000;
    throw err;
  }
  const user = {
    _id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email: lowerEmail,
    password,
    createdAt: new Date(),
  };
  memory.users.set(lowerEmail, user);
  return user;
}

/* ---------------- Presentations ---------------- */

export async function createPresentation(record) {
  if (isMongoConnected()) {
    const Presentation = (await import("../models/presentation.js")).default;
    return Presentation.create(record);
  }
  const id = `mem_pres_${memory.counters.presentations++}`;
  const saved = {
    _id: id,
    ...record,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memory.presentations.set(id, saved);
  return saved;
}

export async function findPresentationsByUser(userId) {
  if (isMongoConnected()) {
    const Presentation = (await import("../models/presentation.js")).default;
    return Presentation.find({ user: userId }).sort({ updatedAt: -1 });
  }
  return [...memory.presentations.values()]
    .filter((p) => p.slug || p.user === userId || !p.user)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function findPresentationById(id) {
  if (isMongoConnected()) {
    const Presentation = (await import("../models/presentation.js")).default;
    return Presentation.findById(id);
  }
  return memory.presentations.get(id) || null;
}

export async function updatePresentationById(id, update) {
  if (isMongoConnected()) {
    const Presentation = (await import("../models/presentation.js")).default;
    return Presentation.findByIdAndUpdate(id, update, { new: true });
  }
  const existing = memory.presentations.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...update, updatedAt: new Date() };
  memory.presentations.set(id, updated);
  return updated;
}

export async function deletePresentationById(id) {
  if (isMongoConnected()) {
    const Presentation = (await import("../models/presentation.js")).default;
    return Presentation.findByIdAndDelete(id);
  }
  return memory.presentations.delete(id);
}

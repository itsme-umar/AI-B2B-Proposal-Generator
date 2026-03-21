import mongoose from "mongoose";

/** Real Atlas hosts look like cluster0.xxxxx.mongodb.net — never literally "cluster.mongodb.net". */
const PLACEHOLDER_HOST = "cluster.mongodb.net";

function assertRealAtlasHost(uri: string): void {
  const match = uri.match(/mongodb\+srv:\/\/[^@]+@([^/?]+)/i);
  if (!match) return;
  const host = match[1].toLowerCase().split(":")[0];
  if (host === PLACEHOLDER_HOST) {
    throw new Error(
      [
        `MONGODB_URI points at the invalid host "${PLACEHOLDER_HOST}" (documentation placeholder only).`,
        "",
        "Option A — Local MongoDB (Homebrew on Mac):",
        "  MONGODB_URI=mongodb://127.0.0.1:27017/ai-b2b-proposals",
        "  Then: brew services start mongodb-community (or your service name) and restart npm run dev.",
        "",
        "Option B — MongoDB Atlas:",
        "  Atlas → Database → Connect → Drivers → copy the full mongodb+srv:// string.",
        "  Host must look like cluster0.xxxxx.mongodb.net (not cluster.mongodb.net).",
      ].join("\n")
    );
  }
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }
  assertRealAtlasHost(uri.trim());
  return uri.trim();
}

/**
 * Turns low-level DNS/driver errors into actionable messages.
 */
export function formatMongoConnectionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";

  if (
    msg.includes("querySrv") &&
    (msg.includes("ENOTFOUND") || code === "ENOTFOUND")
  ) {
    return [
      "Could not resolve MongoDB host (DNS SRV lookup failed).",
      "",
      "Common causes:",
      "1. MONGODB_URI still uses a placeholder — copy the real string from MongoDB Atlas (Database → Connect → Drivers). The host looks like cluster0.ab12cd.mongodb.net, NOT cluster.mongodb.net.",
      "2. Wrong password special characters — URL-encode characters like @ # : in the password.",
      "3. Offline VPN/firewall blocking DNS — try another network or use Atlas IP allowlist + standard connection string if your org requires it.",
      "",
      `Underlying error: ${msg}`,
    ].join("\n");
  }

  return msg;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(getMongoUri(), opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw new Error(formatMongoConnectionError(e));
  }

  return cached.conn;
}

export default connectDB;

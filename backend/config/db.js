import mongoose from "mongoose";

const getDeepestCode = (err) => {
  const visited = new Set();
  let current = err;
  while (current && typeof current === "object" && !visited.has(current)) {
    visited.add(current);
    if (current.code) return current.code;
    current = current.cause || current.reason;
  }
  return undefined;
};

const redactMongoUri = (uri) => {
  if (!uri || typeof uri !== "string") return "<missing>";
  try {
    const u = new URL(uri);
    const safePath = u.pathname && u.pathname !== "/" ? u.pathname : "";
    return `${u.protocol}//${u.host}${safePath}${u.search}`;
  } catch {
    return uri.replace(/\/\/(.*)@/, "//<redacted>@");
  }
};

const isSrvDnsFailure = (err, uri) => {
  if (!uri?.startsWith("mongodb+srv://")) return false;
  const code = getDeepestCode(err);
  return code === "ESERVFAIL" || code === "ENOTFOUND" || code === "EAI_AGAIN";
};

const connectWithMongoose = async (uri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const fallbackUri = process.env.MONGO_URI_FALLBACK;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  try {
    await connectWithMongoose(mongoUri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
    return;
  } catch (err) {
    if (fallbackUri && isSrvDnsFailure(err, mongoUri)) {
      // eslint-disable-next-line no-console
      console.warn(
        `MongoDB SRV DNS lookup failed for ${redactMongoUri(mongoUri)}; attempting MONGO_URI_FALLBACK...`,
      );
      await connectWithMongoose(fallbackUri);
      // eslint-disable-next-line no-console
      console.log("MongoDB connected (via MONGO_URI_FALLBACK)");
      return;
    }

    if (isSrvDnsFailure(err, mongoUri)) {
      const enhanced = new Error(
        [
          "MongoDB connection failed due to DNS SRV lookup error.",
          "",
          `URI: ${redactMongoUri(mongoUri)}`,
          "",
          "Fix options (pick one):",
          "- Fix DNS so SRV records resolve (common fixes: disable VPN/proxy, change DNS to 1.1.1.1 or 8.8.8.8, restart network).",
          "- Use a standard (non-SRV) Atlas connection string and set it as MONGO_URI_FALLBACK (or replace MONGO_URI).",
          "- For local dev, set MONGO_URI=mongodb://localhost:27017/trafficjam",
        ].join("\n"),
      );
      enhanced.cause = err;
      throw enhanced;
    }

    throw err;
  }
};

export default connectDB;

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: false,
      select: false,
      index: false,  // Explicitly disable index on token
    },

    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      required: true,
    },

    browser: {
      type: String,
      default: null,
    },

    device: {
      type: String,
      default: null,
    },

    os: {
      type: String,
      default: null,
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    logoutTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// TTL index to auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, isActive: 1 });

const Session = mongoose.model("Session", sessionSchema);

// Drop the problematic unique index on token if it exists
Session.collection.dropIndex('token_1').catch(() => {
  // Index doesn't exist, which is fine
});

export default Session;

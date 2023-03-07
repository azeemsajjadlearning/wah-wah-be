const mongoose = require("mongoose");

const UserMenuMappingSchema = new mongoose.Schema(
  {
    users: [
      {
        type: String,
        required: true,
      },
    ],
    menu: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    permissions: {
      type: [String],
      enum: ["read", "write", "delete", "all"],
      default: ["read"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserMenuMapping", UserMenuMappingSchema);

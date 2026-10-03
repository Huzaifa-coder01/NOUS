const mongoose = require("mongoose");

const DeviceSchema = mongoose.Schema({
  deviceId: {
    type: String,
    default: "",
    required: [true, "device_id_required"],
  },
  deviceType: {
    type: String,
    enum: ["android", "ios", "web"],
    default: "android",
    required: [true, "device_type_required"],
  },
});

const DevicesSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    devices: [DeviceSchema],
  },
  {
    timestamps: true,
  }
);

const Devices = mongoose.model("device", DevicesSchema);

function createOrSkipDevice(userId, deviceId, deviceType) {
  setImmediate(async () => {
    try {

      const userDevice = await Devices.findOne({
        userId: userId,
        "devices.deviceId": deviceId,
      });

      if (userDevice) {
        return;
      }

      await Devices.updateOne(
        { userId: userId },
        { $push: { devices: { deviceId: deviceId, deviceType: deviceType } } },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error adding device:", error);
    }
  });
}

module.exports = {
  Devices,
  createOrSkipDevice,
};

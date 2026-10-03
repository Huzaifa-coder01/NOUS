const { Bookings } = require("../../../roles/user/bookings/BookingsModel");

const updateBookingStatuses = async () => {
  try {
    const now = new Date();

    const completedBookingIds = await Bookings.find({
      bookingStatus: "ongoing",
      bookingEndDate: { $lte: now },
    }).distinct("_id");

    if (completedBookingIds.length > 0) {
      await Bookings.updateMany(
        { _id: { $in: completedBookingIds } },
        { $set: { bookingStatus: "completed" } },
      );
    }

    const expireBookingIds = await Bookings.find({
      bookingStatus: {
        $nin: [
          "rejected",
          "completed",
          "expired",
          "cancelled",
          "rescheduled",
          "deleted",
        ],
      },
      bookingEndDate: { $lte: now },
    }).distinct("_id");

    if (expireBookingIds.length > 0) {
      await Bookings.updateMany(
        { _id: { $in: expireBookingIds } },
        { $set: { bookingStatus: "expired" } },
      );
    }


  } catch (error) {
    console.error("Error updating booking statuses:", error);
  }
};

module.exports = updateBookingStatuses;

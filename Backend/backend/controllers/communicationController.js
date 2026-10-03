const {
  sendEmailViaBrevo
} = require("../helperUtils/emailUtil");
const { Devices } = require("../models/Devices");
const { sendResponse, validateParams } = require("../helperUtils/responseUtil");
const adminFireBConfig = require("../config/firebaseAdmin");
const { getFullImageUrl } = require("@helperUtils/imageHelper");

const { NotificationExp } = require("../models/Notifications");

const sendEmailMailgun = async (req, res) => {
  const { title, emails, subject, body, config } = req.body;
  const validationOptions = {
    bodyParams: ["title", "emails", "subject", "body"],
  };

  if (!validateParams(req, res, validationOptions)) {
    return;
  }

  try {
    await sendEmailViaBrevo(emails, subject, body, config);
    return sendResponse({
      res,
      statusCode: 200,
      translationKey: "email_sent",
    });
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: "failed_to_send_email",
      error,
    });
  }
};

const sendNotificationControllerForTesting = async (req, res) => {
  const { recipients, title, body, data } = req.body;

  const validationOptions = {
    bodyParams: ["recipients", "title", "body"],
  };

  if (!validateParams(req, res, validationOptions)) {
    return;
  }

  try {
    const response = await sendNotification(recipients, {
      title: title,
      body: body,
      data: data,
    });

    const successIds = [];
    const failureIds = [];

    response.responses.forEach((resp, idx) => {
      if (resp.success) {
        successIds.push(recipients[idx]);
      } else {
        failureIds.push({
          ...recipients[idx],
          error: resp.error ? resp.error.message : "Unknown error",
        });
      }
    });

    if (successIds.length > 0) {
      return sendResponse({
        res,
        statusCode: 200,
        translationKey: "notifications_sent_success",
        values: { title },
        data: {
          successIds,
          failureIds,
        },
      });
    } else {
      return sendResponse({
        res,
        statusCode: 500,
        translationKey: "notifications_sent_failure",
        values: { title },
        data: {
          successIds,
          failureIds,
        },
      });
    }
  } catch (error) {
    return sendResponse({
      res,
      statusCode: 500,
      translationKey: error.message,
      error,
    });
  }
};

const sendUserNotifications = async ({
  recipientIds,
  title,
  body,
  data = {},
  sender = null,
  objectId = null,
  meta = {},
  saveNotification = true,
  image = null,
}) => {
  setImmediate(async () => {
    try {
      const recipientDevices = await Devices.find({
        userId: { $in: recipientIds },
      }).select("userId devices");



      if (recipientDevices && recipientDevices.length > 0) {
        const flattenedDevices = recipientDevices.flatMap((userDevice) =>
          userDevice.devices.map((device) => ({
            userId: userDevice.userId,
            deviceId: device.deviceId,
            deviceType: device.deviceType,
          }))
        );

        const devicesByUser = flattenedDevices.reduce((acc, device) => {
          if (!acc[device.userId]) {
            acc[device.userId] = new Set(); // Use Set to avoid duplicate device IDs
          }
          acc[device.userId].add(device);
          return acc;
        }, {});
        const responses = [];

        for (const userId in devicesByUser) {
          const userDevices = Array.from(devicesByUser[userId]).map(
            (device) => ({
              deviceId: device.deviceId,
              deviceType: device.deviceType,
            })
          );


          const dataWithStringValues = Object.fromEntries(
            Object.entries({
              ...data,
              meta: meta || {}
            }).map(([key, value]) => {
              if (value === undefined || value === null) {
                return [key, ""];
              }

              if (typeof value === "object") {
                return [key, JSON.stringify(value)];
              }

              return [key, value.toString()];
            })
          );

          // Send notifications without awaiting
          const sendNotificationPromise = sendNotification(userDevices, {
            title,
            body,
            data: {
              ...dataWithStringValues,
              subjectId: sender ? sender.toString() : null,
              objectId: objectId ? objectId.toString() : null,
            },
            image
          });

          const sendNotificationResponse = await sendNotificationPromise;
          responses.push({ userId, sendNotificationResponse });
        }


        if (!saveNotification) {
          return;
        }

        const notificationsToSave = responses.map(({ userId }) => ({
          type: data.type || "system",
          subjectId: sender,
          objectId: objectId,
          objectType: data.objectType||"general",
          receiverId: userId,
          image,
          title,
          body,
          meta,
        }));
        await NotificationExp.insertMany(notificationsToSave);
      } else {
        logger.log("No devices found for the provided user IDs.");
      }
    } catch (error) {
      console.error("Error sending notifications in background:", error);
    }
  });
};

const sendNotification = async (recipients, payload) => {
  const androidTokens = [];
  const iosTokens = [];

  recipients.forEach((recipient) => {
    if (recipient.deviceType === "android") {
      androidTokens.push(recipient.deviceId);
    } else if (
      recipient.deviceType === "ios" ||
      recipient.deviceType === "web"
    ) {
      iosTokens.push(recipient.deviceId);
    }
  });

  const notificationId = Math.floor(1000000000 + Math.random() * 9000000000).toString();


  payload.data = Object.fromEntries(
    Object.entries({
      ...payload.data,
      notificationId: notificationId,
      image: getFullImageUrl(payload.image) || "",
    }).map(([key, value]) => [
      key,
      value === undefined || value === null
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value)
    ])
  );



  const androidPayload = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
  };

  const iosPayload = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          sound: "default",
          badge: 1,
        },
      },
    },
    data: payload.data,
  };

  try {
    const promises = [];

    if (androidTokens.length > 0) {
      const androidPromise = adminFireBConfig.messaging().sendEachForMulticast({
        tokens: androidTokens,
        ...androidPayload,
      });
      promises.push(androidPromise);
    }

    if (iosTokens.length > 0) {
      const iosPromise = adminFireBConfig.messaging().sendEachForMulticast({
        tokens: iosTokens,
        ...iosPayload,
      });
      promises.push(iosPromise);
    }

    const responses = await Promise.all(promises);

    const result = {
      responses: [],
    };

    responses.forEach((response) => {
      result.responses = result.responses.concat(response.responses);
    });

    result.responses.forEach((r, index) => {
      if (!r.success) {
      }
    });

    return result;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  sendNotificationControllerForTesting,
  sendUserNotifications,
  sendEmailMailgun
};

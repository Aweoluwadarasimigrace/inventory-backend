const pusher = require("./pusher")

const sendNotification = (message)=>{
         pusher.trigger("notifications", "new-notification", {
            message,
             timestamp: new Date(),
         })
}

module.exports = sendNotification
// store server to be able to use everywhere
let ioInstance;

const newSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("new client is connected", socket.id);
  });
};

// send notification
const sendNotification = (message) => {
  if (ioInstance) {
    ioInstance.emit("notification", {message}, {timestamp: new Date().toISOString()})
  }
};


module.exports = {sendNotification, newSocket}
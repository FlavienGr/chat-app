const generateMessages = (username, text) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username
  };
};
const generatelocationMessage = (username, url) => {
  return {
    url,
    createdAt: new Date().getTime(),
    username
  };
};
module.exports = {
  generateMessages,
  generatelocationMessage
};

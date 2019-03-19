const socket = io();

/// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

/// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const roomPlaceTemplate = document.querySelector("#room-template").innerHTML;

// options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
const autoscrool = () => {
  /// new message element
  const $newMessage = $messages.lastElementChild;

  /// height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const nexMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + nexMessageMargin;

  //// visible height
  const visibleHeight = $messages.offsetHeight;

  /// height of messages container
  const containerHeight = $messages.scrollHeight;

  ///how far have I scrolled

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
socket.on("message", ({ text: message, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message,
    createdAt: moment(createdAt).format("h:mm a"),
    username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscrool();
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();

  /// disable button
  $messageFormButton.setAttribute("disabled", "disabled");

  //// message
  const textMessage = $messageFormInput.value;

  socket.emit("sendMessage", textMessage, error => {
    ///enable button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("the message was delivered");
  });
});

////////////////////////////////////////////////// Navigation browser

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  /// disable button
  $locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    const { longitude, latitude } = position.coords;

    socket.emit("sendLocation", { latitude, longitude }, () => {
      $locationButton.removeAttribute("disabled");
      console.log("location shared");
    });
  });
});
socket.on("locationMessage", ({ url, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    url,
    createdAt: moment(createdAt).format("h:mm a"),
    username
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscrool();
});
socket.on("roomData", ({ users, room }) => {
  const html = Mustache.render(roomPlaceTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html;
});
socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const users = [];

const addUser = ({ id, username, room }) => {
  // clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //valide the data
  if (!username || !room) {
    return {
      error: "username and room are required"
    };
  }

  //check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });
  // valide username
  if (existingUser) {
    return {
      error: "Username is in use"
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
const getUser = id => {
  const user = users.find(user => user.id === id);

  if (!user) return { error: "no user found" };
  return {
    user
  };
};

const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  const usersInRoom = users.filter(user => user.room === room);
  if (!usersInRoom) return [];
  return usersInRoom;
};

module.exports = {
  removeUser,
  addUser,
  getUser,
  getUsersInRoom
};

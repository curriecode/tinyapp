const getUserByEmail = (email, dataBase) => {
  for (let key in dataBase) {
    if (email === dataBase[key].email) {
      return key;
    }
  }
  return null;
};
module.exports = { getUserByEmail };
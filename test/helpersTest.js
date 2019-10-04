const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const dataBase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", dataBase);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined if email does not match with user in the database', () => {
    const user = getUserByEmail("user@beepboop.com", dataBase);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});
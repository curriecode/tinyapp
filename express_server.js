const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');

//user database
const users = {
};

app.use(cookieSession({
  name: 'session',
  keys: ['beep']
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


//dataBase that updates dynamically when users add URLs in their account
let urlDatabase = {
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  }
};

//function finds userID
const getUserById = (id) => {
  return users[id];
};

const generateRandomString = (num) => {
  let output = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = characters.length;
  for (let i = 0; i < num; i++) {
    output += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return output;
};

//returns a new database of urls that only have the id of the current user who is logged in
const urlsForUser = (id) => {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = getUserById(req.session.user_id);
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: user
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user = getUserById(req.session.user_id);

  let templateVars = {
    urls: urlDatabase,
    user: user
  };

  if (user) {
    return res.render("urls_new", templateVars);

  } else {
    return res.redirect('/login');
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const user = getUserById(req.session.user_id);
  if (urlDatabase[req.params.shortURL].userID !== user.id) {
    res.status(400).send('You do not have permissions to edit this url.');
  }
  const shortURL = req.params.shortURL;

  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]['longURL'],
    user: user
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const user = getUserById(req.session.user_id);
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL['longURL']);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const user = getUserById(req.session.user_id);
  if (urlDatabase[req.params.shortURL].userID !== user.id) {
    res.status(400).send('You do not have permissions to edit this url.');
  }
  const newInfo = {
    longURL: req.body.edit,
    userID: user.id
  };
  urlDatabase[req.params.shortURL] = newInfo;
  res.redirect('/urls');
});

app.get("/urls:shortURL", (req, res) => {
  res.redirect('/url');
});

app.post("/login", (req, res) => {
  if (!req.session.user_id) {
    const email = req.body.email;
    const password = req.body.password;
    const userID = getUserByEmail(email, users);

    if (userID) {
      // Is a valid user based on their e-mail
      const user = getUserById(userID);
      if (bcrypt.compareSync(password, user.password)) {
        // Password matches
        req.session.user_id = userID;
        return res.redirect('/urls');
      }
    }
    res.status(404).send('Incorrect username or password');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  const user = getUserById(req.session.user_id);

  let templateVars = {
    user: user
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const user = getUserById(req.session.user_id);

  let templateVars = {
    user: user
  };
  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString(3);
  const user = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  //check for existing email before putting new one into the database
  if (email === "" || password === "") {
    res.status(404).send("You must enter a valid email address and password to create an account");
    return;
  }

  // let dataBase = user.email;
  if (getUserByEmail(email, users)) {
    res.status(404).send("An account already exists for this email address.");
    return;
  }

  users[id] = user;

  req.session.user_id = id;
  res.redirect('/urls');
});
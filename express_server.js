const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
// const cookieSession = require('cookie-session');
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
//  }))



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {};

//function finds userID
const getUserById = (id) => {
  return users[id];
};


//TODO update database to include userId
// i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }


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

const generateRandomString = (num) => {
  let output = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = characters.length;
  for (let i = 0; i < num; i++) {
    output += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return output;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

const urlsForUser = (id) => {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};



app.get("/urls", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);
  // console.log("id of current user", user)
  // console.log(urlsForUser(req.cookies["user_id"]));
  let templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: user,
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);

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
  // console.log("this is the database", urlDatabase)
  const user = getUserById(req.cookies["user_id"]);
  const shortURL = req.params.shortURL;
  // const longURL = urlDatabase[req.params.shortURL].longURL;


  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]['longURL'],
    user: user
  };
  res.render("urls_show", templateVars);
});

//Is this where I update the database?

app.post("/urls", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  // urlDatabase[shortURL].userID = user;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL['longURL']);

});

//TODO make it so users can only delete from there list of things
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params.shortURL)
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const newInfo = req.body.edit;
  urlDatabase[req.params.shortURL] = newInfo;
  res.redirect('/urls');
});

app.get("/urls:shortURL", (req, res) => {
  res.redirect('/url');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // const hashedPassword = bcrypt.hashSync(password, 10);



  for (let id in users) {
    if (users[id].email === email && bcrypt.compareSync(password, users[id].password) === true) {
      res.cookie('user_id', id);
      return res.redirect('/urls');
    }
  }
  return res.status(404).send("Incorrect username or password."); //TODO change error to username/pw not found

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body);
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);

  let templateVars = {
    user: user
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const user = getUserById(req.cookies["user_id"]);

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

  if (req.body.email === "" || req.body.password === "") {
    res.status(404).send("You must enter a valid email address and password to create an account");
    return;
  }

  for (let key in users) {
    if (email === users[key].email) { // XXX
      res.status(404).send("An account already exists for this email address.");
      return;
    }
  }
  users[id] = user;

  res.cookie('user_id', id);
  res.redirect('/urls');
});
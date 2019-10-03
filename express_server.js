const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const users = {};



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    user: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
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
  res.cookie('user_id', req.body);
  console.log("userBody:", req.body);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body);
  res.redirect('/login');
});


app.get("/register", (req, res) => {
  let templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {

  let templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_login", templateVars);
});


// const userLookup = (res) => {
//   if (users['email'] === users['email']) {
//     res.status(404).send("Not found.");
//   }
// };

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(3);
  const user = {
    id: id,
    email: email,
    password: password,
  };

  //check for existing email before putting new one into the database

  if (req.body.email === "" || req.body.password === "") {
    res.status(404).send("Not found.");
    return;
  }

  for (let key in users) {
    if (email === users[key].email) {
      res.status(404).send("Not found.");
      return;
    }
  }
  users[id] = user;

  console.log("users:", users);

  res.cookie('user_id', id);
  res.redirect('/urls');
});
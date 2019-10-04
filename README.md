# Tiny App
  ### An app where users enter in a long URL and shortens it to 6 random characters.

  - it uses ejs to create templates for the different pages (login, registration, urls_show, urls_new)
  - routes are contained in express_server.js
  - everything in the nav is contained in _header.ejs


## functionality to finish

1. URLs Belong to Users
- Add a new userID (string) property to individual url objects within the urlDatabase collection. It should just contain the user ID (the key in the users collection) and not a copy of the entire user data. All URLs should now have this extra property. 

//need to add key with shortURL
//to that add longURL & userID
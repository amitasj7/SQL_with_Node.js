const express = require("express");
const app = express();
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

const path = require("path");
const fs = require("fs");

const {
  connection,
  checkDatabase,

  generateData,
  insertData,
} = require("./fillDatabase.js");






const port = 8080;

app.listen(port, () => {
  console.log("Server run Successfully on port : ", port);
});

// ejs file ko render krne ke liye
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// public folder se javascript and css file ko access krne ke liye
app.use(express.static(path.join(__dirname + "public")));

// request ki body se data access krne ke liye
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// console.log(3 + 2, "hi");
// console.log(3 + 9, "hi");
// console.log(3 + 9);

// connect database with node.js
connection.connect();

// create table if not exist

// if database is empty then insert
checkDatabase()
  .then((count) => {
    if (count === 0) {
      generateData(); // Call the function to generate data
      insertData(); // Call the function to insert data
    } else {
      console.log("Data already exists in the 'user' table.");
    }
  })
  .catch((err) => {
    console.error("Failed to check the database: ", err);
  });

// get(/user)  --> show all user data
app.get("/user", (req, res) => {
  // 1. database se data ko access krna
  // 2. ejs file me daal ke "/user" route par ejs file ko send kar dena
  const q = "SELECT * FROM user";

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      let data = result;
      // console.log(data);

      console.log("Access data successfully");

      // res.send(data);
      res.render("users.ejs", { users: data });
    });
  } catch (e) {
    console.log("Access data problem : ", e);
    res.send("Access Data Problem");
  }
});

// edit user and return form

app.get("/user/:id/edit", (req, res) => {
  const { id } = req.params;
  // console.log("id is ", id);

  // 1. search this id in database to access details
  const q = `SELECT * FROM user WHERE id = '${id}'`; // id ko string form me send krna hoga '${id}'

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      let data = result; // receive particular user data
      // console.log(data);

      console.log("particular user data access successfully");
      // console.log("data is", data[0]); // data is a Array form

      // res.send(data);
      res.render("edit.ejs", { user: data[0] });
    });
  } catch (e) {
    console.log("particular user data access problem : ", e);
    res.send("particular user data access Problem");
  }
});

// update user database and return /user route
app.patch("/user/:id", (req, res) => {
  const { username, email, password: formPassword } = req.body;

  const { id } = req.params;

  // 1. check password correct or not ?
  // database se user ka password le
  const q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;

      let data = result[0]; // receive particular user data

      const databasePass = data.password;

      if (databasePass != formPassword) {
        res.send("Incorrect Password");
        // ab aage code excute nahi hoga vo send ho chuka hai
      } else {
        // 2. update user data in database
        const q = `UPDATE user SET username = '${username}', email = '${email}' WHERE id = '${id}'`;

        try {
          connection.query(q, (err, result) => {
            if (err) throw err;

            console.log("update SUCCESSFULLY");

            res.redirect("/user");
          });
        } catch (e) {
          console.log("update query failed");
        }
      }
    });
  } catch (e) {
    console.log("particular user data access problem : ", e);
    res.send("particular user data access Problem");
  }
});

// Add new user

// 1. get a form
app.get("/user/add", (req, res) => {
  res.render("add.ejs");
});

// 2. add user in database

app.post("/user", (req, res) => {
  const { id, username, email, password, confirmPassword } = req.body;

  // check password and confirm password match or not
  if (password != confirmPassword) {
    res.send("password and confirm password are different");
  } else {
    const user = [id, username, email, password];
    // console.log("user is ", user);

    const q =
      "INSERT INTO user (id, username, email, password) VALUES (?,?,?,?)";

    try {
      connection.query(q, user, (err, result) => {
        if (err) {
          console.log("duplicate entry");
        }

        console.log("add new user  successfully");

        res.redirect("/user");
      });
    } catch (e) {
      console.log("add new user problem : ", e);
    }
  }
});

// search user with username and email-id
// 1. get a form
app.get("/user/search", (req, res) => {
  res.render("search.ejs");
});

// 2. return user
app.get("/user/search-result", (req, res) => {
  const { id, username, email } = req.query;

  // console.log("id ", id);
  // console.log("username ", username);
  // console.log("email ", email);

  if (!id && !username && !email) {
    res.send("please provide at least one detail");
  } else {
    const q = `SELECT * FROM user WHERE id = '${id}' or username = '${username}' or email = '${email}'`;

    try {
      connection.query(q, (err, result) => {
        if (err) throw err;

        let data = result;

        res.send(data);
      });
    } catch (e) {
      console.log("search Query problem", e);
    }
  }
});

// delete user
app.delete("/user/:id", (req, res) => {
  const { id } = req.params;

  const q = `DELETE FROM user WHERE id = '${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("User deleted successfully");

      res.redirect("/user");
    });
  } catch (e) {
    console.log("user delete query problem");
  }
});

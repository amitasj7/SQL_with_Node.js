// CJS
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

// SQL and backend ke between connection --

// Create the connection to database

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta",
  password: "Amit7023136872",
});
let data = [];
function generateData() {
  let createRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
  };

  for (let i = 1; i <= 100; i++) {
    data.push(createRandomUser());
  }

  console.log(data);
  console.log("Data generate successfully");
}

// console.log(createRandomUser());

// console.log("hello");



function insertData() {
  // how to work query

  const insertData =
    "INSERT INTO user (id, username, email, password) VALUES ?";

  try {
    connection.query(insertData, [data], (err, result) => {
      if (err) throw err;
      console.log(result);
      console.log("Insert data successfully");
    });
  } catch (e) {
    console.log("insert data problem : ", e);
  }
}
// Check if the database has any records in the 'user' table
let checkDatabase = () => {
    return new Promise((resolve, reject) => {
      const total = "SELECT count(*) as count FROM user"; // use alias 'count'
  
      connection.query(total, (err, result) => {
        if (err) {
          console.error("Error executing query: ", err);
          reject(err); // Reject the promise on error
        } else {
          console.log("Query result: ", result);
          resolve(result[0].count); // Resolve with the count of users
        }
      });
    });
  };

module.exports = {
  connection,
  checkDatabase,
  
  generateData,
  insertData,
};

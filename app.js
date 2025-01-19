const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require('sqlite3').verbose();


const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

// Database Setup
// const db = new sqlite3.Database("./database/vulnerable.db", (err) => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log("Connected to the SQLite database.");
//   }
// });

const db = new sqlite3.Database(':memory:');

// Vulnerable SQL Table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )
  `);

  // Insert sample data
  db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'password123', 'admin')");
  db.run("INSERT INTO users (username, password, role) VALUES ('user', 'user123', 'user')");
});

// Multer Setup (for File Uploads - Web Shell)
const upload = multer({ dest: "uploads/" });

// Routes
app.get("/", (req, res) => res.render("index"));
app.get("/webshell", (req, res) => res.render("webshell"));
app.get("/xss", (req, res) => res.render("xss"));
app.get("/phishing", (req, res) => res.render("phishing"));
app.get("/login", (req, res) => res.render("login"));


// Web Shell Vulnerability
app.post("/upload", upload.single("file"), (req, res) => {
  const { file } = req;
  if (!file) return res.status(400).send("No file uploaded.");
  const content = fs.readFileSync(file.path, "utf8");
  res.send(`<pre>${content}</pre>`);
});

// SQL Injection Vulnerability
app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.get(query, (err, row) => {
    if (row) {
      res.send(`Welcome, ${row.username}. Your role is: ${row.role}`);
    } else {
      res.send("Invalid credentials or SQL Injection attempt.");
    }
  });
});

// XSS Vulnerability
app.post("/post", (req, res) => {
  const { comment } = req.body;
  res.send(`You posted: ${comment}`);
});

// Phishing Demo
app.post("/phishing-login", (req, res) => {
  const { username, password } = req.body;
  fs.appendFileSync("phished-credentials.txt", `Username: ${username}, Password: ${password}\n`);
  res.send("Credentials captured!");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

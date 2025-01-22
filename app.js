const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require('sqlite3').verbose();
const rateLimit = require('express-rate-limit');  
const logger = require('./logger');

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
app.use(bodyParser.json());
// Middleware to log network requests
app.use((req, res, next) => {
  const networkInfo = {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
  };

  logger.info("Incoming request", networkInfo);
  next();
});

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
  logger.info("file uploaded!")
  res.send(`<pre>${content}</pre>`);
});



// Rate limiter middleware
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts. Please try again later.",  
});

app.post("/auth", authRateLimiter, (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.get(query, (err, row) => {
    if (row) {
      logger.info("User authenticated", { username: row.username, role: row.role });
      res.send(`Welcome, ${row.username}. Your role is: ${row.role}`);
    } else {
      logger.warn("Invalid login attempt", { username });
      res.send("Invalid credentials.");
    }
  });
});

// XSS Vulnerability
app.post("/post", (req, res) => {
  const { comment } = req.body;
  logger.info("User posted", { post: comment});
  res.send(`You posted: ${comment}`);
});

// Phishing Demo
app.post("/phishing-login", (req, res) => {
  const { username, password } = req.body;
  fs.appendFileSync("phished-credentials.txt", `Username: ${username}, Password: ${password}\n`);
  logger.info("phishing : ", { username: username,password:password});
  res.send("Credentials captured!");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs");

const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

server.post("/api/register", (req, res) => {
  const creds = req.body;

  const hash = bcrypt.hashSync(creds.password, 14); // rounds is 2^14

  creds.password = hash;

  db("users")
    .insert(creds)
    .then(ids => {
      res.status(201).json(ids);
    })
    .catch(err => json(err));
});

server.post("/api/login", (req, res) => {
  const creds = req.body;

  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        // Passwords match and user exists by that username;
        // Do whatever when login is successful.
        res.status(200).json({ message: "Welcome!" });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(err => res.json(err));
});

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username', 'password')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));

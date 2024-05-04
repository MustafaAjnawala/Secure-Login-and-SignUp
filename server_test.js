const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const sanitizeHtml = require('sanitize-html');
const bcrypt = require('bcrypt');

const app = express();
const port = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views')); // Serve static HTML files from the 'views' directory

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Sql$123%',
  database: 'asl'
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

//VULNERABLE
// app.post('/login', (req, res) => {
//   const { username, password } = req.body;


//   // WARNING: This code is vulnerable to SQL injection
//   const sqlQuery = `SELECT * FROM user_data WHERE loginid = '${username}' AND password = '${password}'`;

//   pool.query(sqlQuery, (error, results) => {
//     if (error) {
//       console.error('Error:', error);
//       res.status(500).send('Internal Server Error');
//     } else {
//       if (results.length > 0) {
//         const { username, name } = results[0]; // Assuming the name field is named 'name' in the database
//         res.render('welcome', { username, name });
//       } else {
//         res.send('Invalid username or password');
//       }
//     }
//   });
// });

//WITHOUT ENCRYPTION
// app.post('/login', (req, res) => {
//   let { username, password } = req.body;

//   // sanitizing both parameters from harmfull html tags
//   username = sanitizeHtml(username);
//   password = sanitizeHtml(password);

//   pool.query('SELECT * FROM user_data WHERE loginid = ? AND password = ?', [username, password], (error, results) => {
//     if (error) {
//       console.error('Error:', error);
//       res.status(500).send('Internal Server Error');
//     } else {
//       if (results.length > 0) {
//         const { username, name } = results[0]; // Assuming the name field is named 'name' in the database
//         res.render('welcome', { username, name });
//       } else {
//         res.send('Invalid username or password');
//       }
//     }
//   });
// });

app.post('/login', (req, res) => {
  let { username, password } = req.body;

  // sanitizing both parameters from harmfull html tags
  username = sanitizeHtml(username);
  password = sanitizeHtml(password);

  pool.query('SELECT * FROM user_data WHERE loginid = ?', [username], (error, results) => {
    if (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    } else {
      if (results.length > 0) {
        const userData = results[0];
        // Compare the input password with hashed password
        bcrypt.compare(password, userData.password, (compareErr, isMatch) => {
          if (compareErr) {
            console.error('Error comparing passwords:', compareErr);
            res.status(500).send('Internal Server Error');
          } else {
            if (isMatch) {
              //login successful
              const { username, name } = userData;
              res.render('welcome', { username, name });
            } else {
              res.send('Invalid username or password');
            }
          }
        });
      } else {
        res.send('Invalid username or password');
      }
    }
  });
});

//VULN
// app.get('/welcome', (req, res) => {
//   const name = req.query.name; // Retrieve the name from the query parameters

//   res.render('welcome', { name });
// });

app.get('/welcome', (req, res) => {
  let name = req.query.name; // Retrieve the name from the query parameters
  name = sanitizeHtml(name); // Sanitize the name parameter

  res.render('welcome', { name });
});

// to handle the  new user creation in the signup page

// app.post('/signup', (req, res) => {
//   const { name, email, loginid, password } = req.body;

//   // Check if the login ID already exists in the database
//   pool.query('SELECT * FROM user_data WHERE loginid = ?', [loginid], (error, results) => {
//     if (error) {
//       console.error('Error checking if login ID exists:', error);
//       res.status(500).send('Internal Server Error');
//     } else {
//       if (results.length > 0) {
//         res.send('Login ID already exists');
//       } else {
//         // Insert new user data into the database
//         pool.query('INSERT INTO user_data (name, email, loginid, password) VALUES (?, ?, ?, ?)', [name, email, loginid, password], (error, results) => {
//           if (error) {
//             console.error('Error inserting user data into database:', error);
//             res.status(500).send('Internal Server Error');
//           } else {
//             // Redirect the user to the welcome page after successful signup
//             res.redirect('/welcome?name=' + name);
//           }
//         });
//       }
//     }
//   });
// });

//WITHOUT ENCRYPTION
// app.post('/signup', (req, res) => {
//   let { name, email, loginid, password } = req.body;
//   name = sanitizeHtml(name);

//   if (name) {
//     // Check if the login ID already exists in the database
//     pool.query('SELECT * FROM user_data WHERE loginid = ?', [loginid], (error, results) => {
//       if (error) {
//         console.error('Error checking if login ID exists:', error);
//         res.status(500).send('Internal Server Error');
//       } else {
//         if (results.length > 0) {
//           res.send('Login ID already exists');
//         } else {
//           // Insert new user data into the database
//           pool.query('INSERT INTO user_data (name, email, loginid, password) VALUES (?, ?, ?, ?)', [name, email, loginid, password], (error, results) => {
//             if (error) {
//               console.error('Error inserting user data into database:', error);
//               res.status(500).send('Internal Server Error');
//             } else {
//               // Redirect the user to the welcome page after successful signup
//               res.redirect('/welcome?name=' + encodeURIComponent(name));
//             }
//           });
//         }
//       }
//     });
//   }
//   else {
//     res.send("Please enter valid Name");
//   }
// });

app.post('/signup', (req, res) => {
  let { name, email, loginid, password } = req.body;
  name = sanitizeHtml(name);

  if (name) {
    // Check if the login ID already exists in the database
    pool.query('SELECT * FROM user_data WHERE loginid = ?', [loginid], (error, results) => {
      if (error) {
        console.error('Error checking if login ID exists:', error);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length > 0) {
          res.send('Login ID already exists');
        } else {
          if (name.length > 45 || email.length > 45 || loginid.length > 20 || password.length > 20) {
            const validationError = { message: 'Input must be less than 45 characters' };
            return res.status(400).send(validationError);
          } else {
            // Hash the password
            bcrypt.hash(password, 1, (hashErr, hash) => {
              if (hashErr) {
                console.error('Error hashing password:', hashErr);
                res.status(500).send('Internal Server Error');
              } else {
                // Store the new user into databse with hashed password
                pool.query('INSERT INTO user_data (name, email, loginid, password) VALUES (?, ?, ?, ?)', [name, email, loginid, hash], (insertErr, results) => {
                  if (insertErr) {
                    console.error('Error inserting user data into database:', insertErr);
                    res.status(500).send('Internal Server Error');
                  } else {
                    // Redirect the user to the welcome page after successful signup
                    res.redirect('/welcome?name=' + encodeURIComponent(name));
                  }
                });
              }
            });
          }
        }
      }
    });
  }
  else {
    res.send("Dont try XSS :)");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

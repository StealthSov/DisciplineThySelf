// Example code for creating a SQLite database
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('mydatabase.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the mydatabase database.');
});

db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, description TEXT)');
db.run('CREATE TABLE IF NOT EXISTS workout (id INTEGER PRIMARY KEY, date TEXT, pushups INT, situps INT, squats INT, miles DECIMAL)');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
const port = 3000;

app.post('/tasks', (req, res) => {
  const taskDescription = req.body.description;

  db.run(`INSERT INTO tasks(description) VALUES(?)`, [taskDescription], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error inserting task');
    }
    res.send(`Task "${taskDescription}" inserted with ID ${this.lastID}`);
  });
});

app.post('/workout', handlePostWorkout);

function handlePostWorkout(req, res) {
  // Get the workout data from the request body
  const workoutData = req.body;

  // Set the workout date to the current date if not provided in the request body
  if (!workoutData.date) {
    workoutData.date = new Date().toISOString().slice(0, 10);
  }

  // Check if there's already an entry for today's date
  db.get('SELECT * FROM workout WHERE date = ?', [workoutData.date], (error, row) => {
    if (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Error checking for existing workout' });
      return;
    }
    
    if (row) {
      // If an entry for today's date already exists, update it
      console.log(workoutData);
      for(let key in workoutData) {
        if(key == 'date') continue;
        db.run(`UPDATE workout SET ${key} = ${workoutData[key]} WHERE id = ${row.id}`, err => {
          if(err) {
            console.log(error.message);
            res.status(500).json({message : 'Error updating workout'});
            return;
          } else {
          }
        });
      }
      console.log(`Workout updated with ID ${row.id}`);
      res.status(200).json({ message: 'Workout updated successfully' });
    } else {
      // If no entry for today's date exists, insert a new row
      db.run('INSERT INTO workout (date, pushups, situps, squats, miles) VALUES (?, ?, ?, ?, ?)',
        [workoutData.date, workoutData.pushups || 0, workoutData.situps || 0, workoutData.squats || 0, workoutData.miles || 0],
        function(error) {
          if (error) {
            console.log(error.message);
            res.status(500).json({ message: 'Error adding workout' });
          } else {
            console.log(`Workout added with ID ${this.lastID}`);
            res.status(201).json({ message: 'Workout added successfully' });
          }
        });
    }
  });
}

app.get('/workouts', (req, res) => {
  // Execute a SELECT SQL command to retrieve all rows from the workout table
  db.all('SELECT * FROM workout', (error, rows) => {
    if (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Error retrieving workouts' });
      return;
    }

    // Send the workout data back to the client as a JSON object
    res.status(200).json(rows);
  });
});

app.get('/workout', (req, res) => {
  // Extract the date parameter from the request URL
  let date = req.body.date;

  if (!date) {
    date = new Date().toISOString().slice(0, 10);
  } 

  // Execute a SELECT SQL command to retrieve the row from the workout table with the matching date
  db.get('SELECT * FROM workout WHERE date = ?', [date], (error, row) => {
    if (error) {
      console.log(error.message);
      res.status(500).json({ message: 'Error retrieving workout data' });
      return;
    }

    if (!row) {
      // If no row was found with the matching date, send a 404 error to the client
      res.status(200).json({ 
        date: new Date().toISOString().slice(0, 10),
        pushups: 0,
        situps: 0,
        squats: 0,
        miles: 0
       });
    } else {
      // Send the workout data back to the client as a JSON object
      res.status(200).json(row);
    }
  });
});

app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error retrieving tasks');
    }
    res.send(rows);
  });
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  db.run('DELETE FROM tasks WHERE id = ?', taskId, (error) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(`Task with ID ${taskId} deleted`);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Example code for making HTTP requests from your Vue app using axios
// import axios from 'axios';

// axios.post('/tasks', {
//   description: 'Do homework'
// }).then((response) => {
//   console.log(response.data);
// }).catch((error) => {
//   console.error(error);
// });

// axios.get('/tasks').then((response) => {
//   console.log(response.data);
// }).catch((error) => {
//   console.error(error);
// });
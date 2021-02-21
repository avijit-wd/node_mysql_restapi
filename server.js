const express = require("express");
const app = express();
const mysql = require("mysql");
require("dotenv/config");
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "node",
  password: process.env.PASSWORD,
  database: "EmployeeDB",
  multipleStatements: true,
});

db.connect((err) => {
  if (!err) {
    console.log(`Mysql connect successfully!`);
  } else {
    console.log(`DB connection failed Error: ${err}`);
  }
});

app.get("/employees", (req, res) => {
  db.query("SELECT * FROM Employee", (err, rows, fields) => {
    if (!err) {
      res.status(200).send(rows);
    } else {
      console.log(err);
    }
  });
});

app.get("/employee/:id", (req, res) => {
  const empId = req.params.id;
  db.query(
    `SELECT * FROM Employee WHERE emp_id=${empId}`,
    (err, rows, fields) => {
      if (!err) {
        res.status(200).send(rows);
      } else {
        console.log(err);
      }
    }
  );
});

app.delete("/employee/:id", (req, res) => {
  const empId = req.params.id;
  db.query(
    `DELETE FROM Employee WHERE emp_id= ?`,
    [empId],
    (err, rows, fields) => {
      if (!err) {
        res.status(200).send("Resource deleted successfully!");
      } else {
        console.log(err);
      }
    }
  );
});

app.post("/employees", (req, res) => {
  const { emp_id, name, emp_code, salary } = req.body;

  const sql = `SET @emp_id = ?; SET @name= ?; SET @emp_code= ?; SET @salary= ?; CALL EmployeeAddOrEdit(@emp_id, @name, @emp_code, @salary);`;

  db.query(sql, [emp_id, name, emp_code, salary], (err, rows, fields) => {
    if (!err) {
      const newRow = rows.filter((item) => item.constructor === Array);
      res.status(200).send(newRow[0][0]);
    } else {
      console.log(err);
    }
  });
});

app.put("/employees", (req, res) => {
  const { emp_id, name, emp_code, salary } = req.body;

  const sql = `SET @emp_id = ?; SET @name= ?; SET @emp_code= ?; SET @salary= ?; CALL EmployeeAddOrEdit(@emp_id, @name, @emp_code, @salary);`;

  db.query(sql, [emp_id, name, emp_code, salary], (err, rows, fields) => {
    if (!err) {
      const newRow = rows.filter((item) => item.constructor === Array);
      res.send("Updated successfully!");
    } else {
      console.log(err);
    }
  });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, console.log(`Server running a port ${PORT}`));

// --------SCRIPT TO CREATE A NODE CONNECTION---------

// CREATE DATABASE <database name>;

// CREATE USER "<user_name>"@"localhost" IDENTIFIED WITH MYSQL_NATIVE_PASSWORD BY "<password>";

// GRANT ALL ON <database name>.* TO "<user_name>"@"localhost";

// FLUSH PRIVILEGES;

//  ****Stored Procedures on Mysql for create and update****

// CREATE DEFINER=`node`@`localhost` PROCEDURE `EmployeeAddOrEdit`(
// 	IN _emp_id INT,
//     IN _name VARCHAR(25),
//     IN _emp_code VARCHAR(25),
//     IN _salary INT
// )
// BEGIN
// 	IF _emp_id = 0 THEN
// 		INSERT INTO Employee(name, emp_code, salary)
// 		VALUES(_name, _emp_code, _salary);
// 		SET _emp_id = LAST_INSERT_ID();
// 	ELSE
// 		UPDATE Employee
//         SET
//         name = _name,
//         emp_code = _emp_code,
//         salary = _salary
//         WHERE emp_id = _emp_id;
// 	END IF;
// 		SELECT _emp_id AS emp_id , _name AS name,_emp_code AS emp_code, _salary AS salary;
// END

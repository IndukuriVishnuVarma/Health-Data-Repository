import express from "express";
import bodyParser from "body-parser";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session"; // Import express-session

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let db;
db = await open({
    filename: './health.db', // Corrected typo
    driver: sqlite3.Database,
});

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.render('Login.ejs');
});
app.get("/signup",(req,res)=>{
  res.render("Signup.ejs");
})
app.post("/signup",async(req,res)=>{
  const data=req.body;
  if(data.role=="patient")
  {
        const existingUser = await db.get("SELECT * FROM Patient WHERE Username = ?", [data.Username]);
       
        
        if (existingUser) {
            // Username already exists
            res.status(400).send("Username is already taken. Please choose a different one.");
        } else {
            // Hash the password and insert the new user
            
            await db.run("INSERT INTO patient (Role,Username,Password,Gender,DateOfBirth,ContactNumber,Address,Email) VALUES (?, ?,?,?,?,?,?,?)", [data.role,data.username[0], data.password[0],data.gender,data.dob,data.contact[0],data.add,data.email[0]]);
            res.render("PatientDashboard.ejs"); // Redirect to login page or send success response
        }
  }
  else{
    const existingUser = await db.get("SELECT * FROM Doctors WHERE username = ?", [data.username]);
        
        
        if (existingUser) {
            // Username already exists
            res.status(400).send("Username is already taken. Please choose a different one.");
        } else {
            // Hash the password and insert the new user
            
            await db.run("INSERT INTO Doctors (Username,Password,Specialization,ContactNumber,Email,Role) VALUES (?, ?,?,?,?,?)", [data.username[1], data.password[1],data.specs,data.contact[1],data.email[1],data.role]);
            res.render("Login.ejs"); // Redirect to login page or send success response
  }}})

// Route for Signup Page
app.get('/signup', (req, res) => {
  res.render('Signup');
});
app.post("/logout",async(req,res)=>{
  res.render("Login.ejs");
}
)
app.get('/dashboard', (req, res) => {
  res.render('PatientDashboard.ejs');
});
app.post("/login",async(req,res)=>{
  const username=req.body.username;
  const password=req.body.password;
  const patient = await db.get("SELECT * FROM Patient WHERE Username = ?", [username]);
  const doctor = await db.get("SELECT * FROM Doctors WHERE Username = ?", [username]);
  if(patient)
  {
    const isMatch = patient.Password;
        if (isMatch === password) {
          res.render("PatientDashboard.ejs",{name:username}); 
        } else {
            res.send("Password not matched");
        }
    } 
    else if(doctor)
    {
      const isMatch = doctor.Password;
      console.log(doctor.Password);
      console.log(password);
        if (isMatch === password) {
          res.render("Doctor.ejs",{name:username}); 
        } else {
            res.send("Password not matched");
        }
    }
    else{
      res.send("user not found");
    }
    }
  
  
)
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})
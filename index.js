const { nanoid } = require('nanoid')
require('dotenv').config();
const path = require('path')
const express = require('express')
const { Client } = require('pg')
const logger = require('./logger');

const app = express()
const port = process.env.PORT || 3000
const connectionString = process.env.DATABASE_URL
const db = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })
db.connect()

app.use(express.json())
app.use(express.urlencoded());
app.use(logger) // Log User Data

// Feedback Logic Below

app.get('/generateTrolls', async (req, res, next) => {
  res.sendFile(path.join(__dirname, "/frontend/generateTrolls.html"))
})

app.post('/get_urls', async(req, res, next) => {
  const emailArr = req.body.emails.split(',')
  emailArr.forEach(async element => {
    const text = 'INSERT INTO student_paths (path, email) VALUES($1, $2)'
    const values = ["/"+nanoid(6), element]
    const response = await db.query(text, values)
  });
  res.redirect('/secretListOfABCEmails')
})

app.get('/secretListOfABCEmails', async (req, res, next) => {
  const text = 'SELECT * FROM student_paths'
  const response = await db.query(text)
  let retHTML = "<body>"
  response.rows.forEach(elem => {
    retHTML += `<div>Email: ${elem.email} | URL: aa-project-feedback.herokuapp.com${elem.path}</div>`
  })

  res.send(retHTML)
})

app.get('/*', (req, res) => {
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

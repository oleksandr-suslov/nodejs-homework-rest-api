const mongoose = require('mongoose')
const app = require('../app')
require('dotenv').config()

const { PORT = 3000, DB_CONN } = process.env

mongoose
  .connect(DB_CONN)
  .then(() =>
    app.listen(PORT, () => {
      console.log('Database connection successful')
    })
  )
  .catch((error) => {
    console.log(error.message)
    process.exit(1)
  })
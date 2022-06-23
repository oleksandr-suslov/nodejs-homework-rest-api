
const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
        user: 'USERNAME',
        pass: 'THE-GENERATED-APP-PASSWORD'
        }
})

// send()

const send = async (data) => {
const result = await transporter.sendMail({
from: 'USERNAME',
...data
})
return result
}

module.exports = send  
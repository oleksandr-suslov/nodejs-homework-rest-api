const { Conflict, Unauthorized, NotFound, BadRequest } = require('http-errors')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const fs = require('fs/promises')
const path = require('path')
const { v4 } = require('uuid')
const { User } = require('../model')
const { send } = require('../helpers')

const avatarsDir = path.join(__dirname, '../public/avatars')

require('dotenv').config()
const { SECRET_KEY, PORT } = process.env
const BASE_URL = `http://localhost:${PORT}/api/`

const signUp = async (req, res, next) => {
  const { email, password } = req.body
  const avatarURL = gravatar.url(email, { protocol: 'https', s: '250' })
  const user = await User.findOne({ email })
  if (user) {
    next(new Conflict('Email in use'))
  }

  const verificationToken = v4()
  const newUser = new User({ email, avatarURL, verificationToken })
  newUser.setPassword(password)
  const avatarFolder = path.join(avatarsDir, String(newUser._id))
  await fs.mkdir(avatarFolder)
  await newUser.save()

  const mail = {
    to: email,
    subject: 'Confirm your registration',
    html: `<a href='${BASE_URL}users/verify/${verificationToken}'>Click to confirm your email</a>`,
  }

  await send(mail)

  res.status(201).json({
    status: 'success',
    code: 201,
    user: {
      email,
      subscription: 'starter',
    },
  })
}

const logIn = async (req, res, next) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user.verify) {
    next(new BadRequest('Sorry by your email was not verified'))
  }

  if (!user || !user.comparePassword(password)) {
    next(new Unauthorized('Email or password is wrong'))
  }

  const payload = { id: user._id }
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' })

  await User.findByIdAndUpdate(user._id, { token })
  res.status(200).json({
    status: 'success',
    code: 200,
    data: {
      token,
    },
  })
}

const logOut = async (req, res, next) => {
  const { _id } = req.user

  await User.findByIdAndUpdate(_id, { token: null })
  res.status(204).json({
    status: 'success',
    code: 204,
  })
}

const getDataCurrentUser = async (req, res) => {
  const { email, subscription } = req.user

  res.status(200).json({
    status: 'success',
    code: 200,
    user: {
      email,
      subscription,
    },
  })
}

const updateSubscription = async (req, res, next) => {
  const { _id } = req.user
  const { subscription } = req.body
  const result = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  )

  if (!result) {
    throw new NotFound(`Contact with id '${_id}' not found`)
  }

  res.status(200).json({
    status: 'success',
    code: 200,
    result,
  })
}

const verify = async (req, res) => {
  const { verificationToken } = req.params
  const user = await User.findOne({ verificationToken })
  if (!user) {
    throw new NotFound('User not found')
  }

  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  })

  res.json({
    message: 'Verification successful',
  })
}

const reVerify = async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new BadRequest('missing required field email')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new NotFound(`User with email: ${email} is not found`)
  }

  if (user.verify) {
    throw new BadRequest('Verification has already been passed')
  }

  const mail = {
    to: email,
    subject: 'Confirm your registration',
    html: `<a href='${BASE_URL}auth/verify/${user.verificationToken}'>Click to confirm your email</a>`,
  }

  await send(mail)

  res.json({
    message: 'Verification email sent',
  })
}

module.exports = {
  signUp,
  logIn,
  logOut,
  getDataCurrentUser,
  updateSubscription,
  verify,
  reVerify,
}
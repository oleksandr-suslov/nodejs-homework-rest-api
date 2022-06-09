const express = require('express')
const usersRouter = express.Router()

const { validation } = require('../../middlewares/validationMiddleware')
const controllerWrapper = require('../../middlewares/controllerWrapper')
const { authenticate } = require('../../middlewares/authenticate')

const {
  joiUserSchema,
  joiSubscriptionSchema,
} = require('../../model/user')

const {
  signUp,
  logIn,
  logOut,
  getDataCurrentUser,
  updateSubscription,
} = require('../../controllers/authControllers')

usersRouter.post('/signup', validation(joiUserSchema), controllerWrapper(signUp))
usersRouter.post('/login', validation(joiUserSchema), controllerWrapper(logIn))
usersRouter.get('/logout', authenticate, controllerWrapper(logOut))
usersRouter.get('/current', authenticate, controllerWrapper(getDataCurrentUser))
usersRouter.patch(
  '/',
  authenticate,
  validation(joiSubscriptionSchema),
  controllerWrapper(updateSubscription)
)

module.exports = usersRouter
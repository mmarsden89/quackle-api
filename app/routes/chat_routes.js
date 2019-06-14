// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for chats and users
const Chat = require('../models/chat')
const Message = require('../models/message')
const User = require('../models/user')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// check if no returned users
const recipientNotFound = customErrors.recipientNotFound

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404

// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
// *************
// const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { chat: { title: '', text: 'foo' } } -> { chat: { text: 'foo' } }
// *************
// const removeBlanks = require('../../lib/remove_blank_fields')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /chats
router.get('/chats', (req, res, next) => {
  Chat.find()
    .sort('-updatedAt')
    .populate('user1', 'username _id profile')
    .populate('user2', 'username _id profile')
    .populate('lastMessage')
    .populate({path: 'lastMessage', populate: {path: 'owner'}})
    .then(chats => {
      // `chats` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return chats.map(chat => chat.toObject())
    })
    // respond with status 200 and JSON of the chats
    .then(chats => res.status(200).json({ chats: chats }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /chats/5a7db6c74d55bc51bdf39793
router.get('/chats/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Chat.findById(req.params.id)
    .populate('user1', 'username _id profile')
    .populate('user2', 'username _id profile')
    .populate('lastMessage')
    .populate({path: 'lastMessage', populate: {path: 'owner'}})
    // .then(console.log)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "chat" JSON
    .then(chat => {
      Message.find({ chat: chat }).sort('createdAt').populate('owner')
        .then(messages => messages.map(message => message.toObject()))
        .then(messages => {
          return res.status(200).json({ chat: {...chat.toObject(), messages: messages} })
        })
        .catch(next)
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /chats
router.post('/chats', requireToken, (req, res, next) => {
  // first, defend against notexistant users and chatting with self
  User.find({ username: req.body.chat.with })
    .then(recipientNotFound)
    .then(users => {
      // ready to have a chat!
      // check to see if one exists already
      Chat.find({
        $or:
        [{ $and:
          [
            { user1: req.body.chat.user1._id },
            { user2: req.body.chat.user2._id }
          ] },
        { $and:
          [
            { user1: req.body.chat.user2._id },
            { user2: req.body.chat.user1._id }
          ]
        }]
      })
        .then(chats => {
          // if chat doesn't exist, make one and send it to client
          if (chats.length === 0) {
            // set first user of new chat to be current user
            // second user to be the found user
            // and remove 'with' property before creation
            req.body.chat.user1 = req.body.chat.user1
            req.body.chat.user2 = req.body.chat.user2
            delete req.body.chat.with

            // create new chat
            Chat.create(req.body.chat)
            // respond to succesful `create` with status 201 and JSON of new "chat"
              .then(chat => {
                res.status(201).json({ chat: chat.toObject() })
              })
              .catch(next)
          } else {
          // if chat already exists, then send it to the client
            res.status(201).json({ chat: chats[0].toObject() })
          }
        })
        .catch(next)
    })
    .catch(next)
})

// DESTROY
// DELETE /chats/5a7db6c74d55bc51bdf39793
router.delete('/chats/:id', (req, res, next) => {
  Chat.findById(req.params.id)
    .then(handle404)
    .then(chat => {
      // throw an error if current user doesn't own `chat`
      // delete the chat ONLY IF the above didn't throw
      chat.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router

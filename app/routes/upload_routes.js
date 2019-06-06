const express = require('express')

const passport = require('passport')
// const bodyParser = require('body-parser')
const s3UploadFile = require('../../lib/s3UploadApi')
const Upload = require('../models/upload')
const multer = require('multer')
const customErrors = require('../../lib/custom_errors')
const AWS = require('aws-sdk')
const requireToken = passport.authenticate('bearer', { session: false })
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

// From example Route ^^^^^

const multerUpload = multer({ dest: 'pictures/' })
require('dotenv').config()
const s3 = new AWS.S3()

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /uploads
router.get('/uploads', (req, res, next) => {
  Upload.find()
    // .populate('owner', 'username')
    .populate('comments')
    .populate('owner', '-token')
    .populate({path: 'comments', populate: {path: 'owner', select: 'username'}})
    .then(uploads => {
      // `uploads` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return uploads.map(upload => upload.toObject())
    })
    // respond with status 200 and JSON of the uploads
    .then(uploads => res.status(200).json({ uploads: uploads }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /uploads/5a7db6c74d55bc51bdf39793
router.get('/uploads/:id', (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Upload.findById(req.params.id)
    .populate('comments')
    .populate('owner', '-token')
    .populate({path: 'comments', populate: {path: 'owner', select: 'username'}})
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "upload" JSON
    .then(upload => res.status(200).json({ upload: upload.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /uploads
router.post('/uploads', requireToken, multerUpload.single('picture'), (req, res, next) => {
  s3UploadFile.promiseReadFile(req.file)
    .then(fileData => ({
      Key: req.file.filename,
      Bucket: process.env.BUCKET_NAME,
      Body: fileData,
      ACL: 'public-read',
      ContentType: req.file.mimetype
    }))
    .then(s3UploadFile.promiseS3Upload)
    .then(s3Response => {
      return Upload.create({owner: req.user.id, url: s3Response.Location, tag: req.body.tag, description: req.body.description})
    })
    .then(uploadDocument => {
      // The object we are passing through the browser.
      res.status(201).json({ upload: uploadDocument.toObject() })
    })
    .catch(next)
})

// UPDATE
// PATCH /uploads/5a7db6c74d55bc51bdf39793
router.patch('/uploads/:id', requireToken, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.upload.owner

  Upload.findById(req.params.id)
    .then(handle404)
    .then(upload => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, upload)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(req.body.upload).forEach(key => {
        if (req.body.upload[key] === '') {
          delete req.body.upload[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return upload.update(req.body.upload)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /uploads/5a7db6c74d55bc51bdf39793
router.delete('/uploads/:id', requireToken, (req, res, next) => {
  Upload.findById(req.params.id)
    .then(handle404)
    .then(upload => {
      // throw an error if current user doesn't own `upload`
      requireOwnership(req, upload)
      // delete the upload ONLY IF the above didn't throw
      upload.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

router.patch('/likes/:id', requireToken, (req, res, next) => {
  console.log(req.body)
  const liker = req.body.upload.likes
  delete req.body.upload

  Upload.findById(req.params.id)
    .then(handle404)
    .then(upload => {
      const hasLiked = upload.likes.some(like => {
        console.log(like)
        return like.toString() === liker
      })
      if (hasLiked) {
        return upload.update({$pull: {likes: liker}})
      } else {
        return upload.update({$push: {likes: liker}})
      }
    })
    .then(upload => res.sendStatus(204))
    .catch(next)
})

module.exports = router

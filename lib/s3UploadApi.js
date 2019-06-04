require('dotenv').config()
const AWS = require('aws-sdk')
// const mime = require('mime-types')
const fs = require('fs')
const s3 = new AWS.S3()

// const extension = mime.extension(mimeType)

const promiseReadFile = function (fileObj) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileObj.path, (err, data) => {
      console.log(fileObj)
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const promiseS3Upload = function (params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
}

module.exports = {
  promiseReadFile,
  promiseS3Upload
}

const AWS = require('aws-sdk')
const fs = require('fs')
const mime = require('mime-types')
require('dotenv').config()

const s3 = new AWS.S3()

const type = mime.lookup(process.argv[2])

const originalFileName = process.argv[2].split('/').pop()

const promiseReadFile = function () {
  return new Promise((resolve, reject) => {
    fs.readFile(process.argv[2], (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

promiseReadFile()
  .then(fileData => {
    return {
      Bucket: process.env.BUCKET_NAME,
      Key: `${Date.now()}${originalFileName}`,
      Body: fileData,
      ACL: 'public-read',
      ContentType: type
    }
  })
  .then(params => {
    console.log(s3.upload(params, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log(data)
      }
    }))
  })
  .catch(err => {
    console.log(err)
  })

module.exports = s3

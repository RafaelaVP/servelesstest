"use strict";

const AWS = require("aws-sdk");
const sharp = require("sharp");
const { basename, extname } = require("path");

const S3 = new AWS.S3();

module.exports.handle = async ({ Records: records }, context) => {
  try {
     for(const record of records){
        const { key } = record.s3.object;
        const bucketName = record.s3.bucket.name
        const image = await S3.getObject({
          Bucket: bucketName,
          Key: key
        }).promise();

        const optimized = await sharp(image.Body)
          .resize(1280, 720, { fit: "inside", withoutEnlargement: true })
          .toFormat("jpeg", { progressive: true, quality: 50 })
          .toBuffer();

        await S3.putObject({
          Body: optimized,
          Bucket: bucketName,
          ContentType: "image/jpeg",
          Key: `compressed/${basename(key, extname(key))}.jpg`
        }).promise();
     }return true
  }
   catch (err) {
     console.log(err)
    return err;
  }
};
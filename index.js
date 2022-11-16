require('dotenv').config();
const express = require("express");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3-v2");

const app = express();
const s3 = new aws.S3();

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.REGION
})

const upload = multer({
    storage:multerS3({
        bucket: process.env.BUCKET,
        // bucket: process.env.BUCKET + "/photo",
        s3,
        key: (req, file, cb)=>{
            cb(null, file.originalname)
        }
    })

})

app.post("/upload", upload.single("file"), (req, res) => {
    res.send("Successfully uploaded")
})

app.get("/list", async (req, res)=> {
    const result = await s3.listObjectsV2({Bucket: process.env.BUCKET}).promise()
    let list = result.Contents.map(item=>item.Key);
    res.send(list);
})

app.get("/download/:filename", async (req, res)=> {
    const filename = req.params.filename;
    const result = await s3.getObject({Bucket: process.env.BUCKET,Key: filename }).promise();
    res.send(result.Body);
})


app.delete("/delete/:filename", async (req, res)=> {
    const filename = req.params.filename;
    await s3.deleteObject({Bucket: process.env.BUCKET,Key: filename }).promise();
    res.send("Successfully deleted");
})
app.listen(3000, ()=>{
    console.log("Successfully connected");
});
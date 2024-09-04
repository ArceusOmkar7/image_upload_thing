const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const ImageMetadata = require('./db');
const path = require('path');
const {GridFsStorage} = require('multer-gridfs-storage');


// secret keys etc
require('dotenv').config();

// initialising express
const app = express();

// essential middlewares
app.use(express.json());
app.use(cors())

// MongoDB connection
const connectionURL = process.env.mongoURI + 'upload_thing';
mongoose.connect(process.env.mongoURI + 'upload_thing', { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
const md = ImageMetadata;

conn.once('open', () => {
    console.log("CONNECTED TO DB");    
})

// Multer initialisation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = 'uploads/'; // Make sure the folder exists
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

// dummy get route
app.get('/', function (req, res) {
    res.json({
        msg: "Hello there"
    });
});

// upload file 
app.post('/upload', upload.array('files', 10), async function (req, res) {
    try {
        // create db model
        const fileArr = req.files.map(file => ({
            fileName: file.originalname,
            filePath: '/uploads/' + file.originalname,
            mimeType: file.mimetype,
            uploadedAt: Date.now(),
            size: file.size,
        }));

        // save db model
        await md.insertMany(fileArr);
        
        res.json({
            msg: "Uploaded!",
            files: fileArr.map(f => f.fileName),
        });
    } catch (error) {
        console.error("Cannot save:", error);
        res.status(400).json({
            msg: "Couldn't upload",
            reason: error.message,
        });
    }
});


app.listen(3000, () => {
    console.log("LISTENING TO PORT 3000");
})

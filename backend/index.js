const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const ImageMetadata = require('./db');
const { GridFsStorage } = require('multer-gridfs-storage');
// const { v4: primaryKey } = require('uuid');

// secret keys etc
require('dotenv').config();

// initialising express
const app = express();

// essential middlewares
app.use(express.json());
app.use(cors())

// MongoDB connection
const connectionURL = process.env.mongoURI + 'upload_thing';

// console.log(connectionURL);
mongoose.connect(connectionURL);
const conn = mongoose.connection;
const md = ImageMetadata;

conn.once('open', () => {
    console.log("CONNECTED TO DB");
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "uploads"
      });
})

conn.on('error', (err) => {
    console.error("Error connecting to DB:", err);
});

// Multer initialisation
const storage = new GridFsStorage({
    url: connectionURL,
    file: (req, file) => {
        console.log("File object in GridFsStorage:", file); // Detailed logging
        return {
            filename: `${Date.now()}-${file.originalname}`, // Unique filename
            bucketName: 'uploads', // Collection name in MongoDB for storing files
        };
    }
});

storage.on('file', (file) => {
    console.log("File stored in GridFS:", file);
});

storage.on('connection', (db) => {
    console.log('GridFS connected');
});

storage.on('error', (error) => {
    console.error('GridFS Storage Error:', error);
});

const upload = multer({ storage: storage });

// older local file system configuration 
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         const folderPath = 'uploads/'; // Make sure the folder exists
//         cb(null, folderPath);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + '-' + file.originalname); // Generate a unique filename
//     }
// });

// const upload = multer({ storage: storage });

// dummy get route
app.get('/', function (req, res) {
    res.json({
        msg: "Hello there"
    });
});

// upload file endpoint
app.post('/upload', upload.array('files', 10), async function (req, res) {
    if (!req.files || req.files.length === 0) {
        throw new Error("No files uploaded.");
    }

    // console.log(req.files);
    try {
        // create db model
        const fileArr = req.files.map(file => {
            // Log each file to see its properties
            // console.log(file);
            return {
                fileName: file.originalname,
                gridFSFileId: file.id,
                mimeType: file.mimetype,
                uploadedAt: Date.now(),
                size: file.size,
            };
        });
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

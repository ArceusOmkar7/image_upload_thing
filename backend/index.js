const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const { GridFsStorage } = require('multer-gridfs-storage');

// secret keys etc
require('dotenv').config();

// initialising express
const app = express();

// essential middlewares
app.use(express.json());
app.use(cors())

/* ---------MONGODB SIDE INITIALISATION--------- */
// MongoDB connection
const connectionURL = process.env.mongoURI + 'upload_thing';

// console.log(connectionURL);
mongoose.connect(connectionURL);
const conn = mongoose.connection;
// const md = ImageMetadata;
/* ---------MONGODB SIDE DONE--------- */


/* ---------GRIDFS-MULTER SIDE INITIALISATION--------- */
let gfs;

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
            metadata: {
                originalName: file.originalname,
            }
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
/* ---------GRIDFS-MULTER SIDE DONE--------- */

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
        return res.status(400).json({ msg: "No files uploaded." });
    }

    try {
        res.json({
            msg: "Uploaded!",
            files: req.files.map(file => file.originalname),
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({
            msg: "Couldn't upload",
            reason: error.message,
        });
    }
});


app.get('/download/:filename', async function (req, res) {
    const fileName = req.params.filename;

    try {
        // Find the file in the GridFS bucket
        const file = await gfs.find({ metadata: {originalName: fileName} }).toArray();
        
        if (!file || file.length === 0) {
            return res.status(404).json({ msg: "File not found" });
        }

        // Extract file info and create a readable stream
        const fileInfo = file[0];
        const downloadStream = gfs.openDownloadStream(fileInfo._id);
        
        if (!downloadStream) {
            return res.status(404).json({ msg: "Cannot stream the file" });
        }

        downloadStream.on('error', (err) => {
            res.status(500).json({ msg: "Error downloading file", error: err.message });
        });

        // Set response headers and pipe the file stream to the response
        res.set('Content-Type', fileInfo.contentType);
        res.set('Content-Disposition', `attachment; filename=${fileInfo.filename}`);
        downloadStream.pipe(res);

    } 
    catch (error) {
        console.error("Error downloading file:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

app.get('/all', async function (req, res) {
    try {
        const files = await gfs.find().toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ msg: "No files found" });
        }

        // Send the file metadata without URLs
        const fileDetails = files.map(file => ({
            fileId: file._id,
            filename: file.filename,
            contentType: file.contentType,
            uploadDate: file.uploadDate,
            length: file.length,
            metadata: file.metadata,
        }));

        res.json(fileDetails);

    } catch (error) {
        console.error("Error retrieving files:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});


app.listen(3000, () => {
    console.log("LISTENING TO PORT 3000");
})

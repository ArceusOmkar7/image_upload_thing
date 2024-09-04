const mongoose = require('mongoose');

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm", "video/x-msvideo"]
// x-msvideo = .avi

const imageMetadataSchema = new mongoose.Schema({ 
    fileName: {
      type: String,
      required: true,
    },
    gridFSFileId: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ACCEPTED_IMAGE_TYPES,
    },
    uploadedAt: {
      type: Date,
      require: true,  
    },
    size: {
      type: Number,
      required: true,
    },
  });

const ImageMetadata = mongoose.model('metadata', imageMetadataSchema);

module.exports = ImageMetadata;



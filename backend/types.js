const { model } = require('mongoose');
const z = require('zod');

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const uploadReqType = z.object({
    name: z.string(),
    image: z.array(z.any())
        .min(1, { msg: "Image is required." })
        .refine((files) => files.every(file => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type), { msg: "Only .jpeg, .jpg, .png, .webp files are accepted." }))
});

module.exports = { uploadReqType };

const mongoose = require("mongoose");
const blogModel = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        tags:
        {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        views: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            default: "Published",
            enum: ["Published", "Draft", "Archived"],
          
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('bolg', blogModel);

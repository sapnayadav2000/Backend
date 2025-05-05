
const Blog = require('../Model/blog');
const path = require("path");
const fs = require("fs");


exports. addBlog = async (req, res) => {

    try {
        req.body.image = `Uploads/${req.file?.filename}`;
    
        const blog = await Blog.create(req.body);
    
        res
          .status(201)
          .json({ status: true, message: "Blog Created ", data: blog });
      } catch (err) {
        res.status(400).json({ status: false, error: err.message });
      }

};

exports. getAllBlog = async (req, res) => {

    try {
        const blog = await Blog.find().sort({ createdAt: -1 });
    
        if (blog.length === 0) {
          return res
            .status(404)
            .json({ status: false, message: "Blog Not Found" });
        }
    
        res
          .status(200)
          .json({
            status: true,
            message: "Blog Fetch Successfully ",
            data: blog,
          });
      } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, error: err.message });
      }

};

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
          return res.status(404).json({ status: false, message: "Blog Not Found" });
        }
    
        // Handle image update
        if (req.file) {
          const newImagePath = `Uploads/${req.file.filename}`;
    
          // Remove old image if it exists
          if (blog.image) {
            const oldFilePath = path.join(__dirname, "../", blog.image);
            if (fs.existsSync(oldFilePath)) {
              fs.unlinkSync(oldFilePath); // Deletes the old image
            }
          }
    
          // Assign new image path
          blog.image = newImagePath;
        }
    
        // Update other fields
        Object.assign(blog, req.body);
        await blog.save();
    
        res.status(200).json({
          status: true,
          message: "Blog Updated Successfully",
          data: blog,
        });
      } catch (err) {
        res.status(400).json({ status: false, error: err.message });
      }

};

exports. GetByIdgBlog = async (req, res) => {
  

    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
    
        if (!blog) {
          return res
            .status(404)
            .json({ status: false, message: "Blog  Not Found" });
        }
        res
          .status(200)
          .json({
            status: true,
            message: " Blog Fetch Successfully ",
            data: blog,
          });
      } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, error: err.message });
      }

};

exports. deleteByID = async (req, res) => {

    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
          return res
            .status(404)
            .json({ status: false, message: "Blog Not Found" });
        }
        if (blog.image) {
          const imagepath = path.join(
            __dirname,
            "../Uploads",
            path.basename(blog.image)
          );
          if (fs.existsSync(imagepath)) {
            fs.unlink(imagepath, (err) => {
              if (err) {
                console.err("Failed to delete image", err);
              }
            });
          }
        }
        await Blog.findByIdAndDelete(req.params.id);
    
        res
          .status(200)
          .json({
            status: true,
            message: "Blog  Delete Successfuly  ",
            data: blog,
          });
      } catch (err) {
        console.log(err);
        res.status(500).json({ status: false, error: err.message });
      }

};


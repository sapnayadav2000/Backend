const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // ✅ Fixed case
        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // ✅ Fixed case
                
                addedAt: { type: Date, default: Date.now },
            },
            
        ],
    },
    {
        timestamps: true, // <-- This adds createdAt and updatedAt automatically
      }
);

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist; 

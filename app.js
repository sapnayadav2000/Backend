const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const userRoutes = require("./Route/userRoute");
const bannerRoutes = require("./Route/bannerRoute");
const notificationRouter = require("./Route/notificationRoute");
const adminRoute = require("./Route/adminRoute");
const categoryRouter = require("./Route/categoryRoute");
const subCategoryRouter = require("./Route/subCategoryRoute");
const productRoute = require("./Route/productRoute");
const brandRoute = require("./Route/brandRoute");
const useraddressRoute = require("./Route/userAddressRoute");
const productdetailsRoute = require("./Route/productDetailsRoute");
const AppPolicy=require('./Route/appPolicyRoute');
const blogRoute=require('./Route/blogRoute');
const cartRoute=require('./Route/cartRoute');
const wishlistRoute=require('./Route/wishlistRoute');
const pincodeRoutes = require("./Route/pincodeRoute");
const ReturnRoute=require('./Route/returnRoute');

const Orders=require('./Route/ordersRoute')

const contactRoute=require('./Route/contactRoute');
const ReviewRoute=require('./Route/reviewRoute')
const TicketRoute=require('./Route/ticketRoute')
app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/ban", bannerRoutes);
app.use("/api/notification", notificationRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/brand", brandRoute);
app.use("/api/product", productRoute);
app.use("/api/address", useraddressRoute);
app.use("/api/productdetails", productdetailsRoute);
app.use('/api/policy',AppPolicy)
app.use('/api/blog',blogRoute);
app.use('/api/wishlist',wishlistRoute);
// app.use('/api/order',orderRoute);

app.use("/api/pincodes", pincodeRoutes);
app.use('/api/cart',cartRoute);
app.use('/api/contact',contactRoute);
app.use('/api/review',ReviewRoute)
app.use('/api/ticket',TicketRoute)
app.use('/api/return',ReturnRoute)

app.use('/api/Orders',Orders)


module.exports = app;

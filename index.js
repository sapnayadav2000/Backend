
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'}); 
const mongoose = require('mongoose');
const app = require('./app');




mongoose.connect(process.env.DATABASE_LOCAL_STRING,{
    useNewUrlParser: true,
    useUnifiedTopology: true,})
.then(con =>{
    console.log('MongoDB connected');
})




const server = app.listen(process.env.PORT , ()=>{
    console.log(`app is running on Port`,process.env.PORT) 
    

})

process.on('unhandledRejection', err => {
    console.log(err.name,err);
    console.log('UNHANDLED REJECTION ! SHUTTING DOWN.....');
    server.close(()=>{
        process.exit(1);
    });
});
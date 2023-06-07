const express = require('express');
const app = express(); //returns instance of http server
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

// app.use((req, res, next) => {
//     res.status(200).json({
//         message: 'It works well!'
//     });
// });

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Allow, Authorization");

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PATCH, PUT, POST, DELETE, GET");
        return res.status(200).json({});
    }
    next();
})

mongoose.connect("mongodb+srv://pragatikhurana8:Hello123.@node-rest-shop.osplqhu.mongodb.net/").then(res => console.log("connection successful")).catch(err => console.log(err));
mongoose.Promise = global.Promise;

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect("mongodb+srv://pragatikhurana8:pragatikhurana8@node-rest-shop.osplqhu.mongodb.net/", {});
//         console.log(`Mongoose Connected : ${conn.connection.host}`);
//     } catch (error) {
//         console.log(`Error: ${error.message}`);
//         process.exit();
//     }
// };
// console.log(process.env.MONGO_ATLAS_PW)
// connectDB();


//it reach here that means no upper routes were able to handle request
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

//direct flow in errors comes here directly (error return due to fail in some database operations)
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
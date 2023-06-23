const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { default: mongoose } = require('mongoose');
const order = require('../models/order');

router.get('/', (req, res, next) => {
    Order.find()
    .select('_id product quantity')
    .populate('product', 'name')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {

    // Product.findById(req.body.productId).then(product => {
        
    // }).catch()


    const order = new Order({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
    });

    order.save().then(result => {
        res.status(201).json({
            message: "Order Created",
            createdOrder: {
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result._id
            }
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
    .populate('product')
    .exec()
    .then(doc => {
        if(!doc) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }
        res.status(200).json({
            order: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id}).exec()
    .then(resut => {
        res.status(200).json({
            message: 'Oder deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders/',
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;
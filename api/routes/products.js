const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/product');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false); //reject a file
    }
}

// const upload = multer({dest: 'uploads/'});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024*1024*5
    },
    fileFilter: fileFilter
})

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price productImage _id')
        .exec().then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response)
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    product.save().then(result => {
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    console.log("called", id);
    Product.findById(id)
        .select('name price productImage _id')
        .exec().then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products'
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                })
            }
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    // const updateOps = {};
    // for (const ops of req.body) {
    //     updateOps[ops.propName] = ops.value;
    // }


    Product.findByIdAndUpdate(id, { $set: req.body }, { new: true }).then(result => {
        res.status(200).json({
            message: "Product updated",
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id }).exec().then(result => {
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: {
                    name: 'String',
                    price: 'Number'
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
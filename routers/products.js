const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {Product} = require('../models/products');
const {Category} = require('../models/categories')
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});



router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const productList = await Product.find(filter) //.select('name image');

    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);
})

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({message: 'The Product with the given id not found'})
    }
    res.status(200).send(product);
})

router.post(`/`, async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid Category')
    }

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brands: req.body.brands,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product) {
        return res.status(500).send('The Product cannot be created')
    }

    res.send(product);

    // product.save().then((createdProduct => {
//     res.status(201).json(createdProduct)
// })).catch((err) => {
//     res.status(500).json({
//         error: err,
//         success: false
//     })
// })

})


router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({message: 'Invalid Product Id'});
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send({message: 'Product not found'});

    const category = await Category.findById(req.body.category);
    if (!category) {
        return res.status(400).send('Invalid Category')
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brands: req.body.brands,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        }, {
            new: true
        }
    )

    if (!updatedProduct) {
        return res.status(404).send('The Product cannot be updated.')
    }
    res.send(updatedProduct);
})

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: 'The product is deleted!',
                    });
            } else {
                return res
                    .status(404)
                    .json({success: false, message: 'Product not found!'});
            }
        })
        .catch((err) => {
            return res.status(500).json({success: false, error: err});
        });
});

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);

    if (!productCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        productCount: productCount,
    });
});

router.get('/get/featured/:count',async (req, res)=>{
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isFeatured:true}).limit(+count);

    if(!products){
        res.status(404).json({success: false})

    }
    res.send(products)
})

module.exports = router;


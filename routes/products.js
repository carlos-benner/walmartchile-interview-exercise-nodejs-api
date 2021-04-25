const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const isPalindrome = require('../helpers/strings');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    try {
        const products = await Product.find().limit(100);
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.json({ msg: err });
    }
});

router.get('/search/:query', async (req, res) => {
    const query = req.params.query;
    const limit =
        !isNaN(req.query.limit) &&
        Number.isInteger(parseInt(req.query.limit)) &&
        req.query.limit > 0
            ? parseInt(req.query.limit)
            : null;
    if (!query || (isNaN(query) && query.trim().length <= 3)) {
        return res.status(400).json({
            msg: 'Search query must contain at least 3 non-numeric characters',
        });
    }

    //Query is numeric. Find by ID
    if (!isNaN(query)) {
        if (query > 0 && Number.isInteger(parseInt(query))) {
            try {
                let product = await Product.findOne({ id: query });
                return res.status(200).json(product);
            } catch (err) {
                console.error(err);
                return res.status(500).json(err);
            }
        }
        return res.status(400).json({
            msg: 'numeric query must be positive integer',
        });
    }

    try {
        let products = await Product.find({
            $or: [
                { brand: { $regex: query } },
                { description: { $regex: query } },
            ],
        }).limit(limit);
        if (isPalindrome(query)) {
            products = products.map((p) => {
                p.discount = 50;
                p.original_price = p.price;
                p.price = p.price * (p.discount / 100);
                return p;
            });
        }
        return res.status(200).json(products);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.get('/:productId', async (req, res) => {
    let query = req.params.productId;
    if (isNaN(query) || !Number.isInteger(parseInt(query)) || query < 1) {
        return res.status(400).json({
            msg: 'Product id must be positive integer',
        });
    }
    try {
        let product = await Product.findOne({ id: query });
        return res.status(product ? 200 : 404).json(product);
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

router.post('/', function (req, res) {
    if (!req.body.brand || !req.body.price) {
        return res.status(500).json({ msg: 'brand and price are required' });
    }

    const newProduct = new Product({
        brand: req.body.brand,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
    });

    newProduct
        .save()
        .then((data) => res.status(200).json(data))
        .catch((err) => {
            console.error(err);
            res.status(500).json(err);
        });
});

router.delete('/:id', async function (req, res) {
    const productId = req.params.id;
    try {
        let product = await Product.findOneAndRemove(
            { id: productId },
            null,
            (err, data) => {
                if (!err) {
                    return res
                        .status(200)
                        .json({ msg: `Product with id ${productId} deleted` });
                }
                res.status(404).json({
                    msg: `Product with id ${productId} not found.`,
                });
            }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
});

module.exports = router;

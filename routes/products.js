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

router.post('/search', async (req, res) => {
    const query = req.body.query;
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
                p.price = p.price / 2;
                p.discounted = true;
                return p;
            });
        }
        res.status(200).json(products);
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

module.exports = router;

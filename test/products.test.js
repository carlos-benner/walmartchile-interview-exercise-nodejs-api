const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

//Assertion style
chai.should();

chai.use(chaiHttp);

/**
 * Testing get all (100, for now) products
 */

describe('GET /products/', () => {
    it('Should get all products', (done) => {
        chai.request(app)
            .get('/products/')
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('array');
                response.body.length.should.be.eq(100);
                done();
            });
    });
});

/**
 * Testing get product by id
 */

describe('GET /products/:id', () => {
    it('Should get a product by id', (done) => {
        const productId = 15;
        chai.request(app)
            .get(`/products/${productId}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('object');
                response.body.should.have.property('id').eq(productId);
                response.body.should.have.property('brand');
                response.body.should.have.property('description');
                response.body.should.have.property('image');
                response.body.should.have.property('price').eq(953318);
                response.body.should.not.have.property('discounted');
                done();
            });
    });

    it('Should not get a product by id', (done) => {
        const productId = 154444;
        chai.request(app)
            .get(`/products/${productId}`)
            .end((error, response) => {
                response.should.have.status(404);
                done();
            });
    });
});

/**
 * Testing search product by brand/description
 */

describe('GET /products/search/:query', () => {
    it('Should get a product by brand or description', (done) => {
        const query = 'asdf';
        chai.request(app)
            .get(`/products/search/${query}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('array');
                response.body.forEach((p) => {
                    p.should.have.property('brand');
                    p.should.have.property('description');
                    p.should.have.property('image');
                    p.should.have.property('price');
                    (
                        p.brand.includes(query) || p.description.includes(query)
                    ).should.eq(true);
                });
                done();
            });
    });

    /**
     * Testing search does not work for short queries
     */

    it('Should not return results if query has fewer than 4 characters', (done) => {
        const query = 'asd';
        chai.request(app)
            .get(`/products/search/${query}`)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.msg.should.eq(
                    'Search query must contain at least 3 non-numeric characters'
                );
                done();
            });
    });

    it('Should not return results if query is empty', (done) => {
        chai.request(app)
            .get(`/products/search/`)
            .end((error, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.msg.should.eq(
                    'Product id must be positive integer'
                );
                done();
            });
    });

    /**
     * Testing promotion is applied when searching by palindrome
     */

    it('Should apply 50% discount on prices when searching by palindrome', (done) => {
        const query = 'asdsa';
        chai.request(app)
            .get(`/products/search/${query}`)
            .end((error, response) => {
                response.should.have.status(200);
                response.body.should.be.a('array');
                response.body.forEach((p) => {
                    p.should.have.property('brand');
                    p.should.have.property('description');
                    p.should.have.property('image');
                    p.should.have.property('price');
                    p.should.have.property('original_price').eq(p.price / 0.5);
                    (
                        p.brand.includes(query) || p.description.includes(query)
                    ).should.eq(true);
                });
                done();
            });
    });
});

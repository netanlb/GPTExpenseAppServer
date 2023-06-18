
const express = require('express');
const router = express.Router();

//return a json with the developers info
router.get('/', function(req, res, next) {
    res.status(200).json([{firstname: 'Adam Eliyahu', lastname: 'Haymov', id: '203520259', email: 'advanceadam1@gmail.com'}, 
                {firstname: 'Eliel', lastname: 'Yeshayahu', id: '208574160', email: 'eliy5550@gmail.com'}]);
});

module.exports = router;

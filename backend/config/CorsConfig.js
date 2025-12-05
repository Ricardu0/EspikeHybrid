const cors = require('cors');

const corsOptions = {
    origin: [
        'http://localhost:8081',
        'https://espike-frontend.onrender.com' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true
};

module.exports = cors(corsOptions);
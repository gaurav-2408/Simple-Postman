require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public')); // Serve static files

// Serve index.html as root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// to check backend is upto-date
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Request validation
const validateRequest = (req, res, next) => {
    const { endPoint, httpMethod, headers, body } = req.body;
    
    if (!endPoint || !httpMethod || !headers) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!isValidEndPoint(endPoint)) {
        return res.status(400).json({ error: 'Invalid endpoint URL' });
    }
    
    if (!isValidHttpMethod(httpMethod)) {
        return res.status(400).json({ error: 'Invalid HTTP method' });
    }
    
    if (!isValidHeaders(headers)) {
        return res.status(400).json({ error: 'Invalid headers' });
    }
    
    next();
};

// Validation functions
const isValidEndPoint = (endPoint) =>{
    try {
        const url = new URL(endPoint);
    
        // Basic checks
        const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
        const hasHostname = url.hostname.length > 0;
    
        return isHttp && hasHostname;
    }catch (err) {
        return false;
    }
};

const isValidHeaders = (headers) =>{
    return Object.keys(headers).length > 0;
}   

const isValidBody = (body) =>{
    return Object.keys(body).length > 0;
}   

const isValidHttpMethod = (httpMethod) =>{
    return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(httpMethod);
}

// Main API endpoint
app.post('/api/request', validateRequest, async (req, res) => {
    try {
        const { endPoint, httpMethod, headers, body } = req.body;
        
        const config = {
            method: httpMethod.toLowerCase(),
            url: endPoint,
            headers: headers,
            data: body || undefined
        };

        const response = await axios(config);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || 'An error occurred while processing the request'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
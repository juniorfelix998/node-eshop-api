const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config')


app.use(cors());
app.options('*', cors())


// middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);


const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRouter);
app.use(`${api}/products`, productsRouter)
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);

// Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'easyshop'
}).then(
    () => {
        console.log('Database Connection Ready')
    }
).catch(
    (err) => {
        console.log(err)
    }
)

// Server
app.listen(3000, () => {
    console.log('Server is Running http://localhost:3000');
})
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const axios = require('axios');


const app = express();
const PORT = process.env.PORT || 8084;


mongoose.connect('mongodb+srv://mayurpanchal527:Madara%402002@cluster0.zejgeu7.mongodb.net/ecommerce'
, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB!');
});

db.on('disconnected', () => {
  console.warn('MongoDB disconnected!');
});


const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: true,
  },
  productId: {
    type: Array,
    default: true,
  },
  orderId: {
    type: String,
    default: true,
  },
  total: {
    type: Number,
    required: true, 
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);

const CART_API_URL = 'https://your-friend-api.com/cart';
const USER_API_URL = 'https://your-friend-api.com/user';


app.use(bodyParser.json());


app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/orders', async (req, res) => {
//   try {
//     const { productName, quantity } = req.body;
//     const order = new Order({ productName, quantity });
//     await order.save();
//     res.status(201).json(order);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post('/api/orders', async (req, res) => {
  try {
    const { cartId, userId } = req.body;


    if (!cartId || !userId) {
      return res.status(400).json({ error: 'Cart ID and User ID are required.' });
    }


    const [cartResponse, userResponse] = await Promise.all([
      axios.get(`${CART_API_URL}/${cartId}`),
      axios.get(`${USER_API_URL}/${userId}`),
    ]);

    const cart = cartResponse.data;
    const user = userResponse.data;


    const order = new Order({
      orderId: generateOrderId(),
      user,
      cart,
      status: 'Pending', 
      timestamp: new Date().toISOString(),
    });


    await order.save();


    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/orders/:orderId', async (req, res) => {
  try {
    const orderIdParam = req.params.orderId;

    const order = await Order.findOne({ orderId: orderIdParam });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order by orderId:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

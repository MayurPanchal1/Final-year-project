const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();
const PORT = 8084;

app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/your-database', { useNewUrlParser: true, useUnifiedTopology: true });


const orderSchema = new mongoose.Schema({
  orderId: String,
  user: Object,
  cart: Object,
  status: String,
  timestamp: String,
});


const Order = mongoose.model('Order', orderSchema);


const CART_API_URL = 'https://your-friend-api.com/cart';
const USER_API_URL = 'https://your-friend-api.com/user';


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


function generateOrderId() {
  return Math.random().toString(36).substr(2, 9);
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

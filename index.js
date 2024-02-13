const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect('mongodb+srv://mayurpanchal527:Madara%402002@cluster0.zejgeu7.mongodb.net/ecommerce'
, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) {
      console.error('Error connecting to MongoDB:', err);
  } else {
      console.log('Connected to MongoDB');
  }
});


const orderSchema = new mongoose.Schema({
  customerName: String,
  productName: String,
  quantity: Number,
});

const Order = mongoose.model('Order', orderSchema);


app.use(bodyParser.json());


app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { customerName, productName, quantity } = req.body;
    const order = new Order({ customerName, productName, quantity });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

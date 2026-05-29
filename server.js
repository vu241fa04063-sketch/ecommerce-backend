const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// One-time seed endpoint (remove after use)
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    const admin = await User.create({ name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: 'admin' });
    const user = await User.create({ name: 'John Doe', email: 'user@store.com', password: 'user123', role: 'user' });

    const products = await Product.insertMany([
      { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-cancelling headphones with 30-hour battery life.', price: 79.99, category: 'Electronics', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', createdBy: admin._id },
      { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard with tactile switches.', price: 129.99, category: 'Electronics', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', createdBy: admin._id },
      { name: 'Classic White T-Shirt', description: '100% organic cotton t-shirt, comfortable for everyday wear.', price: 24.99, category: 'Clothing', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', createdBy: admin._id },
      { name: 'Slim Fit Jeans', description: 'Modern slim fit jeans made from stretch denim.', price: 59.99, category: 'Clothing', stock: 75, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', createdBy: admin._id },
      { name: 'JavaScript: The Good Parts', description: 'A must-read book for every JavaScript developer.', price: 19.99, category: 'Books', stock: 40, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', createdBy: admin._id },
      { name: 'Clean Code', description: 'A handbook of agile software craftsmanship by Robert C. Martin.', price: 34.99, category: 'Books', stock: 35, imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', createdBy: admin._id },
      { name: 'Ceramic Coffee Mug Set', description: 'Set of 4 handcrafted ceramic mugs, microwave safe.', price: 39.99, category: 'Home', stock: 60, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400', createdBy: admin._id },
      { name: 'Yoga Mat Premium', description: 'Non-slip eco-friendly yoga mat, 6mm thick.', price: 49.99, category: 'Sports', stock: 45, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', createdBy: admin._id },
    ]);

    await Order.create({
      user: user._id,
      items: [{ product: products[0]._id, name: products[0].name, quantity: 1, price: products[0].price }],
      totalAmount: products[0].price,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
    });

    res.json({ success: true, message: 'Database seeded! Admin: admin@store.com / admin123 | User: user@store.com / user123' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

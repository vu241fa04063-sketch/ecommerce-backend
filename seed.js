const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and crystal-clear sound.',
    price: 79.99,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches, perfect for gaming and typing.',
    price: 129.99,
    category: 'Electronics',
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  },
  {
    name: 'Classic White T-Shirt',
    description: '100% organic cotton t-shirt, comfortable and breathable for everyday wear.',
    price: 24.99,
    category: 'Clothing',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans made from stretch denim for maximum comfort and style.',
    price: 59.99,
    category: 'Clothing',
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'A must-read book for every JavaScript developer. Covers the best features of the language.',
    price: 19.99,
    category: 'Books',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  },
  {
    name: 'Clean Code',
    description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
    price: 34.99,
    category: 'Books',
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic mugs, microwave and dishwasher safe.',
    price: 39.99,
    category: 'Home',
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip eco-friendly yoga mat with alignment lines, 6mm thick for joint support.',
    price: 49.99,
    category: 'Sports',
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });

    // Create regular user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@store.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Users created');

    // Create products
    const createdProducts = await Product.insertMany(
      products.map((p) => ({ ...p, createdBy: admin._id }))
    );
    console.log(`${createdProducts.length} products created`);

    // Create a sample order
    await Order.create({
      user: user._id,
      items: [
        { product: createdProducts[0]._id, name: createdProducts[0].name, quantity: 1, price: createdProducts[0].price },
        { product: createdProducts[4]._id, name: createdProducts[4].name, quantity: 2, price: createdProducts[4].price },
      ],
      totalAmount: createdProducts[0].price + createdProducts[4].price * 2,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
      },
    });

    console.log('Sample order created');
    console.log('\n✅ Database seeded successfully!');
    console.log('Admin: admin@store.com / admin123');
    console.log('User:  user@store.com  / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();

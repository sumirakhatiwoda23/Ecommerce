import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

// 5 categories x 20 products = 100 products total.
// Real Unsplash photos, cycled per category so every product gets a
// photo that actually matches what it is (not a random unrelated image).
const UNSPLASH_IDS = {
  Electronics: [
    '1505740420928-5e560c06d30e', '1498049794561-7780e7231661', '1550009158-9ebf69173e03',
    '1588508065123-287b28e013da', '1648737966636-2fc3a5fffc8a', '1593344484962-796055d4a3a4',
    '1548092372-0d1bd40894a3'
  ],
  Furniture: [
    '1586023492125-27b2c045efd7', '1631679706909-1844bbd07221', '1583847268964-b28dc8f51f92',
    '1567016376408-0226e4d0c1ea', '1634712282287-14ed57b9cc89', '1628744876497-eb30460be9f6',
    '1598300042247-d088f8ab3a91', '1693578616322-c8abe6c7393d', '1600210492493-0946911123ea',
    '1506898667547-42e22a46e125', '1705326701287-346fc37a2c86', '1565031491910-e57fac031c41',
    '1571898223382-0aa3499f0f2a', '1602872030490-4a484a7b3ba6'
  ],
  Clothing: [
    '1558769132-cb1aea458c5e', '1599971284305-674fb528fa78', '1591047139829-d91aecb6caea',
    '1540221652346-e5dd6b50f3e7', '1532453288672-3a27e9be9efd', '1562157873-818bc0726f68',
    '1525507119028-ed4c629a60a3', '1434389677669-e08b4cac3105'
  ],
  Footwear: [
    '1560769629-975ec94e6a86', '1656944227421-416b1d2186c9', '1605523741177-cd660595c2cf',
    '1628413993904-94ecb60f1239', '1695073621086-aa692bc32a3d', '1604671801908-6f0c6a092c05',
    '1618677831708-0e7fda3148b4', '1542219550-37153d387c27'
  ],
  'Beauty & Personal Care': [
    '1596462502278-27bfdc403348', '1512496015851-a90fb38ba796', '1580870069867-74c57ee1bb07',
    '1583209814683-c023dd293cc6', '1608571423902-eed4a5ad8108', '1619451427882-6aaaded0cc61',
    '1522335789203-aabd1fc54bc9', '1631730486572-226d1f595b68'
  ]
};

const CATEGORY_DATA = [
  {
    name: 'Electronics',
    priceRange: [15, 1600],
    items: [
      'Wireless Noise-Cancelling Headphones', 'Smart LED TV 55-inch', 'Bluetooth Portable Speaker',
      '4K Action Camera', '15-inch Gaming Laptop', 'RGB Mechanical Keyboard', 'Wireless Ergonomic Mouse',
      'Smartwatch Fitness Tracker', '10-inch Android Tablet', 'Dolby Atmos Soundbar',
      'Professional DSLR Camera', 'True Wireless Earbuds', '20000mAh Power Bank',
      'Smart Home Hub Speaker', 'Robot Vacuum Cleaner', '1TB Portable SSD',
      '15W Wireless Charging Pad', 'Virtual Reality Headset', '4K Camera Drone', 'Digital Photo Frame'
    ]
  },
  {
    name: 'Furniture',
    priceRange: [30, 2200],
    items: [
      'Minimalist Modern Accent Chair', 'Solid Wood Dining Table', '3-Seater Leather Sofa',
      'Queen Size Bed Frame', '5-Tier Bookshelf', 'Office Desk with Drawers',
      'Reclining Armchair', 'Round Glass Coffee Table', 'TV Stand Media Console',
      'Set of 2 Bar Stools', '3-Door Wardrobe Closet', 'Kids Bunk Bed',
      '4-Piece Outdoor Patio Set', 'Oversized Bean Bag Chair', 'Entryway Shoe Rack Cabinet',
      'Nightstand with Lamp Shelf', 'Bathroom Vanity Cabinet', 'Rustic Bar Counter Table',
      'Wooden Rocking Chair', 'Storage Ottoman Bench'
    ]
  },
  {
    name: 'Clothing',
    priceRange: [12, 320],
    items: [
      'Classic Denim Jacket', 'Cotton Crew Neck T-Shirt', 'Slim Fit Chinos',
      'Wool Blend Overcoat', 'Casual Flannel Shirt', 'Summer Floral Dress',
      'Formal Two-Piece Suit', 'Graphic Print Hoodie', 'Athletic Joggers',
      'Silk Button-Up Blouse', 'Cargo Cotton Shorts', 'Knit Cardigan Sweater',
      'Leather Biker Jacket', 'Linen Short-Sleeve Shirt', 'High-Waist Yoga Leggings',
      'Puffer Winter Jacket', 'Classic Fit Polo Shirt', 'Maxi Summer Dress',
      'Waterproof Trench Coat', 'Thermal Base Layer Set'
    ]
  },
  {
    name: 'Footwear',
    priceRange: [18, 260],
    items: [
      'Classic White Sneakers', 'Lightweight Running Shoes', 'Leather Chelsea Boots',
      'Casual Canvas Slip-Ons', 'Formal Oxford Shoes', 'Waterproof Hiking Boots',
      'High-Top Basketball Shoes', 'Comfort Fit Sandals', 'Ankle Rain Boots',
      'Suede Penny Loafers', 'Sports Training Shoes', 'Beach Flip Flops',
      'Insulated Snow Boots', 'Classic Ballet Flats', 'Espadrille Wedge Sandals',
      'Classic Canvas Skate Shoes', 'Leather Cowboy Boots', 'Memory Foam Slippers',
      'Soccer Cleats', 'Platform Block Heels'
    ]
  },
  {
    name: 'Beauty & Personal Care',
    priceRange: [6, 150],
    items: [
      'Vitamin C Brightening Serum', 'Hydrating Face Moisturizer', 'Matte Liquid Lipstick Set',
      'Argan Oil Hair Treatment', 'Purifying Charcoal Face Mask', 'Sonic Electric Toothbrush',
      'Eau de Parfum Spray', 'Broad Spectrum Sunscreen SPF 50', 'Professional Makeup Brush Set',
      'Ionic Hair Dryer', 'Beard Grooming Kit', '12-Piece Nail Polish Collection',
      'Shea Butter Body Lotion', '18-Shade Eyeshadow Palette', 'Anti-Aging Night Cream',
      'Shampoo & Conditioner Duo', 'Cordless Electric Shaver', 'Facial Cleansing Brush',
      'Moisturizing Lip Balm Set', 'Aromatherapy Essential Oil Diffuser'
    ]
  }
];

const generateProducts = () => {
  const products = [];

  CATEGORY_DATA.forEach((cat) => {
    const photoIds = UNSPLASH_IDS[cat.name] || [];

    cat.items.forEach((itemName, index) => {
      const [minPrice, maxPrice] = cat.priceRange;
      const price = Number((minPrice + Math.random() * (maxPrice - minPrice)).toFixed(2));
      const stock = Math.floor(Math.random() * 56) + 5; // 5 - 60
      const ratings = Number((3.5 + Math.random() * 1.5).toFixed(1)); // 3.5 - 5.0
      const numReviews = Math.floor(Math.random() * 146) + 4; // 4 - 149
      const photoId = photoIds.length ? photoIds[index % photoIds.length] : null;
      const imageUrl = photoId
        ? `https://images.unsplash.com/photo-${photoId}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`
        : `https://picsum.photos/seed/${encodeURIComponent(itemName)}/600/400`;

      products.push({
        name: itemName,
        description: `${itemName} — a top pick in our ${cat.name} collection, chosen for quality, durability, and everyday value.`,
        price,
        category: cat.name,
        stock,
        imageUrl,
        ratings,
        numReviews
      });
    });
  });

  return products;
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shopnest.com',
      password: hashedPassword,
      role: 'admin'
    });

    const products = generateProducts();

    await Product.insertMany(products);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();
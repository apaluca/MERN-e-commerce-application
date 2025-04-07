const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Cart = require("./models/Cart");

// Sample users data
const users = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    active: true,
    createdAt: new Date(),
  },
  {
    username: "user",
    email: "user@example.com",
    password: "password123",
    role: "user",
    active: true,
    createdAt: new Date(),
  },
];

// Sample product categories
const categories = ["electronics", "clothing", "home", "books"];

// Sample product data
const products = [
  {
    name: "Smartphone X",
    description:
      "Latest smartphone with high-end features including 6.5-inch display, 128GB storage, and 48MP camera.",
    price: 899.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Smartphone",
    category: "electronics",
    stock: 25,
  },
  {
    name: "Laptop Pro",
    description:
      "Powerful laptop with 16GB RAM, 512GB SSD, and dedicated graphics card perfect for professionals.",
    price: 1299.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Laptop",
    category: "electronics",
    stock: 15,
  },
  {
    name: "Wireless Headphones",
    description:
      "Noise-cancelling wireless headphones with 30-hour battery life and premium sound quality.",
    price: 249.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Headphones",
    category: "electronics",
    stock: 40,
  },
  {
    name: "Men's Cotton T-Shirt",
    description:
      "Comfortable 100% cotton t-shirt available in multiple colors and sizes.",
    price: 19.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=T-Shirt",
    category: "clothing",
    stock: 100,
  },
  {
    name: "Women's Jeans",
    description:
      "Classic fit women's denim jeans with stretch material for extra comfort.",
    price: 49.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Jeans",
    category: "clothing",
    stock: 75,
  },
  {
    name: "Running Shoes",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
    price: 89.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Shoes",
    category: "clothing",
    stock: 50,
  },
  {
    name: "Coffee Table",
    description: "Modern coffee table with tempered glass top and wooden legs.",
    price: 199.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Table",
    category: "home",
    stock: 10,
  },
  {
    name: "Bedding Set",
    description:
      "Luxury bedding set including duvet cover, sheet, and pillow cases.",
    price: 79.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Bedding",
    category: "home",
    stock: 30,
  },
  {
    name: "Kitchen Blender",
    description:
      "High-powered blender for smoothies, soups, and more with multiple speed settings.",
    price: 69.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Blender",
    category: "home",
    stock: 20,
  },
  {
    name: "Bestselling Novel",
    description:
      "The latest bestselling fiction novel that's taking the world by storm.",
    price: 15.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Novel",
    category: "books",
    stock: 60,
  },
  {
    name: "Cookbook",
    description:
      "Collection of 100 easy recipes for beginners and experienced cooks alike.",
    price: 24.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Cookbook",
    category: "books",
    stock: 35,
  },
  {
    name: "Self-Help Book",
    description:
      "Guide to personal development and achieving your goals with practical exercises.",
    price: 18.99,
    imageUrl: "https://dummyimage.com/400x300/e0e0e0/333333&text=Self-Help",
    category: "books",
    stock: 45,
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Generate a random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(
    thirtyDaysAgo.getTime() +
      Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );
};

// Seed database function
const seedDatabase = async (clearDB = false) => {
  try {
    // Connect to the database
    await connectDB();

    if (clearDB) {
      // Clear existing data
      console.log("Clearing existing data...");
      await User.deleteMany({});
      await Product.deleteMany({});
      await Order.deleteMany({});
      await Cart.deleteMany({});
      console.log("Database cleared.");
    }

    console.log("Starting database seeding...");

    // Seed users - IMPORTANT: Manually hash passwords instead of relying on pre-save hook
    console.log("Seeding users...");
    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        // Manually hash the password with 10 salt rounds
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create user with pre-hashed password and explicitly set fields
        const user = await User.create({
          ...userData,
          password: hashedPassword,
          active: true, // Explicitly set active status
          createdAt: new Date(), // Explicitly set creation date
        });

        createdUsers.push(user);
        console.log(`User created: ${user.username} (${user.role})`);
        console.log(`  - Active: ${user.active}`);
        console.log(`  - Created At: ${user.createdAt}`);
      } else {
        // For existing users, ensure password is correctly hashed and update fields
        let needsUpdate = false;

        // Test if the password is already hashed by attempting to compare
        try {
          const isMatch = await bcrypt.compare(
            userData.password,
            existingUser.password
          );
          if (!isMatch) {
            needsUpdate = true;
          }
        } catch (error) {
          // If error during comparison, the password is likely not properly hashed
          needsUpdate = true;
        }

        // Check if active status and createdAt needs update
        if (existingUser.active !== true || !existingUser.createdAt) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          // Update with properly hashed password and other fields
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(userData.password, salt);

          existingUser.password = hashedPassword;
          existingUser.active = true; // Ensure active is true

          // Set createdAt if it doesn't exist
          if (!existingUser.createdAt) {
            existingUser.createdAt = new Date();
          }

          await existingUser.save();
          console.log(`User updated: ${existingUser.username}`);
          console.log(`  - Active: ${existingUser.active}`);
          console.log(`  - Created At: ${existingUser.createdAt}`);
        } else {
          console.log(
            `User already exists with correct settings: ${existingUser.username} (${existingUser.role})`
          );
          console.log(`  - Active: ${existingUser.active}`);
          console.log(`  - Created At: ${existingUser.createdAt}`);
        }

        createdUsers.push(existingUser);
      }

      // Verify the password hash works
      const user = await User.findOne({ email: userData.email });
      const passwordValid = await bcrypt.compare(
        userData.password,
        user.password
      );
      if (passwordValid) {
        console.log(`✓ Password verification successful for ${user.username}`);
      } else {
        console.error(`✗ Password verification FAILED for ${user.username}`);
      }
    }

    // Seed products
    console.log("Seeding products...");
    const createdProducts = [];
    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });

      if (!existingProduct) {
        const product = await Product.create(productData);
        createdProducts.push(product);
        console.log(`Product created: ${product.name}`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`Product already exists: ${existingProduct.name}`);
      }
    }

    // Seed orders (for regular user)
    const regularUser = createdUsers.find((user) => user.role === "user");

    // Only create orders if they don't exist for this user already
    const existingOrders = await Order.countDocuments({
      user: regularUser._id,
    });

    if (existingOrders === 0) {
      console.log("Seeding orders...");

      // Create 3 sample orders
      for (let i = 0; i < 3; i++) {
        // Randomly select 1-3 products
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const orderProducts = [];
        const usedProductIds = new Set();

        for (let j = 0; j < numProducts; j++) {
          let randomProduct;

          // Ensure we don't add the same product twice
          do {
            randomProduct =
              createdProducts[
                Math.floor(Math.random() * createdProducts.length)
              ];
          } while (usedProductIds.has(randomProduct._id.toString()));

          usedProductIds.add(randomProduct._id.toString());

          // Random quantity between 1 and 3
          const quantity = Math.floor(Math.random() * 3) + 1;

          orderProducts.push({
            product: randomProduct._id,
            name: randomProduct.name,
            quantity: quantity,
            price: randomProduct.price,
          });
        }

        // Calculate total
        const total = orderProducts.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Random status
        const statuses = ["pending", "processing", "shipped", "delivered"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        // Create the order
        const order = await Order.create({
          user: regularUser._id,
          items: orderProducts,
          total: total,
          shippingAddress: {
            street: "123 Main St",
            city: "Anytown",
            postalCode: "12345",
            country: "Country",
          },
          paymentMethod: "credit_card",
          status: status,
          createdAt: getRandomDate(),
        });

        console.log(`Order created: ${order._id} (${status})`);
      }
    } else {
      console.log(
        `${existingOrders} orders already exist for user ${regularUser.username}.`
      );
    }

    console.log("Database seeding completed!");

    // Print login credentials for quick testing
    console.log("\n----- TEST ACCOUNTS -----");
    for (const user of users) {
      console.log(
        `${user.role.toUpperCase()}: Email: ${user.email}, Password: ${
          user.password
        }`
      );
    }
    console.log("-----------------------\n");

    return true;
  } catch (err) {
    console.error("Error seeding database:", err);
    return false;
  } finally {
    // Disconnect from database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
};

// Check for command line arguments
if (require.main === module) {
  // This script is being run directly
  const clearDB = process.argv.includes("--clear");

  seedDatabase(clearDB)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  // This script is being required/imported
  module.exports = seedDatabase;
}

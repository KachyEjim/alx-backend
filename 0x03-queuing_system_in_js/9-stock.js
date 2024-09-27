import express from 'express';
import redis from 'redis';
import { promisify } from 'util';

const app = express();
const port = 1245;

// Define the products array
const listProducts = [
  { id: 1, name: 'Suitcase 250', price: 50, stock: 4 },
  { id: 2, name: 'Suitcase 450', price: 100, stock: 10 },
  { id: 3, name: 'Suitcase 650', price: 350, stock: 2 },
  { id: 4, name: 'Suitcase 1050', price: 550, stock: 5 }
];

// Create a Redis client and promisify it
const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Function to get item by ID
const getItemById = (id) => {
  return listProducts.find(item => item.id === id);
};

// Route to get all products
app.get('/list_products', (req, res) => {
  const products = listProducts.map(({ id, name, price, stock }) => ({
    itemId: id,
    itemName: name,
    price,
    initialAvailableQuantity: stock
  }));
  res.json(products);
});

// Route to get product by ID
app.get('/list_products/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const id = parseInt(itemId, 10);
  const product = getItemById(id);

  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(id);
  res.json({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    initialAvailableQuantity: product.stock,
    currentQuantity: product.stock - reservedStock
  });
});

// Route to reserve product
app.get('/reserve_product/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const id = parseInt(itemId, 10);
  const product = getItemById(id);

  if (!product) {
    return res.json({ status: 'Product not found' });
  }

  const reservedStock = await getCurrentReservedStockById(id);
  if (product.stock - reservedStock <= 0) {
    return res.json({
      status: 'Not enough stock available',
      itemId: id
    });
  }

  await reserveStockById(id, reservedStock + 1);
  res.json({
    status: 'Reservation confirmed',
    itemId: id
  });
});

// Function to reserve stock by ID
const reserveStockById = async (itemId, stock) => {
  await setAsync(`item.${itemId}`, stock);
};

// Function to get current reserved stock by ID
const getCurrentReservedStockById = async (itemId) => {
  const stock = await getAsync(`item.${itemId}`);
  return stock ? parseInt(stock, 10) : 0;
};

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

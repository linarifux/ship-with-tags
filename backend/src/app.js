import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import shipmentRoutes from './routes/shipment.routes.js';
import productRoutes from './routes/product.routes.js';
import tagRoutes from './routes/tag.routes.js';

// Import Middleware
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173']
}));

app.use(express.json());

// Main Route Entry Point
app.use('/api/shipments', shipmentRoutes);

app.use('/api/products', productRoutes);

app.use('/api/tags', tagRoutes);

// Health check for the dashboard
app.get('/health', (req, res) => res.status(200).send('API is healthy'));

// Global Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
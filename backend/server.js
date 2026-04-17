const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
require('./src/jobs/overdue.job');
require('./src/jobs/reservation.job');

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',       require('./src/routes/auth.routes'));
app.use('/api/books',      require('./src/routes/book.routes'));
app.use('/api/categories', require('./src/routes/category.routes'));
app.use('/api/borrows',        require('./src/routes/borrow.routes'));
app.use('/api/admin',          require('./src/routes/admin.routes'));
app.use('/api/notifications',  require('./src/routes/notification.routes'));
app.use('/api/reservations',   require('./src/routes/reservation.routes'));

app.get('/', (req, res) => res.json({ message: 'Library API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
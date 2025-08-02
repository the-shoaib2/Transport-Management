
# Transport Management System

A comprehensive solution for managing transport operations, including bus management, route planning, student management, payment tracking, and real-time location monitoring.

<!-- ![Dashboard Screenshot](https://via.placeholder.com/800x400?text=Transport+Management+Dashboard) -->

## 🚀 Features

- **User Authentication & Authorization**
  - Secure login system with role-based access control
  - Password encryption and token-based authentication

- **Bus Management**
  - Add, update, and manage bus information
  - Track bus status (active, maintenance, inactive)
  - Schedule maintenance and track history

- **Route Management**
  - Create and manage transport routes
  - Set start and end locations with distance and time estimates
  - Monitor route performance and usage

- **Schedule Management**
  - Create daily, weekly, and monthly bus schedules
  - Assign buses to specific routes with departure and arrival times
  - Manage schedule changes and cancellations

- **Student Management**
  - Register and manage student information
  - Track student status and payment history
  - Manage student-route assignments

- **Payment System**
  - Record and track student payments
  - Support multiple payment methods and payment types
  - Generate payment reports and track revenue

- **Dashboard & Analytics**
  - Real-time monitoring of all transport operations
  - Visual analytics of routes, schedules, and payments
  - System performance metrics and reports

- **Location Tracking**
  - Monitor bus locations in real-time
  - Track route history and deviations
  - Calculate estimated arrival times

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling and UI components
- **React Router** - Navigation and routing
- **Axios** - API communication
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **JSON Web Tokens** - Authentication
- **Bcrypt** - Password encryption

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.x or later)
- npm (v6.x or later)
- MySQL (v8.x or later)

## 🔧 Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/the-shoaib2/Transport-Management.git
cd transport-management-system
```

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and other configurations.

5. Initialize the database:
   ```bash
   node init-db.js
   ```

6. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🚀 Deployment

### Backend Deployment

1. Set up your production environment
2. Configure environment variables for production
3. Build the backend:
   ```bash
   npm run build
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the frontend for production:
   ```bash
   npm run build
   ```
2. Deploy the contents of the `dist` directory to your static file hosting service

## 🗂️ Project Structure

```
transport-management-system/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Application pages
│   │   │   └── admin/       # Admin dashboard pages
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx          # Main app component
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Frontend dependencies
│
├── server/                  # Node.js backend
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── database/            # Database setup and migrations
│   │   └── migrations/      # SQL migration scripts
│   ├── scripts/             # Utility scripts
│   ├── constants.js         # Application constants
│   ├── init-db.js           # Database initialization
│   ├── index.js             # Main server entry point
│   └── package.json         # Backend dependencies
│
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## 📝 API Documentation

### Authentication API

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/admin` - Get admin information

### Admin API

- **Bus Management**
  - `GET /admin/buses` - Get all buses
  - `POST /admin/buses` - Create a new bus
  - `GET /admin/buses/:busId` - Get bus details
  - `PUT /admin/buses/:busId` - Update bus information
  - `DELETE /admin/buses/:busId` - Delete a bus

- **Route Management**
  - `GET /admin/routes` - Get all routes
  - `POST /admin/routes` - Create a new route
  - `GET /admin/routes/:routeId` - Get route details
  - `PUT /admin/routes/:routeId` - Update route information
  - `DELETE /admin/routes/:routeId` - Delete a route

- **Schedule Management**
  - `GET /admin/schedules` - Get all schedules
  - `POST /admin/schedules` - Create a new schedule
  - `GET /admin/schedules/:scheduleId` - Get schedule details
  - `PUT /admin/schedules/:scheduleId` - Update schedule information
  - `DELETE /admin/schedules/:scheduleId` - Delete a schedule

- **Student Management**
  - `GET /admin/students` - Get all students
  - `POST /admin/students` - Create a new student
  - `GET /admin/students/:studentId` - Get student details
  - `PUT /admin/students/:studentId` - Update student information
  - `DELETE /admin/students/:studentId` - Delete a student

- **Payment Management**
  - `GET /admin/payments` - Get all payments
  - `POST /admin/payments` - Create a new payment
  - `GET /admin/payments/:paymentId` - Get payment details
  - `PUT /admin/payments/:paymentId` - Update payment information
  - `DELETE /admin/payments/:paymentId` - Delete a payment

- **Dashboard Statistics**
  - `GET /admin/dashboard/stats` - Get dashboard statistics
  - `GET /admin/dashboard/revenue` - Get revenue statistics
  - `GET /admin/dashboard/maintenance` - Get maintenance statistics

## 🔒 Environment Variables

### Backend `.env` Variables

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=transport_management

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
```

### Frontend `.env` Variables

```
VITE_API_URL=http://localhost:5000
```

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

Project Link: [https://github.com/the-shoaib2/Transport-Management](https://github.com/the-shoaib2/Transport-Management)

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/) 
=======
Hello
>>>>>>> 8ff5da50d8173a4e01734141880850b4fc2469e1

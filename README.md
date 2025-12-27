# MyFields

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A comprehensive web application for managing olive fields, tracking agricultural activities, and visualizing field data on interactive maps.

## 🌟 What the Project Does

MyFields is a full-stack web application designed for olive farmers and agricultural managers. It provides tools to:

- Manage user accounts with secure authentication
- Create and organize olive field locations
- Track various agricultural activities (oil production, fertilization, pruning, spraying)
- Upload and store photos/videos for each activity
- Visualize fields on interactive maps using GPS coordinates
- Monitor field performance over time with detailed year-by-year tracking

## 🚀 Why the Project is Useful

- **Centralized Management**: Keep all field data in one place with easy access
- **Activity Tracking**: Record and monitor farming activities with media attachments
- **Visual Mapping**: See your fields geographically with Leaflet-powered maps
- **Data-Driven Decisions**: Analyze production trends and optimize farming practices
- **Mobile-Friendly**: Capture photos directly from mobile devices using webcam integration

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for media storage
- Security middleware (Helmet, CORS, Rate Limiting)

### Frontend
- **React** with React Router for navigation
- **Leaflet** for interactive maps
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Webcam** for photo capture

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local installation or cloud service like MongoDB Atlas)
- A Cloudinary account for media storage

## 🚀 Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd MyFields
   ```

2. **Set up the backend:**
   ```bash
   cd olive-backend
   npm install
   ```

3. **Set up the frontend:**
   ```bash
   cd ../olive-frontend
   npm install
   ```

### Configuration

1. **Backend Environment Variables:**
   Create a `.env` file in the `olive-backend` directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/myfields
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

2. **Frontend Configuration:**
   The frontend is configured to connect to `http://localhost:5000` by default. Update `src/services/api.js` if your backend runs on a different port.

### Running the Application

1. **Start the backend:**
   ```bash
   cd olive-backend
   npm run dev
   ```
   The backend will run on http://localhost:5000

2. **Start the frontend:**
   ```bash
   cd olive-frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

3. **Access the application:**
   Open your browser and navigate to http://localhost:3000

## 📖 Usage

### User Registration and Login
- Register a new account or log in with existing credentials
- Secure JWT-based authentication protects your data

### Managing Fields
- Add new olive fields with GPS coordinates
- View all your fields on the dashboard
- Edit field details and track activities by year

### Activity Tracking
- Record oil production with quantities and quality notes
- Log fertilization, pruning, and spraying activities
- Upload photos/videos for each activity using the camera or file upload

### Map Visualization
- View your fields on an interactive map
- Use drawing tools to mark field boundaries
- Navigate and zoom to explore your agricultural areas

## 🔗 API Endpoints

The backend provides RESTful API endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /fields` - Get all user fields
- `POST /fields` - Create new field
- `PUT /fields/:id` - Update field
- `DELETE /fields/:id` - Delete field
- `POST /upload` - Upload media files

For detailed API documentation, see the backend code in `olive-backend/src/routes/`.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style guidelines


## 👥 Maintainers

- **Your Name** - [gnnsstavrou81@gmail.com]

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

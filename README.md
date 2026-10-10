# Student Project Showcase

Student Project Showcase is a web application where students can publish and share their academic projects. It allows students to explore projects created by others, view project details, like projects, and interact through comments.

The project is built using React.js, Node.js, Express.js, and MongoDB Atlas.

## Features

- **User Authentication:** Sign up and log in securely.
- **User Profiles:** View student details, including name, roll number, and email.
- **Publish Projects:** Share projects with a title, description, technologies used, GitHub URL, and optional live demo URL.
- **Project Cover Image:** Upload a cover image for each project.
- **Project Feed:** Browse projects published by students.
- **Project Details:** View project information, links, likes, and comments.
- **Likes:** Like and unlike projects, with likes stored in the database.
- **Comments:** Add comments to projects.
- **Delete Projects:** Users can delete their own projects.

## Technologies Used

### Frontend
- React.js
- CSS
- JavaScript
- Fetch API

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- bcrypt.js

### Database and Image Storage
- MongoDB Atlas — stores user information, projects, likes, and comments.
- Cloudinary — stores project cover images.

## Project Structure

```text
student-project-showcase/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

*Note: The folder structure above is an example. Adjust it to match your actual project.*

## Prerequisites

Make sure you have the following installed or configured:

- Node.js and npm
- A MongoDB Atlas account and database
- A Cloudinary account for image storage

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd student-project-showcase
```

### 2. Set Up the Backend

Navigate to the server folder:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder and add your configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace the placeholder values with your own credentials. Keep your `.env` file private and never upload it to GitHub.

Start the backend server:

```bash
npm start
```

If your project does not have a start script configured, use:

```bash
node server.js
```

### 3. Set Up the Frontend

Open a new terminal and navigate to the frontend folder:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

## How It Works

1. Students create an account using their details.
2. Registered students log in to access the application.
3. Students publish projects with descriptions, technologies, links, and a cover image.
4. Other students browse the project feed and open individual project pages.
5. Users can like projects and add comments.
6. Students can view profiles and delete their own published projects.

## Security

- Passwords are hashed before being stored in the database.
- JWT is used for authentication.
- Protected routes require a valid authentication token.
- Project ownership is checked before allowing project deletion.
- Environment variables are used to store sensitive credentials.

## Future Improvements

Possible improvements include search and filtering, pagination, and additional profile information.

## Author

Developed as a student project to practice full-stack web development using the MERN stack.

## License

This project was created for educational purposes.

# Chess Project 🎮


https://github.com/user-attachments/assets/e2e4315f-d585-4c7f-a3e6-f4edd772dede


A feature-rich online chess application that allows users to play with friends or opponents online. With real-time gameplay and a responsive UI.

## Features  
✅ Play online or invite friends for private matches.  
✅ Real-time gameplay with WebSocket connections.  
✅ Downloadable move history for review.  
✅ Automatic check and checkmate detection.  
✅ Pawn promotion handling.  
✅ Interactive and responsive UI using Tailwind CSS.  

---

## Getting Started  

Follow the instructions below to clone, build, and run the project.  

### Prerequisites  
Make sure you have the following installed:  
- **Node.js** (v14 or above)  
- **npm** (Node Package Manager)  

---

## Installation  

1. **Clone the Repository**  
   Open a terminal and run the following command to clone the project:  
   ```
   git clone https://github.com/Govindggupta/chess.git
   cd chess
   ```

2. **Install Dependencies and Build the Project**  
   In the root folder of the project, run the following command to install dependencies and build:  
   ```
   npm run build
   ```

---

## Running the Project  

The project consists of both a backend and frontend, which need to be started separately.  

### Step 1: Start Backend  

1. Open a terminal in the **root folder** of the project.  
2. Run the following command to start the backend:  
   ```
   npm run backend
   ```
   This will start the backend server and make the API available. Keep this terminal open.  

---

### Step 2: Start Frontend  

1. Open a **new terminal** in the **root folder**.  
2. Run the following command to start the frontend:  
   ```
   npm run frontend
   ```
   This will launch the React application for the frontend.  

> **Note:**  
> - Both commands (`npm run backend` and `npm run frontend`) must be run in the **root folder** of the project.  
> - Use separate terminals for running each command.  
> - Start the backend server first, then start the frontend server in a new terminal.  

---

## Project Structure  

```
root
├── backend/          # Backend logic and WebSocket implementation
├── frontend/         # Interactive UI built with React and Tailwind CSS
├── package.json      # Project dependencies and scripts
├── README.md         # Project documentation
└── ...
```

## Contributing  

We welcome contributions! Feel free to fork the repository and create a pull request.  
If you are contributing, please create a **separate branch** with the naming convention:  
`your-name/feature-name`.  

---

### Happy Chess Playing! 🏆

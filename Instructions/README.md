# Windlytics Quickstart Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10+
- pip (Python package manager)
- Node.js 18+ and npm 9+
- Git (for cloning and version control)

## 1. Backend Setup (Flask API)
Navigate to the backend directory:
```bash
cd Codebase/windlytics_backend
```
Create and activate a virtual environment:

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask backend:
```bash
python run.py
```
By default, the backend will start at:
```cpp
http://127.0.0.1:5000/
```

## 2. Frontend Setup (React App)
Navigate to the frontend directory:
```bash
cd ../windlytics_frontend
```

Install Node dependencies:
```bash
npm install
```

Start the React development server:
```bash
npm run dev
```

By default, Vite serves the frontend at:
```arduino
http://localhost:5173/
```

## 3. Verify Everything Works

Start the Flask backend (`python run.py`)
Start the React frontend (`npm run dev`)
Open your browser and visit:
```arduino
http://localhost:5173/
```
Place turbines on the map, select turbine models, and run a simulation — results should appear in a modal.
# My Flask App

This is a simple Flask application.

## Project Structure

```
my-flask-app
├── app
│   ├── __init__.py
│   ├── routes.py
│   ├── models.py
│   ├── forms.py
│   ├── templates
│   │   ├── base.html
│   │   └── index.html
│   └── static
│       ├── css
│       │   └── style.css
│       └── js
│           └── main.js
├── tests
│   └── test_app.py
├── requirements.txt
├── .flaskenv
├── run.py
└── README.md
```

## Setup Instructions

1. Create a new directory for your project:
   ```bash
   mkdir my-flask-app
   cd my-flask-app
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install Flask and other dependencies:
   ```bash
   pip install Flask
   ```

5. Create the project structure as specified:
   ```bash
   mkdir app tests
   mkdir app/templates app/static app/static/css app/static/js
   ```

6. Create the necessary files:
   ```bash
   touch app/__init__.py app/routes.py app/models.py app/forms.py
   touch tests/test_app.py requirements.txt .flaskenv run.py README.md
   ```

7. Add Flask to requirements.txt:
   ```bash
   echo "Flask" >> requirements.txt
   ```

Now your Flask project is set up with the specified structure.
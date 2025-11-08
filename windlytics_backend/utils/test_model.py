import joblib
import pandas as pd

# Load the saved model
loaded_model = joblib.load('./xgb_wind_model.pkl')

# Mock input data: longitude, latitude, month, day
mock_input = pd.DataFrame({
    'Longitude (x)': [-64.24],
    'Latitude (y)': [45.76],
    'month': [12],
    'day': [22]
})

# Run prediction
predicted_wind_speed = loaded_model.predict(mock_input)[0]
print(f'Predicted wind speed: {predicted_wind_speed:.2f} km/h')
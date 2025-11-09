from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Load model and scaler
loaded_model = joblib.load('./models/grib_wind_model.pkl')
loaded_scaler = joblib.load('./models/grib_wind_scaler.pkl')

app = Flask(__name__)
CORS(app)

# Predict wind speed in m/s
def predict_wind_speed(lat, lon, date_time):
    month = date_time.month
    day = date_time.day
    hour = date_time.hour
    day_of_year = date_time.timetuple().tm_yday
    day_of_week = date_time.weekday()

    features = pd.DataFrame({
        'longitude': [lon],
        'latitude': [lat],
        'month_sin': [np.sin(2 * np.pi * month / 12)],
        'month_cos': [np.cos(2 * np.pi * month / 12)],
        'day_sin': [np.sin(2 * np.pi * day / 31)],
        'day_cos': [np.cos(2 * np.pi * day / 31)],
        'hour_sin': [np.sin(2 * np.pi * hour / 24)],
        'hour_cos': [np.cos(2 * np.pi * hour / 24)],
        'doy_sin': [np.sin(2 * np.pi * day_of_year / 365)],
        'doy_cos': [np.cos(2 * np.pi * day_of_year / 365)],
        'dow_sin': [np.sin(2 * np.pi * day_of_week / 7)],
        'dow_cos': [np.cos(2 * np.pi * day_of_week / 7)]
    })

    features_scaled = loaded_scaler.transform(features)
    wind_speed_kmh = loaded_model.predict(features_scaled)[0]

    # Convert km/h → m/s
    return round(wind_speed_kmh * 1000 / 3600, 2)

# Wind turbine power curve
def wind_turbine_power_curve(wind_speed, cut_in, rated, cut_out, rated_power):
    if wind_speed < cut_in or wind_speed >= cut_out:
        return 0.0
    elif wind_speed < rated:
        normalized_speed = (wind_speed - cut_in) / (rated - cut_in)
        return rated_power * (normalized_speed ** 3 * (10 - 15 * normalized_speed + 6 * normalized_speed ** 2))
    else:
        normalized_speed = (wind_speed - rated) / (cut_out - rated)
        return rated_power * (1 - normalized_speed ** 3)

@app.route('/generated-energy', methods=["POST"])
def generated_energy():
    data = request.get_json()
    required_keys = ['cut_in', 'rated', 'cut_out', 'rated_power', 'latitude', 'longitude', 'start_date', 'end_date']
    if not data or any(key not in data for key in required_keys):
        return jsonify({"error": "Missing required fields"}), 400

    cut_in = data["cut_in"]
    rated = data["rated"]
    cut_out = data["cut_out"]
    rated_power = data["rated_power"]
    lat = data["latitude"]
    lon = data["longitude"]

    # Parse dates
    try:
        start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
        end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if end_date < start_date:
        return jsonify({"error": "End date cannot be before start date"}), 400

    total_energy = 0
    daily_energies = []

    num_days = (end_date - start_date).days + 1
    for i in range(num_days):
        current_date = start_date + timedelta(days=i)
        hourly_energies = []
        daily_total_energy = 0

        for hour in range(24):
            dt = datetime(current_date.year, current_date.month, current_date.day, hour)
            wind_speed = predict_wind_speed(lat, lon, dt)
            power = wind_turbine_power_curve(wind_speed, cut_in, rated, cut_out, rated_power)
            energy_MWh = power / 1000  # kW → MWh per hour

            hourly_energies.append({
                "hour": dt.strftime("%H:%M"),
                "predicted_wind_speed_m_s": wind_speed,
                "hourly_energy_MWh": round(energy_MWh, 4)
            })

            daily_total_energy += energy_MWh

        daily_energies.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "daily_total_energy_MWh": round(daily_total_energy, 4),
            "hourly_energies": hourly_energies
        })

        total_energy += daily_total_energy

    return jsonify({
        "total_energy_MWh": round(total_energy, 4),
        "daily_energies": daily_energies,
        "num_days": num_days
    })

if __name__ == "__main__":
    app.run(debug=True)

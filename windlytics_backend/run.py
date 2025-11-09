from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from datetime import datetime, timedelta

loaded_model = joblib.load('./models/xgb_wind_model.pkl')

app = Flask(__name__)
CORS(app)  

# Call the model
def predict_wind_speed(lat, log, month, day):
    model_input = pd.DataFrame({
        'Longitude (x)': [log],
        'Latitude (y)': [lat],
        'month': [month],
        'day': [day]
    })

    return loaded_model.predict(model_input)[0]

def wind_turbine_power_curve(wind_speed, cut_in, rated, cut_out, rated_power):
    if wind_speed < cut_in or wind_speed >= cut_out:
        return 0.0
    elif wind_speed < rated:
        # Normalized cubic increase for smooth steep rise
        normalized_speed = (wind_speed - cut_in) / (rated - cut_in)
        return rated_power * (normalized_speed ** 3 * (10 - 15 * normalized_speed + 6 * normalized_speed ** 2))
    else:
        # Dramatic drop after rated power
        normalized_speed = (wind_speed - rated) / (cut_out - rated)
        return rated_power * (1 - normalized_speed ** 3)  # Cubic decay

@app.route('/generated-energy', methods=["POST"])
def generated_energy():
    data = request.get_json()
    required_keys = ['cut_in', 'rated', 'cut_out', 'rated_power', 'latitude', 'longitude', 'days']
    if not data or any(key not in data for key in required_keys):
        return jsonify({"error": "One or more required items in request is missing"}), 400

    cut_in = data["cut_in"]
    rated = data["rated"]
    cut_out = data["cut_out"]
    rated_power = data["rated_power"]
    lat = data["latitude"]
    log = data["longitude"]
    num_days = data["days"]

    total_energy = 0
    daily_energies = []

    start_date = datetime.today()

    for i in range(num_days):
        current_date = start_date + timedelta(days=i)
        month = current_date.month
        day = current_date.day

        # Predict wind speed for this day
        wind_speed = float(predict_wind_speed(lat, log, month, day))

        print("predicted wind speed", wind_speed)

        # Calculate daily energy (MWh)
        daily_power = float(wind_turbine_power_curve(wind_speed, cut_in, rated, cut_out, rated_power))
        daily_energy = float(daily_power * 24 / 1000)  # MWh/day

        daily_energies.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "predicted_wind_speed": wind_speed,
            "daily_energy_MWh": daily_energy
        })

        total_energy += daily_energy

    return jsonify({
        "total_energy_MWh": float(total_energy),
        "daily_energies": daily_energies,
        "num_days": num_days
    })


if __name__ == '__main__':
    app.run(debug=True)

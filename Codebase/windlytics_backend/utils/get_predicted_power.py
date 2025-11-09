import math

def wind_turbine_power_curve(wind_speed, cut_in, rated, cut_out, rated_power):
    """
    Approximates a realistic wind turbine power curve:
    - Below cut-in: 0
    - Between cut-in and rated: steep cubic/sigmoid-like increase
    - Between rated and cut-out: constant rated power
    - Above cut-out: 0
    """
    if wind_speed < cut_in or wind_speed >= cut_out:
        return 0.0
    elif wind_speed < rated:
        # Normalized cubic increase for smooth steep rise
        normalized_speed = (wind_speed - cut_in) / (rated - cut_in)
        return rated_power * (normalized_speed ** 3 * (10 - 15 * normalized_speed + 6 * normalized_speed ** 2))
    else:
        return rated_power

def find_best_turbine_location(turbine_params, locations):
    """
    turbine_params: dict with keys 'cut_in', 'rated', 'cut_out', 'rated_power'
    locations: list of dicts with 'lat', 'lng', 'wind_speed'
    """
    best_location = None
    max_energy = 0

    for loc in locations:
        power = wind_turbine_power_curve(loc['wind_speed'],
                                   turbine_params['cut_in'],
                                   turbine_params['rated'],
                                   turbine_params['cut_out'],
                                   turbine_params['rated_power'])
        if power > max_energy:
            max_energy = power
            best_location = loc

    return best_location, max_energy

# Example usage:
if __name__ == "__main__":
    turbine_params = {
        'cut_in': 3.5,      # m/s
        'rated': 12.0,      # m/s
        'cut_out': 25.0,    # m/s
        'rated_power': 1500 # kW
    }

    # Example location list with predicted wind speeds
    locations = [
        {'lat': 34.05, 'lng': -118.25, 'wind_speed': 5.0},
        {'lat': 36.17, 'lng': -115.14, 'wind_speed': 7.5},
        {'lat': 40.71, 'lng': -74.00, 'wind_speed': 4.0},
        {'lat': 41.88, 'lng': -87.63, 'wind_speed': 6.2},
    ]

    best_loc, estimated_power = find_best_turbine_location(turbine_params, locations)
    print(f"Best location: {best_loc}")
    print(f"Estimated power output: {estimated_power:.2f} kW")

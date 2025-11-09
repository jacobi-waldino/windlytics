# ༄ Windlytics
## 2025 Cognizant BrAInstorm Challenge
Created by Jacob (Jake) Waldner, Xander Brown, and Shaun Ramsay, otherwise known as the Airbenders

Windlytics is an AI-Powered interactive web application for planning and simulating offshore wind turbine placements in Nova Scotia. Users can place turbines on a map, configure turbine models, run energy generation simulations, and visualize results through interactive charts.

## Technologies Used
### Front-end
| Library                                                          | Purpose                                   | License      |
| ---------------------------------------------------------------- | ----------------------------------------- | ------------ |
| [React](https://react.dev/)                                      | Component-based frontend framework        | MIT          |
| [Material UI (MUI)](https://mui.com/)                            | Accessible React component library        | MIT          |
| [Material UI Icons](https://mui.com/material-ui/material-icons/) | SVG icon set                              | MIT          |
| [React Leaflet](https://react-leaflet.js.org/)                   | React wrapper for Leaflet maps            | MIT          |
| [Leaflet](https://leafletjs.com/)                                | Map rendering engine                      | BSD 2-Clause |
| [Recharts](https://recharts.org/en-US/)                          | Charting library for energy visualization | MIT          |
| [date-fns](https://date-fns.org/)                                | Date utilities used by pickers            | MIT          |
| [MUI X Date Pickers](https://mui.com/x/react-date-pickers/)      | Accessible date range selectors           | MIT          |
### Back-end
| Library                                                           | Purpose                                               | License      |
| ----------------------------------------------------------------- | ----------------------------------------------------- | ------------ |
| [Flask](https://flask.palletsprojects.com/)                       | Web framework for serving the API                     | BSD 3-Clause |
| [Flask-CORS](https://flask-cors.readthedocs.io/)                  | Enables secure CORS support for frontend requests     | MIT          |
| [joblib](https://joblib.readthedocs.io/)                          | Loads serialized ML models and scalers                | BSD          |
| [pandas](https://pandas.pydata.org/)                              | Data manipulation for feature engineering and results | BSD 3-Clause |
| [NumPy](https://numpy.org/)                                       | Mathematical computation for feature transformations  | BSD          |
| [scikit-learn](https://scikit-learn.org/stable/) *(for training)* | Regression modeling and scaling                       | BSD 3-Clause |
| [datetime](https://docs.python.org/3/library/datetime.html)       | Standard library for time management                  | PSF License  |

AI Model was trained on '[*ERA5 hourly data on single levels from 1940 to present*](https://cds.climate.copernicus.eu/requests?tab=all)' dataset 
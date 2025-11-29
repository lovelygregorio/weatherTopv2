README.md

 SETU Web Development 2 - Assignment 

Author: Lovely Gregorio
Student: W20114829 
Github Url	   : https://github.com/lovelygregorio/weatherTopv2 
Deployed URL		: https://weathertopapp2.onrender.com 
	



Current Version: 0.0.2
Updated: Nov 2025

This version has been refactored to follow module lecture notes.

------------------------------------------
WeatherTopApp- Project README
-------------------------------------------
Project Overview

WeatherTops is a Node.js and express web application that allows users to create and manage personal weather stations, view real-time weather data, track 24 hours and access 5-day forecasts.

It integrates the OpenWeatherMap API to fetch live data such as temperature ,wind speed, pressure and conditions, and display them beautifully with weather icons and charts.

------------------------------------------------------------

Features:
- Add and Manage Weather Stations 
- Live Weather Data from OpenWeatherMap API
- Auto-Generate weather reports
- Simple 24 Hour (3hourly) Trend Graphs 
- 5 Day Extended Forecasts
- Station Map View using OpenStreetMap Integration  
- Min/Max Tracking for Temp, Wind & Pressure
- User Authentication & Session Management
- Responsive UI using Bulma CSS
Frontend - HTML5, Handlebars, Bulma CSS 
Backend- Node.js, Express.js, Express-Handlebars 
API - OpenWeatherMap API](https://openweathermap.org/api) 
Charts - Chart.js (48 3- Hourly Forecast) 


———————————————————————————————


Project Structure
WeatherTop/
│── controllers/ # route handlers and app logic
│── models/ # data models for stations & reports
│── public/ # static assets (CSS, images, icons)
│── utils/ # helper functions for weather formatting
│── views/ # handlebars templates
│── routes.js # app routes
│── server.js # express app entry point
│── .env # API keys & secrets
│── package.json # dependencies & scripts


———————————————————————————————
Project Release Overview:

Baseline - add and list stations, open details page 
Release 1 - manual weather reports, weather codes, deployed.
Release 2 - added wind direction, min/max data, signup/login.
Release 3 - time/date reports, station summary dashboard.
Release 4 - auto-generate reports, 48-hour graphs, 5-day forecasts.

------------------------------------------------------------

Getting Started with the WeatherTopApp

1. Clone the repository:
git clone 


2. Install dependencies
npm install

3. configure .env file
OPENWEATHER_KEY=Lovely_api_key

4. start the server
npm start

App will run on http://localhost:4000

API Integration

OpenWeatherMap API Endpoints:

- Current Weather:
 https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}

- Forecast (24 hour & 5 day):
 https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}

- Weather Icons:
 https://openweathermap.org/weather-conditions#Icon-list



--------------------
2025AUGUST v1
2025NOVEMBER v2

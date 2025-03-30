<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# AI Defense Hackathon

## A real-time air-to-sea multi-modal drone sentry system for anomaly detection, object detection, and anti-submarine defense and deterrence

### Description: A sentry system that dispatches air-to-sea drones from a central submarine/naval carrier or other military base to monitor submarine routes, undersea communication cables, mine detection, mitigate illegal immigration, etc using AI agents. The system sends information back to the home base in real-time and uses an agentic system to plan emergency responses, actions, and give recommendations to the relevant agencies (ICE, US Navy, etc).

### Features:

#### Underwater Drone Coverage (Anaïs)
- **Sonar Capabilities (Mode 1)**
  - Collection and analysis of underwater sound signatures
  - Patrol-based monitoring using sonar and hydrophones

#### Navigation & Threat Prediction Engine (Divyam)
- **Camera System (Mode 2)**
  - Real-time aerial path planning
  - Threat score-based navigation

#### Active Defense & Deterrence System
- **Communication System**
  - Military base alert system for anomaly and attack detection
  - Real-time threat reporting
- **Counter-measures**
  - Drone-based sonar jamming through destructive interference

#### Frontend Interface (Divyam)
- **Monitoring Dashboard**
  - SONAR data visualization
  - Camera feed integration
- **Technology Stack**
  - React
  - Tailwind CSS
  - Windsurf integration


### Team Members:
- Anaïs Killian
- Divyam Jindal
- Rut Mehta
- Aryan Ghariwala

### Project Structure:




## Setup


### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/anaiskillian/ai_defense.git
cd ai_defense
```

2. Set up Python virtual environment:
```bash
python3 -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
.\venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

The application should now be running on:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
>>>>>>> 8ff700e986d5f42f5d1e0b7435bee04c9a53175f

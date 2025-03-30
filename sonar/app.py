from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load and train the model
def train_model():
    df = pd.read_csv('sonar.csv', header=None)
    X = df.drop(60, axis=1)
    y = df[60].map({'R': 0, 'M': 1})
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Save the model
    joblib.dump(model, 'sonar_model.joblib')
    return model

# Load or train the model
if os.path.exists('sonar_model.joblib'):
    model = joblib.load('sonar_model.joblib')
else:
    model = train_model()

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        readings = data.get('readings', [])
        
        # Convert to correct format
        readings_array = np.array(readings)
        if readings_array.ndim == 1:
            readings_array = readings_array.reshape(1, -1)
            
        # Make prediction
        predictions = model.predict(readings_array)
        probabilities = model.predict_proba(readings_array)
        
        # Format results
        results = []
        for pred, prob in zip(predictions, probabilities):
            result = {
                'prediction': 'MINE' if pred == 1 else 'ROCK',
                'confidence': float(prob[pred] * 100)
            }
            results.append(result)
            
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001)

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def load_and_train_model():
    # Load the data
    df = pd.read_csv('sonar.csv', header=None)
    
    # Separate features and target
    X = df.drop(60, axis=1)  # All columns except the last one
    y = df[60].map({'R': 0, 'M': 1})  # Convert R/M to 0/1
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train the model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Test the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("\nModel Accuracy:", accuracy)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Rock', 'Mine']))
    
    return model, X.columns

def test_single_reading(model, columns, readings):
    # Convert readings to correct format
    df = pd.DataFrame([readings], columns=columns)
    prediction = model.predict(df)
    probabilities = model.predict_proba(df)
    
    result = "MINE" if prediction[0] == 1 else "ROCK"
    confidence = probabilities[0][prediction[0]] * 100
    
    return result, confidence

def get_sample_readings():
    # Load a few sample readings from the dataset
    df = pd.read_csv('sonar.csv', header=None)
    samples = df.sample(n=3)  # Get 3 random samples
    return samples.iloc[:, :-1].values.tolist(), samples.iloc[:, -1].values.tolist()

if __name__ == "__main__":
    print("Loading and training the sonar model...")
    model, columns = load_and_train_model()
    
    while True:
        print("\nSonar Testing Menu:")
        print("1. Test with random samples from dataset")
        print("2. Test with custom readings")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == "1":
            sample_readings, actual_classes = get_sample_readings()
            print("\nTesting with random samples from the dataset:")
            for i, (readings, actual) in enumerate(zip(sample_readings, actual_classes)):
                result, confidence = test_single_reading(model, columns, readings)
                print(f"\nSample {i+1}:")
                print(f"Actual: {actual}")
                print(f"Predicted: {result}")
                print(f"Confidence: {confidence:.2f}%")
        
        elif choice == "2":
            print("\nEnter 60 sonar frequency readings (comma-separated):")
            try:
                readings = [float(x.strip()) for x in input().split(",")]
                if len(readings) != 60:
                    print(f"Error: Expected 60 readings, got {len(readings)}")
                    continue
                    
                result, confidence = test_single_reading(model, columns, readings)
                print(f"\nPrediction: {result}")
                print(f"Confidence: {confidence:.2f}%")
            except ValueError:
                print("Error: Invalid input. Please enter numeric values separated by commas.")
        
        elif choice == "3":
            print("\nExiting...")
            break
        
        else:
            print("\nInvalid choice. Please try again.")

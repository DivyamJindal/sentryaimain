# Threat Response Planning System

This module is responsible for generating threat response plans based on detection data. It uses the Gemini AI model to analyze threats and create comprehensive response strategies.

## Features

- Threat data analysis
- Response plan generation
- Agency-specific recommendations
- Final response compilation

## Components

1. `threat_response_creation.py`: Main script containing the threat response workflow
2. `mock_detections.json`: Sample detection data for testing

## Setup

1. Create a `.env` file in the root directory
2. Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

## Usage

Run the main script:
```bash
python threat_response_creation.py
```

The script will:
1. Load threat data from mock_detections.json
2. Analyze the threat
3. Generate a response plan
4. Create agency recommendations
5. Compile a final response

## Output

The system generates a comprehensive response including:
- Threat analysis
- Response plan
- Agency recommendations
- Final response document

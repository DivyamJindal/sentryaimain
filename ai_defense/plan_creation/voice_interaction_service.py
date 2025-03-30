from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model for chat
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

def format_threat_context(threat_data):
    """Format threat data into a clear context string"""
    if not threat_data:
        return "No current threat data available."

    objects = threat_data.get('unique_objects', {})
    high_threats = [f"{count} {obj}" for obj, count in objects.items() 
                   if obj.lower() in ['mines', 'drone', 'boat']]
    medium_threats = [f"{count} {obj}" for obj, count in objects.items() 
                     if obj.lower() in ['truck', 'car', 'airplane', 'person']]
    
    context = []
    if high_threats:
        context.append(f"HIGH THREAT OBJECTS DETECTED: {', '.join(high_threats)}")
    if medium_threats:
        context.append(f"MEDIUM THREAT OBJECTS DETECTED: {', '.join(medium_threats)}")
    
    threat_level = "HIGH" if high_threats else "MEDIUM" if medium_threats else "LOW"
    context.append(f"Current Threat Level: {threat_level}")
    
    return "\n".join(context)

@app.route('/api/voice-chat', methods=['POST'])
def handle_voice_chat():
    try:
        data = request.json
        user_message = data.get('message')
        threat_data = data.get('threatData')

        if not user_message:
            return jsonify({'error': 'Missing user message'}), 400

        # Format the current threat context
        threat_context = format_threat_context(threat_data)

        # Add system context to the message
        prompt = f"""You are Sentral AI, an advanced defense system assistant. 
        Current situation:
        {threat_context}

        User query: {user_message}

        Respond in a clear, direct manner focusing on security implications and actionable recommendations. 
        Keep responses concise but informative."""

        # Get AI response
        response = chat.send_message(prompt)
        ai_response = response.text

        return jsonify({
            'success': True,
            'response': ai_response
        })

    except Exception as e:
        print(f"Error in voice chat: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002)

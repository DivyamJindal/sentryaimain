from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
import os
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Twilio configuration
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
client = Client(account_sid, auth_token)

# Store the latest emergency message
current_emergency_message = ""

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_call_script(emergency_message):
    """Generate a more natural speaking script from the emergency message"""
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"""
        Convert this emergency alert message into a clear, concise speaking script for an automated emergency call:
        {emergency_message}
        
        Make it sound natural and urgent but calm. Include only the most critical information.
        Format it as a simple paragraph that can be read aloud.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating script: {e}")
        return emergency_message

@app.route('/twiml', methods=['GET', 'POST'])
def get_twiml():
    """Return TwiML for the emergency call"""
    global current_emergency_message
    
    # Create TwiML response
    response = VoiceResponse()
    
    # Add a pause for the call to connect properly
    response.pause(length=1)
    
    # Add the emergency message
    response.say(current_emergency_message, voice='alice')
    
    # Return the TwiML
    return Response(str(response), mimetype='text/xml')

@app.route('/api/emergency-call', methods=['POST'])
def make_emergency_call():
    try:
        global current_emergency_message
        
        data = request.json
        emergency_message = data.get('message')
        recipient_number = data.get('recipientNumber')

        if not emergency_message or not recipient_number:
            return jsonify({'error': 'Missing required parameters'}), 400

        # Generate the call script
        current_emergency_message = generate_call_script(emergency_message)
        
        # Get the public URL for our TwiML endpoint
        # For testing, we'll use ngrok to expose our local server
        twiml_url = "https://1d6c-2600-1700-1870-6920-00-3.ngrok-free.app/twiml"

        # Make the call using our TwiML endpoint
        call = client.calls.create(
            url=twiml_url,
            to=recipient_number,
            from_=twilio_number
        )

        return jsonify({
            'success': True,
            'callSid': call.sid,
            'status': call.status,
            'message': current_emergency_message
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)

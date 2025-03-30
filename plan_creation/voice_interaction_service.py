from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import tempfile
import uuid
from dotenv import load_dotenv
from gemini_calls import gemini_client, transcribe

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Initialize the model for chat
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

# Initialize the Gemini client from the gemini_calls module
from google import genai as genai_client
client = genai_client.Client(api_key=os.environ.get("GEMINI_API_KEY"))

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

@app.route('/api/voice-upload', methods=['POST'])
def handle_voice_upload():
    try:
        # Check if threat data is included in the request
        threat_data = None
        if 'threatData' in request.form:
            import json
            threat_data = json.loads(request.form.get('threatData'))
        
        # Check if audio file is included in the request
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Create a temporary directory to store the audio file
        temp_dir = tempfile.mkdtemp()
        audio_filename = f"{uuid.uuid4()}.mp3"
        audio_path = os.path.join(temp_dir, audio_filename)
        
        print(f"Saving audio file to: {audio_path}")
        
        # Save the audio file
        audio_file.save(audio_path)
        
        # Verify the file exists and has content
        if not os.path.exists(audio_path) or os.path.getsize(audio_path) == 0:
            print(f"Error: File not saved or empty: {audio_path}")
            return jsonify({'error': 'Failed to save audio file'}), 500
        
        print(f"Audio file saved successfully. Size: {os.path.getsize(audio_path)} bytes")
        
        # Transcribe the audio using the gemini function
        transcription = transcribe(client, audio_path)
        
        print(f"Transcription result: '{transcription}'")
        
        if not transcription:
            return jsonify({'error': 'Failed to transcribe audio'}), 500
        
        # Format the current threat context
        threat_context = format_threat_context(threat_data)
        
        # Add system context to the message
        prompt = f"""You are Sentral AI, an advanced defense system assistant. 
        Current situation:
        {threat_context}

        User query: {transcription}

        Respond in a clear, direct manner focusing on security implications and actionable recommendations. 
        Keep responses concise but informative."""
        
        # Get AI response using gemini_client
        ai_response = gemini_client(client, prompt)
        
        # Clean up the temporary file
        try:
            os.remove(audio_path)
            os.rmdir(temp_dir)
            print("Temporary files cleaned up successfully")
        except Exception as e:
            print(f"Warning: Failed to clean up temporary files: {e}")
        
        return jsonify({
            'success': True,
            'transcription': transcription,
            'response': ai_response
        })
        
    except Exception as e:
        print(f"Error in voice upload: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)

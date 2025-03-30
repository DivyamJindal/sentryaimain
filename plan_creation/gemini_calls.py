import requests
import json
import os
import time
import argparse
from google import genai
from google.genai import types
from dotenv import load_dotenv  # Import dotenv
from typing import Dict, List, Any, ClassVar, Optional
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver


# Load environment variables early to configure the API key
load_dotenv()
# Configure the Gemini API key
try:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    print("Please ensure it is set in your .env file or environment.")
    exit(1) # Exit if the key is not found

def gemini_client(client, input_text):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[input_text],
        config=types.GenerateContentConfig(
            system_instruction="You are a strategic emergency response system. You are to respond with concise, accurate, precise, and actionable responses. These responses will be used to generate a response plan.",
            response_mime_type="text/plain"),
    )
    return response.text

def transcribe(client, audio_file_path):
    """
    Transcribe an audio file using Gemini's speech-to-text capabilities.
    
    Args:
        client: The Gemini API client
        audio_file_path: Path to the audio file to transcribe
        
    Returns:
        The transcribed text as a string
    """
    try:
        # Read the audio file
        with open(audio_file_path, "rb") as f:
            audio_data = f.read()
        
        # Create the audio part correctly using the Part class
        audio_part = types.Part(
            inline_data=types.Blob(
                mime_type="audio/mp3",
                data=audio_data
            )
        )
        
        # Generate content with the text prompt and audio part
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                "Please transcribe this audio recording accurately.",
                audio_part
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,
            ),
        )
        
        return response.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return ""

# State definition for the agentic framework
class ThreatResponseState(Dict[str, Any]):
    """State for the threat response agent."""
    
    # Define the expected keys in the state
    threat_data: Dict[str, Any]
    threat_analysis: Optional[str] = None
    response_plan: Optional[str] = None
    resources_needed: Optional[List[str]] = None
    final_response: Optional[str] = None

# Function to load threat data from JSON files
def load_threat_data(threat_file_path: str) -> Dict[str, Any]:
    """
    Load threat data from a JSON file.
    
    Args:
        threat_file_path: Path to the JSON file containing threat data
        
    Returns:
        Dictionary containing the threat data
    """
    try:
        with open(threat_file_path, 'r') as f:
            threat_data = json.load(f)
        return threat_data
    except Exception as e:
        print(f"Error loading threat data: {e}")
        return {}

# Agent nodes for the LangGraph

def analyze_threat(state: ThreatResponseState) -> ThreatResponseState:
    """
    Analyze the threat data and generate an initial analysis.
    
    Args:
        state: Current state containing threat data
        
    Returns:
        Updated state with threat analysis
    """
    threat = state["threat_data"]
    
    # Format the threat data into a descriptive prompt
    prompt = f"""
    Analyze the following threat detection and provide a concise threat assessment:
    
    Detected Object(s): {', '.join([obj['type'] for obj in threat['objects_detected']])}
    Threat Level: {threat['threat_level']}
    Location: Latitude {threat['coordinates']['latitude']}, Longitude {threat['coordinates']['longitude']}, Altitude {threat['coordinates']['altitude']}
    Conditions: {threat['environment_conditions']['time_of_day']} - {threat['environment_conditions']['weather']}
    Raw Description: {threat['raw_description']}
    
    Provide a threat analysis including potential intent, capabilities, and immediate concerns.
    """
    
    # Get response from Gemini
    analysis = gemini_client(client, prompt)
    
    # Update state
    state["threat_analysis"] = analysis
    return state

def generate_response_plan(state: ThreatResponseState) -> ThreatResponseState:
    """
    Generate a response plan based on the threat analysis.
    
    Args:
        state: Current state containing threat data and analysis
        
    Returns:
        Updated state with response plan
    """
    threat = state["threat_data"]
    analysis = state["threat_analysis"]
    
    prompt = f"""
    Based on the following threat information and analysis, create a detailed response plan:
    
    THREAT INFORMATION:
    Detected Object(s): {', '.join([obj['type'] for obj in threat['objects_detected']])}
    Threat Level: {threat['threat_level']}
    Location: Latitude {threat['coordinates']['latitude']}, Longitude {threat['coordinates']['longitude']}, Altitude {threat['coordinates']['altitude']}
    Conditions: {threat['environment_conditions']['time_of_day']} - {threat['environment_conditions']['weather']}
    
    THREAT ANALYSIS:
    {analysis}
    
    Provide a step-by-step response plan including immediate actions, personnel required, and containment strategies.
    """
    
    # Get response from Gemini
    response_plan = gemini_client(client, prompt)
    
    # Update state
    state["response_plan"] = response_plan
    return state

def identify_resources(state: ThreatResponseState) -> ThreatResponseState:
    """
    Identify the resources needed for the response plan.
    
    Args:
        state: Current state containing threat data, analysis, and response plan
        
    Returns:
        Updated state with resources needed
    """
    response_plan = state["response_plan"]
    
    prompt = f"""
    Based on the following response plan, identify and list all resources needed:
    
    RESPONSE PLAN:
    {response_plan}
    
    List all personnel, equipment, vehicles, and other resources needed to execute this plan.
    Format as a numbered list.
    """
    
    # Get response from Gemini
    resources = gemini_client(client, prompt)
    
    # Update state with resources as a list (assuming the model returns a numbered list)
    # We'll process the raw text into a list
    resources_list = [line.strip() for line in resources.split('\n') if line.strip()]
    state["resources_needed"] = resources_list
    return state

def finalize_response(state: ThreatResponseState) -> ThreatResponseState:
    """
    Generate the final response combining all previous steps.
    
    Args:
        state: Current state containing all previous outputs
        
    Returns:
        Updated state with final response
    """
    threat = state["threat_data"]
    analysis = state["threat_analysis"]
    response_plan = state["response_plan"]
    resources = state["resources_needed"]
    
    prompt = f"""
    Create a comprehensive threat response document with the following sections:
    
    THREAT INFORMATION:
    Detected Object(s): {', '.join([obj['type'] for obj in threat['objects_detected']])}
    Threat Level: {threat['threat_level']}
    Location: Latitude {threat['coordinates']['latitude']}, Longitude {threat['coordinates']['longitude']}, Altitude {threat['coordinates']['altitude']}
    Conditions: {threat['environment_conditions']['time_of_day']} - {threat['environment_conditions']['weather']}
    Raw Description: {threat['raw_description']}
    
    THREAT ANALYSIS:
    {analysis}
    
    RESPONSE PLAN:
    {response_plan}
    
    RESOURCES REQUIRED:
    {chr(10).join(resources)}
    
    Format this as a complete, professional security response document with clear section headings.
    """
    
    # Get response from Gemini
    final_response = gemini_client(client, prompt)
    
    # Update state
    state["final_response"] = final_response
    return state

# Create the agent workflow using LangGraph
def create_threat_response_agent():
    """
    Create and return the threat response agent workflow.
    
    Returns:
        A callable graph that can be executed with threat data
    """
    # Define the workflow
    workflow = StateGraph(ThreatResponseState)
    
    # Add nodes
    workflow.add_node("analyze_threat", analyze_threat)
    workflow.add_node("generate_response_plan", generate_response_plan)
    workflow.add_node("identify_resources", identify_resources)
    workflow.add_node("finalize_response", finalize_response)
    
    # Define edges (the flow)
    workflow.add_edge("analyze_threat", "generate_response_plan")
    workflow.add_edge("generate_response_plan", "identify_resources")
    workflow.add_edge("identify_resources", "finalize_response")
    
    # Set the entry point
    workflow.set_entry_point("analyze_threat")
    
    # Compile the workflow
    return workflow.compile()

def process_threat_file(threat_file_path, output_dir=None):
    """
    Process a single threat file and generate a response.
    
    Args:
        threat_file_path: Path to the JSON file containing threat data
        output_dir: Directory to save the output (defaults to None)
        
    Returns:
        The final response
    """
    # Load the threat data
    threat_data = load_threat_data(threat_file_path)
    
    # Create the agent
    agent = create_threat_response_agent()
    
    # For a list of threat detections, process each one individually
    responses = []
    
    # Process each threat
    if isinstance(threat_data, list):
        for i, threat in enumerate(threat_data):
            print(f"Processing threat {i+1}/{len(threat_data)}...")
            
            # Initialize the agent state
            state = {"threat_data": threat}
            
            # Run the agent
            final_state = agent.invoke(state)
            
            # Get the final response
            response = final_state["final_response"]
            responses.append(response)
            
            # Save the response to a file if output_dir is specified
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
                output_file = os.path.join(output_dir, f"response_{i+1}.txt")
                with open(output_file, 'w') as f:
                    f.write(response)
                print(f"Response saved to {output_file}")
    else:
        # If threat_data is a single threat (not a list)
        print("Processing single threat...")
        
        # Initialize the agent state
        state = {"threat_data": threat_data}
        
        # Run the agent
        final_state = agent.invoke(state)
        
        # Get the final response
        response = final_state["final_response"]
        responses.append(response)
        
        # Save the response to a file if output_dir is specified
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, "response.txt")
            with open(output_file, 'w') as f:
                f.write(response)
            print(f"Response saved to {output_file}")
    
    return responses

def process_all_threats(threats_dir, output_dir=None):
    """
    Process all JSON files in the threats directory.
    
    Args:
        threats_dir: Directory containing the threat JSON files
        output_dir: Directory to save the outputs (defaults to None)
    """
    # Get a list of all JSON files in the threats directory
    json_files = [os.path.join(threats_dir, f) for f in os.listdir(threats_dir) if f.endswith('.json')]
    
    print(f"Found {len(json_files)} threat files in {threats_dir}")
    
    # Process each file
    for json_file in json_files:
        print(f"\nProcessing {os.path.basename(json_file)}...")
        file_output_dir = os.path.join(output_dir, os.path.basename(json_file).split('.')[0]) if output_dir else None
        process_threat_file(json_file, file_output_dir)

def main():
    """
    Main function to run the threat response agent.
    """
    parser = argparse.ArgumentParser(description="Threat Response Agent")
    parser.add_argument("--threats-dir", default="plan_creation/threats", help="Directory containing threat JSON files")
    parser.add_argument("--output-dir", default="plan_creation/responses", help="Directory to save response outputs")
    parser.add_argument("--file", help="Process a specific threat file instead of the entire directory")
    
    args = parser.parse_args()
    
    # Set the base directory to the project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Resolve paths
    threats_dir = os.path.join(base_dir, args.threats_dir)
    output_dir = os.path.join(base_dir, args.output_dir) if args.output_dir else None
    
    # Check if the threats directory exists
    if not os.path.exists(threats_dir):
        print(f"Error: Threats directory {threats_dir} does not exist")
        exit(1)
    
    # Process a specific file or all files
    if args.file:
        file_path = os.path.join(threats_dir, args.file) if not os.path.isabs(args.file) else args.file
        if not os.path.exists(file_path):
            print(f"Error: File {file_path} does not exist")
            exit(1)
        process_threat_file(file_path, output_dir)
    else:
        process_all_threats(threats_dir, output_dir)

if __name__ == "__main__":
    main()

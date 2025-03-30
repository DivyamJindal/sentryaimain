import requests
import json
import os
import time
import argparse
from dotenv import load_dotenv  # Import dotenv
from typing import Dict, List, Any, ClassVar, Optional
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.llms.base import LLM
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver

# Define the initial state structure
class AgentState(dict):
    """State for the threat response agent"""
    threat_data: Dict[str, Any]
    analysis: Dict[str, Any] = None
    response_plan: Dict[str, Any] = None
    recommendations: Dict[str, Any] = None
    status: str = "initialized"

# Create a simple mock LLM for testing
class MockLLM(LLM):
    """Mock LLM that returns placeholder responses for fast testing"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    @property
    def _llm_type(self) -> str:
        return "mock-llm"
    
    def _call(self, prompt: str, stop=None, **kwargs) -> str:
        """Return a mock response based on the prompt type"""
        time.sleep(1)  # Add a small delay to simulate processing
        
        if "threat analysis system" in prompt.lower():
            return """
            Based on the detection data, this appears to be a surveillance drone flying at medium altitude (150m) during dusk hours in clear weather. 
            
            Type of threat: Unauthorized drone surveillance
            Intent: Likely intelligence gathering or area mapping
            Danger level: Medium
            Capabilities: Video/photo recording, possible radio signal interception
            Limitations: Limited flight time, vulnerable to signal jamming
            Strategic implications: Potential preparation for future operations or targeting of critical infrastructure
            """
        
        elif "response planning system" in prompt.lower():
            return """
            IMMEDIATE ACTIONS:
            1. Deploy counter-drone measures to track the device
            2. Activate electronic countermeasures to jam signals if necessary
            3. Alert nearby security units to maintain visual contact
            
            RESOURCES REQUIRED:
            - Signal intelligence unit
            - Counter-drone response team
            - Radar tracking system
            
            COMMUNICATION PROTOCOLS:
            - Maintain secure channel Alpha for all communications
            - Hourly situational updates to command
            - Alert civilian airspace control if drone moves toward populated areas
            
            CONTINGENCY MEASURES:
            - Prepare forced landing protocols if threat escalates
            - Ready physical interception units if drone approaches sensitive areas
            
            TIMELINE:
            - Immediate tracking and monitoring
            - Escalation decision within 15 minutes
            - Resolution within 60 minutes
            """
        
        elif "coordination system" in prompt.lower():
            return """
            NAVY COMMAND:
            - Maintain alert status for naval assets in the area
            - Prepare defensive countermeasures
            - Update intelligence assessment based on drone flight pattern
            
            COAST GUARD:
            - Patrol waterways surrounding the detection area
            - Coordinate with local maritime traffic
            - Ready response vessels for possible interception
            
            INTELLIGENCE SERVICES:
            - Analyze drone technical specifications based on flight characteristics
            - Cross-reference with known drone deployments in the region
            - Investigate potential operators based on capabilities
            
            LOCAL LAW ENFORCEMENT:
            - Secure perimeter of critical infrastructure in flight path
            - Prepare for public safety measures if drone moves toward populated areas
            - Coordinate with federal authorities on jurisdiction
            """
        
        else:
            return "Generated response for: " + prompt[:100] + "..."

# Define the nodes of our agentic system
def threat_analyzer(state: AgentState) -> AgentState:
    """Analyze the detected threat and its implications"""
    # Use the mock LLM for testing
    llm = MockLLM()
    
    # Define the threat analysis prompt
    analysis_template = """
    You are a naval defense threat analysis system. Analyze the following detection data
    and provide a comprehensive threat assessment:

    DETECTION DATA:
    {threat_data}

    Your task is to analyze this detection and assess:
    1. Type of threat and potential intent
    2. Level of danger (low, medium, high, critical)
    3. Possible capabilities and limitations
    4. Strategic implications

    THREAT ANALYSIS:
    """
    
    analysis_prompt = PromptTemplate(
        input_variables=["threat_data"],
        template=analysis_template
    )
    
    # Create and run the analysis chain using modern LangChain patterns
    chain = analysis_prompt | llm | StrOutputParser()
    
    # Use the new invoke method instead of run
    analysis_result = chain.invoke({
        "threat_data": json.dumps(state["threat_data"], indent=2)
    })
    
    # Update the state with the analysis
    state["analysis"] = {
        "assessment": analysis_result,
        "timestamp": time.time()
    }
    state["status"] = "analyzed"
    
    print("Analysis complete")
    return state

def response_planner(state: AgentState) -> AgentState:
    """Generate response plans based on the threat analysis"""
    llm = MockLLM()
    
    # Define the response planning prompt
    response_template = """
    You are a naval defense response planning system. Based on the following threat analysis,
    generate a comprehensive response plan:

    THREAT DATA:
    {threat_data}

    THREAT ANALYSIS:
    {analysis}

    Your task is to create a detailed response plan that includes:
    1. Immediate actions to address the threat
    2. Required resources and personnel
    3. Communication protocols
    4. Contingency measures
    5. Timeline for response

    RESPONSE PLAN:
    """
    
    response_prompt = PromptTemplate(
        input_variables=["threat_data", "analysis"],
        template=response_template
    )
    
    # Create and run the response chain using modern LangChain patterns
    chain = response_prompt | llm | StrOutputParser()
    
    # Use the new invoke method instead of run
    response_result = chain.invoke({
        "threat_data": json.dumps(state["threat_data"], indent=2),
        "analysis": state["analysis"]["assessment"]
    })
    
    # Update the state with the response plan
    state["response_plan"] = {
        "plan": response_result,
        "timestamp": time.time()
    }
    state["status"] = "planned"
    
    print("Response plan complete")
    return state

def agency_recommendations(state: AgentState) -> AgentState:
    """Generate agency-specific recommendations"""
    llm = MockLLM()
    
    # Define the agency recommendations prompt
    recommendations_template = """
    You are a naval defense coordination system. Based on the following threat analysis and response plan,
    provide specific recommendations for different agencies:

    THREAT DATA:
    {threat_data}

    THREAT ANALYSIS:
    {analysis}

    RESPONSE PLAN:
    {response_plan}

    Your task is to provide specific recommendations for the correct agency from the following agencies:
    1. Navy Command
    2. Coast Guard
    3. Local Law Enforcement
    4. Intelligence Services
    5. Civilian Authorities

    Format your response as specific actionable items for each agency. Limit the amount of agencies called. 

    AGENCY RECOMMENDATIONS:
    """
    
    recommendations_prompt = PromptTemplate(
        input_variables=["threat_data", "analysis", "response_plan"],
        template=recommendations_template
    )
    
    # Create and run the recommendations chain using modern LangChain patterns
    chain = recommendations_prompt | llm | StrOutputParser()
    
    # Use the new invoke method instead of run
    recommendations_result = chain.invoke({
        "threat_data": json.dumps(state["threat_data"], indent=2),
        "analysis": state["analysis"]["assessment"],
        "response_plan": state["response_plan"]["plan"]
    })
    
    # Parse recommendations for each agency
    recommendations = {
        "content": recommendations_result,
        "timestamp": time.time()
    }
    
    # Update the state with the recommendations
    state["recommendations"] = recommendations
    state["status"] = "complete"
    
    print("Agency recommendations complete")
    return state

# Define the agentic workflow
def build_agent_workflow():
    """Build and return the agent workflow graph"""
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("threat_analyzer", threat_analyzer)
    workflow.add_node("response_planner", response_planner) 
    workflow.add_node("agency_recommendations", agency_recommendations)
    
    # Define edges
    workflow.add_edge("threat_analyzer", "response_planner")
    workflow.add_edge("response_planner", "agency_recommendations")
    
    # Set entry point
    workflow.set_entry_point("threat_analyzer")
    
    # Compile the workflow
    return workflow.compile()

# Function to process a new threat detection
def process_threat_detection(detection_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process a detection and run it through the agent workflow"""
    # Initialize the workflow
    workflow = build_agent_workflow()
    
    # Create initial state
    initial_state = AgentState(
        threat_data=detection_data,
        status="initialized"
    )
    
    # Run the workflow
    final_state = workflow.invoke(initial_state)
    
    # Extract threat level from analysis
    analysis_text = final_state["analysis"]["assessment"].lower()
    if "critical" in analysis_text:
        threat_level = "severe"
    elif "high" in analysis_text:
        threat_level = "high"
    elif "medium" in analysis_text:
        threat_level = "medium"
    else:
        threat_level = "low"
    
    # Format the response in a clean JSON structure
    response = {
        "threat_level": threat_level,
        "detection": {
            "type": detection_data.get("type", "Unknown"),
            "timestamp": detection_data.get("timestamp", time.time()),
            "location": detection_data.get("location", {})
        },
        "analysis": {
            "description": final_state["analysis"]["assessment"].strip(),
            "timestamp": final_state["analysis"]["timestamp"]
        },
        "response_plan": {
            "steps": [step.strip() for step in final_state["response_plan"]["plan"].split("\n") if step.strip() and not step.strip().startswith("IMMEDIATE") and not step.strip().startswith("RESOURCES") and not step.strip().startswith("COMMUNICATION") and not step.strip().startswith("CONTINGENCY") and not step.strip().startswith("TIMELINE")],
            "timestamp": final_state["response_plan"]["timestamp"]
        },
        "agencies": {
            agency.strip(":\n "): [
                action.strip("- \n") 
                for action in section.split("-")[1:] 
                if action.strip()
            ]
            for agency, section in [
                part.split(":", 1) 
                for part in final_state["recommendations"]["content"].split("\n\n") 
                if ":" in part
            ]
        }
    }
    
    print(f"\nThreat Response Summary:")
    print(json.dumps(response, indent=2))
    return response

# Function to poll the detection service
def poll_detection_service(mock_mode: bool) -> List[Dict[str, Any]]:
    """Poll the detection service or load mock data."""
    if mock_mode:
        print("Running in mock mode. Loading data from mock_detections.json")
        try:
            with open("plan_creation/mock_detections.json", "r") as f:
                detections = json.load(f)
        except FileNotFoundError:
            print("Error: mock_detections.json not found")
            return []
        
        responses = []
        for detection in detections:
            print(f"Processing detection: {detection.get('type', 'Unknown')}")
            response = process_threat_detection(detection)
            responses.append(response)
            
        return responses
    else:
        # TODO: Implement real detection service polling
        pass

if __name__ == "__main__":
    load_dotenv()  # Load environment variables from .env file
    
    parser = argparse.ArgumentParser(description='Run the threat response agent')
    parser.add_argument('--mock', action='store_true', help='Run with mock data')
    args = parser.parse_args()
    
    print("Starting Threat Response Agent...")
    print("Polling for new detections...")
    
    # Poll for detections
    responses = poll_detection_service(args.mock)
    
    if not responses:
        print("No detections found.")

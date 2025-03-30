import os
import json
import time
from typing import Dict, Any, List, Optional

def analyze_threat_data(threat_data: Dict[str, Any]) -> str:
    """Analyze threat data and provide a manual assessment"""
    unique_objects = threat_data.get("unique_objects", {})
    video_info = threat_data.get("video_info", {})
    
    # Perform manual analysis based on object types and counts
    analysis = []
    
    # 1. THREAT IDENTIFICATION
    analysis.append("1. THREAT IDENTIFICATION:")
    total_objects = sum(unique_objects.values())
    
    # Classify objects by threat level
    high_threat = {"Mines", "Drone", "boat"}
    medium_threat = {"truck", "car", "airplane", "person"}
    low_threat = {"bird", "horse", "cow", "sheep", "rocks", "Fish and plants", "bicycle", "umbrella", "kite", "bus"}
    
    threat_levels = {
        "High": [],
        "Medium": [],
        "Low": []
    }
    
    for obj, count in unique_objects.items():
        if obj in high_threat:
            threat_levels["High"].append(f"{obj} (Count: {count})")
        elif obj in medium_threat:
            threat_levels["Medium"].append(f"{obj} (Count: {count})")
        else:
            threat_levels["Low"].append(f"{obj} (Count: {count})")
    
    for level, objects in threat_levels.items():
        if objects:
            analysis.append(f"- {level} Threat Objects: {', '.join(objects)}")
    
    # 2. RISK ASSESSMENT
    analysis.append("\n2. RISK ASSESSMENT:")
    
    # Calculate overall threat level
    if any(obj in high_threat for obj in unique_objects):
        analysis.append("- Overall Threat Level: HIGH")
        analysis.append("  * Presence of high-threat objects requires immediate attention")
    elif any(obj in medium_threat for obj in unique_objects):
        analysis.append("- Overall Threat Level: MEDIUM")
        analysis.append("  * Potential security concerns detected")
    else:
        analysis.append("- Overall Threat Level: LOW")
        analysis.append("  * No immediate threats detected")
    
    # Video context
    analysis.append(f"- Video Duration: {video_info.get('total_frames', 0) / video_info.get('fps', 1):.1f} seconds")
    analysis.append(f"- Resolution: {video_info.get('resolution', 'Unknown')}")
    
    # 3. RECOMMENDATIONS
    analysis.append("\n3. RECOMMENDATIONS:")
    if any(obj in high_threat for obj in unique_objects):
        analysis.extend([
            "- IMMEDIATE ACTIONS:",
            "  * Alert maritime security forces",
            "  * Deploy rapid response team",
            "  * Establish 1000m safety perimeter",
            "  * Initiate continuous monitoring"
        ])
    elif any(obj in medium_threat for obj in unique_objects):
        analysis.extend([
            "- ACTIONS REQUIRED:",
            "  * Increase surveillance",
            "  * Notify local authorities",
            "  * Maintain 500m observation zone",
            "  * Document all activities"
        ])
    else:
        analysis.extend([
            "- STANDARD PROCEDURES:",
            "  * Continue regular monitoring",
            "  * Log all observations",
            "  * Maintain normal security protocols"
        ])
    
    # 4. SPECIAL CONSIDERATIONS
    analysis.append("\n4. SPECIAL CONSIDERATIONS:")
    
    # Check for unusual combinations
    if "Mines" in unique_objects and "Drone" in unique_objects:
        analysis.append("- CRITICAL: Potential coordinated threat detected (Mine + Drone combination)")
    
    if "boat" in unique_objects and unique_objects.get("person", 0) > 10:
        analysis.append("- WARNING: Large number of personnel with watercraft - assess for suspicious activity")
    
    # Add temporal context
    total_frames = video_info.get("total_frames", 0)
    fps = video_info.get("fps", 0)
    if total_frames and fps:
        duration = total_frames / fps
        analysis.append(f"- Temporal Context: {duration:.1f} seconds of surveillance data")
        analysis.append(f"- Detection Rate: {total_objects/duration:.1f} objects per second average")
    
    return "\n".join(analysis)

def load_threat_data(threat_file_path: str) -> Dict[str, Any]:
    """Load threat data from a JSON file"""
    try:
        with open(threat_file_path, 'r') as f:
            threat_data = json.load(f)
        return threat_data
    except Exception as e:
        print(f"Error loading threat data: {e}")
        return {}

def process_json_file(json_path: str):
    """Process a single JSON file and save results to a txt file"""
    print(f"\nProcessing {json_path}...")
    
    # Load the threat data
    threat_data = load_threat_data(json_path)
    if not threat_data:
        print(f"Failed to load threat data from {json_path}")
        return
    
    # Analyze the threat
    analysis = analyze_threat_data(threat_data)
    
    # Create output filename
    base_name = os.path.splitext(os.path.basename(json_path))[0]
    output_dir = "analysis_results"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f"{base_name}_analysis.txt")
    
    # Save results to file
    with open(output_file, 'w') as f:
        f.write(f"THREAT ANALYSIS REPORT\n")
        f.write(f"Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Source file: {json_path}\n")
        f.write(f"{'='*80}\n\n")
        
        f.write("ORIGINAL DETECTION DATA:\n")
        f.write("-" * 40 + "\n")
        f.write(json.dumps(threat_data, indent=2))
        f.write("\n\n")
        
        f.write("THREAT ANALYSIS:\n")
        f.write("-" * 40 + "\n")
        f.write(analysis)
    
    print(f"Analysis saved to: {output_file}")

if __name__ == "__main__":
    # Get list of JSON files
    json_dir = "jsons"
    json_files = [f for f in os.listdir(json_dir) if f.endswith('.json')]
    
    # Process each file
    for json_file in sorted(json_files):
        json_path = os.path.join(json_dir, json_file)
        process_json_file(json_path)
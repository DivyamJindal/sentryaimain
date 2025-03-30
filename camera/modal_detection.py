import os
import modal
import numpy as np
import shutil
import base64
import subprocess
from collections import defaultdict
import json
import cv2
from ultralytics import YOLO
import supervision as sv

# Create base image with minimal dependencies
base_image = (
    modal.Image.debian_slim()
    .pip_install(
        "ultralytics",
        "supervision",
        "opencv-python-headless",
    )
    .apt_install(
        "ffmpeg",
        "libsm6",
        "libxext6",
        "libx264-dev",
        "x264",
        "libavcodec-extra",  # Additional codecs
        "libavformat-dev",
        "libavutil-dev",
        "libswscale-dev"
    )
)

# Create detection image with all dependencies
detection_image = (
    base_image
    .pip_install(
        "numpy",
        "ffmpeg-python"
    )
    .add_local_dir(os.path.join(os.getcwd(), 'test_videos'), remote_path="/root/test_videos")
)

# Create app for Modal
app = modal.App()

# Create a volume to store processed output
output_volume = modal.Volume.from_name("drone-detection-output", create_if_missing=True)

# Ensure test_videos directory exists
test_videos_dir = os.path.join(os.getcwd(), 'test_videos')
os.makedirs(test_videos_dir, exist_ok=True)

@app.function(
    image=detection_image,
    gpu="T4",
    volumes={"/root/processed_output": output_volume}
)
def detect_objects(video_path: str):
    """Process video with YOLOv8 model and track objects."""
    model = YOLO("yolov8x.pt")
    
    # Convert local path to container path
    container_video_path = os.path.join("/root/test_videos", os.path.basename(video_path))
    cap = cv2.VideoCapture(container_video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {container_video_path}")
        return None

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Processing video: {container_video_path}")
    print(f"Resolution: {frame_width}x{frame_height}, FPS: {fps}, Total Frames: {total_frames}")

    video_filename = os.path.basename(video_path)
    base_name = os.path.splitext(video_filename)[0]
    output_video_path = os.path.join("/root/processed_output", f"{base_name}_detected.mp4")
    json_output_path = os.path.join("/root/processed_output", f"{base_name}_detections.json")
    
    # Create a temporary directory for frames
    temp_dir = os.path.join("/root/processed_output", "temp_frames")
    os.makedirs(temp_dir, exist_ok=True)

    tracker = sv.ByteTrack()
    box_annotator = sv.BoxAnnotator()  # Use default parameters for now

    frame_count = 0
    unique_objects = defaultdict(int)
    
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            
            results = model(frame)[0]
            detections = sv.Detections.from_ultralytics(results)
            
            if len(detections) > 0:
                detections = tracker.update_with_detections(detections)
                
                # Count unique objects by class
                for class_id in detections.class_id:
                    class_name = results.names[class_id]
                    unique_objects[class_name] += 1
                
                # Create label array for detections
                labels = [
                    f"{results.names[class_id]}"
                    for class_id in detections.class_id
                ]
                
                frame = box_annotator.annotate(
                    scene=frame,
                    detections=detections
                )
                
            # Save frame as image
            frame_path = os.path.join(temp_dir, f"frame_{frame_count:04d}.jpg")
            cv2.imwrite(frame_path, frame)
            
            # Print progress every 30 frames (about once per second)
            if frame_count % 30 == 0:
                print(f"Processing frame {frame_count}/{total_frames}")
            
    except Exception as e:
        print(f"Error during video processing: {e}")
        cap.release()
        return None

    cap.release()

    # Use ffmpeg to create video from frames
    try:
        print("\nCreating video from frames...")
        # First create a temporary video with raw frames
        temp_video = os.path.join(temp_dir, 'temp_video.mp4')
        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-framerate', str(fps),
            '-i', os.path.join(temp_dir, 'frame_%04d.jpg'),
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-vf', f'fps={fps}',  # Ensure output framerate matches input
            temp_video
        ]
        result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)
        print("First pass complete")
        
        # Now create the final video with proper metadata
        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-i', temp_video,
            '-c', 'copy',
            '-movflags', '+faststart',
            '-map', '0:v',  # Only copy video stream
            output_video_path
        ]
        result = subprocess.run(ffmpeg_cmd, check=True, capture_output=True, text=True)
        print("Second pass complete")
        
        # Clean up temp directory
        import shutil
        shutil.rmtree(temp_dir)
        
        # Verify the output file exists and has content
        if os.path.exists(output_video_path) and os.path.getsize(output_video_path) > 0:
            print(f"Successfully created video at {output_video_path}")
            print(f"Video file size: {os.path.getsize(output_video_path)} bytes")
            
            # Verify video metadata
            probe_cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', output_video_path]
            try:
                duration = float(subprocess.run(probe_cmd, check=True, capture_output=True, text=True).stdout.strip())
                print(f"Video duration: {duration:.2f} seconds")
            except:
                print("Warning: Could not verify video duration")
        else:
            print(f"Error: Output video file is empty or missing")
            return None
            
    except subprocess.CalledProcessError as e:
        print(f"Error creating video: {e}")
        print(f"FFmpeg output: {e.stdout}")
        print(f"FFmpeg errors: {e.stderr}")
        return None

    print(f"\nProcessed {frame_count} frames")
    print("\nUnique Object Summary:")
    for obj, count in unique_objects.items():
        print(f"{obj}: {count} instances")

    detection_summary = {
        "video_info": {
            "filename": video_filename,
            "resolution": f"{frame_width}x{frame_height}",
            "fps": fps,
            "total_frames": total_frames,
            "processed_frames": frame_count
        },
        "unique_objects": dict(unique_objects)
    }

    with open(json_output_path, 'w') as f:
        json.dump(detection_summary, f, indent=2)

    print("\nProcessing complete!")
    print(f"Output video saved to: {output_video_path}")
    print(f"Detection summary saved to: {json_output_path}")

    return detection_summary

@app.function(image=base_image, volumes={"/root/processed_output": output_volume})
def copy_output_to_local():
    # Get all files in the output directory
    output_dir = "/root/processed_output"
    files = []
    for file_name in os.listdir(output_dir):
        file_path = os.path.join(output_dir, file_name)
        if os.path.isfile(file_path):  # Only include files, not directories
            files.append(file_path)
    
    print(f"Found {len(files)} files in remote directory:")
    for file_path in files:
        print(f"- {os.path.basename(file_path)}")

    # Read all files
    file_contents = {}
    for file_path in files:
        print(f"Reading {file_path}")
        with open(file_path, 'rb') as f:
            content = f.read()
            print(f"Read {len(content)} bytes from {os.path.basename(file_path)}")
            file_contents[os.path.basename(file_path)] = content

    return file_contents

@app.local_entrypoint()
def main():
    """Main function to run the object detection pipeline."""
    video_dir = os.path.join(os.getcwd(), 'test_videos')
    video_files = [f for f in os.listdir(video_dir) if f.endswith(('.mp4', '.avi', '.mov'))]
    
    if not video_files:
        print("No video files found in test_videos directory.")
        return
    
    print("Found", len(video_files), "videos:")
    for i, video in enumerate(video_files, 1):
        print(f"{i}. {video}")
    
    print("\nProcessing first video:", video_files[0])
    
    processed_dir = os.path.join(os.getcwd(), "processed_output")
    os.makedirs(processed_dir, exist_ok=True)
    
    # Use full path when calling detect_objects
    video_path = os.path.join(video_dir, video_files[0])
    results = detect_objects.remote(video_path)
    
    if results and 'unique_objects' in results:
        print("\nUnique Object Summary:")
        for obj, count in results['unique_objects'].items():
            print(f"{obj}: {count} instances")
    
    print("\nCopying output files to local directory...")
    file_contents = copy_output_to_local.remote()
    
    for filename, content in file_contents.items():
        local_path = os.path.join(processed_dir, filename)
        try:
            print(f"Writing {len(content)} bytes to {filename}")
            with open(local_path, 'wb') as f:
                f.write(content)
            print(f"Saved {filename} ({os.path.getsize(local_path)} bytes) to {local_path}")
        except Exception as e:
            print(f"Error saving {filename}: {str(e)}")

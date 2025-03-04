import matplotlib.pyplot as plt
import numpy as np
import base64
import json
from io import BytesIO
from PIL import Image
import sys

def generate_heatmap(image_data: str) -> dict:
    """
    Generate a heatmap overlay for the dermoscopic image
    Args:
        image_data: Base64 encoded image string
    Returns:
        Dictionary with heatmap data
    """
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))

        # Resize to standard size
        image = image.resize((224, 224))

        # Convert to numpy array
        img_array = np.array(image)

        # Create figure without margins
        plt.figure(figsize=(8, 8))
        plt.subplots_adjust(0, 0, 1, 1)

        # Display original image
        plt.imshow(img_array)

        # Create dummy heatmap data (replace with actual attribution data)
        # Center weighted heatmap as placeholder
        y, x = np.ogrid[-112:112:224j, -112:112:224j]
        heatmap = np.exp(-(x*x + y*y)/(2.*50.*50.))

        # Overlay heatmap with transparency
        plt.imshow(heatmap, cmap='jet', alpha=0.5)
        plt.axis('off')

        # Save to bytes
        buf = BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
        plt.close()

        # Encode to base64
        buf.seek(0)
        heatmap_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        return {
            "status": "success",
            "heatmap": f"data:image/png;base64,{heatmap_base64}"
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    # Read input from stdin
    input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        result = generate_heatmap(data.get('image_data', ''))
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": f"Failed to process input: {str(e)}"
        }))
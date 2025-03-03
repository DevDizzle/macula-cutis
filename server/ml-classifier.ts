import * as tf from "@tensorflow/tfjs-node";

let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel(
      "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json"
    );
  }
  return model;
}

export async function classifyImage(imageData: string): Promise<{ label: string; confidence: number }> {
  const model = await loadModel();
  
  // Convert base64 to buffer
  const buffer = Buffer.from(imageData.split(',')[1], 'base64');
  
  // Load image using TensorFlow Node
  const tensor = tf.node.decodeImage(buffer)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

  // Get prediction
  const prediction = await model.predict(tensor) as tf.Tensor;
  const data = await prediction.data();
  
  // Get highest confidence class
  const maxIndex = data.indexOf(Math.max(...Array.from(data)));
  
  // Cleanup
  tensor.dispose();
  prediction.dispose();

  // Simple classification for demo
  const labels = ["benign", "malignant"];
  return {
    label: labels[maxIndex % 2],
    confidence: data[maxIndex],
  };
}

export async function generateHeatmap(imageData: string): Promise<string> {
  // For demo purposes, return a base64 encoded red overlay
  // In a real application, this would use SHAP or similar for actual heatmap generation
  const canvas = createCanvas(224, 224);
  const ctx = canvas.getContext('2d');
  
  // Draw red overlay
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  ctx.fillRect(56, 56, 112, 112); // Center 50% of the image
  
  return canvas.toDataURL();
}

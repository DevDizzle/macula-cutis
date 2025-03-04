import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";
import { Loader2, Upload, AlertTriangle, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

export default function HomePage() {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error("Image size must be less than 1MB"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          resolve(result);
        } else {
          reject(new Error("Invalid image format"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        setImageError(null);
        const processedImage = await processImage(file);
        setSelectedImage(processedImage);
      } catch (error) {
        setImageError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Image Processing Error",
          description: error instanceof Error ? error.message : "Failed to process image",
          variant: "destructive",
        });
      }
    }
  }, [toast, processImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedImage) throw new Error("No image selected");

      const res = await apiRequest("POST", "/api/analyze", {
        imageData: selectedImage,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Prediction: ${data.prediction} (${Math.round(data.confidence * 100)}% confidence)`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImageError(null);
  };

  const getRecommendation = (prediction: string, confidence: number) => {
    const confidencePercentage = Math.round(confidence * 100);
    if (prediction.toLowerCase() === "benign" && confidencePercentage >= 70) {
      return "Low-risk lesion; monitor regularly as per your professional discretion.";
    } else if (prediction.toLowerCase() === "malignant" && confidencePercentage >= 70) {
      return "Immediate biopsy strongly recommended.";
    }
    return "Further clinical evaluation recommended due to moderate confidence level.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end space-x-4">
          <Link href="/about" className="text-cyan-600 hover:text-cyan-700">
            About MaculaCutis
          </Link>
          <Link href="/contact" className="text-cyan-600 hover:text-cyan-700">
            Contact Us
          </Link>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {!analyzeMutation.data ? (
          <Card className="bg-white shadow-xl border-0 mb-8">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-gray-200 hover:border-cyan-400 hover:bg-gray-50"
                } ${imageError ? "border-red-500" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-16 w-16 text-cyan-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Upload dermoscopic image for immediate assessment
                </h3>
                <p className="text-gray-600">
                  Drag & drop your dermoscopic image (PNG, JPG) or click to select
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 1MB
                </p>
                {imageError && (
                  <p className="text-sm text-red-500 mt-4">{imageError}</p>
                )}
              </div>

              {selectedImage && !imageError && (
                <div className="mt-8 space-y-4">
                  <div className="max-w-md mx-auto">
                    <img
                      src={selectedImage}
                      alt="Selected dermoscopic image"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                  <button
                    className={`w-full py-4 px-6 rounded-lg text-white font-semibold transition-colors ${
                      analyzeMutation.isPending
                        ? "bg-cyan-400 cursor-not-allowed"
                        : "bg-cyan-600 hover:bg-cyan-700"
                    }`}
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analyzing Image...
                      </div>
                    ) : (
                      "Analyze Image"
                    )}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                {analyzeMutation.data.prediction.toLowerCase() === "benign" ? (
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className="text-3xl font-bold mb-2">
                  {analyzeMutation.data.prediction}
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Probability: {Math.round(analyzeMutation.data.confidence * 100)}%
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Original Image</h3>
                    <img
                      src={selectedImage}
                      alt="Original dermoscopic image"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Region Analysis</h3>
                    <img
                      src={analyzeMutation.data.heatmapData}
                      alt="Analysis heatmap"
                      className="rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Highlighted regions show areas of interest for the analysis
                    </p>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-6 mt-8">
                  <p className="text-gray-700">
                    {getRecommendation(
                      analyzeMutation.data.prediction,
                      analyzeMutation.data.confidence
                    )}
                  </p>
                </div>

                <button
                  onClick={resetAnalysis}
                  className="mt-8 flex items-center justify-center mx-auto px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <ArrowUpCircle className="w-5 h-5 mr-2" />
                  Analyze Another Image
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-gray-500 space-x-4">
        <Link href="/privacy" className="hover:text-cyan-600">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-cyan-600">
          Terms of Use
        </Link>
      </footer>
    </div>
  );
}
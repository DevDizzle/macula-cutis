import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { useState, useCallback } from "react";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MaculaCutis – Your AI Second Opinion Tool for Dermoscopy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quickly confirm your diagnostic intuition with an accurate, AI-powered second opinion.
          </p>
        </div>

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

        {analyzeMutation.data && (
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-lg font-medium">
                    {analyzeMutation.data.prediction}
                  </p>
                  <p className="text-sm text-gray-600">
                    Confidence: {Math.round(analyzeMutation.data.confidence * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
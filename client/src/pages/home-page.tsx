import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Analysis } from "@shared/schema";

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
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
        // Ensure we have a proper base64 string
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
        setImageError(error.message);
        toast({
          title: "Image Processing Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedImage) throw new Error("No image selected");

      // Verify the base64 format before sending
      if (!selectedImage.startsWith('data:image/')) {
        throw new Error("Invalid image format");
      }

      console.log("Sending image for analysis, length:", selectedImage.length);
      const res = await apiRequest("POST", "/api/analyze", {
        imageData: selectedImage,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({
        title: "Analysis Complete",
        description: "Your image has been analyzed successfully.",
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

  const { data: analyses, isLoading: isLoadingAnalyses } = useQuery<Analysis[]>({
    queryKey: ["/api/analyses"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">2nd Opinion</h1>
            <p className="text-sm text-gray-600">
              Welcome, {user?.name} ({user?.title})
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-gray-200"
                } ${imageError ? "border-red-500" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  Drag & drop a dermoscopic image (JPEG/PNG, max 1MB), or click to select
                </p>
                {imageError && (
                  <p className="text-sm text-red-500 mt-2">{imageError}</p>
                )}
              </div>

              {selectedImage && !imageError && (
                <div className="mt-4 space-y-4">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="rounded-lg max-h-64 mx-auto"
                  />
                  <Button
                    className="w-full"
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Analyze Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalyses ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </div>
              ) : analyses?.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No analyses yet. Upload an image to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {analyses?.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex gap-4">
                        <img
                          src={analysis.imageData}
                          alt="Analysis"
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{analysis.prediction}</p>
                          <p className="text-sm text-gray-600">
                            Confidence: {analysis.confidence}%
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(analysis.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <img
                        src={analysis.heatmapData}
                        alt="Heatmap"
                        className="w-full rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
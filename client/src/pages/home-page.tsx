
// Authentication removed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { Loader2, Upload, FileImage, ShieldCheck, Brain, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Analysis } from "@shared/schema";

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

// Helper function to process the image
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error(`Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: () => apiRequest<Analysis[]>({ url: "/api/analyses" }),
  });

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

      return apiRequest<Analysis>({
        url: "/api/analyze",
        method: "POST",
        data: { imageData: selectedImage },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      setSelectedImage(null);
      toast({
        title: "Analysis Complete",
        description: "Your image has been successfully analyzed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <header className="py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">
          MaculaCutis – Your AI Second Opinion Tool for Dermoscopy
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto px-4">
          Professional diagnostic support powered by advanced AI – designed specifically for dermatologists.
        </p>
      </header>
      
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid gap-8">
          <Card className="border border-blue-100 shadow-sm">
            <CardHeader className="border-b border-blue-50 bg-blue-50/50">
              <CardTitle className="text-blue-800">Upload Dermoscopic Image</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                } ${imageError ? "border-red-500" : ""}`}
              >
                <input {...getInputProps()} />
                <FileImage className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                <p className="text-slate-700 mb-2 font-medium">
                  Upload dermoscopic image (PNG, JPG) for immediate assessment
                </p>
                <p className="text-sm text-slate-500">
                  Drag & drop or click to select (max 1MB)
                </p>
                {imageError && (
                  <p className="text-sm text-red-500 mt-2">{imageError}</p>
                )}
              </div>

              {selectedImage && (
                <div className="mt-6 text-center">
                  <div className="mb-4 rounded-lg overflow-hidden inline-block border border-slate-200">
                    <img
                      src={selectedImage}
                      alt="Selected dermoscopic image"
                      className="max-h-64 max-w-full object-contain"
                    />
                  </div>
                  <Button
                    onClick={() => analyzeMutation.mutate()}
                    disabled={analyzeMutation.isPending}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Image"
                    )}
                  </Button>
                  <p className="text-slate-600 mt-4 text-sm italic">
                    Quickly confirm your diagnostic intuition with an accurate, AI-powered second opinion.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4 my-8">
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm text-center">
              <ShieldCheck className="h-10 w-10 mb-3 mx-auto text-blue-500" />
              <h3 className="font-semibold text-slate-800 mb-2">Accurate Assessment</h3>
              <p className="text-slate-600 text-sm">High precision AI analysis trained on validated dermatological datasets</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm text-center">
              <Brain className="h-10 w-10 mb-3 mx-auto text-teal-500" />
              <h3 className="font-semibold text-slate-800 mb-2">Visual Insights</h3>
              <p className="text-slate-600 text-sm">Explainable AI with heatmap visualization of key diagnostic features</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm text-center">
              <Clock className="h-10 w-10 mb-3 mx-auto text-indigo-500" />
              <h3 className="font-semibold text-slate-800 mb-2">Instant Results</h3>
              <p className="text-slate-600 text-sm">Receive analysis within seconds to support your clinical workflow</p>
            </div>
          </div>

          {analysesLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-slate-500 mt-2">Loading your previous analyses...</p>
            </div>
          ) : analyses && analyses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {analyses.map((analysis) => (
                    <Card key={analysis.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={analysis.imageData}
                          alt="Analyzed dermoscopic image"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-3">
                        <p className="font-medium">{analysis.prediction}</p>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {analysis.confidence}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>

      <footer className="mt-auto py-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} MaculaCutis - Professional AI tool for dermatologists</p>
      </footer>
    </div>
  );
}

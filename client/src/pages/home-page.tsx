
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function HomePage() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query past analyses
  const analyses = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/analyses");
      return await res.json();
    },
  });

  // Create a new analysis
  const analyzeMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const res = await apiRequest("POST", "/api/analyze", { imageData });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["analyses"],
      });
      toast({
        title: "Analysis complete",
        description: "Your image has been analyzed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setCurrentImage(base64);
      analyzeMutation.mutate(base64);
    };

    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Skin Lesion Analyzer</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted transition-colors ${
                isDragActive ? "border-primary bg-primary/10" : "border-muted"
              }`}
            >
              <input {...getInputProps()} />
              {currentImage ? (
                <div className="flex flex-col items-center">
                  <img
                    src={currentImage}
                    alt="Uploaded"
                    className="max-h-48 rounded mb-4"
                  />
                  <p>Drop a new image or click to replace</p>
                </div>
              ) : isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <p>
                  Drag and drop a skin lesion image here, or click to select a
                  file
                </p>
              )}
            </div>

            {analyzeMutation.isPending && (
              <div className="flex items-center justify-center mt-4">
                <LoaderCircle className="animate-spin mr-2" />
                <span>Analyzing image...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <ScrollArea className="h-[400px]">
                  {analyses.isLoading ? (
                    <div className="flex justify-center p-4">
                      <LoaderCircle className="animate-spin" />
                    </div>
                  ) : analyses.data?.length > 0 ? (
                    <div className="space-y-2">
                      {analyses.data.map((analysis: any) => (
                        <div
                          key={analysis.id}
                          className="flex items-center justify-between p-2 rounded border hover:bg-muted cursor-pointer"
                          onClick={() => setCurrentImage(analysis.imageData)}
                        >
                          <div className="flex items-center">
                            <img
                              src={analysis.imageData}
                              alt="Skin lesion"
                              className="w-12 h-12 object-cover rounded mr-2"
                            />
                            <div>
                              <p className="font-medium">{analysis.prediction}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  analysis.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              analysis.confidence > 75
                                ? "destructive"
                                : analysis.confidence > 50
                                ? "default"
                                : "outline"
                            }
                          >
                            {analysis.confidence}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No analyses yet. Upload an image to get started.
                    </p>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="detailed">
                {analyses.data &&
                  analyses.data.length > 0 &&
                  currentImage &&
                  analyses.data
                    .filter(
                      (analysis: any) => analysis.imageData === currentImage
                    )
                    .map((analysis: any) => (
                      <div key={analysis.id} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium mb-1">Original Image</p>
                            <img
                              src={analysis.imageData}
                              alt="Original"
                              className="w-full rounded"
                            />
                          </div>
                          <div>
                            <p className="font-medium mb-1">Heatmap Overlay</p>
                            <img
                              src={analysis.heatmapData}
                              alt="Heatmap"
                              className="w-full rounded"
                            />
                          </div>
                        </div>

                        <div>
                          <p className="font-medium">Diagnosis</p>
                          <p>{analysis.prediction}</p>
                        </div>

                        <div>
                          <p className="font-medium">Confidence</p>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${analysis.confidence}%` }}
                            ></div>
                          </div>
                          <p className="text-right text-sm">
                            {analysis.confidence}%
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <p className="font-medium">Date</p>
                          <p>
                            {new Date(
                              analysis.createdAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}

                {(!currentImage || analyses.data?.length === 0) && (
                  <p className="text-center text-muted-foreground">
                    Select an analysis from the list view to see details.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;

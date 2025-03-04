import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { MicroscopeIcon, Activity, BrainCircuit, AlertTriangle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <a className="text-cyan-600 hover:text-cyan-700 mb-8 inline-flex items-center">
            ← Back to Analysis
          </a>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About MaculaCutis</h1>
          <p className="text-xl text-gray-600">
            AI-powered second opinion tool for dermatological assessment
          </p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MicroscopeIcon className="h-6 w-6 text-cyan-600" />
                <CardTitle>Purpose and Intended Use</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                MaculaCutis is an AI-powered second opinion tool specifically designed for dermatologists. 
                It provides immediate probabilistic assessments of dermoscopic images to assist clinical decisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-cyan-600" />
                <CardTitle>Training and Dataset</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                The model was trained using Google AutoML Vision within Vertex AI, leveraging the 
                widely recognized HAM10000 dataset from{" "}
                <a 
                  href="https://www.isic-archive.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-700 underline"
                >
                  ISIC Archive
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-cyan-600" />
                <CardTitle>Model Performance Metrics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">PR AUC</p>
                  <p className="text-2xl font-semibold text-gray-900">0.978</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Log Loss</p>
                  <p className="text-2xl font-semibold text-gray-900">0.173</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Precision at 0.5 Threshold</p>
                  <p className="text-2xl font-semibold text-gray-900">94.28%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Recall at 0.5 Threshold</p>
                  <p className="text-2xl font-semibold text-gray-900">94.28%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interpretability (Coming Soon)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To further enhance transparency and clinical trust, we plan to incorporate SHAP heatmaps. 
                These visual explanations will clearly highlight image regions that most significantly 
                influence the model's predictions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
                <CardTitle>Disclaimer</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">
                MaculaCutis is an AI-powered second opinion tool and is not intended to replace 
                professional medical judgment or diagnostic practices. Always confirm critical 
                diagnoses through clinical assessment and standard medical procedures.
              </p>
            </CardContent>
          </Card>
        </div>
        <footer className="mt-12 text-center text-sm text-gray-500 space-x-4">
          <Link href="/privacy">
            <a className="hover:text-cyan-600">Privacy Policy</a>
          </Link>
          <span>•</span>
          <Link href="/terms">
            <a className="hover:text-cyan-600">Terms of Use</a>
          </Link>
        </footer>
      </main>
    </div>
  );
}
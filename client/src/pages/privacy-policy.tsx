import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Shield, Lock, EyeOff } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-cyan-600 hover:text-cyan-700 mb-8 inline-flex items-center">
          ← Back to Analysis
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: March 04, 2025</p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-cyan-600" />
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                At MaculaCutis.com ("we," "us," or "our"), your privacy is our top priority. This Privacy Policy explains how we collect, use, and protect your information when you use our application (the "App"). We are committed to maintaining the highest standards of privacy and security, including full compliance with medical data privacy standards and the Health Insurance Portability and Accountability Act (HIPAA).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-cyan-600" />
                <CardTitle>How We Process Your Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                MaculaCutis.com enables you to analyze images by converting them into Base64-encoded strings, which are securely transmitted to our cloud-based machine learning service, hosted on Google Cloud's Vertex AI platform, for processing. This analysis occurs on secure, HIPAA-compliant servers, and we do not retain any patient-identifiable data after the processing is complete.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Image Data:</strong> When you upload an image, it is encoded as a Base64 string on your device. This encoded data is sent to Vertex AI for classification, and the results are returned to you.
                </li>
                <li>
                  <strong>No Retention:</strong> Once the analysis is finished, the Base64-encoded data is not stored on our servers or by Vertex AI beyond the duration of the request. We do not keep copies of your images or any associated patient-identifiable information.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <EyeOff className="h-6 w-6 text-cyan-600" />
                <CardTitle>Security Measures</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We employ robust security measures to protect your data during transmission and processing:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Encryption:</strong> Base64-encoded data is transmitted over secure, encrypted connections (TLS).</li>
                <li><strong>HIPAA Compliance:</strong> Vertex AI operates within Google Cloud's HIPAA-compliant framework.</li>
                <li><strong>No Retention:</strong> Data is deleted immediately after analysis, reducing exposure risks.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">
                We're here to answer your questions about privacy. Please reach out to:<br />
                Email: eraphaelparra@gmail.com<br />
                Contact: Evan R. Parra
              </p>
            </CardContent>
          </Card>
        </div>
        <footer className="mt-12 text-center text-sm text-gray-500 space-x-4">
          <Link href="/terms" className="hover:text-cyan-600">
            Terms of Use
          </Link>
        </footer>
      </main>
    </div>
  );
}
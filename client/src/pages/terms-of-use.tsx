import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ScrollText, Shield, AlertTriangle } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-cyan-600 hover:text-cyan-700 mb-8 inline-flex items-center">
          ← Back to Analysis
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-gray-600">Last Updated: March 04, 2025</p>
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ScrollText className="h-6 w-6 text-cyan-600" />
                <CardTitle>Purpose of the App</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                MaculaCutis.com is designed to assist users in analyzing images by converting them into Base64-encoded strings and processing them through Google Cloud's Vertex AI platform. The App provides classification results based on this analysis. It is intended as a supportive tool, not a replacement for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-cyan-600" />
                <CardTitle>User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Use the App only for lawful purposes and in accordance with these Terms.</li>
                <li>Provide accurate images for analysis, understanding that results depend on the quality and content of what you submit.</li>
                <li>Not upload content that is illegal, harmful, or infringes on others' rights (e.g., copyrighted material or identifiable patient data without consent).</li>
                <li>Maintain the security of your device to protect your data.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-cyan-600" />
                <CardTitle>Disclaimers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-600">
                <p><strong>No Medical Advice:</strong> MaculaCutis.com is not a healthcare provider. The analysis results are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Seek professional medical guidance for health-related concerns.</p>
                <p><strong>Accuracy:</strong> While we strive for reliable results, the App's output depends on the quality of your images and the underlying Vertex AI model. We do not guarantee accuracy or completeness.</p>
                <p><strong>"As Is" Basis:</strong> The App is provided "as is" without warranties, express or implied, including merchantability, fitness for a particular purpose, or non-infringement.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">
                Questions or concerns? We're here to help:<br />
                Email: eraphaelparra@gmail.com<br />
                Contact: Evan R. Parra
              </p>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-cyan-600">
            Privacy Policy
          </Link>
        </footer>
      </main>
    </div>
  );
}
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">GDPR Compliance Checker</h3>
            <p className="text-gray-400 mb-4">
              An AI-powered tool to help organizations assess and improve their GDPR compliance. 
              Built with modern web technologies and powered by IO Intelligence API.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://docs.io.net"
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                IO Intelligence Docs
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Document Upload</li>
              <li>AI Analysis</li>
              <li>Compliance Scoring</li>
              <li>Improvement Suggestions</li>
              <li>Detailed Reports</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-4">GDPR Areas</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Data Subject Rights</li>
              <li>Consent Management</li>
              <li>Data Security</li>
              <li>Breach Notification</li>
              <li>Privacy by Design</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © 2025 GDPR Compliance Checker.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-gray-400">Powered by</span>
            <a
              href="https://io.net"
              className="text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              IO Intelligence
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

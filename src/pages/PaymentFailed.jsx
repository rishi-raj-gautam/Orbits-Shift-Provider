import { useState } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import Header from '../components/Header';


export default function PaymentFailed() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRetry = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const today = new Date(); // or use new Date('2025-06-25') for a fixed date

const day = today.getDate();
const month = today.toLocaleString('default', { month: 'long' });
const year = today.getFullYear();

// Function to get ordinal suffix
function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const formattedDate = `${getOrdinal(day)} ${month}, ${year}`;



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-rose-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden p-0">
        <div className="p-8 flex flex-col items-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <AlertTriangle className="text-rose-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Payment Failed</h1>
          <p className="text-gray-600 text-center mb-2">
            We couldn't process your payment. Please check your payment details and try again.
          </p>
        </div>
        <div className="border-t border-gray-100 px-8 pb-8">
          <div className="mb-6 mt-8">
            <h2 className="text-xs font-medium text-gray-700 mb-2">Error details</h2>
            <div className="bg-gray-100 rounded-md p-4 text-xs text-gray-600">
              <p className="mb-1"><span className="font-semibold">Error code:</span> PAYMENT_DECLINED</p>
              <p className="mb-1"><span className="font-semibold">Date:</span> {formattedDate}</p>
              <p><span className="font-semibold">Message:</span> The card issuer declined the transaction.</p>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xs font-medium text-gray-700 mb-2">Possible reasons</h2>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 ml-2">
              <li>Insufficient funds in your account</li>
              <li>Incorrect payment information</li>
              <li>Your card has been blocked by your bank</li>
              <li>Temporary issue with your payment provider</li>
            </ul>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-black hover:bg-gray-800 text-white text-base disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                'Try Again'
              )}
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-black hover:bg-gray-800 text-white text-base"
                onClick={() => navigate('/booking-details')}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                className="flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-black hover:bg-gray-800 text-white text-base"
              >
                <HelpCircle className="mr-2 h-5 w-5" />
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-500 text-center">
        Need assistance? Contact support at <span className="text-rose-600">info@reliancemove.com</span>
      </p>
    </div>
  );
}
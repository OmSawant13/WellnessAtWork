import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/services';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import QRCode from 'qrcode';

const ConnectHealthApp = () => {
  const { user } = useAuthStore();
  const [oauthUrl, setOauthUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkConnectionStatus();
    // Check URL params for callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('googleFit') === 'connected') {
      toast.success('✅ Google Fit connected successfully!');
      checkConnectionStatus();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('error')) {
      toast.error('Failed to connect Google Fit. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await authService.getGoogleFitStatus();
      setConnected(response.data.data.connected);
    } catch (error) {
      console.error('Error checking Google Fit status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await authService.connectGoogleFit();
      const url = response.data.oauthUrl;
      setOauthUrl(url);

      // Generate QR code
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    } catch (error) {
      console.error('Error connecting Google Fit:', error);
      toast.error('Failed to get Google Fit connection URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Fit?')) {
      return;
    }

    try {
      await authService.disconnectGoogleFit();
      setConnected(false);
      setOauthUrl('');
      setQrCodeUrl('');
      toast.success('Google Fit disconnected');
    } catch (error) {
      console.error('Error disconnecting Google Fit:', error);
      toast.error('Failed to disconnect Google Fit');
    }
  };

  if (checking) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Checking connection...</span>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiCheck className="text-green-600 text-xl mr-2" />
            <div>
              <p className="text-green-800 font-semibold">Google Fit Connected</p>
              <p className="text-sm text-green-600">Steps will be automatically fetched</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-all"
          >
            <FiX className="inline mr-1" />
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Google Fit</h3>
        <p className="text-sm text-gray-600">
          Connect your Google Fit account to automatically sync your daily steps. No manual entry needed!
        </p>
      </div>

      {!oauthUrl ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <FiRefreshCw className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            'Connect Google Fit'
          )}
        </button>
      ) : (
        <div className="space-y-4">
          {qrCodeUrl && (
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img src={qrCodeUrl} alt="Google Fit QR Code" className="w-64 h-64" />
              </div>
              <p className="mt-3 text-sm text-gray-600 text-center">
                Scan this QR code with your phone to connect
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <a
              href={oauthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-center"
            >
              Open in Browser
            </a>
            <button
              onClick={() => {
                setOauthUrl('');
                setQrCodeUrl('');
              }}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> After authorizing, you'll be redirected back to the app. Make sure to allow access to your fitness data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectHealthApp;



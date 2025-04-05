// In BarcodeScanner.jsx
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

const BarcodeScanner = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      showTorchButtonIfSupported: false,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0]
    });

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        console.warn(error);
      }
    );

    return () => scanner.clear();
  }, [onScan]);

  return <div id="reader" />;
};

export default BarcodeScanner;
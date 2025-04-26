import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
      console.log("Scan successful:", decodedText);
      onScan(decodedText);
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(error => {
          console.error("Error stopping camera:", error);
        });
      }
    };
    const qrCodeErrorCallback = (error) => {
      console.warn("QR Code scanning error:", error);
    };
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).catch(err => {
      console.error("Error starting scanner:", err);
    });
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping camera on unmount:", error);
        });
      }
    };
  }, [onScan]);

  return (
    <div>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default BarcodeScanner;
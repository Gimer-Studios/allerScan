import { useState, useEffect } from "react";
import axios from "axios"; 
import BarcodeScanner from "./components/BarcodeScanner";
import AllergyProfile from "./components/AllergyProfile";
import "./styles.css"; 

function App() {
  const [barcode, setBarcode] = useState(null);
  const [allergens, setAllergens] = useState(null);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState("");
  const [isHomeScreen, setIsHomeScreen] = useState(true); 
  const [isEditingAllergens, setIsEditingAllergens] = useState(false); 
  const [showCamera, setShowCamera] = useState(true);

  const handleScan = (code) => {
    setBarcode(code);
    setProductData(null);
    setError(""); 
    setShowCamera(false);
    fetchProductData(code);
  };

  const handleSaveAllergens = (allergyList) => {
    setAllergens(allergyList);
    localStorage.setItem("allergens", JSON.stringify(allergyList)); 
    setIsHomeScreen(true); 
    setIsEditingAllergens(false); 
  };

  useEffect(() => {
    const savedAllergens = localStorage.getItem("allergens");
    if (savedAllergens) {
      setAllergens(JSON.parse(savedAllergens)); //allergens from localStorage
    }
  }, []);

  const fetchProductData = async (barcode) => {
    try {
      setError(""); 
      console.log("Fetching product data for barcode:", barcode);

      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      console.log("API Response:", response);

      const data = response.data;
      if (data.product) {
        const productName = data.product.product_name;
        const ingredients = data.product.ingredients_text || "";
        setProductData({ productName, ingredients });
        checkForAllergens(ingredients);
      } else {
        setError("Product not found!");
        setProductData(null);
      }
    } catch (err) {
      console.error("Error fetching product data:", err); //logging
      setError("Error fetching product data.");
    }
  };

  const checkForAllergens = (ingredients) => {
    if (!allergens || !ingredients) return;
    const foundAllergens = allergens.filter((allergen) =>
      ingredients.toLowerCase().includes(allergen)
    );
    const warningMessages = [];

    if (foundAllergens.length > 0) {
      warningMessages.push({
        message: `Warning: This product contains ${foundAllergens.join(", ")}`,
        color: "red",
      });
    } else {
      warningMessages.push({
        message: "This product is safe based on your allergens.",
        color: "green", 
      });
    }

    setError(warningMessages);
  };

  const handleReturnHome = () => {
    setIsHomeScreen(true);
    setBarcode(null);
    setProductData(null);
    setError("");
    setIsEditingAllergens(false); 
    setShowCamera(true); 
  };

  return (
    <div className="container">
      <h1>AllerScan</h1>

      {isHomeScreen ? (
        <>
          {!allergens ? (
            <AllergyProfile onSave={handleSaveAllergens} />
          ) : (
            <div>
              <p>Your allergens have been saved. Start scanning products now!</p>
              <button onClick={() => setIsHomeScreen(false)}>Start Scanning</button>
              <button onClick={() => setIsEditingAllergens(true)} className="edit-allergens">
                Edit Allergens
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={barcode ? "product-result" : "scanning-mode"}>
          {barcode && (
            <>
              <p><strong>Scanned Barcode:</strong> {barcode}</p>
              <p><strong>Product:</strong> {productData?.productName || "Unknown Product"}</p>
              <p><strong>Ingredients:</strong> {productData?.ingredients || "No ingredients listed."}</p>
              
              {error.length > 0 && error.map((msg, index) => (
                <p key={index} style={{ color: msg.color }}>
                  {msg.message}
                </p>
              ))}
            </>
          )}
          
          {/*show scanner if no barcode has been scanned*/}
          {!barcode && <BarcodeScanner onScan={handleScan} />}
          
          {/*show camera preview only if no barcode scanned*/}
          {!barcode && showCamera && <div className="camera-preview">Camera Preview</div>}

          <div className="action-buttons">
            <button onClick={handleReturnHome} className="return-home">Return to Home Screen</button>
            {barcode && (
              <button 
                onClick={() => {
                  setBarcode(null);
                  setShowCamera(true);
                }}
              >
                Scan Another
              </button>
            )}
          </div>

          <p><strong>Your Allergens:</strong> {allergens.join(", ")}</p>
        </div>
      )}

      {isEditingAllergens && (
        <div className="edit-allergens-screen">
          <AllergyProfile onSave={handleSaveAllergens} allergens={allergens} />
        </div>
      )}

      <footer>
        <p className="disclaimer">
          Disclaimer: This app is in beta and may not be fully accurate. Please double-check ingredients.
        </p>
      </footer>
    </div>
  );
}

export default App;
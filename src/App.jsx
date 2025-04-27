import { useState, useEffect } from "react";
import axios from "axios"; 
import BarcodeScanner from "./components/BarcodeScanner";
import AllergyProfile from "./components/AllergyProfile";
import "./styles.css"; 

function App() {
  const [barcode, setBarcode] = useState(null);
  const [allergens, setAllergens] = useState([]); 
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
    console.log("handleSaveAllergens called with:", allergyList);
    if (Array.isArray(allergyList) && allergyList.length > 0) {
      setAllergens(allergyList);
      localStorage.setItem("allergens", JSON.stringify(allergyList));
      setIsHomeScreen(true);
      setIsEditingAllergens(false);
      console.log("Allergens saved successfully:", allergyList);
    } else {
      console.log("No allergens to save or invalid data");
      //user needs atleast one allergen
      setError([{
        message: "Please add at least one allergen before saving.",
        color: "yellow",
      }]);
    }
  };

  useEffect(() => {
    try {
      const savedAllergens = localStorage.getItem("allergens");
      console.log("Retrieved from localStorage:", savedAllergens);
      
      if (savedAllergens) {
        const parsed = JSON.parse(savedAllergens);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllergens(parsed);
          console.log("Loaded allergens from localStorage:", parsed);
        } else {
          console.log("Parsed data is not a valid array or is empty");
          setAllergens([]);
        }
      } else {
        console.log("No allergens found in localStorage");
        setAllergens([]);
      }
    } catch (error) {
      console.error("Error loading allergens from localStorage:", error);
      //clear localStorage
      localStorage.removeItem("allergens");
      setAllergens([]);
    }
  }, []);

  const fetchProductData = async (barcode) => {
    try {
      setError([]); 
      console.log("Fetching product data for barcode:", barcode);
  
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      console.log("API Response:", response);
  
      const data = response.data;
      if (data.product) {
        const productName = data.product.product_name || "Unknown Product";
        const ingredients = data.product.ingredients_text || "";
        setProductData({ productName, ingredients });
  
        if (ingredients) {
          checkForAllergens(ingredients);
        } else {
          setError([{
            message: "No ingredients information available for this product.",
            color: "yellow",
          }]);
        }
      } else {
        setError([{
          message: "Product not found! You may try scanning again as it may have been scanned incorrectly.",
          color: "yellow",
        }]);
        setProductData({ productName: "Unknown Product", ingredients: "No ingredients available" });
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError([{
        message: "Error fetching product data.",
        color: "yellow",
      }]);
      setProductData({ productName: "Unknown Product", ingredients: "No ingredients available" });
    }
  };

  const checkForAllergens = (ingredients) => {
    if (!allergens || !ingredients) return;
    const ingredientsLower = ingredients.toLowerCase();

    const foundAllergens = allergens.filter((allergen) =>
      ingredientsLower.includes(allergen.toLowerCase())
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
          {/*use length check for allergens array*/}
          {allergens.length === 0 ? (
            <AllergyProfile onSave={handleSaveAllergens} allergens={[]} />
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
              
              {Array.isArray(error) && error.length > 0 && error.map((msg, index) => (
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

          {allergens.length > 0 && (
            <p><strong>Your Allergens:</strong> {allergens.join(", ")}</p>
          )}
        </div>
      )}

      {isEditingAllergens && (
        <div className="edit-allergens-screen">
          <AllergyProfile onSave={handleSaveAllergens} allergens={allergens} />
        </div>
      )}

      <footer>
        <p className="disclaimer">
          Disclaimer: This app is in beta and may not be fully accurate. Please double check ingredients.
        </p>
      </footer>
    </div>
  );
}

export default App;
import { useState, useEffect } from "react";
import axios from "axios"; 
import BarcodeScanner from "./components/BarcodeScanner";
import AllergyProfile from "./components/AllergyProfile";
import "./styles.css"; 

function App() {
  const [barcode, setBarcode] = useState(null);
  const [allergens, setAllergens] = useState([]); 
  const [productData, setProductData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isHomeScreen, setIsHomeScreen] = useState(true); 
  const [isEditingAllergens, setIsEditingAllergens] = useState(false); 
  const [showCamera, setShowCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  const handleScan = (code) => {
    setBarcode(code);
    setProductData(null);
    setAlerts([]);
    setShowCamera(false);
    fetchProductData(code);
  };

  const handleSaveAllergens = (allergyList) => {
    console.log("handleSaveAllergens called with:", allergyList);
    setAllergens(allergyList);
    localStorage.setItem("allergens", JSON.stringify(allergyList));
    
    if (allergyList.length > 0) {
      setAlerts([{
        message: "Allergens saved successfully!",
        type: "success",
        icon: "✓"
      }]);
      console.log("Allergens saved successfully:", allergyList);
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
      //clear localStorage if corrupted
      localStorage.removeItem("allergens");
      setAllergens([]);
    }
  }, []);

  const fetchProductData = async (barcodeValue) => {
    try {
      setIsLoading(true);
      setAlerts([]); 
      console.log("Fetching product data for barcode:", barcodeValue);
  
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcodeValue}.json`);
      console.log("API Response:", response);
  
      const data = response.data;
      if (data.product) {
        const productName = data.product.product_name || "Unknown Product";
        const ingredients = data.product.ingredients_text || "";
        const brands = data.product.brands || "";
        const categories = data.product.categories || "";
        
        setProductData({ 
          productName, 
          ingredients, 
          brands,
          categories,
          barcode: barcodeValue
        });
  
        if (ingredients) {
          checkForAllergens(ingredients);
        } else {
          setAlerts([{
            message: "No ingredients information available for this product.",
            type: "warning",
            icon: "ℹ️"
          }]);
        }
      } else {
        setAlerts([{
          message: "Product not found! Try scanning again - the barcode may have been read incorrectly.",
          type: "warning",
          icon: "❓"
        }]);
        setProductData({ 
          productName: "Unknown Product", 
          ingredients: "No ingredients available",
          barcode: barcodeValue
        });
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
      setAlerts([{
        message: "Unable to fetch product data. Please check your internet connection.",
        type: "danger",
        icon: "⚠️"
      }]);
      setProductData({ 
        productName: "Unknown Product", 
        ingredients: "No ingredients available",
        barcode: barcodeValue
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkForAllergens = (ingredients) => {
    if (!allergens || !ingredients) return;
    const ingredientsLower = ingredients.toLowerCase();

    const foundAllergens = allergens.filter((allergen) =>
      ingredientsLower.includes(allergen.toLowerCase())
    );
    
    const alertMessages = [];
  
    if (foundAllergens.length > 0) {
      alertMessages.push({
        message: `⚠️ WARNING: Contains ${foundAllergens.join(", ")} - Not safe for you!`,
        type: "danger",
        icon: "🚨"
      });
    } else {
      alertMessages.push({
        message: "✅ Safe to consume based on your registered allergens",
        type: "success", 
        icon: "✓"
      });
    }
  
    setAlerts(alertMessages);
  };
  
  const handleReturnHome = () => {
    setIsHomeScreen(true);
    setBarcode(null);
    setProductData(null);
    setAlerts([]);
    setIsEditingAllergens(false); 
    setShowCamera(true); 
    setShowIngredients(false);
  };

  const handleStartScanning = () => {
    setIsHomeScreen(false);
    setBarcode(null);
    setProductData(null);
    setAlerts([]);
    setShowCamera(true);
    setShowIngredients(false);
  };

  const handleScanAnother = () => {
    setBarcode(null);
    setProductData(null);
    setAlerts([]);
    setShowCamera(true);
    setShowIngredients(false);
  };

  const AlertComponent = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;
    
    return (
      <div className="alerts-container">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            <span className="alert-icon">{alert.icon}</span>
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    );
  };

  const ProductCard = ({ product, isLoading }) => {
    if (isLoading) {
      return (
        <div className="card">
          <div className="loading">
            <div className="loading-spinner"></div>
            <span>Loading product information...</span>
          </div>
        </div>
      );
    }

    if (!product) return null;

    return (
      <div className="product-card">
        <div className="product-header">
          <div className="product-icon">📦</div>
          <div className="product-info">
            <h3>{product.productName}</h3>
            <div className="product-barcode">{product.barcode}</div>
          </div>
        </div>
        
        {product.brands && (
          <div className="product-detail">
            <strong>Brand:</strong> {product.brands}
          </div>
        )}
        
        <div className="ingredients-section">
          <div className="ingredients-header" onClick={() => setShowIngredients(!showIngredients)}>
            <h4>🧾 Ingredients</h4>
            <span className="dropdown-arrow">{showIngredients ? '▼' : '▶'}</span>
          </div>
          {showIngredients && (
            <div className="ingredients-text">
              {product.ingredients || "No ingredients information available"}
            </div>
          )}
        </div>
      </div>
    );
  };

  const AllergenDisplay = () => {
    if (allergens.length === 0 && !isEditingAllergens) {
      return (
        <div className="your-allergens">
          <h4>🚫 Your Allergens</h4>
          <p className="no-allergens-text">No allergens added yet</p>
          <button className="btn btn-secondary" onClick={() => setIsEditingAllergens(true)}>
            ⚙️ Add Allergens
          </button>
        </div>
      );
    }

    if (isEditingAllergens) {
      return (
        <div className="your-allergens">
          <AllergyProfile onSave={handleSaveAllergens} allergens={allergens} />
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsEditingAllergens(false)}
            style={{ marginTop: '1rem' }}
          >
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="your-allergens">
        <h4>🚫 Your Allergens</h4>
        <div className="allergen-list">
          {allergens.map((allergen, index) => (
            <span key={index} className="allergen-chip">
              {allergen}
            </span>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={() => setIsEditingAllergens(true)}>
          ⚙️ Edit Allergens
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>AllerScan</h1>

      {isHomeScreen ? (
        <div className="home-content">
          {allergens.length === 0 && !isEditingAllergens ? (
            <div className="card">
              <AllergyProfile onSave={handleSaveAllergens} allergens={[]} />
            </div>
          ) : (
            <>
              <div className="welcome-message">
                <p>Great! Your allergens are saved.</p>
                <p>Ready to scan products and stay safe!</p>
              </div>
              
              <div className="action-buttons">
                <button className="btn" onClick={handleStartScanning}>
                  Start Scanning
                </button>
              </div>

              <AllergenDisplay />
            </>
          )}
        </div>
      ) : (
        <div className="scanner-container">
          {!barcode ? (
            <>
              <div className="card">
                <h2>📸 Scan Product Barcode</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Point your camera at the barcode on the product
                </p>
                <div className="scanner-frame">
                  <BarcodeScanner onScan={handleScan} />
                  <div className="scanning-overlay"></div>
                </div>
              </div>
              
              <button className="btn btn-secondary" onClick={handleReturnHome}>
                Return Home
              </button>
            </>
          ) : (
            <div className="product-result">
              <AlertComponent alerts={alerts} />
              
              <ProductCard product={productData} isLoading={isLoading} />
              
              <div className="action-buttons">
                <button className="btn" onClick={handleScanAnother}>
                  Scan Another
                </button>
                <button className="btn btn-secondary" onClick={handleReturnHome}>
                  Return Home
                </button>
              </div>

              {allergens.length > 0 && (
                <div className="your-allergens">
                  <h4>🚫 Your Current Allergens</h4>
                  <div className="allergen-list">
                    {allergens.map((allergen, index) => (
                      <span key={index} className="allergen-chip">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
import { useState, useEffect } from "react";

function AllergyProfile({ onSave, allergens = [] }) {
  const [allergenInput, setAllergenInput] = useState("");
  const [allergenList, setAllergenList] = useState(allergens || []);
  const [errorMessage, setErrorMessage] = useState("");

  //update local state when allergens prop changes
  useEffect(() => {
    setAllergenList(allergens || []);
  }, [allergens]);

  const handleInputChange = (e) => {
    setAllergenInput(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAllergen();
    }
  };

  const handleAddAllergen = () => {
    const trimmedInput = allergenInput.trim();
    
    if (!trimmedInput) {
      return;
    }
    
    if (!allergenList.includes(trimmedInput)) {
      const newList = [...allergenList, trimmedInput];
      setAllergenList(newList);
      setAllergenInput("");
      onSave(newList); //save when adding
      console.log("Added allergen:", trimmedInput, "New list:", newList);
    } else {
      setErrorMessage(`"${trimmedInput}" is already in your allergen list`);
    }
  };

  const handleRemoveAllergen = (allergenToRemove) => {
    const newList = allergenList.filter(item => item !== allergenToRemove);
    setAllergenList(newList);
    onSave(newList); //save when removing
  };

  return (
    <div className="allergy-profile">
      <h2>Edit Your Allergens</h2>
      
      <div className="tags-container">
        {allergenList.map((allergen, index) => (
          <span key={index} className="tag">
            {allergen}
            <button 
              type="button"
              onClick={() => handleRemoveAllergen(allergen)} 
              className="remove-tag"
            >
              x
            </button>
          </span>
        ))}
      </div>
      
      {errorMessage && (
        <p className="error-message">{errorMessage}</p>
      )}
      
      <div className="allergen-input-container">
        <input
          type="text"
          value={allergenInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Add an allergen (e.g., peanuts, eggs)"
          className="allergen-input"
        />
        <button 
          type="button" 
          onClick={handleAddAllergen} 
          className="add-allergen-btn"
        >
          Add
        </button>
      </div>
      
      <p className="helper-text">
        Common allergens: milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish
      </p>
    </div>
  );
}

export default AllergyProfile;
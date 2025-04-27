import { useState } from "react";

function AllergyProfile({ onSave, allergens = [] }) {
  const [allergenInput, setAllergenInput] = useState("");
  const [allergenList, setAllergenList] = useState(allergens || []);
  const [errorMessage, setErrorMessage] = useState("");

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
      console.log("Added allergen:", trimmedInput, "New list:", newList);
    } else {
      setErrorMessage(`"${trimmedInput}" is already in your allergen list`);
    }
  };

  const handleRemoveAllergen = (allergenToRemove) => {
    setAllergenList(allergenList.filter(item => item !== allergenToRemove));
  };

  const handleSaveAllergens = () => {
    if (allergenList.length === 0) {
      if (allergenInput.trim()) {
        onSave([allergenInput.trim()]);
        console.log("Saving allergen from input:", allergenInput.trim());
      } else {
        setErrorMessage("Please add at least one allergen before saving");
      }
    } else {
      onSave(allergenList);
      console.log("Saving allergen list:", allergenList);
    }
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
        />
        <button 
          type="button" 
          onClick={handleAddAllergen} 
          className="add-allergen-btn"
        >
          Add
        </button>
      </div>
      
      <button 
        type="button"
        onClick={handleSaveAllergens} 
        className="save-allergens"
      >
        Save Allergens
      </button>
      
      <p className="helper-text">
        Common allergens: milk, eggs, peanuts, tree nuts, soy, wheat, fish, shellfish
      </p>
    </div>
  );
}

export default AllergyProfile;
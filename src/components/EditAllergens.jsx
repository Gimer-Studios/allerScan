import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditAllergens = ({ allergens, onSave }) => {
  const [newAllergen, setNewAllergen] = useState('');
  const navigate = useNavigate();

  const handleAddAllergen = () => {
    if (newAllergen && !allergens.includes(newAllergen)) {
      onSave([...allergens, newAllergen]);
      setNewAllergen('');
    }
  };

  const handleRemoveAllergen = (allergen) => {
    onSave(allergens.filter(a => a !== allergen));
  };

  return (
    <div className="edit-allergens">
      <h1>Edit Your Allergens</h1>
      <div className="allergen-input">
        <input
          type="text"
          value={newAllergen}
          onChange={(e) => setNewAllergen(e.target.value)}
          placeholder="Add allergen (e.g., peanuts)"
        />
        <button onClick={handleAddAllergen}>Add Allergen</button>
      </div>
      <div className="allergen-tags">
        {allergens.map((allergen, index) => (
          <div key={index} className="allergen-tag">
            <span>{allergen}</span>
            <button onClick={() => handleRemoveAllergen(allergen)}>Remove</button>
          </div>
        ))}
      </div>
      <button className="save-btn" onClick={() => navigate('/')}>Save Allergens</button>
    </div>
  );
};

export default EditAllergens;

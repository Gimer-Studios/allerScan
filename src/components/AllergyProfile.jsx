import { useState, useEffect } from "react";

function AllergyProfile({ onSave, allergens = [] }) {
  const [allergenInput, setAllergenInput] = useState("");
  const [tags, setTags] = useState(allergens);

  useEffect(() => {
    setTags(allergens); //set the allergens list when it changes
  }, [allergens]);

  const handleInputChange = (e) => {
    setAllergenInput(e.target.value);
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (allergenInput && !tags.includes(allergenInput)) {
        setTags([...tags, allergenInput]);
        setAllergenInput("");
      }
    }
  };

  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter(tag => tag !== removedTag));
  };

  const handleSave = () => {
    onSave(tags);
  };

  return (
    <div className="allergy-profile">
      <h2>Edit Your Allergens</h2>
      <div className="tags-container">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag} <button onClick={() => handleRemoveTag(tag)} className="remove-tag">x</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={allergenInput}
        onChange={handleInputChange}
        onKeyDown={handleAddTag}
        placeholder="Add an allergen (e.g., peanuts, eggs)"
      />
      <button onClick={handleSave} className="save-allergens">Save Allergens</button>
    </div>
  );
}

export default AllergyProfile;
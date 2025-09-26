import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handles the selection of an item from the dropdown
  const handleSelect = (option) => {
    onChange(option.value); // Pass the selected value to the parent component
    setIsOpen(false); // Close the dropdown
  };

  // Find the label of the currently selected option
  const selectedLabel = value
    ? options.find((opt) => opt.value === value)?.label
    : placeholder;

  return (
    <div className="relative w-full">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm text-black outline-none bg-white border border-slate-100 px-2.5 py-3 rounded-md mt-2 flex justify-between items-center"
      >
        <span>{selectedLabel}</span>
        <span className={`ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <LuChevronDown />
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full bg-white border border-slate-100 rounded-md mt-1 shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
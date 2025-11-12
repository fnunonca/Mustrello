import React, { useState } from 'react';
import { Palette } from 'lucide-react';

interface CardColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string | undefined) => void;
}

const CARD_COLORS = [
  { name: 'Verde', value: '#61bd4f' },
  { name: 'Amarillo', value: '#f2d600' },
  { name: 'Naranja', value: '#ff9f1a' },
  { name: 'Rojo', value: '#eb5a46' },
  { name: 'Morado', value: '#c377e0' },
  { name: 'Azul', value: '#0079bf' },
  { name: 'Turquesa', value: '#00c2e0' },
  { name: 'Lima', value: '#51e898' },
  { name: 'Rosa', value: '#ff78cb' },
  { name: 'Negro', value: '#344563' },
];

export const CardColorPicker: React.FC<CardColorPickerProps> = ({
  currentColor,
  onColorChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  const handleRemoveColor = () => {
    onColorChange(undefined);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        title="Cambiar color"
      >
        <Palette size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 z-20 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-48">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase">
              Etiquetas
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {CARD_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorSelect(color.value)}
                  className={`w-8 h-8 rounded hover:opacity-80 transition-opacity ${
                    currentColor === color.value
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            {currentColor && (
              <button
                onClick={handleRemoveColor}
                className="mt-3 w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 py-1 px-2 rounded"
              >
                Quitar color
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

import React from 'react';

interface ManufacturerLogosProps {
  logos: string[];
}

const ManufacturerLogos: React.FC<ManufacturerLogosProps> = ({ logos }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-6">注目ブランド (Featured Brands)</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 items-center">
        {logos.map((logoUrl, index) => (
          <div key={index} className="flex justify-center items-center p-2 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <img src={logoUrl} alt={`Brand logo ${index + 1}`} className="max-h-12 object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ManufacturerLogos;
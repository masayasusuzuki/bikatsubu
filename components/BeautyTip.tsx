import React, { useState, useCallback } from 'react';
import { generateBeautyTip } from '../services/geminiService';

const BeautyTip: React.FC = () => {
  const [tip, setTip] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerateTip = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setTip('');
    try {
      const generatedTip = await generateBeautyTip();
      setTip(generatedTip);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate tip: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-pink-100 to-rose-100 border-l-4 border-[#d11a68] rounded-r-lg shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gemini AI Beauty Tip</h3>
          <p className="text-gray-600">Get an AI-powered insight for your daily beauty routine.</p>
        </div>
        <button
          onClick={handleGenerateTip}
          disabled={isLoading}
          className="bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center w-52"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Generate Today\'s Tip'
          )}
        </button>
      </div>
      {tip && (
        <div className="mt-4 p-4 bg-white/70 rounded-lg">
          <p className="text-gray-700 italic">"{tip}"</p>
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default BeautyTip;

import React, { useState, useEffect, useCallback } from 'react';
import type { HeroSlide } from '../types';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  }, [slides.length]);

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 8000);
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex transition-transform duration-1000 ease-in-out"
           style={{ transform: `translateX(calc(50vw - 35vw - ${currentIndex * 67}vw))` }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex-shrink-0 relative"
            style={{
              width: '65vw',
              aspectRatio: '16/9',
              marginLeft: '1vw',
              marginRight: '1vw'
            }}
          >
            <img src={slide.imageUrl} alt={slide.alt} className="w-full h-full object-cover rounded-lg" />
            <div className={`absolute inset-0 bg-black rounded-lg transition-opacity duration-1000 ease-in-out ${
              index !== currentIndex ? 'opacity-50' : 'opacity-0'
            }`}></div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-white' : 'bg-gray-400'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

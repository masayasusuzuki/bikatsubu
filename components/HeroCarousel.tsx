
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

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.articleSlug) {
      window.location.href = `/article/${slide.articleSlug}`;
    } else if (slide.articleId) {
      window.location.href = `/article/${slide.articleId}`;
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div className="flex transition-transform duration-1000 ease-in-out"
           style={{ transform: `translateX(calc(50vw - 35vw - ${currentIndex * 67}vw))` }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`flex-shrink-0 relative ${slide.articleId ? 'cursor-pointer' : ''}`}
            style={{
              width: '65vw',
              aspectRatio: '16/9',
              marginLeft: '1vw',
              marginRight: '1vw'
            }}
            onClick={() => handleSlideClick(slide)}
          >
            <img src={slide.imageUrl.replace('/upload/', '/upload/c_fill,w_1200,h_675,q_auto,f_auto/')} alt={slide.alt} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ease-in-out ${
              index !== currentIndex ? 'opacity-30' : 'opacity-0'
            }`}></div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 bg-black/30 backdrop-blur-sm px-4 py-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 transition-all duration-300 ${
              currentIndex === index 
                ? 'bg-white scale-125' 
                : 'bg-white/60 hover:bg-white/80'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

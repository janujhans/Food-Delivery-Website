import React, { useState, useEffect } from 'react'
import './ImageCarousel.css'
import { food_list } from '../../assets/assets'

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState('next')

  // Select unique food images for carousel (e.g., every 4th item to get variety)
  const carouselImages = [
    food_list[0],
    food_list[4],
    food_list[8],
    food_list[13],
    food_list[17],
    food_list[21],
    food_list[25],
    food_list[29]
  ]

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection('next')
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [carouselImages.length])

  const handlePrev = () => {
    setDirection('prev')
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  const handleNext = () => {
    setDirection('next')
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const goToSlide = (index) => {
    if (index > currentSlide) setDirection('next')
    else if (index < currentSlide) setDirection('prev')
    setCurrentSlide(index)
  }

  return (
    <div className='carousel-container'>
      <div className='carousel-wrapper'>
        {/* Main carousel display */}
        <div className='carousel-display'>
          <div className={`carousel-slide ${direction}`}>
            <img src={carouselImages[currentSlide].image} alt={carouselImages[currentSlide].name} />
            <div className='slide-info'>
              <h3>{carouselImages[currentSlide].name}</h3>
              <p>₹{carouselImages[currentSlide].price}</p>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button className='carousel-btn prev-btn' onClick={handlePrev}>
          ❮
        </button>
        <button className='carousel-btn next-btn' onClick={handleNext}>
          ❯
        </button>

        {/* Dots indicator */}
        <div className='carousel-dots'>
          {carouselImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className='carousel-thumbnails'>
        {carouselImages.map((item, index) => (
          <div
            key={index}
            className={`thumbnail ${index === currentSlide ? 'active-thumbnail' : ''}`}
            onClick={() => goToSlide(index)}
          >
            <img src={item.image} alt={item.name} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageCarousel

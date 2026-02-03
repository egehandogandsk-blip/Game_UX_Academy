import React, { useRef, useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ images, onImageClick }) => {
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = () => {
        if (!carouselRef.current) return;

        const scrollLeft = carouselRef.current.scrollLeft;
        const itemWidth = carouselRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        carousel.addEventListener('scroll', handleScroll);
        return () => carousel.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToIndex = (index) => {
        if (!carouselRef.current) return;
        const itemWidth = carouselRef.current.offsetWidth;
        carouselRef.current.scrollTo({
            left: index * itemWidth,
            behavior: 'smooth'
        });
    };

    return (
        <div className="carousel-container">
            <div className="carousel" ref={carouselRef}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="carousel-item"
                        onClick={() => onImageClick && onImageClick(image, index)}
                    >
                        <img src={image.url || image} alt={image.alt || `Image ${index + 1}`} />
                        {image.caption && (
                            <div className="carousel-caption">{image.caption}</div>
                        )}
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <div className="carousel-dots">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => scrollToIndex(index)}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {images.length > 1 && (
                <>
                    <button
                        className="carousel-nav carousel-nav-prev"
                        onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                    <button
                        className="carousel-nav carousel-nav-next"
                        onClick={() => scrollToIndex(Math.min(images.length - 1, currentIndex + 1))}
                        disabled={currentIndex === images.length - 1}
                        aria-label="Next image"
                    >
                        ›
                    </button>
                </>
            )}
        </div>
    );
};

export default Carousel;

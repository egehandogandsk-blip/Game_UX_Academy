import React, { useRef, useEffect, useState } from 'react';
import './VisualMarker.css';

const VisualMarker = ({ image, markers, onMarkerClick }) => {
    const canvasRef = useRef(null);
    const [selectedMarker, setSelectedMarker] = useState(null);

    useEffect(() => {
        if (!canvasRef.current || !image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Draw visual markers
            markers.forEach((marker, index) => {
                drawMarker(ctx, marker, index, img.width, img.height);
            });
        };

        img.src = image;
    }, [image, markers]);

    const drawMarker = (ctx, marker, index, imgWidth, imgHeight) => {
        const x = (marker.coordinates.x / 100) * imgWidth;
        const y = (marker.coordinates.y / 100) * imgHeight;
        const width = (marker.coordinates.width / 100) * imgWidth;
        const height = (marker.coordinates.height / 100) * imgHeight;

        // Get color based on severity
        const colors = {
            high: '#FF4757',
            medium: '#FFB627',
            low: '#4A90E2'
        };

        const color = colors[marker.severity] || colors.medium;

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(x, y, width, height);

        // Draw semi-transparent overlay
        ctx.fillStyle = color + '20';
        ctx.fillRect(x, y, width, height);

        // Draw marker number
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + width / 2, y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), x + width / 2, y);

        // Draw connecting line
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y + 20);
        ctx.lineTo(x + width / 2, y + 40);
        ctx.stroke();
    };

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Find clicked marker
        const clicked = markers.findIndex(marker => {
            const mx = marker.coordinates.x;
            const my = marker.coordinates.y;
            const mw = marker.coordinates.width;
            const mh = marker.coordinates.height;

            return x >= mx && x <= mx + mw && y >= my && y <= my + mh;
        });

        if (clicked >= 0) {
            setSelectedMarker(clicked);
            onMarkerClick && onMarkerClick(markers[clicked], clicked);
        }
    };

    return (
        <div className="visual-marker-container">
            <canvas
                ref={canvasRef}
                className="visual-marker-canvas"
                onClick={handleCanvasClick}
            />

            {markers.length > 0 && (
                <div className="marker-legend">
                    <h4>Visual Feedback</h4>
                    {markers.map((marker, index) => (
                        <div
                            key={index}
                            className={`marker-legend-item ${selectedMarker === index ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedMarker(index);
                                onMarkerClick && onMarkerClick(marker, index);
                            }}
                        >
                            <div className={`marker-number severity-${marker.severity}`}>
                                {index + 1}
                            </div>
                            <div className="marker-info">
                                <div className="marker-element">{marker.element}</div>
                                <div className="marker-problem">{marker.problem}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VisualMarker;

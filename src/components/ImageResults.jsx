import React from 'react';

const ImageResults = ({ images, onAddCaption }) => {
  if (!images.length) return null;

  return (
    <div className="row">
      {images.map((img) => (
        <div key={img.id} className="col-md-3 mb-4">
          <div className="card h-100">
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img
                src={img.webformatURL}
                className="card-img-top"
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                alt={img.tags}
              />
            </div>
            <div className="card-body text-center">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => onAddCaption(img)}
              >
                Add Caption
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageResults;

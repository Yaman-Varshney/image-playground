import React, { useState } from 'react';
import ImageResults from '../components/ImageResults';
import CanvasEditor from '../components/CanvasEditor';

const Home = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');  // Store API errors
  const [loading, setLoading] = useState(false); // Show loading state

  const handleSearch = async () => {
    // Validate search query
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setError('');
    setLoading(true); // Start loading
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=49731089-96e0c2f2b0df16a0fad684ff8&q=${encodeURIComponent(query)}&image_type=photo&per_page=12`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch images.');
      }

      const data = await res.json();
      if (data.hits.length === 0) {
        setError('No images found for the given search query.');
      } else {
        setImages(data.hits);
      }
    } catch (error) {
      setError(error.message || 'An error occurred while fetching images.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="container mt-5">
      {!selectedImage ? (
        <>
          <h1 className="text-center mb-4">Image Caption Editor</h1>

          <div className="row justify-content-center mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for images..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {loading && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          <ImageResults
            images={images}
            onAddCaption={(img) => setSelectedImage(img.webformatURL)}
          />
        </>
      ) : (
        <CanvasEditor imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default Home;

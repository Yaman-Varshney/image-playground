import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const CanvasEditor = ({ imageUrl, onClose }) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [error, setError] = useState('');
  const [activityHistory, setActivityHistory] = useState([]); // Store the history
  const [showHistory, setShowHistory] = useState(false); // Modal visibility
  const [textInput, setTextInput] = useState(''); // State for the text input

  // Wait until the canvas is mounted
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: '500',
      height: '400',
      backgroundColor: '#fff',
    });
    fabricRef.current = canvas;
    setIsCanvasReady(true); // Flag as ready

    // Listen for text changes to update history
    canvas.on('object:modified', (e) => {
      if (e.target && e.target.type === 'textbox') {
        const updatedText = e.target;
        logActivity('Text Updated', {
          content: updatedText.text,
          left: updatedText.left,
          top: updatedText.top,
          width: updatedText.width,
          height: updatedText.height,
        });
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load image after canvas is ready
  useEffect(() => {
    if (!isCanvasReady || !fabricRef.current) return;

    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        img.scaleToWidth(800);
        fabricRef.current.setBackgroundImage(
          img,
          fabricRef.current.renderAll.bind(fabricRef.current),
          {
            scaleX: fabricRef.current.width / img.width,
            scaleY: fabricRef.current.height / img.height,
          }
        );

        // Log image URL in history (background image)
        logActivity('Image', { url: imageUrl });
      },
      {
        crossOrigin: 'anonymous',
      }
    );
  }, [isCanvasReady, imageUrl]);

  const handleTextChange = (e) => {
    setTextInput(e.target.value); // Update the input state with user input
  };

  const addText = () => {
    if (!fabricRef.current || !textInput.trim()) {
      setError('Please enter some text.');
      return;
    }

    const text = new fabric.Textbox(textInput, {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#000',
    });
    fabricRef.current.add(text).setActiveObject(text);

    // Log to history with the text content
    logActivity('Text Added', { content: text.text, left: text.left, top: text.top });

    setTextInput(''); // Clear the input field after adding the text
  };

  const addShape = (type) => {
    if (!fabricRef.current) {
      setError('Canvas not ready yet!');
      return;
    }

    let shape;
    const opts = {
      left: 150,
      top: 150,
      fill: 'rgba(0,0,255,0.5)',
    };

    switch (type) {
      case 'rect':
        shape = new fabric.Rect({ ...opts, width: 100, height: 100 });
        break;
      case 'circle':
        shape = new fabric.Circle({ ...opts, radius: 50 });
        break;
      case 'triangle':
        shape = new fabric.Triangle({ ...opts, width: 100, height: 100 });
        break;
      case 'polygon':
        shape = new fabric.Polygon(
          [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 50, y: 100 },
          ],
          {
            fill: 'rgba(0,255,0,0.5)',
            left: 200,
            top: 200,
          }
        );
        break;
      default:
        return;
    }

    fabricRef.current.add(shape);

    // Log to history with shape properties
    logActivity(type.charAt(0).toUpperCase() + type.slice(1), {
      left: shape.left,
      top: shape.top,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
    });
  };

  const logActivity = (type, data) => {
    // If the activity type is 'Text Updated', update the corresponding history
    if (type === 'Text Updated') {
      setActivityHistory((prevHistory) =>
        prevHistory.map((activity) =>
          activity.type === 'Text Added' && activity.attributes.content === data.content
            ? { ...activity, attributes: { ...activity.attributes, content: data.content } }
            : activity
        )
      );
    } else {
      // If it's a new activity, add it to history
      setActivityHistory((prevHistory) => [
        ...prevHistory,
        { type, attributes: data },
      ]);
    }
  };

  const downloadImage = () => {
    if (!fabricRef.current) {
      setError('Canvas not ready yet!');
      return;
    }

    try {
      const dataURL = fabricRef.current.toDataURL({
        format: 'png',
        quality: 1,
      });

      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'edited-image.png';
      link.click();
    } catch (error) {
      setError('Failed to export image!');
    }
  };

  const toggleHistoryModal = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Editor Mode</h4>
        <button className="btn btn-outline-secondary" onClick={onClose}>Back</button>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <div className="row">
        {/* Canvas Column */}
        <div className="col-md-8">
          <canvas ref={canvasRef} className="border" />
        </div>

        {/* Sidebar with input and buttons */}
        <div className="col-md-4">
          <div className="mb-3">
            <div className="d-flex flex-column">
              <div className="d-flex mb-3">
                <input
                  type="text"
                  className="form-control me-2"
                  value={textInput}
                  onChange={handleTextChange}
                  placeholder="Enter text here"
                />
                <button className="btn btn-sm btn-success ms-2" onClick={addText}>Add Text</button>
              </div>
            </div>
            <div className="btn-group-vertical w-100">
              <button className="btn btn-sm btn-info" onClick={() => addShape('rect')}>Rectangle</button>
              <button className="btn btn-sm btn-info" onClick={() => addShape('circle')}>Circle</button>
              <button className="btn btn-sm btn-info" onClick={() => addShape('triangle')}>Triangle</button>
              <button className="btn btn-sm btn-info" onClick={() => addShape('polygon')} style={{ marginBottom: '10px' }}>Polygon</button>
              <button className="btn btn-sm btn-primary" onClick={downloadImage}>Download</button>
              <button className="btn btn-sm btn-secondary" onClick={toggleHistoryModal}>Show Activity History</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal to display the activity history */}
      <div
        className={`modal fade ${showHistory ? 'show' : ''} text-start`}
        style={{ display: showHistory ? 'block' : 'none' }} 
        tabIndex="-1"
        aria-labelledby="activityHistoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="activityHistoryModalLabel">Activity History</h5>
              <button type="button" className="btn-close" onClick={toggleHistoryModal} aria-label="Close"></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <ul>
                {activityHistory.map((activity, index) => (
                  <li key={index}>
                    <strong>{activity.type}</strong>:
                    <pre>{JSON.stringify(activity.attributes, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={toggleHistoryModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditor;
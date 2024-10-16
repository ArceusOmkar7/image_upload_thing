import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CardItem } from './CardItems';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">ImgThing</div>
        <nav className="nav">
          <a href="#upload">Upload</a>
          <a href="#gallery">Gallery</a>
        </nav>
      </header>
      <section className="landing-page">
        <div className="upload-section">
          <UploadComponent />
        </div>
        <div className="info-section">
          <h1>Transfer Your Files [locally]</h1>
          <p>Upload and manage your files with a sleek, user-friendly interface. Experience the future of file handling with minimal design and maximum efficiency.[localy]</p>
        </div>
      </section>
      <section id="gallery" className="gallery-section">
        <h2>Gallery</h2>
        <CardContainer />
      </section>
      <footer className="footer">
        <a href="https://github.com/ArceusOmkar7/image_upload_thing/issues/new" target='_blank'>Raise A issue</a>
        <p>&copy; 2024 Image_thing_app.</p>
      </footer>
    </div>
  );
}

function UploadComponent() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleFileUpload = async () => {
    const formData = new FormData();

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        "https://image-upload-thing-backend.vercel.app/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Uploaded file successfully!", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        multiple
        required
        onChange={handleFileChange}
        className="file-input"
      />
      <button className="upload-button" onClick={handleFileUpload}>
        Upload
      </button>
    </div>
  );
}

function CardContainer() {
  const [cards, setCards] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('https://image-upload-thing-backend.vercel.app/all');
      const fileList = response.data;

      const filePromises = fileList.map(async (file) => {
        const fileResponse = await axios.get(`https://image-upload-thing-backend.vercel.app/download/${file.metadata.originalName}`, {
          responseType: 'blob'
        });
        const blob = new Blob([fileResponse.data], { type: file.contentType });
        const url = URL.createObjectURL(blob);

        return {
          ...file,
          url
        };
      });

      const filesWithUrls = await Promise.all(filePromises);
      setCards(filesWithUrls);
    } catch (error) {
      console.error('Error fetching or processing files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();

    const interval = setInterval(() => {
      fetchFiles();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-container">
      {cards.map(card => <CardItem imageUrl={card.url} name={card.metadata.originalName} key={card._id} />)}
    </div>
  );
}

export default App;

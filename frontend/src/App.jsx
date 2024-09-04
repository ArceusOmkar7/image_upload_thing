import { useState } from "react";
import "./App.css";
import axios from 'axios';

function App() {
  return <UploadComponent />;
}

function UploadComponent() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleFileUpload = async () => {
    const formData = new FormData();
    
    // Append each file to FormData
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      console.log("Uploaded file successfully!", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="card bg-base-100 w-8/12 shadow-xl flex flex-col">
      <div className="card-body items-center text-center">
        <h2 className="card-title">Upload Your Files</h2>
        <ul className="flex gap-2">
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
        <input
          type="file"
          multiple
          required
          onChange={handleFileChange}
          className="p-4"
        />
        <div className="card-actions">
          <button className="btn btn-primary shadow-cyan-900" onClick={handleFileUpload}>Upload</button>
        </div>
      </div>
    </div>
  );
}

export default App;

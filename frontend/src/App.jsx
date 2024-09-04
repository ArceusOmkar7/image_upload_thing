import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { CardItem } from "./CardItem";

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
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:3000/upload",
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
    <div>
      {/* Upload part */}
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
            <button
              className="btn btn-primary shadow-cyan-900"
              onClick={handleFileUpload}
            >
              Upload
            </button>
          </div>
        </div>

      </div>
      
      {/* Images display part */}
      <CardContainer></CardContainer>
    </div>
  );
}

function CardContainer() {
  const [cards, setCards] = useState([]);

  const fetchFiles = async () => {
    try {
      console.log(cards)
      // Fetch the list of files
      const response = await axios.get('http://localhost:3000/all');
      const fileList = response.data; // Assuming response.data is the file metadata array

      // Fetch each file and create a Blob URL
      const filePromises = fileList.map(async (file) => {
        const fileResponse = await axios.get(`http://localhost:3000/download/${file.metadata.originalName}`, {
          responseType: 'blob' // Important for handling file data
        });
        const blob = new Blob([fileResponse.data], { type: file.contentType });
        const url = URL.createObjectURL(blob);

        return {
          ...file,
          url
        };
      });

      // Wait for all file promises to resolve
      const filesWithUrls = await Promise.all(filePromises);

      // Update the state with the files including their Blob URLs
      setCards(filesWithUrls);
      console.log("Images fetched:",filesWithUrls.length);
    } catch (error) {
      console.error('Error fetching or processing files:', error);
    }
  };

  useEffect(() => {
    // Fetch files on component mount
    fetchFiles();

    // Set up interval to fetch files every 30 seconds
    const interval = setInterval(() => {
      fetchFiles();
    }, 30000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      margin: "10px 0px",
      gap: "10px"
    }}>
      {cards.map(card => <CardItem imageUrl={card.url} name={card.metadata.originalName} key={card._id}></CardItem>)}
    </div>
  );
}

// export default CardContainer;

export default App
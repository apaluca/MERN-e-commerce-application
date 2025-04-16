import { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";

const ImageUpload = ({ onUploadSuccess, onUploadError, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const { API, setError } = useAppContext();

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      // Create a FormData object to send the files
      const formData = new FormData();

      if (multiple) {
        // Add multiple files to formData (limit to 5)
        Array.from(files)
          .slice(0, 5)
          .forEach((file) => {
            formData.append("images", file);
          });
      } else {
        // Add single file to formData
        formData.append("image", files[0]);
      }

      // Upload endpoint
      const endpoint = multiple ? "/upload/images" : "/upload/image";

      // Configure request with progress tracking
      const response = await API.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percentCompleted);
        },
      });

      // Call the success callback with the response data
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error.response?.data?.message || "Failed to upload image");
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    handleUpload(e.target.files);
  };

  // Handle drag and drop events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleUpload(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {multiple ? "Upload Images" : "Upload Image"}
        </label>
        {uploading && (
          <span className="text-xs text-gray-500">{progress}% uploaded</span>
        )}
      </div>

      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 border-dashed"
        } rounded-md cursor-pointer`}
        onClick={handleButtonClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <svg
            className={`mx-auto h-12 w-12 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-gray-600 justify-center">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
            >
              <span>{uploading ? "Uploading..." : "Select a file"}</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                ref={fileInputRef}
                className="sr-only"
                onChange={handleFileInputChange}
                disabled={uploading}
                multiple={multiple}
                accept="image/*"
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB {multiple && "(max 5 files)"}
          </p>
        </div>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

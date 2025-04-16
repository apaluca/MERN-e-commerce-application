import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import ImageUpload from "../../components/ImageUpload";

const ProductEditPage = () => {
  const { id } = useParams(); // Get product ID from URL if editing
  const navigate = useNavigate();
  const { API, setError } = useAppContext();
  const [loading, setLoading] = useState(id ? true : false);
  const [submitting, setSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "https://dummyimage.com/200x200/e0e0e0/333333&text=Product",
    imagePublicId: "",
    images: [],
    imagesPublicIds: [],
    category: "",
    stock: "",
    featured: false,
  });

  // Fetch product data if editing
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await API.get(`/products/${id}`);
          const product = response.data;

          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            imageUrl:
              product.imageUrl ||
              "https://dummyimage.com/200x200/e0e0e0/333333&text=Product",
            imagePublicId: product.imagePublicId || "",
            images: product.images || [],
            imagesPublicIds: product.imagesPublicIds || [],
            category: product.category || "",
            stock: product.stock || "",
            featured: product.featured || false,
          });
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product details.");
          navigate("/admin/products");
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, API, setError, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" || name === "stock"
            ? parseFloat(value) || ""
            : value,
    });
  };

  const handleAddImage = () => {
    if (newImageUrl && formData.images.length < 5) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl],
        imagesPublicIds: [...(formData.imagesPublicIds || []), ""], // Add empty public ID for URL-based image
      });
      setNewImageUrl("");
    } else if (formData.images.length >= 5) {
      setError("Maximum of 5 additional images allowed");
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    const updatedPublicIds = [...(formData.imagesPublicIds || [])];

    // Remove the image URL
    updatedImages.splice(index, 1);

    // If there's a corresponding public ID, remove it too
    if (updatedPublicIds[index]) {
      // Optional: Add API call to delete from Cloudinary
      updatedPublicIds.splice(index, 1);
    }

    setFormData({
      ...formData,
      images: updatedImages,
      imagesPublicIds: updatedPublicIds,
    });
  };

  const handleMoveImage = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.images.length - 1)
    ) {
      return;
    }

    const updatedImages = [...formData.images];
    const updatedPublicIds = [...(formData.imagesPublicIds || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    [updatedImages[index], updatedImages[newIndex]] = [
      updatedImages[newIndex],
      updatedImages[index],
    ];

    // Also move the public IDs in the same way
    if (updatedPublicIds.length > 0) {
      [updatedPublicIds[index], updatedPublicIds[newIndex]] = [
        updatedPublicIds[newIndex],
        updatedPublicIds[index],
      ];
    }

    setFormData({
      ...formData,
      images: updatedImages,
      imagesPublicIds: updatedPublicIds,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Validate images array (max 5 additional images)
      if (formData.images.length > 5) {
        setError("Maximum of 5 additional images allowed");
        setSubmitting(false);
        return;
      }

      if (id) {
        // Update existing product
        await API.put(`/products/${id}`, formData);
      } else {
        // Create new product
        await API.post("/products", formData);
      }

      // Return to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error.response?.data?.message || "Failed to save product.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading product data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {id ? "Edit Product" : "Add New Product"}
        </h1>
        <Link
          to="/admin/products"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Featured in carousel
                </label>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="mt-6">
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Main Image
              </label>

              {formData.imageUrl && (
                <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden mb-3">
                  <img
                    src={formData.imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                  {formData.imageUrl !==
                    "https://dummyimage.com/200x200/e0e0e0/333333&text=Product" && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          imageUrl:
                            "https://dummyimage.com/200x200/e0e0e0/333333&text=Product",
                          imagePublicId: "",
                        })
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 text-xs hover:bg-red-600"
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              <div>
                {formData.imageUrl ===
                "https://dummyimage.com/200x200/e0e0e0/333333&text=Product" ? (
                  <ImageUpload
                    onUploadSuccess={(data) => {
                      setFormData({
                        ...formData,
                        imageUrl: data.url,
                        imagePublicId: data.public_id,
                      });
                    }}
                  />
                ) : (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images{" "}
                <span className="text-xs text-gray-500">(Max 5)</span>
              </label>

              {/* Display existing additional images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-md overflow-hidden"
                    >
                      <div className="h-48 bg-gray-100">
                        <img
                          src={image}
                          alt={`Additional ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="p-3 bg-gray-50 flex justify-between items-center">
                        <div className="truncate text-sm text-gray-500 flex-1 mr-2">
                          {image.slice(0, 25)}...
                        </div>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, "up")}
                            disabled={index === 0}
                            className="text-gray-500 hover:text-gray-700 p-1 disabled:text-gray-300"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, "down")}
                            disabled={index === formData.images.length - 1}
                            className="text-gray-500 hover:text-gray-700 p-1 disabled:text-gray-300"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload additional images */}
              {formData.images.length < 5 && (
                <div className="mb-4">
                  <ImageUpload
                    multiple={true}
                    onUploadSuccess={(data) => {
                      // Data will be an array of image objects with urls and public_ids
                      const newImages = [
                        ...formData.images,
                        ...data.map((img) => img.url),
                      ].slice(0, 5); // Ensure max 5 images

                      const newPublicIds = [
                        ...(formData.imagesPublicIds || []),
                        ...data.map((img) => img.public_id),
                      ].slice(0, 5);

                      setFormData({
                        ...formData,
                        images: newImages,
                        imagesPublicIds: newPublicIds,
                      });
                    }}
                  />
                </div>
              )}

              {/* Option to add images via URL */}
              <div className="flex items-center mt-4">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Or enter image URL directly"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={formData.images.length >= 5}
                  className="ml-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Add
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {formData.images.length}/5 additional images added.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <Link
              to="/admin/products"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {submitting ? "Saving..." : id ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditPage;

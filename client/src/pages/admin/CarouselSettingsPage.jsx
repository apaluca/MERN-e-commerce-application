import { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";

// Custom notification component
const Notification = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      <div
        className={`${
          type === "success"
            ? "bg-green-100 border-green-400 text-green-700"
            : "bg-red-100 border-red-400 text-red-700"
        } px-4 py-3 rounded border shadow-md flex items-center justify-between`}
      >
        <span className="block mr-6">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const CarouselSettingsPage = () => {
  const { API, setError } = useAppContext();
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ autoPlay: true, interval: 4000 });
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // State for our custom notification
  const [notification, setNotification] = useState(null);
  // { message: "Message text", type: "success" | "error" }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [prodRes, settingsRes] = await Promise.all([
          API.get("/products"),
          API.get("/settings/carousel"),
        ]);

        if (!active) return;

        const prodList = prodRes.data?.products || prodRes.data || [];
        setProducts(prodList);
        setSettings(settingsRes.data);
        setInitialSettings(settingsRes.data);
      } catch (err) {
        console.error(err);
        setError("Error loading carousel settings or products.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    return () => {
      active = false;
    };
  }, [API, setError]);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [products, searchQuery]);

  const featuredProducts = useMemo(
    () => filteredProducts.filter((p) => p.featured),
    [filteredProducts],
  );

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value),
    }));
  };

  const hasChanged = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings],
  );

  const saveSettings = async () => {
    if (!hasChanged) {
      showNotification("No changes to save.");
      return;
    }

    try {
      setSaving(true);
      await API.put("/settings/carousel", settings);
      setInitialSettings(settings);
      showNotification("Settings saved successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save carousel settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (id, featured) => {
    try {
      setSaving(true);
      await API.put(`/products/${id}`, { featured });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, featured } : p)),
      );
      showNotification(
        `Product ${featured ? "featured" : "unfeatured"} successfully.`,
      );
    } catch (err) {
      console.error(err);
      showNotification("Could not update product.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SETTINGS PANEL */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Carousel Options</h2>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="autoPlay"
              name="autoPlay"
              checked={settings.autoPlay}
              onChange={handleSettingChange}
              className="mr-2"
            />
            <label htmlFor="autoPlay">Auto-play enabled</label>
          </div>

          <label className="block mb-2">Slide Interval (ms)</label>
          <input
            type="number"
            name="interval"
            value={settings.interval}
            min="1000"
            step="500"
            onChange={handleSettingChange}
            className="w-full mb-4 border rounded px-3 py-2"
          />

          <button
            onClick={saveSettings}
            disabled={!hasChanged || saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-2">Featured Products</h2>
          <p className="text-sm text-gray-600 mb-4">
            {featuredProducts.length} currently featured.
          </p>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-[28rem] overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Product</th>
                  <th className="text-left px-4 py-2">Featured</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchQuery
                        ? "No products match your search."
                        : "No products found."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-500">
                              ${p.price.toFixed(2)} - {p.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={p.featured}
                          disabled={saving}
                          onChange={() => toggleFeatured(p._id, !p.featured)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Tip: Feature high-quality images and bestselling products to attract
            user attention.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselSettingsPage;

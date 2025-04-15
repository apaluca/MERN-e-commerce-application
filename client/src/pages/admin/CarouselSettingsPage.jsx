import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Alert from "../../components/Alert";

const CarouselSettingsPage = () => {
  const { API, setError } = useAppContext();
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ autoPlay: true, interval: 5000 });
  const [initialSettings, setInitialSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured),
    [products]
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
    [settings, initialSettings]
  );

  const saveSettings = async () => {
    if (!hasChanged) {
      setSuccessMessage("No changes to save.");
      setTimeout(() => setSuccessMessage(""), 2500);
      return;
    }

    try {
      setSaving(true);
      await API.put("/settings/carousel", settings);
      setSuccessMessage("Settings saved.");
      setInitialSettings(settings);
    } catch (err) {
      console.error(err);
      setError("Failed to save carousel settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(""), 2500);
    }
  };

  const toggleFeatured = async (id, featured) => {
    try {
      setSaving(true);
      await API.put(`/products/${id}`, { featured });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, featured } : p))
      );
      setSuccessMessage(`Product ${featured ? "featured" : "unfeatured"}`);
    } catch (err) {
      console.error(err);
      setError("Could not update product.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(""), 2500);
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
      <Alert message={successMessage} type="success" />

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

          <div className="max-h-[28rem] overflow-y-auto border rounded">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Product</th>
                  <th className="text-left px-4 py-2">Featured</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
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
                            ${p.price} - {p.category}
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
                ))}
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

import { useAppContext } from "../context/AppContext";

const Alert = () => {
  const { error } = useAppContext();

  if (!error) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 right-0 mx-auto max-w-md z-50 p-4">
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold mr-1">Error:</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );
};

export default Alert;

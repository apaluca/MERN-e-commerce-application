import { useAppContext } from "../context/AppContext";

const Alert = () => {
  const { error, success } = useAppContext();

  if (!error && !success) return null;

  const isError = !!error;
  const message = error || success;

  return (
    <div className="fixed top-16 left-0 right-0 mx-auto max-w-md z-50 p-4">
      <div
        className={`${
          isError
            ? "bg-red-100 border border-red-400 text-red-700"
            : "bg-green-100 border border-green-400 text-green-700"
        } px-4 py-3 rounded relative`}
        role="alert"
      >
        <strong className="font-bold mr-1">
          {isError ? "Error:" : "Success:"}
        </strong>
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
};

export default Alert;

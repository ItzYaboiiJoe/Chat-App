function SignOutConfirmation({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">{message}</h2>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignOutConfirmation;

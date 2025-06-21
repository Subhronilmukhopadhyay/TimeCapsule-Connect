// import axios from '../../utils/axiosInstance';

const DeleteAccount = () => {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    //   await axios.delete('/api/user/delete-account');
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-red-50 p-4 rounded">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
      <p className="text-sm text-red-700 mb-4">
        Deleting your account is permanent. All your data, including capsules, will be lost.
      </p>
      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Delete My Account
      </button>
    </div>
  );
};

export default DeleteAccount;

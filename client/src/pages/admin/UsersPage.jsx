import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

const AdminUsersPage = () => {
  const { API, setError } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    active: true
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await API.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API, setError]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role,
      active: user.active
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update role
      await API.put(`/admin/users/${selectedUser._id}/role`, {
        role: formData.role
      });
      
      // Update active status
      await API.put(`/admin/users/${selectedUser._id}/status`, {
        active: formData.active
      });
      
      // Refresh users list
      const response = await API.get('/admin/users');
      setUsers(response.data);
      
      handleCloseModal();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await API.delete(`/admin/users/${userId}`);
      
      // Refresh users list
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">User Management</h1>
      
      <div className="bg-white shadow-sm overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">All Users</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage user roles and account status.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                      user.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit User Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.username}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedUser.email}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="user">Regular User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Regular users can browse and purchase products. Administrators have full access to manage users, products, and orders.
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="active"
                      name="active"
                      type="checkbox"
                      checked={formData.active}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                      Account Active
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
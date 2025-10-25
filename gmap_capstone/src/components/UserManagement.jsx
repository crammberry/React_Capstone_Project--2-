import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { userProfile } = useAuth(); // Get current user's profile
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  // Check if current user is superadmin
  const isSuperAdmin = userProfile?.role === 'superadmin';

  // ACCESS CONTROL: Only superadmin can access this component
  if (!isSuperAdmin) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        borderRadius: '12px',
        border: '2px solid #fca5a5'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', marginBottom: '12px' }}>
          Access Denied
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
          Only the superadmin can access User Management.
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Contact your system administrator if you need access.
        </p>
      </div>
    );
  }

  // Load all users from profiles table
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading all users from profiles...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Loaded users:', data.length);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      showNotification('Error loading users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const confirmAction = (action) => {
    // SECURITY: Prevent any actions on superadmin accounts
    if (action.userRole === 'superadmin') {
      showNotification('Cannot modify superadmin account. Only database changes are allowed.', 'error');
      return;
    }

    // SECURITY: Prevent superadmin from demoting themselves
    if (action.userId === userProfile?.id) {
      showNotification('You cannot modify your own account!', 'error');
      return;
    }

    setActionToConfirm(action);
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!actionToConfirm) return;

    const { userId, action, currentRole, email } = actionToConfirm;

    try {
      let updateData = {};
      let successMessage = '';

      switch (action) {
        case 'promote':
          updateData = { role: 'admin' };
          successMessage = `✅ ${email} promoted to Admin!`;
          break;
        case 'demote':
          updateData = { role: 'user' };
          successMessage = `✅ ${email} demoted to User`;
          break;
        case 'verify':
          updateData = { is_verified: true };
          successMessage = `✅ ${email} verified successfully!`;
          break;
        case 'unverify':
          updateData = { is_verified: false };
          successMessage = `⚠️ ${email} marked as unverified`;
          break;
        default:
          throw new Error('Unknown action');
      }

      updateData.updated_at = new Date().toISOString();

      console.log('🔄 Updating user:', { userId, updateData });

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ User updated:', data);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, ...updateData } : u));
      
      showNotification(successMessage, 'success');
    } catch (error) {
      console.error('❌ Error updating user:', error);
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setShowConfirmModal(false);
      setActionToConfirm(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    verified: users.filter(u => u.is_verified).length,
    unverified: users.filter(u => !u.is_verified).length,
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>👥</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            User Management
          </h2>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          Manage user accounts, roles, and verification status
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `2px solid ${notification.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: notification.type === 'error' ? '#dc2626' : '#16a34a',
          fontWeight: '600'
        }}>
          {notification.message}
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.total}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Users</div>
        </div>
        <div style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(139, 92, 246, 0.2)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.admins}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Admins</div>
        </div>
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.verified}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Verified</div>
        </div>
        <div style={{
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.unverified}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Unverified</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins Only</option>
          <option value="user">Users Only</option>
        </select>
        <button
          onClick={loadUsers}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>User</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Joined</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {user.full_name || 'No name'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.role === 'superadmin' ? '#fef3c7' : user.role === 'admin' ? '#ede9fe' : '#dbeafe',
                      color: user.role === 'superadmin' ? '#92400e' : user.role === 'admin' ? '#7c3aed' : '#2563eb'
                    }}>
                      {user.role === 'superadmin' ? '⭐ SUPERADMIN' : user.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.is_verified ? '#d1fae5' : '#fee2e2',
                      color: user.is_verified ? '#065f46' : '#991b1b'
                    }}>
                      {user.is_verified ? '✅ Verified' : '⚠️ Unverified'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {/* SUPERADMIN: Show locked message */}
                      {user.role === 'superadmin' ? (
                        <span style={{
                          padding: '6px 12px',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          🔒 Protected
                        </span>
                      ) : user.id === userProfile?.id ? (
                        /* Current user (yourself): Can't modify own account */
                        <span style={{
                          padding: '6px 12px',
                          backgroundColor: '#e5e7eb',
                          color: '#6b7280',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          👤 You
                        </span>
                      ) : (
                        /* Regular users and admins: Show action buttons */
                        <>
                          {user.role === 'user' ? (
                            <button
                              onClick={() => confirmAction({
                                userId: user.id,
                                action: 'promote',
                                email: user.email,
                                userRole: user.role
                              })}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Promote to Admin"
                            >
                              👑 Promote
                            </button>
                          ) : (
                            <button
                              onClick={() => confirmAction({
                                userId: user.id,
                                action: 'demote',
                                email: user.email,
                                userRole: user.role
                              })}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#6b7280',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Demote to User"
                            >
                              👤 Demote
                            </button>
                          )}
                          {!user.is_verified ? (
                            <button
                              onClick={() => confirmAction({
                                userId: user.id,
                                action: 'verify',
                                email: user.email,
                                userRole: user.role
                              })}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Verify User"
                            >
                              ✅ Verify
                            </button>
                          ) : (
                            <button
                              onClick={() => confirmAction({
                                userId: user.id,
                                action: 'unverify',
                                email: user.email,
                                userRole: user.role
                              })}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                              title="Unverify User"
                            >
                              ⚠️ Unverify
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && actionToConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
              Confirm Action
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Are you sure you want to <strong>{actionToConfirm.action}</strong> user:{' '}
              <strong style={{ color: '#1f2937' }}>{actionToConfirm.email}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setActionToConfirm(null);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;


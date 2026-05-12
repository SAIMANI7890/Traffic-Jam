import { useState, useEffect } from "react";
import api from "../services/api.js";
import staffService from "../services/staffService.js";

export default function AdminSettingsPage() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Staff management state
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState("");
  const [newStaffUsername, setNewStaffUsername] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffSuccess, setStaffSuccess] = useState("");

  useEffect(() => {
    loadStaffUsers();
  }, []);

  const loadStaffUsers = async () => {
    try {
      setLoadingStaff(true);
      const response = await staffService.getStaffUsers();
      setStaffList(response.staff || []);
    } catch (err) {
      setStaffError(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffError("");
    setStaffSuccess("");

    if (!newStaffUsername.trim()) {
      setStaffError("Username is required");
      return;
    }

    try {
      setAddingStaff(true);
      await staffService.createStaffUser({ username: newStaffUsername.trim() });
      setStaffSuccess(`Staff user "${newStaffUsername}" created successfully!`);
      setNewStaffUsername("");
      await loadStaffUsers();
    } catch (err) {
      setStaffError(err.response?.data?.message || "Failed to create staff user");
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId, username) => {
    if (!confirm(`Are you sure you want to delete staff user "${username}"?`)) {
      return;
    }

    try {
      await staffService.deleteStaffUser(staffId);
      setStaffSuccess(`Staff user "${username}" deleted successfully`);
      await loadStaffUsers();
    } catch (err) {
      setStaffError(err.response?.data?.message || "Failed to delete staff user");
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPin !== confirmNewPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    if (currentPin === newPin) {
      setError("New PIN must be different from current PIN");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/auth/admin/change-pin", {
        currentPin,
        newPin,
        confirmNewPin,
      });

      setSuccess("PIN changed successfully! Share the new PIN with your staff.");
      setCurrentPin("");
      setNewPin("");
      setConfirmNewPin("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and organization settings
        </p>
      </div>

      {/* Staff Management Section */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Staff Management</h2>
        <p className="mb-6 text-sm text-gray-600">
          Create and manage staff users. Staff members will use their username and your PIN to login.
        </p>

        {/* Add Staff Form */}
        <form onSubmit={handleAddStaff} className="mb-6 space-y-4">
          {staffError && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {staffError}
            </div>
          )}

          {staffSuccess && (
            <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-600">
              {staffSuccess}
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium">Staff Username *</label>
              <input
                type="text"
                value={newStaffUsername}
                onChange={(e) => setNewStaffUsername(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="e.g., john_doe"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                disabled={addingStaff}
              >
                {addingStaff ? "Adding..." : "+ Add Staff"}
              </button>
            </div>
          </div>
        </form>

        {/* Staff List */}
        <div>
          <h3 className="mb-3 font-medium">Current Staff Members</h3>
          {loadingStaff ? (
            <div className="text-center text-gray-500">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <div className="rounded border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
              No staff members yet. Add your first staff member above.
            </div>
          ) : (
            <div className="space-y-2">
              {staffList.map((staff) => (
                <div
                  key={staff._id}
                  className="flex items-center justify-between rounded border bg-gray-50 p-3"
                >
                  <div>
                    <div className="font-medium">{staff.username}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(staff.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteStaff(staff._id, staff.username)}
                    className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Change PIN Section */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Change PIN</h2>
        <p className="mb-6 text-sm text-gray-600">
          Your PIN is shared with staff members for login. When you change it,
          make sure to inform all staff members of the new PIN.
        </p>

        <form onSubmit={handleChangePin} className="space-y-4">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Current PIN *</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded border p-2"
              placeholder="1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              New PIN (4 digits) *
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded border p-2"
              placeholder="1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Confirm New PIN *
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmNewPin}
              onChange={(e) =>
                setConfirmNewPin(e.target.value.replace(/\D/g, ""))
              }
              className="w-full rounded border p-2"
              placeholder="1234"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Changing PIN..." : "Change PIN"}
          </button>
        </form>
      </div>

      {/* PIN Sharing Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-2 font-semibold text-blue-900">
          📌 Sharing PIN with Staff
        </h3>
        <p className="text-sm text-blue-800">
          Your staff members need your PIN to login. Share it with them offline
          (in person, phone call, or secure messaging). They will use their
          username and your PIN to access the system.
        </p>
      </div>
    </div>
  );
}

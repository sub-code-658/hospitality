import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import api from "../services/axios";
import { useToast } from "../components/Toast";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user, login } = useAuth(); // login function might just save user data
  const { addToast } = useToast();

  // Profile update state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await api.put("/auth/profile", profileData);
      addToast(
        t("settings.profile_updated", "Profile updated successfully"),
        "success",
      );
      // Update context user if possible, but simple reload or rely on context re-fetch
    } catch (err) {
      addToast(
        err.response?.data?.message || t("common.error", "An error occurred"),
        "error",
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  const submitPasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast(
        t("settings.password_mismatch", "New passwords do not match"),
        "error",
      );
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      addToast(
        t("settings.password_changed", "Password changed successfully"),
        "success",
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      addToast(
        err.response?.data?.message || t("common.error", "An error occurred"),
        "error",
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>
        {t("common.settings", "Settings")}
      </h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <section
          className="p-6 rounded-lg"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            {t("settings.update_profile", "Update Profile")}
          </h2>
          <form onSubmit={submitProfileUpdate} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("common.name", "Name")}
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("common.phone", "Phone")}
              </label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("common.bio", "Bio")}
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows="3"
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              {updatingProfile
                ? t("common.saving", "Saving...")
                : t("common.save_changes", "Save Changes")}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section
          className="p-6 rounded-lg"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text)" }}
          >
            {t("settings.change_password", "Change Password")}
          </h2>
          <form onSubmit={submitPasswordUpdate} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("settings.current_password", "Current Password")}
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                required
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("settings.new_password", "New Password")}
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                required
                minLength="6"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--text-dim)" }}
              >
                {t("settings.confirm_password", "Confirm New Password")}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 rounded-md focus:outline-none"
                style={{
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                required
                minLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              {updatingPassword
                ? t("common.saving", "Saving...")
                : t("settings.update_password", "Update Password")}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

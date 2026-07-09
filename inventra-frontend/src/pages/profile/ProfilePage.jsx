import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Save } from "lucide-react";
import UserAvatar from "@/components/common/UserAvatar";
import apiClient from "@/api/axios";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [previewImage, setPreviewImage] = useState(user?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Sync formData and preview when user data changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setPreviewImage(user.profileImage || null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProfileImage = async () => {
    if (!selectedFile) {
      toast.error("No image selected");
      return;
    }

    setUploading(true);
    try {
      const formDataWithFile = new FormData();
      formDataWithFile.append("profileImage", selectedFile);

      const response = await apiClient.patch(
        `/auth/profile-image`,
        formDataWithFile,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updatedUser = response.data.user;

      updateUser(updatedUser);
      setSelectedFile(null);
      setPreviewImage(updatedUser.profileImage || null);
      toast.success("Profile image updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await apiClient.patch(
        `/auth/profile`,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }
      );

      const updatedUser = response.data.user;

      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setPreviewImage(user?.profileImage || null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information and profile settings</p>
        </div>

        {/* Profile Card */}
        <Card className="border-border/60 p-8 shadow-soft">
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-6 pb-8 border-b border-gray-200">
              <div className="relative">
                <UserAvatar user={user} size="xl" />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition shadow-lg">
                    <Upload className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Preview New Image */}
              {isEditing && selectedFile && (
                <div className="space-y-3 w-full">
                  <div className="relative inline-block">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleUploadProfileImage}
                    disabled={uploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewImage(user?.profileImage || null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel Upload
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500">Click the camera icon to change your profile picture</p>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-6">
              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-800">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="h-10 rounded-lg border border-gray-300 px-3 text-base"
                  />
                ) : (
                  <p className="text-base text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
                    {user?.fullName || "—"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-800">
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-10 rounded-lg border border-gray-300 px-3 text-base"
                  />
                ) : (
                  <p className="text-base text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
                    {user?.email || "—"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-800">
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="h-10 rounded-lg border border-gray-300 px-3 text-base"
                  />
                ) : (
                  <p className="text-base text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
                    {user?.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-800">Role</Label>
                <p className="text-base text-gray-700 py-2 px-3 bg-gray-50 rounded-lg capitalize">
                  {user?.role || "—"}
                </p>
              </div>

              {/* Account Status */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-800">Account Status</Label>
                <div className="flex items-center gap-2 py-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-base text-gray-700">Active</p>
                </div>
              </div>

              {/* Account Created */}
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-gray-800">Account Created</Label>
                <p className="text-base text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveChanges}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 font-semibold"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 rounded-lg h-10 font-semibold"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 font-semibold"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="border-border/60 p-6 shadow-soft bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-2">Profile Tips</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Keep your email up to date for important account notifications</li>
            <li>✓ A profile picture helps other team members identify you easily</li>
            <li>✓ Your contact information helps customers reach you</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

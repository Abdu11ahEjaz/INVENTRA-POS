import React from "react";

/**
 * UserAvatar Component
 * Shows user profile image if available, otherwise shows initials
 * 
 * Props:
 * - user: { fullName, profileImage, role }
 * - size: 'sm' (28px), 'md' (40px), 'lg' (56px), 'xl' (80px)
 * - showRole: boolean - show role initials instead of name
 */
const UserAvatar = ({ user, size = "md", showRole = false }) => {
  if (!user) return null;

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-2xl",
  };

  const getInitials = (name, role) => {
    if (showRole && role) {
      return role.charAt(0).toUpperCase();
    }
    if (!name || typeof name !== "string") {
      return role ? role.charAt(0).toUpperCase() : "U";
    }
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getBgColor = (role) => {
    const colors = {
      SuperAdmin: "bg-red-500",
      Admin: "bg-orange-500",
      Manager: "bg-yellow-500",
      Accountant: "bg-green-500",
      Sales: "bg-blue-500",
    };
    return colors[role] || "bg-gray-500";
  };

  const initials = getInitials(user.fullName, user.role);
  const bgColor = getBgColor(user.role);

  // If profile image exists, show it
  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={user.fullName}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        title={`${user.fullName} (${user.role})`}
      />
    );
  }

  // Otherwise show initials
  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm`}
      title={`${user.fullName} (${user.role})`}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;

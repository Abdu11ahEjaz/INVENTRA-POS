/**
 * Convert technical error messages to user-friendly messages
 */
export const getUserFriendlyError = (error) => {
  // If there's a custom message from the backend, use it
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    // Filter out technical details
    if (msg.includes("E11000") || msg.includes("duplicate key")) {
      return "This record already exists. Please try again.";
    }
    if (msg.includes("ValidationError")) {
      return "Please check your input and try again.";
    }
    if (msg.includes("CastError")) {
      return "Invalid ID format.";
    }
    return msg;
  }

  // Handle specific error types
  const errorMsg = error?.message || error?.toString() || "Unknown error";

  if (errorMsg.includes("E11000") || errorMsg.includes("duplicate")) {
    return "This record already exists.";
  }
  if (errorMsg.includes("404") || errorMsg.includes("not found")) {
    return "Record not found.";
  }
  if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
    return "You don't have permission to perform this action.";
  }
  if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
    return "Please log in again.";
  }
  if (errorMsg.includes("500") || errorMsg.includes("Internal Server")) {
    return "Server error. Please try again later.";
  }
  if (errorMsg.includes("Network") || errorMsg.includes("Failed to fetch")) {
    return "Connection error. Please check your internet.";
  }
  if (errorMsg.includes("ValidationError")) {
    return "Please check your input and try again.";
  }

  return "An error occurred. Please try again.";
};

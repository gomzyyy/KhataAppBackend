import { Owner, Partner, Employee } from "../models/index.js"; // Assuming you have these models in place
import mongoose from "mongoose";

// Function to check if the user is an Owner, Partner, or Employee and has permission to delete the customer
export const isOwnerOrPartnerOrEmployee = async (user, customerId) => {
  try {
    // Ensure the user object has a valid role
    if (!user || !user.role) {
      throw new Error("User role not found");
    }

    // Validate customerId format
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      throw new Error("Invalid customer ID format");
    }

    // Check based on user role
    let isAuthorized = false;
    if (user.role === "Owner") {
      // Owners have access to delete any customer
      isAuthorized = true;
    } else if (user.role === "Partner") {
      // Partners can delete customers if the customer is associated with them
      // (You can customize this based on your system's business logic)
      const partner = await Partner.findById(user._id);
      if (partner && partner.customers.includes(customerId)) {
        isAuthorized = true;
      }
    } else if (user.role === "Employee") {
      // Employees may only delete customers that belong to their department or group (if needed)
      // Example: Add logic to check if the employee has permission based on the customer
      const employee = await Employee.findById(user._id);
      if (employee && employee.department === customer.department) {
        isAuthorized = true;
      }
    }

    return isAuthorized;
  } catch (error) {
    console.error("Error in permission check:", error);
    return false; // Default to no permission if any error occurs
  }
};

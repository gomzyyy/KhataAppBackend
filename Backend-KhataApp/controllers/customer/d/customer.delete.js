import Customer from "../models/Customer.js";
import SoldProduct from "../models/SoldProduct.js";
import SoldProductPaymentHistory from "../models/SoldProductPaymentHistory.js";
import UnknownPaymentHistory from "../models/UnknownPaymentHistory.js";
import { isOwnerOrPartnerOrEmployee } from "../utils/permissions.js"; // Your permission checking function

export const deleteCustomer = async (req, res) => {
  try {
    // Step 1: Check if the user has permission to delete customer
    const user = req.user; // Assuming you have user details in req.user
    const customerId = req.params.id; // Customer ID from the URL params

    // Verify that the current user is an owner, partner, or employee (this can be customized based on your permission system)
    if (!isOwnerOrPartnerOrEmployee(user, customerId)) {
      return res.status(403).json({ message: "You don't have permission to delete this customer." });
    }

    // Step 2: Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Step 3: Remove all related data
    // Delete sold product data
    await SoldProduct.deleteMany({ buyer: customerId });

    // Delete payment history for sold products
    await SoldProductPaymentHistory.deleteMany({ reference: customerId });

    // Delete unknown payment history
    await UnknownPaymentHistory.deleteMany({ "details.to.name": customer.name });

    // Step 4: Delete the customer record
    await Customer.findByIdAndDelete(customerId);

    return res.status(200).json({ message: "Customer deleted successfully along with related data." });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

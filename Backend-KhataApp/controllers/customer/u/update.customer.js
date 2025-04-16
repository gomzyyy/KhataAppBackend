import mongoose from "mongoose";
import Customer from "../../../models/Customer.js";
import resType from "../../../lib/response.js";
import { uploadToCloudinary } from "../../../services/cloudinary.js";
import fs from "fs";
import { isOwnerOrPartnerOrEmployee } from "../../../helpers/permission.helper.js"; // ✅ your custom permission check

export const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const user = req.user; // ✅ assuming auth middleware sets req.user with full user object (including role & _id)

    // Validate Customer ID
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Invalid customer ID.",
        success: false,
      });
    }

    // Check if Customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Customer not found.",
        success: false,
      });
    }

    // ✅ Permission check using helper
    const isAllowed = await isOwnerOrPartnerOrEmployee(user, customerId);
    if (!isAllowed) {
      return res.status(resType.FORBIDDEN.code).json({
        message: "You do not have permission to update this customer.",
        success: false,
      });
    }

    // Prepare updated fields
    const updatedData = {
      name: req.body.name || customer.name,
      address: req.body.address || customer.address,
      phoneNumber: req.body.phoneNumber || customer.phoneNumber,
      email: req.body.email || customer.email,
    };

    // ✅ Handle image upload
    if (req.file && req.file.path) {
      const { path } = req.file;

      const { code, url } = await uploadToCloudinary({
        path,
        resourceType: "IMAGE",
      });

      // Clean up local image file
      fs.unlinkSync(path);

      if (code === resType.OK.code && url) {
        updatedData.image = url;
      } else {
        return res.status(resType.BAD_REQUEST.code).json({
          message: "Image upload to Cloudinary failed.",
          success: false,
        });
      }
    }

    // Perform update
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updatedData,
      { new: true }
    );

    return res.status(resType.OK.code).json({
      message: "Customer updated successfully.",
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: "Something went wrong.",
      success: false,
    });
  }
};

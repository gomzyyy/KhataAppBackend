import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../helpers/cloudinary.helper.js";
import Product from "../../models/product.model.js";
import { resType as r } from "../../lib/response.js";
import { isOwnerOrPartnerOrEmployee } from "../../helpers/permission.helper.js";

// Update Product Controller
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      name,
      productType,
      basePrice,
      discountedPrice,
      quantity,
      measurementType,
      measurementTypeDescription,
      stock,
      productCost,
      image,
    } = req.body;
    const userId = req.uid;
    const userRole = req.query.role;

    // Validate required fields
    if (
      !productId ||
      !name ||
      !productType ||
      !basePrice ||
      !quantity ||
      !stock ||
      !productCost
    ) {
      return res.status(r.BAD_REQUEST.code).json({
        message: "Missing required fields.",
        success: false,
      });
    }

    // Fetch the product to be updated
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(r.NOT_FOUND.code).json({
        message: "Product not found.",
        success: false,
      });
    }

    // Check if the user has permission to update the product
    const hasPermission =
      product.createdBy.toString() === userId.toString() ||
      (await isOwnerOrPartnerOrEmployee(
        { _id: userId, role: userRole },
        product.businessOwner.toString()
      ));

    if (!hasPermission) {
      return res.status(r.UNAUTHORIZED.code).json({
        message: "You do not have permission to update this product.",
        success: false,
      });
    }

    // If new image is provided, delete the old image from Cloudinary and upload the new one
    if (image) {
      // Delete the old image if it exists
      if (product.image) {
        const deleteResult = await deleteFromCloudinary(product.image);
        if (deleteResult.code !== r.OK.code) {
          return res.status(deleteResult.code).json({
            message: deleteResult.message,
            success: false,
          });
        }
      }

      // Upload the new image to Cloudinary
      const cloudinaryResponse = await uploadToCloudinary({ path: image });

      if (cloudinaryResponse.code !== r.OK.code || !cloudinaryResponse.url) {
        return res.status(cloudinaryResponse.code).json({
          message: "Failed to upload image to Cloudinary.",
          success: false,
        });
      }

      // Set the new image URL to the product
      product.image = cloudinaryResponse.url;
    }

    // Update product fields
    product.name = name;
    product.productType = productType;
    product.basePrice = basePrice;
    product.discountedPrice = discountedPrice;
    product.quantity = quantity;
    product.measurementType = measurementType;
    product.measurementTypeDescription = measurementTypeDescription;
    product.stock = stock;
    product.productCost = productCost;

    // Save updated product
    await product.save();

    return res.status(r.SUCCESS.code).json({
      message: "Product updated successfully.",
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(r.INTERNAL_SERVER_ERROR.code).json({
      message: error.message || r.INTERNAL_SERVER_ERROR.message,
      success: false,
    });
  }
};

import { AdminRole } from "../../constants/enums.js";
import resType from "../../lib/response.js";
import { Asset } from "../../models/index.js";
import { uploadToCloudinary } from "../../service/cloud.js";

export const setAssetDocController = async (req, res) => {
  try {
    const { assetId } = req.query;
    if (!assetId) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Cannot find asset from the database.",
        success: false,
      });
    }
    if (!req.file || !req.file.path) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "No media/file path found.",
        success: false,
      });
    }
    const { path } = req.file;
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(resType.NOT_FOUND.code).json({
        message: "Requested asset not found from the database.",
        success: false,
      });
    }
    const { code, url } = await uploadToCloudinary({
      path,
      resourceType: "RAW",
    });
    if (code !== resType.OK.code || !url || url.trim().length === 0) {
      return res.status(resType.BAD_REQUEST.code).json({
        message: "Failed to upload Media/File.",
        success: false,
      });
    }
    try {
      asset.documentUrl = url;
      await asset.save();
    } catch (error) {
      console.error("Error saving user image:", error);
      return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
        message: "Failed to save document.",
        success: false,
      });
    }

    return res.status(resType.OK.code).json({
      message: "Success.",
      data: { imageUrl: url },
      success: true,
    });
  } catch (error) {
    return res.status(resType.INTERNAL_SERVER_ERROR.code).json({
      message: `Internal server error.`,
      success: false,
    });
  }
};

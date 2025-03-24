import {resType as r} from "../../lib/response.js"

export const checkForUpdates =async(req,res)=>{
    try {
        const version = [process.env.CURRENT_APP_BASE_VERSION,process.env.CURRENT_APP_MAJOR_UPDATE_VERSION,process.env.CURRENT_APP_MINOR_UPDATE_VERSION]
        const currentVersion = version.join(".")
        return res.status(r.OK.code).json({
            message:"Success.",
            currentVersion,
            success:true
        })
    } 
    catch (error) {
        return res.status(r.INTERNAL_SERVER_ERROR.code).json({
            message:error instanceof Error ? error.message : r.INTERNAL_SERVER_ERROR.message,
            success:false
        })
    }
}
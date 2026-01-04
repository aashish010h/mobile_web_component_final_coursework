import axiosInstance from "./axiosInstance";
export const getAssets = async (page = 1, search = "", status = "") => {
    const params = { page };
    if (search) params.search = search;
    if (status) params.status = status;

    const response = await axiosInstance.get("/assets", { params });
    return response.data;
};

export const deleteAsset = async (id) => {
    return axiosInstance.delete(`/assets/${id}`);
};

export const createAsset = async (formData) => {
    return axiosInstance.post("/assets", formData, {
        headers: {
            "Content-Type": "multipart/form-data", // Critical for file uploads
        },
    });
};

export const getAsset = async (id) => {
    const response = await axiosInstance.get(`/assets/${id}`);
    return response.data;
};

export const updateAsset = async (id, formData) => {
    // Laravel requires POST with _method="PUT" to handle file uploads on updates
    formData.append("_method", "PUT");

    return axiosInstance.post(`/assets/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const downloadAssetFile = async (id, fallbackFilename) => {
    try {
        const response = await axiosInstance.get(`/assets/${id}/download`, {
            responseType: "blob", // Critical: Treat response as binary data
        });

        // 1. Safety Check: Is the response actually a JSON error?
        // Sometimes Laravel returns a 200 OK with JSON even if we asked for a blob
        if (
            response.headers["content-type"] &&
            response.headers["content-type"].includes("application/json")
        ) {
            const text = await response.data.text(); // Convert blob to text
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || "Download failed");
        }

        // 2. Try to get the real filename from headers
        let filename = fallbackFilename || `file-${id}`;
        const disposition = response.headers["content-disposition"];

        if (disposition && disposition.indexOf("attachment") !== -1) {
            // Regex to extract filename="example.txt"
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
            }
        }

        // 3. Trigger the Download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download Error:", error);
        // Re-throw so the UI can show a specific Toast
        throw error;
    }
};

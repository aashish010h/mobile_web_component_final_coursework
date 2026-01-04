import axiosInstance from "./axiosInstance";

export const getDashboardStats = async () => {
    const response = await axiosInstance.get("/dashboard-stats");
    return response.data;
};

export const exportMyData = async () => {
    const response = await axiosInstance.get("/gdpr/export");
    // The backend sends JSON directly, we return it to be saved
    return response.data;
};

export const deleteMyAccount = async () => {
    return axiosInstance.post("/gdpr/erasure");
};

export const getPolicies = async () => {
    const response = await axiosInstance.get("/policies");
    return response.data;
};

export const getPolicy = async (id) => {
    const response = await axiosInstance.get(`/policies/${id}`);
    return response.data;
};

export const publishPolicy = async (id) => {
    // We send today's date as the effective date
    const response = await axiosInstance.patch(`/policies/${id}/publish`, {
        effective_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    });
    return response.data;
};

export const deprecatePolicy = async (id) => {
    const response = await axiosInstance.patch(`/policies/${id}/deprecate`);
    return response.data;
};

export const createPolicy = async (data) => {
    return axiosInstance.post("/policies", data);
};

import { LoginSchemaType } from "@/schemas/loginSchema";
import axiosInstance from "./axiosInstance";

export async function getCsrfCookie() {
    await axiosInstance.get("/sanctum/csrf-cookie");
}

export async function login(credential: LoginSchemaType) {
    // await getCsrfCookie();
    const res = await axiosInstance.post("/login", credential);
    return res.data;
}

export async function getUser() {
    return axiosInstance.get("user");
}

export async function getUserWithId(id) {
    return axiosInstance.get(`users/${id}`);
}

export async function logoutUser() {
    return axiosInstance.post("logout");
}

export async function createUser(formData) {
    // 1. Pass the data (formData) as the second argument
    // 2. Use the correct RESTful endpoint ('/users')
    return axiosInstance.post("/users", formData);
}

export const getUsers = async (
    page = 1,
    search = "",
    role = "",
    options = {}
) => {
    // We filter out empty params so we don't send ?role=&search=
    const params = { page };
    if (search) params.search = search;
    if (role) params.role = role;

    const response = await axiosInstance.get(`users`, {
        params,
        ...options,
    });

    return response.data;
};

// Send the update
export async function updateUser(id, userData) {
    // We use PUT for updates
    return axiosInstance.put(`/users/${id}`, userData);
}

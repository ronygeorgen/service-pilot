import { axiosInstance } from "../../services/api";

export const CreateService = async(data)=>{
    return await axiosInstance.post('/data/api/services/', data);
}

export const serviceList = async(data)=>{
    return await axiosInstance.get('/data/api/services/', data);
}

export const serviceEdit = async(data)=>{
    return await axiosInstance.put(`/data/api/services/${data.id}/`, data);
}  

export const serviceDelete = async(id)=>{
    return await axiosInstance.delete(`/data/api/services/${id}/`);
}  

export const adminLogin = async(data)=>{
    return await axiosInstance.post(`/accounts/auth/login/`, data);
}   

export const globalSettings = async(data)=>{
    return await axiosInstance.post(`data/globalsettings/update/`, data);
} 

export const getGlobalSettings = async()=>{
    return await axiosInstance.get(`data/globalsettings/update/`);
} 
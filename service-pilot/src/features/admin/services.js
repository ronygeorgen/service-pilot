import { axiosInstance } from "../../services/api";

export const CreateService = async(data)=>{
    return await axiosInstance.post('/data/api/services/', data);
}

export const serviceList = async(data)=>{
    return await axiosInstance.get('/data/api/services/', data);
}

export const serviceEdit = async(data)=>{
    return await axiosInstance.put(`/data/api/services/${data.services[0].id}/`, data);
}   
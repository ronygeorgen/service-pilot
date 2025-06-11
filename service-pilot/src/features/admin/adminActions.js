import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../services/api";
import { adminLogin, CreateService, getGlobalSettings, globalSettings, serviceDelete, serviceEdit, serviceList } from "./services";

export const createService = createAsyncThunk('createService', async (data, {rejectWithValue})=>{
    try{
        const response = await CreateService(data)
        console.log(response.data, 'responses')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})

export const serviceListAction = createAsyncThunk('serviceList', async (data, {rejectWithValue})=>{
    try{
        const response = await serviceList(data)
        console.log(response.data, 'responses')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})

export const editServiceAction = createAsyncThunk('editService', async (data, {rejectWithValue})=>{
    try{
        console.log('eeditt', data);
        
        const response = await serviceEdit(data)
        console.log(response.data, 'responses edit')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})

export const deleteServiceAction = createAsyncThunk('deleteService', async (id, {rejectWithValue})=>{
    try{
        console.log('delete', id);
        
        const response = await serviceDelete(id)
        console.log(response.data, 'responses delete')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})

export const adminLoginAction = createAsyncThunk('adminLogin', async (data, {rejectWithValue})=>{
    try{
        console.log('login', data);
        
        const response = await adminLogin(data)
        console.log(response.data, 'responses login')
        localStorage.setItem("user_authenticated", "true");
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})

export const globalSettingsAction = createAsyncThunk('globalSettings', async (data, {rejectWithValue})=>{
    try{
        const response = await globalSettings(data)
        console.log(response.data, 'responses globalsettings')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})


export const getGlobalSettingsActions = createAsyncThunk('getGlobalSettings', async (_, {rejectWithValue})=>{
    try{
        const response = await getGlobalSettings()
        console.log(response.data, 'responses get globalsettings')
        return response.data
    }catch(error){
        console.log(error, 'error')
        return rejectWithValue(error.response?.data)
    }
})
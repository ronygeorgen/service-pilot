import {configureStore} from '@reduxjs/toolkit'
import adminReducer from './features/admin/adminSlice'

const store = configureStore({
    reducer:{
        admin:adminReducer
    }
})

export default store
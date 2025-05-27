import {configureStore} from '@reduxjs/toolkit'
import adminReducer from './features/admin/adminSlice'
import servicesReducer from './features/user/servicesSlice'
import contactsReducer from './features/user/contactsSlice'

const store = configureStore({
    reducer:{
        admin:adminReducer,
        services: servicesReducer,
        contacts: contactsReducer,
    }
})

export default store
import {configureStore} from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'

const store = configureStore({
    reducer:{
        auth:authSlice,
        // Add other slices here as needed
    }
})

export default store;
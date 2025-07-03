import {createSlice} from '@reduxjs/toolkit'

const storedUserData = localStorage.getItem('myAppState');
const initialState = {
    status: storedUserData !== null,
    userData: storedUserData ? JSON.parse(storedUserData) : {username:'Guest'}
};

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        login:(state,action)=>{
            state.status = true;
            state.userData = action.payload.userData;
            localStorage.setItem('myAppState', JSON.stringify(action.payload.userData));
        },
        logout:(state)=>{
            state.status = false;
            state.userData = null;
            localStorage.removeItem('myAppState');
        }
    }
})

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;
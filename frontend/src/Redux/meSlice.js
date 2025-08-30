import { createSlice } from '@reduxjs/toolkit';
const initialState={
    value:{}, 
}

const meSlice= createSlice({
    name:'me',
    initialState,
    reducers:{
        setMe:(state,action)=>{
            state.value = action.payload
        },
        deleteMe:(state)=>{
            state.value= {}
        } 
     }
})

export const { setMe,deleteMe } = meSlice.actions;
export default meSlice.reducer;

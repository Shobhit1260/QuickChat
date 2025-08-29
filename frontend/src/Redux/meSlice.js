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
        }  
     }
})

export const { setMe } = meSlice.actions;
export default meSlice.reducer;

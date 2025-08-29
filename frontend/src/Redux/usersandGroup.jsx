import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    value:{}
}

export const usersandGroupSlice=createSlice({
    name:'usersandGroup',
    initialState,
    reducers:{
        setUsersandGroup:(state,action)=>{
            state.value=action.payload;
        }
    }
})

export const  {setUsersandGroup} = usersandGroupSlice.actions;
export default usersandGroupSlice.reducer;
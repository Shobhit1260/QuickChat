import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import userReducer from './UserSlice';
import meReducer from './meSlice';
import usersandGroupReducer from './usersandGroup';
const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, meReducer);

export const store = configureStore({
  reducer: {
    userSelected: userReducer,
    me:persistedReducer,
    usersandGroup: usersandGroupReducer,
  },
})


export const persistor = persistStore(store);

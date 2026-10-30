import { configureStore } from "@reduxjs/toolkit";
import skillReducer from "./skillSlice";

export const store = configureStore({
  reducer: {
    skills: skillReducer,
  },
});

export default store;

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { NotifState } from "./notif.type";

const initialState: NotifState = {notifications: [],
};


export const notif = createSlice({
  name: "notif",
  initialState,
  reducers: {
    create: (
      state,
      action: PayloadAction<{
        id:string;
        title: string;
        text: string;
        hide: boolean;
    }>
    ) => {
      state.notifications= [...state.notifications, action.payload]
    },
    update: (
      state,
      action: PayloadAction<{
        id:string;
        title: string;
        text: string;
        hide: boolean;
    }>
    ) => {
      state.notifications = state.notifications.map((item)=>action.payload.id === item.id?({...item, ...action.payload}): item);
    },
    delete: (
      state,
      action: PayloadAction<{ id:string }>
    ) => {
      state.notifications = state.notifications.filter((item)=>action.payload.id !== item.id);
    },
  },
});

// Action creators are generated for each case reducer function
export const { create, update } =
  notif.actions;

export default notif.reducer;

import { createAsyncThunk } from "@reduxjs/toolkit";
import { create, update } from "./notif.slice";

export const notify = createAsyncThunk(
  "notif/notify",
  async (
    {
      title,
      text,
      timer,
    }: {
      title: string;
      text: string;
      timer: number;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const newData = {
        id: new Date().getTime().toString(),
        title,
        text,
        hide: false,
      };


      dispatch(create(newData));

      
    await new Promise((resolve) => setTimeout(resolve, timer));
  
      dispatch(update({...newData, hide: true}));

      return true;
    } catch (err) {
      rejectWithValue(err);
    }
  }
);

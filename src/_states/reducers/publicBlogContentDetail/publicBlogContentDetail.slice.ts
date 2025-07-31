import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { IPublicBlogContentDetailState } from "./publicBlogContentDetail.type";
import { fetchPublicBlogContentDetail } from "./publicBlogContentDetail.thunk";

const initialState: IPublicBlogContentDetailState = {
  loading: false,
  response: null,
  error: null,
  page: {
    of: 1,
    size: 5,
  },
  sort: [
    {by:"created_at", order: "desc"}
  ],
  filter: {}
};


export const publicBlogContentDetail = createSlice({
  name: "publicBlogContentDetail",
  initialState,
  reducers: {
    addPublicBlogContentDetail: (
      state,
      action: PayloadAction<{ title: string; content: string }>
    ) => {
      state.loading = false;
      state.response = {
        ...state.response,
        ...(!!state.response
          ? {
              result: {
                ...state.response.result,
                data: [...state.response.result.data, action.payload],
              },
            }
          : {}),
      } as typeof state.response;
    },
    setPage: (state, action: PayloadAction<{ of: number; size: number }>) => {
      state.page = action.payload;
    },
    setSort: (
      state,
      action: PayloadAction<{ by: string; order: "asc" | "desc" }[]>
    ) => {
      state.sort = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ [x: string]: any }>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPublicBlogContentDetail.pending, (state) => {
      state.loading=true;
    });
    builder.addCase(fetchPublicBlogContentDetail.fulfilled, (state, action) => {
      state.loading=false;
      state.response = action.payload;
    });
    builder.addCase(fetchPublicBlogContentDetail.rejected, (state, action) => {
      state.loading=false;
      state.error = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
export const { addPublicBlogContentDetail, setPage, setSort, setFilter } =
  publicBlogContentDetail.actions;

export default publicBlogContentDetail.reducer;

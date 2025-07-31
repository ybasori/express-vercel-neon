import { expandJSON } from "@src/helper/helper";
import { api } from "@src/_config/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBlogContent = createAsyncThunk(
  "blogContent/fetchBlogContent",
  async (
    {
      page,
      sort,
      filter,
      show,
    }: {
      page: { of: number; size: number };
      sort: { by: string; order: "asc" | "desc" }[];
      filter: { [x: string]: any };
      show: any[];
    },
    { rejectWithValue }
  ) => {
    try {
      let newFilter = {};
      Object.keys(filter).forEach((item) => {
        newFilter = { ...newFilter, [item]: encodeURI(`%${filter[item]}%`) };
      });

      const query = expandJSON({ page, sort, filter: newFilter, show })
        .map((item) => `${item.label}=${item.value}`)
        .join("&");

      const data = await fetch(`${api.DASHBOARD_BLOG_CONTENT_LIST}?${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => {
        return res.json();
      });

      if (data.statusCode < 400) {
        return data;
      }
      return rejectWithValue(data);
    } catch (err) {
      rejectWithValue(err);
    }
  }
);
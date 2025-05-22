import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://e-shopreact-production.up.railway.app";

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Products", "Users", "Characteristics", "Comments"],
  endpoints: () => ({}),
});

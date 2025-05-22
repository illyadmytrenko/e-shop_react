import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://e-shop-react-ehp2.onrender.com";

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Products", "Users", "Characteristics", "Comments"],
  endpoints: () => ({}),
});

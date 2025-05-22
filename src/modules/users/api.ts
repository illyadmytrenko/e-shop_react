import { baseApi } from "@/common/shared/api";
import { z } from "zod";
import { UserInfo } from "@/common/types/user-info";

const UserDtoSchema = z.object({
  userId: z.number(),
  userEmail: z.string(),
  userName: z.string(),
  userAddress: z.union([z.string(), z.null()]),
  userPostalCode: z.union([z.string(), z.null()]),
  userPhoneNumber: z.union([z.string(), z.null()]),
  userNotifications: z.union([z.string(), z.null()]),
  userBonusPoints: z.number(),
  userDiscount: z.union([z.number(), z.null()]),
});

export const userApi = baseApi.injectEndpoints({
  endpoints: (create) => ({
    getUser: create.query<UserInfo, number>({
      query: (userId) => `/user/${userId}`,
      providesTags: ["Users"],
      transformResponse: (res: unknown) => UserDtoSchema.parse(res),
    }),
    getUsers: create.query<UserInfo[], void>({
      query: () => "/users",
      providesTags: ["Users"],
      transformResponse: (res: unknown) => UserDtoSchema.array().parse(res),
    }),
    deleteUser: create.mutation<void, number>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: create.mutation<UserInfo, { id: number; data: Partial<UserInfo> }>({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
  overrideExisting: true,
});

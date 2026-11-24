import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/api/auth/` }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({ url: 'register', method: 'POST', body: credentials }),
    }),
    login: builder.mutation({
      query: (credentials) => ({ url: 'login', method: 'POST', body: credentials }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation } = authApi;

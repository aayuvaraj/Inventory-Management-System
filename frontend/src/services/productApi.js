import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearCredentials } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/products/`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(clearCredentials());
  return result;
};

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => '',
      providesTags: (result = []) => [
        ...result.map((product) => ({ type: 'Product', id: product._id })),
        { type: 'Product', id: 'LIST' },
      ],
    }),
    addProduct: builder.mutation({
      query: (product) => ({ url: '', method: 'POST', body: product }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...changes }) => ({ url: id, method: 'PUT', body: changes }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: id, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;

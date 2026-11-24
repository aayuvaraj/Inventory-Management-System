import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearCredentials } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api/integrations/`,
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

export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    lookupBarcode: builder.query({
      query: (barcode) => `barcode/${encodeURIComponent(barcode)}`,
    }),
  }),
});

export const { useLazyLookupBarcodeQuery } = integrationApi;

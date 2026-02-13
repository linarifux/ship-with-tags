import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const shipstationApi = createApi({
  reducerPath: 'shipstationApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api' }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    // We use getOrders to access the 1,000+ awaiting shipment items
    getOrders: builder.query({
      query: (params) => ({
        url: '/shipments',
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          // Mapping 'pending' to 'awaiting_shipment' for the API
          shipment_status: params.status === 'pending' ? 'awaiting_shipment' : params.status,
          sortBy: params.sortBy || 'OrderDate',
        },
      }),
      providesTags: ['Orders'],
    }),
  }),
});

export const { useGetOrdersQuery } = shipstationApi;
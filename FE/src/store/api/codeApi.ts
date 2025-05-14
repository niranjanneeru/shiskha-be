/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const codeApi = createApi({
  reducerPath: "codeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers: Headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: any) => ({
        url: "user/login",
        method: "POST",
        body: credentials,
      }),
    }),
    submitCode: builder.mutation({
      query: (body: any) => ({
        url: "/code/submit",
        method: "POST",
        body,
      }),
    }),

    getAssignmentTests: builder.query({
      query: (assignmentId: string) => `/assignments/${assignmentId}/tests`,
    }),

    getSpecialisations: builder.query({
      query: () => "learning/specialisations",
    }),

    getCourses: builder.query({
      query: (specialisationId: string) => `learning/specialisations/${specialisationId}`,
    }),
    getCourseDetails: builder.query({
      query: (courseId: string) => `learning/courses/${courseId}`,
    }),
    getCourseContents: builder.query({
      query: (courseId: string) => `learning/contents/${courseId}`,
    }),
  }),
});

export const {
  useSubmitCodeMutation,
  useGetAssignmentTestsQuery,
  useLoginMutation,
  useGetSpecialisationsQuery,
  useLazyGetCoursesQuery,
  useLazyGetCourseDetailsQuery,
  useLazyGetCourseContentsQuery
} = codeApi;

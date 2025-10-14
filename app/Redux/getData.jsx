import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFunction } from "../api/apiFunction";
import {
  createEmpProfile,
  employeeExpApi,
  getJobsApi,
  getCredits,
  getCreditsApi,
  createProfileApi,
  jobPostApi,
  getUnlockedApi,
  searchCandidateApi,
  appliedJobsApi,
} from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const updateTotalExp = async (employee) => {
  if (!employee?.updatedAt || !employee?.TotalExperience) {
    return;
  }

  const updateDate = new Date(employee.updatedAt);
  const today = new Date();
  const timeGap = today - updateDate;

  // convert ms → days
  const gapInDays = Math.floor(timeGap / (1000 * 60 * 60 * 24));

  let years = employee.TotalExperience.years || 0;
  let months = employee.TotalExperience.months || 0;

  if (gapInDays > 30) {
    months += 1;
    if (months >= 12) {
      years += 1;
      months = 0;
    }
  }

  const data = { years, months };

  const headers = { Authorization: `Bearer ${AsyncStorage.getItem("Token")}` };

  try {
    await apiFunction(employeeExpApi, null, data, "post", { headers });
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Experience",
      text2: "could not update Experience",
    });
  }
};

export const fetchUserProfile = createAsyncThunk(
  "getData/fetchUserProfile",
  async () => {
    const response = await apiFunction(
      createEmpProfile,
      null,
      null,
      "get",
      true
    );
    if (response) {
      updateTotalExp(response.data);
      return response.data;
    }
  }
);

export const fetchEmployerProfile = createAsyncThunk(
  "getData/fetchEmployerProfile",
  async () => {
    const response = await apiFunction(
      createProfileApi,
      null,
      null,
      "get",
      true
    );
    if (response) {
      return response.data;
    }
  }
);

export const fetchJobs = createAsyncThunk("getData/fetchJobs", async () => {
  const response = await apiFunction(getJobsApi, null, null, "get", true);
  if (response) {
    return response.data;
  }
});

export const fetchJobsById = createAsyncThunk(
  "getData/fetchJobsById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiFunction(jobPostApi, [id], null, "get", true);
      if (response) {
        return response.data;
      }
    } catch (error) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const fetchAppliedJobs = createAsyncThunk(
  "getData/fetchAppliedJobs",
  async () => {
    try {
      const response = await apiFunction(
        appliedJobsApi,
        null,
        null,
        "get",
        true
      );
      if (response) {
        return response.data;
      }
    } catch (e) {
    }
  }
);

export const fetchCredits = createAsyncThunk(
  "getData/fetchCredits",
  async () => {
    const response = await apiFunction(getCreditsApi, null, null, "get", true);

    if (response) {
      if (response.data.length <= 0) {
        Toast.show({
          type: "error",
          text1: "Credits",
          text2: "No credits",
        });
      } else {
        return response;
      }
    }
  }
);

const initialState = {
  employee: null,
  employer: null,
  jobs: null,
  loading: false,
  error: null,
  jobCredit: null,
  appliedJobs: null,
  dataBaseCredit: null,
  creditsData: null,
  jobData: null,
  jobsById: null,
};

const getDataSlice = createSlice({
  name: "getData",
  initialState,
  reducers: {
    deleteEmployee: (state) => {
      state.employee = null;
    },
    setJobData: (state, action) => {
      state.jobData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAppliedJobs.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedJobs = action.payload;
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // fetchJobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.jobCredit = action?.payload?.totalActiveJobCredits;
        state.creditsData = action?.payload?.data;
        state.dataBaseCredit = action?.payload?.totalActiveDatabaseCredits;
      })
      .addCase(fetchCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.jobCredit = null;
        state.dataBaseCredit = null;
        state.creditsData = null;
      })
      .addCase(fetchEmployerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.employer = action.payload;
      })
      .addCase(fetchEmployerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobsById.fulfilled, (state, action) => {
        state.loading = false;
        state.jobsById = action.payload;
      })
      .addCase(fetchJobsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.jobsById = null;
      });
  },
});

export const { deleteEmployee, setJobData } = getDataSlice.actions;

export default getDataSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/project-proposal",
        data,
      );
      toast.success(response.data.message || "Proposal submitted successfully");
      return response.data.data?.project || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Proposal submission failed",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/project");
      return response.data.data?.Project || response.data.data || response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/supervisor");
      return (
        response.data.data?.supervisor || response.data.data || response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch supervisor",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchAllSupervisors = createAsyncThunk(
  "student/fetchAllSupervisors",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/student/fetch-supervisors");
      return (
        response.data.data?.supervisors || response.data.data || response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch supervisors",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/student/request-supervisor",
        data,
      );
      // thunkAPI.dispatch(getSupervisor());
      toast.success(response.data.message || "Supervisor request sent");
      return response.data.data?.request || response.data.data || response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request supervisor",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      const form = new FormData();
      for (const file of files) {
        form.append("files", file);
      }
      const response = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success(response.data.message || "Files uploaded successfully");
      return response.data.data?.files || response.data.data || response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchDashboardStats = createAsyncThunk(
  "fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        "/student/fetch-dashboard-stats",
      );
      return (
        response.data.data?.dashboardStats ||
        response.data.data ||
        response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getFeedback = createAsyncThunk(
  "getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/student/feedback/${projectId}`,
      );
      return (
        response.data.data?.feedback || response.data.data || response.data
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch feedback");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const downloadFile = createAsyncThunk(
  "downloadFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
      );
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitProposal.fulfilled, (state, action) => {
        state.project = action.payload?.project || action.payload;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.project = action.payload?.project || action.payload || null;
        state.files = action.payload?.files || action.payload || [];
      })
      .addCase(getSupervisor.fulfilled, (state, action) => {
        state.supervisor = action.payload?.supervisor || action.payload || null;
      })
      .addCase(fetchAllSupervisors.fulfilled, (state, action) => {
        state.supervisors = action.payload?.supervisors || action.payload || [];
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        const newFiles = action.payload?.files || action.payload || [];
        state.files = [...state.files, ...newFiles];
      })
      .addCase(requestSupervisor.fulfilled, (state, action) => {
        state.status = action.payload?.status || action.payload || null;
      })
      .addCase(requestSupervisor.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats =
          action.payload?.dashboardStats || action.payload || null;
      })
      .addCase(getFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload?.feedback || action.payload || null;
      });
  },
});

export default studentSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getTeacherDashboardStats = createAsyncThunk(
  "getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        "/teacher/fetch-dashboard-stats",
      );
      return response.data.data.dashboardStats || response.data.data || null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );
      return response.data.data.requests || response.data.data || null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const acceptTeacherRequest = createAsyncThunk(
  "acceptTeacherRequest",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/teacher/requests/${id}/accept`,
      );
      toast.success(response.data.message || "Request accepted successfully");
      return response.data.data.request || response.data.data || null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const rejectTeacherRequest = createAsyncThunk(
  "rejectTeacherRequest",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/teacher/requests/${id}/reject`,
      );
      toast.success(response.data.message || "Request rejected successfully");
      return response.data.data.request || response.data.data || null;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markProjectAsComplete = createAsyncThunk(
  "markProjectAsComplete",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/teacher/mark-complete/${projectId}`,
      );
      toast.success(response.data.message || "Project marked as complete");
      return { projectId };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark project as complete",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload,
      );
      toast.success(response.data.message || "Feedback added successfully");
      return {
        projectId,
        feedback: response.data.data?.feedback || response.data.data || null,
      };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add feedback");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/teacher/assigned-students");
      return (
        response.data.data?.students || response.data.data || response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const downloadTeacherFile = createAsyncThunk(
  "downloadTeacherFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText); // Parse the text back to JSON

        toast.error(errorJson.message || "Failed to download file");
        return thunkAPI.rejectWithValue(errorJson.message);
      }

      const errorMsg =
        error.response?.data?.message || "Failed to download file";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(errorMsg);
    }
  },
);
export const getTeacherFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/teacher/files`);
      return response.data.data?.files || response.data.data || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch files");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || null;
    });
    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      state.list = action.payload?.requests || action.payload || null;
    });
    builder.addCase(acceptTeacherRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;
      state.list = state.list.filter(
        (request) => request._id !== updatedRequest._id,
      );
      state.list.push(updatedRequest);
    });
    builder.addCase(rejectTeacherRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter(
        (request) => request._id !== rejectedRequest._id,
      );
      state.list.push(rejectedRequest);
    });
    builder.addCase(markProjectAsComplete.fulfilled, (state, action) => {
      const { projectId } = action.payload;
      state.assignedStudents = state.assignedStudents.map((student) => {
        if (student.project?._id === projectId) {
          return {
            ...student,
            project: { ...student.project, status: "completed" },
          };
        }
        return student;
      });
    });
    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((student) => {
        // Check if the student's project ID matches the feedback's project ID
        if (student.project?._id === projectId) {
          const updatedFeedback = student.project.feedback
            ? [...student.project.feedback, feedback]
            : [feedback];
          return {
            ...student,
            project: { ...student.project, feedback: updatedFeedback },
          };
        }
        return student;
      });
    });

    builder.addCase(getAssignedStudents.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch assigned students";
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.assignedStudents = action.payload?.students || action.payload || [];
      state.loading = false;
    });
    //   const { blob, projectId, fileId } = action.payload;
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement("a");
    //   link.href = url;
    //   link.setAttribute("download", `file_${projectId}_${fileId}`);
    //   document.body.appendChild(link);
    //   link.click();
    //   link.remove();
    // });

    builder.addCase(getTeacherFiles.fulfilled, (state, action) => {
      state.files = action.payload?.files || action.payload || [];
      state.loading = false;
    });
  },
});

export default teacherSlice.reducer;

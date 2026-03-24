import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// ==============================
// 1. STUDENT THUNKS
// ==============================

export const createStudent = createAsyncThunk(
  "createStudent", // Fixed typo "createStudet"
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/admin/create-student", data);
      toast.success(response.data.message || "Student created successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Student creation failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateStudent = createAsyncThunk(
  "updateStudent", // Fixed typo "updateStudet"
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/update-student/${id}`,
        data,
      );
      toast.success(response.data.message || "Student updated successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteStudent = createAsyncThunk(
  "deleteStudent",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-student/${id}`,
      );
      toast.success(response.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// ==============================
// 2. TEACHER THUNKS
// ==============================

export const createTeacher = createAsyncThunk(
  "createTeacher",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(response.data.message || "Teacher created successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Teacher creation failed");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateTeacher = createAsyncThunk(
  "updateTeacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/admin/update-teacher/${id}`,
        data,
      );
      toast.success(response.data.message || "Teacher updated successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteTeacher = createAsyncThunk(
  "deleteTeacher",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/delete-teacher/${id}`,
      );
      toast.success(response.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// ==============================
// 3. COMMON THUNKS
// ==============================

// Allows the component to call "deleteUser" generically if needed
// You can remove this if you strictly use deleteTeacher/deleteStudent
export const deleteUser = deleteTeacher;

export const getAllUsers = createAsyncThunk(
  "getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/admin/users");
      // Safety check: ensure we return an array
      return response.data.data.users || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllProjects = createAsyncThunk(
  "getAllProjects",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/admin/projects");
      return response.data.data.projects || [];
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getDashboardStats = createAsyncThunk(
  "getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/admin/dashboard-stats");
      return response.data.data.stats || response.data.data || null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const assignSupervisor = createAsyncThunk(
  "assignSupervisor",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        "/admin/assign-supervisor",
        data,
      );
      toast.success(
        response.data.message || "Supervisor assigned successfully",
      );
      return response.data.data.supervisor || response.data.data || null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to assign supervisor",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const approveProject = createAsyncThunk(
  "approveProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/admin/project/${projectId}`, {
        status: "approved",
      });
      toast.success(response.data.message || "Project approved successfully");
      return projectId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const rejectProject = createAsyncThunk(
  "rejectProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/admin/project/${projectId}`, {
        status: "rejected",
      });
      toast.success(response.data.message || "Project rejected successfully");
      return projectId;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);
export const getProject = createAsyncThunk(
  "getProject",
  async (projectId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/admin/project/${projectId}`);

      return (
        response.data?.data?.project ||
        response.data?.data ||
        response.data ||
        null
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// ==============================
// SLICE LOGIC
// ==============================

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [], // Main list for ManageTeachers
    loading: false,
    stats: null,
    projects: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Get All Users ---
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload || [];
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Student Handlers ---
      .addCase(createStudent.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        // ✅ The Fix: Using findIndex is more reliable for updates
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })

      // --- Teacher Handlers ---
      .addCase(createTeacher.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        // ✅ The Fix: Directly update the item in the array
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id,
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload || null;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(approveProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "approved" } : p,
        );
      })
      .addCase(rejectProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "rejected" } : p,
        );
      });
  },
});

export default adminSlice.reducer;

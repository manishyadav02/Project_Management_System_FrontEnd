import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// login
export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try {
    const response = await axiosInstance.post("/auth/login", data, {
      headers: { "Content-Type": "application/json" },
    });
    toast.success(response.data.message || "Login successful");
    return response.data.user;
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

// forgotPassword
export const forgotPassword = createAsyncThunk(
  "forgotPassword",
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/auth/password/forgot", {
        email,
      });
      toast.success(
        response.data.message || "Password reset link sent to your email"
      );
      return null;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send password reset link"
      );
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// resetPassword
export const resetPassword = createAsyncThunk(
  "resetPassword",
  async ({ token, password, confirmPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/auth/password/reset/${token}`,
        {
          password,
          confirmPassword,
        }
      );
      toast.success(response.data.message || "Password reset successfully");
      return response.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// getUser
export const getUser = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data || "Error fetching user"
    );
  }
});

// logOut
export const logOut = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    toast.success(response.data.message || "Logged out successfully");
    return null;
  } catch (error) {
    toast.error(error.response?.data?.message || "Logout failed");
    return thunkAPI.rejectWithValue(
      error.response?.data || "Error during logout"
    );
  }
});

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: true,
  },
  extraReducers: (builder) => {
    builder
      // Login Cases
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })

      // getUser Cases
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuth = true;
        // Optimization: Don't set authUser to null here to prevent UI flashing
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(getUser.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null; // Only clear user if check fails
      })

      // logOut Cases
      .addCase(logOut.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logOut.rejected, (state) => {
        // ✅ FIX: Force logout even if backend fails
        state.authUser = null;
      })

      // forgotPassword Cases
      .addCase(forgotPassword.pending, (state) => {
        state.isRequestingForToken = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isRequestingForToken = false;
      })
      .addCase(forgotPassword.rejected, (state) => {
        state.isRequestingForToken = false;
      })

      // resetPassword Cases
      .addCase(resetPassword.pending, (state) => {
        state.isUpdatingPassword = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isUpdatingPassword = false;
        state.authUser = action.payload;
      })
      .addCase(resetPassword.rejected, (state) => {
        state.isUpdatingPassword = false;
      });
  },
});

export default authSlice.reducer;
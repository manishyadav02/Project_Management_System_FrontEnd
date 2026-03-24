import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const getNotifications = createAsyncThunk(
  "getNotifications",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/notification");
      return response.data?.data || response.data || [];
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch notifications",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markAsRead = createAsyncThunk(
  "markAsRead",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/notification/${id}/read`);
      return (
        response.data?.data?.notification ||
        response.data?.notification ||
        response.data
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark notification as read",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const markAllAsRead = createAsyncThunk(
  "markAllAsRead",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.put("/notification/read-all");
      toast.success(
        response.data.message || "All notifications marked as read",
      );
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to mark all as read",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "deleteNotification",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/notification/${id}/delete`);
      toast.success(response.data.message || "Notification deleted");
      return id;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete notification",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    list: [],
    unreadCount: 0,
    readCount: 0,
    highPriorityMessages: 0,
    thisWeekNotifications: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getNotifications.fulfilled, (state, action) => {
      state.list = action.payload?.notifications || action.payload || [];
      state.unreadCount = action.payload?.unreadOnly || action.payload || 0;
      state.readCount = action.payload?.readOnly || action.payload || 0;
      state.highPriorityMessages =
        action.payload?.highPriorityMessages || action.payload || 0;
      state.thisWeekNotifications =
        action.payload?.thisWeekNotifications || action.payload || 0;
    });
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const updatedNotification = action.payload;

      // 1. Find the exact notification in the state
      const existingNotification = state.list.find(
        (n) => n._id === updatedNotification._id,
      );

      // 2. Directly update it (Immer handles the immutability behind the scenes)
      if (existingNotification) {
        existingNotification.isRead = true; // Or use Object.assign to copy all new backend fields
        // Object.assign(existingNotification, updatedNotification);
      }

      // 3. Bulletproof counter recalculation
      state.unreadCount = state.list.filter((n) => !n.isRead).length;
      state.readCount = state.list.filter((n) => n.isRead).length;
    });

    builder.addCase(markAllAsRead.fulfilled, (state, action) => {
      state.list.forEach((n) => {
        n.isRead = true;
      });

      state.unreadCount = 0;

      state.readCount = state.list.length;
    });
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      // 1. Remove the notification
      state.list = state.list.filter((n) => n._id !== action.payload);

      // 2. Bulletproof recalculations based ONLY on the remaining items!
      state.unreadCount = state.list.filter((n) => !n.isRead).length;
      state.readCount = state.list.filter((n) => n.isRead).length;

      // 3. Add back your high priority counter using the same safe method
      state.highPriorityMessages = state.list.filter(
        (n) => n.priority === "high",
      ).length;
    });
  },
});

export default notificationSlice.reducer;

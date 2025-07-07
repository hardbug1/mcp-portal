import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Workflow } from '../../types/workflow';
import { workflowService, type WorkflowStats, type DashboardData } from '../../services/workflowService';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  isDashboardLoading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  dashboardData: null,
  isLoading: false,
  isDashboardLoading: false,
  error: null,
};

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflow/fetchWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const workflows = await workflowService.getWorkflows();
      return workflows;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workflows');
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'workflow/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const dashboardData = await workflowService.getDashboardData();
      return dashboardData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkflow: (state, action: PayloadAction<Workflow | null>) => {
      state.currentWorkflow = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isDashboardLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentWorkflow } = workflowSlice.actions;
export default workflowSlice.reducer; 
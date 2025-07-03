import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Workflow } from '../../types/workflow';
import { apiClient } from '../../services/api';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  workflows: [],
  currentWorkflow: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchWorkflows = createAsyncThunk(
  'workflow/fetchWorkflows',
  async (_, { rejectWithValue }) => {
    try {
      const workflows = await apiClient.get<Workflow[]>('/workflows');
      return workflows;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workflows');
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
      });
  },
});

export const { clearError, setCurrentWorkflow } = workflowSlice.actions;
export default workflowSlice.reducer; 
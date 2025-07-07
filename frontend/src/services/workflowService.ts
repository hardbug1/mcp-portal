import apiService from './api';
import type { Workflow, CreateWorkflowRequest, UpdateWorkflowRequest } from '../types/workflow';

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  weeklyExecutions: number;
}

export interface DashboardData {
  stats: WorkflowStats;
  recentWorkflows: Workflow[];
}

class WorkflowService {
  async getDashboardData(): Promise<DashboardData> {
    const [workflows, stats] = await Promise.all([
      this.getWorkflows(),
      this.getStats(),
    ]);

    // 최근 5개 워크플로우만 반환
    const recentWorkflows = workflows.slice(0, 5);

    return {
      stats,
      recentWorkflows,
    };
  }

  async getStats(): Promise<WorkflowStats> {
    return apiService.get<WorkflowStats>('/workflows/stats');
  }

  async getWorkflows(): Promise<Workflow[]> {
    return apiService.get<Workflow[]>('/workflows');
  }

  async getWorkflow(id: string): Promise<Workflow> {
    return apiService.get<Workflow>(`/workflows/${id}`);
  }

  async createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    return apiService.post<Workflow>('/workflows', data);
  }

  async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
    return apiService.put<Workflow>(`/workflows/${id}`, data);
  }

  async deleteWorkflow(id: string): Promise<void> {
    return apiService.delete<void>(`/workflows/${id}`);
  }

  async executeWorkflow(id: string, inputs?: any): Promise<any> {
    return apiService.post<any>(`/workflows/${id}/execute`, { inputs });
  }

  async duplicateWorkflow(id: string): Promise<Workflow> {
    return apiService.post<Workflow>(`/workflows/${id}/duplicate`);
  }
}

export const workflowService = new WorkflowService();
export default workflowService; 
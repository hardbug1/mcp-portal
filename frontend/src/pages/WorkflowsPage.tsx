import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchWorkflows } from '../store/slices/workflowSlice';
import { workflowService } from '../services/workflowService';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ToastContainer';
import {
  PlusIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import type { Workflow } from '../types/workflow';

const WorkflowsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { workflows, isLoading, error } = useAppSelector((state) => state.workflow);
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created'>('updated');
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchWorkflows());
  }, [dispatch]);

  // 필터링 및 정렬된 워크플로우
  const filteredWorkflows = workflows
    .filter((workflow) => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflows(prev => 
      prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleSelectAll = () => {
    setSelectedWorkflows(
      selectedWorkflows.length === filteredWorkflows.length 
        ? [] 
        : filteredWorkflows.map(w => w.id)
    );
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (confirm('정말로 이 워크플로우를 삭제하시겠습니까?')) {
      try {
        await workflowService.deleteWorkflow(workflowId);
        dispatch(fetchWorkflows());
        showSuccess('워크플로우 삭제됨', '워크플로우가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('워크플로우 삭제 실패:', error);
        showError('삭제 실패', '워크플로우 삭제에 실패했습니다.');
      }
    }
  };

  const handleDuplicateWorkflow = async (workflowId: string) => {
    try {
      await workflowService.duplicateWorkflow(workflowId);
      dispatch(fetchWorkflows());
      showSuccess('워크플로우 복사됨', '워크플로우가 성공적으로 복사되었습니다.');
    } catch (error) {
      console.error('워크플로우 복사 실패:', error);
      showError('복사 실패', '워크플로우 복사에 실패했습니다.');
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await workflowService.executeWorkflow(workflowId);
      showSuccess('워크플로우 실행됨', '워크플로우가 성공적으로 실행되었습니다.');
    } catch (error) {
      console.error('워크플로우 실행 실패:', error);
      showError('실행 실패', '워크플로우 실행에 실패했습니다.');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedWorkflows.length === 0) {
      showWarning('선택된 워크플로우가 없습니다', '작업할 워크플로우를 선택해주세요.');
      return;
    }

    const actionText = {
      activate: '활성화',
      deactivate: '비활성화',
      delete: '삭제'
    }[action];

    if (action === 'delete' && !confirm(`선택된 ${selectedWorkflows.length}개 워크플로우를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const promises = selectedWorkflows.map(async (workflowId) => {
        switch (action) {
          case 'delete':
            return workflowService.deleteWorkflow(workflowId);
          case 'activate':
          case 'deactivate':
            // 워크플로우 상태 업데이트 API 호출 (나중에 구현)
            return Promise.resolve();
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      
      if (action === 'delete') {
        dispatch(fetchWorkflows());
        setSelectedWorkflows([]);
      }

      showSuccess(
        `일괄 ${actionText} 완료`,
        `${selectedWorkflows.length}개 워크플로우가 ${actionText}되었습니다.`
      );
    } catch (error) {
      console.error(`일괄 ${actionText} 실패:`, error);
      showError(`일괄 ${actionText} 실패`, `일부 워크플로우 ${actionText}에 실패했습니다.`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">워크플로우</h1>
            <p className="mt-2 text-sm text-gray-700">
              MCP 서버를 생성하고 관리하는 워크플로우 목록입니다.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link to="/workflows/new" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              새 워크플로우
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="워크플로우 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="updated">최근 수정순</option>
              <option value="created">생성일순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedWorkflows.length > 0 && (
          <div className="mt-4 bg-primary-50 border border-primary-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-700">
                {selectedWorkflows.length}개 워크플로우 선택됨
              </span>
                             <div className="flex gap-2">
                 <button 
                   onClick={() => handleBulkAction('activate')}
                   className="btn-secondary text-sm"
                 >
                   일괄 활성화
                 </button>
                 <button 
                   onClick={() => handleBulkAction('deactivate')}
                   className="btn-secondary text-sm"
                 >
                   일괄 비활성화
                 </button>
                 <button 
                   onClick={() => handleBulkAction('delete')}
                   className="btn-secondary text-sm text-red-600"
                 >
                   일괄 삭제
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-500">워크플로우를 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="mt-8 text-center py-12">
            <p className="text-red-600">워크플로우를 불러오는데 실패했습니다.</p>
            <button
              onClick={() => dispatch(fetchWorkflows())}
              className="mt-2 text-primary-600 hover:text-primary-500"
            >
              다시 시도
            </button>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          workflows.length === 0 ? (
            /* Empty State - No workflows */
            <div className="text-center py-12">
              <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">워크플로우가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                첫 번째 워크플로우를 만들어 MCP 서버를 생성해보세요.
              </p>
              <div className="mt-6">
                <Link to="/workflows/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  새 워크플로우 만들기
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State - No search results */
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">검색 결과가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                다른 검색어를 시도하거나 필터를 변경해보세요.
              </p>
            </div>
          )
        ) : (
          /* Workflow List */
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 sm:px-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedWorkflows.length === filteredWorkflows.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    워크플로우 ({filteredWorkflows.length})
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredWorkflows.map((workflow) => (
                  <li key={workflow.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedWorkflows.includes(workflow.id)}
                            onChange={() => handleSelectWorkflow(workflow.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center">
                              <h3 className="text-sm font-medium text-gray-900">
                                {workflow.name}
                              </h3>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                workflow.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {workflow.status === 'active' ? '활성' : '비활성'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {workflow.description || '설명이 없습니다.'}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>생성: {formatDate(workflow.createdAt)}</span>
                              <span className="mx-2">•</span>
                              <span>수정: {formatDate(workflow.updatedAt)}</span>
                              {workflow.nodes && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{workflow.nodes.length}개 노드</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="실행"
                          >
                            <PlayIcon className="h-5 w-5" />
                          </button>
                          
                          <Link
                            to={`/workflows/${workflow.id}`}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="편집"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => handleDuplicateWorkflow(workflow.id)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title="복사"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          
                          <Menu as="div" className="relative">
                            <Menu.Button className="p-1 text-gray-600 hover:text-gray-700">
                              <ChevronDownIcon className="h-5 w-5" />
                            </Menu.Button>
                            <Transition
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <Link
                                        to={`/workflows/${workflow.id}`}
                                        className={`${active ? 'bg-gray-100' : ''} flex px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <EyeIcon className="mr-3 h-5 w-5" />
                                        상세 보기
                                      </Link>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleDuplicateWorkflow(workflow.id)}
                                        className={`${active ? 'bg-gray-100' : ''} flex w-full px-4 py-2 text-sm text-gray-700`}
                                      >
                                        <DocumentDuplicateIcon className="mr-3 h-5 w-5" />
                                        복사하기
                                      </button>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() => handleDeleteWorkflow(workflow.id)}
                                        className={`${active ? 'bg-gray-100' : ''} flex w-full px-4 py-2 text-sm text-red-700`}
                                      >
                                        <TrashIcon className="mr-3 h-5 w-5" />
                                        삭제하기
                                      </button>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    </div>
  );
};

export default WorkflowsPage; 
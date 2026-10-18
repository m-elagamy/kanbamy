import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";
import {
  type BoardFilters,
  DEFAULT_BOARD_FILTERS,
  getBoardFilterKey,
  type TaskState,
  type TaskStore,
} from "@/lib/types/stores/task";
import type { ClientTask } from "@/lib/types";

function checkTaskMatchesFilter(task: ClientTask, filter: BoardFilters): boolean {
  if (filter.priorities && filter.priorities.length > 0) {
    if (!filter.priorities.includes(task.priority)) {
      return false;
    }
  }
  if (filter.tags && filter.tags.length > 0) {
    if (!task.tags || !task.tags.some((t) => filter.tags.includes(t))) {
      return false;
    }
  }
  return true;
}

const initialState: TaskState = {
  activeBoardId: null,
  tasks: {},
  columnTaskIds: {},
  columnPages: {},
  columnFilterCache: {},
  activeTaskId: null,
  optimisticOperations: {},
};

const createOperationId = () => crypto.randomUUID();

export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      initializeTaskPages: (boardId, pages) => {
        set((state) => {
          state.activeBoardId = boardId;
          state.tasks = {};
          state.columnTaskIds = {};
          state.columnPages = {};
          state.columnFilterCache = {};
          state.activeTaskId = null;
          state.optimisticOperations = {};

          const defaultKey = getBoardFilterKey(DEFAULT_BOARD_FILTERS);

          for (const page of pages) {
            const taskIds = page.tasks.map((task) => task.id);
            state.columnTaskIds[page.columnId] = taskIds;
            state.columnPages[page.columnId] = {
              nextCursor: page.nextCursor,
              totalCount: page.totalCount,
              isLoading: false,
              error: null,
              filter: DEFAULT_BOARD_FILTERS,
            };
            if (!state.columnFilterCache[page.columnId]) {
              state.columnFilterCache[page.columnId] = {};
            }
            state.columnFilterCache[page.columnId][defaultKey] = {
              taskIds: [...taskIds],
              nextCursor: page.nextCursor,
              totalCount: page.totalCount,
            };
            for (const task of page.tasks) {
              state.tasks[task.id] = task;
            }
          }
        });
      },

      replaceColumnTaskPage: (
        columnId,
        tasks,
        nextCursor,
        filter,
        totalCount,
      ) => {
        set((state) => {
          const taskIds = tasks.map((task) => task.id);
          state.columnTaskIds[columnId] = taskIds;
          for (const task of tasks) state.tasks[task.id] = task;

          state.columnPages[columnId] = {
            nextCursor,
            totalCount,
            isLoading: false,
            error: null,
            filter,
          };

          const filterKey = getBoardFilterKey(filter);
          if (!state.columnFilterCache[columnId]) {
            state.columnFilterCache[columnId] = {};
          }
          state.columnFilterCache[columnId][filterKey] = {
            taskIds: [...taskIds],
            nextCursor,
            totalCount,
          };
        });
      },

      appendColumnTaskPage: (columnId, tasks, nextCursor) => {
        set((state) => {
          const ids = state.columnTaskIds[columnId] ?? [];
          const existingIds = new Set(ids);
          for (const task of tasks) {
            state.tasks[task.id] = task;
            if (!existingIds.has(task.id)) {
              ids.push(task.id);
              existingIds.add(task.id);
            }
          }
          state.columnTaskIds[columnId] = ids;

          const page = state.columnPages[columnId];
          if (page) {
            page.nextCursor = nextCursor;
            page.isLoading = false;
            page.error = null;

            const filterKey = getBoardFilterKey(page.filter);
            if (!state.columnFilterCache[columnId]) {
              state.columnFilterCache[columnId] = {};
            }
            state.columnFilterCache[columnId][filterKey] = {
              taskIds: [...ids],
              nextCursor,
              totalCount: page.totalCount,
            };
          }
        });
      },

      restoreColumnFilterFromCache: (columnId, filter) => {
        const filterKey = getBoardFilterKey(filter);
        const cached = get().columnFilterCache[columnId]?.[filterKey];
        if (!cached) return false;

        set((state) => {
          state.columnTaskIds[columnId] = [...cached.taskIds];
          state.columnPages[columnId] = {
            nextCursor: cached.nextCursor,
            totalCount: cached.totalCount,
            isLoading: false,
            error: null,
            filter,
          };
        });
        return true;
      },

      setColumnPageLoading: (columnId, isLoading) => {
        set((state) => {
          if (state.columnPages[columnId]) {
            state.columnPages[columnId].isLoading = isLoading;
          }
        });
      },

      setColumnPageError: (columnId, error) => {
        set((state) => {
          if (state.columnPages[columnId]) {
            state.columnPages[columnId].error = error;
            state.columnPages[columnId].isLoading = false;
          }
        });
      },

      setActiveTask: (task) => {
        set((state) => {
          state.activeTaskId = task?.id || null;

          if (task) {
            state.tasks[task.id] = task;
          }
        });
      },

      captureSnapshot: (taskId) => {
        const operationId = createOperationId();
        let created = false;
        set((state) => {
          const activeId = taskId ?? state.activeTaskId;
          if (!activeId) return;
          const columnId = Object.entries(state.columnTaskIds).find(([, ids]) =>
            ids.includes(activeId),
          )?.[0];
          if (!columnId) return;
          const previousIndex = state.columnTaskIds[columnId].indexOf(activeId);
          state.optimisticOperations[operationId] = {
            kind: "drag",
            boardId: state.activeBoardId,
            taskId: activeId,
            previousColumnId: columnId,
            previousIndex,
          };
          created = true;
        });
        return created ? operationId : null;
      },

      clearSnapshot: (operationId) => {
        set((state) => {
          if (operationId) delete state.optimisticOperations[operationId];
          else state.optimisticOperations = {};
        });
      },

      addTask: (columnId, task) => {
        set((state) => {
          state.tasks[task.id] = task;

          if (!state.columnTaskIds[columnId]) {
            state.columnTaskIds[columnId] = [];
          }

          const page = state.columnPages[columnId];
          if (page) {
            page.totalCount += 1;
            const matchesFilter = checkTaskMatchesFilter(task, page.filter);

            if (matchesFilter && !page.nextCursor) {
              state.columnTaskIds[columnId].push(task.id);
            }
          } else {
            state.columnTaskIds[columnId].push(task.id);
          }

          if (state.columnFilterCache[columnId]) {
            const currentFilterKey = page ? getBoardFilterKey(page.filter) : null;
            for (const key of Object.keys(state.columnFilterCache[columnId])) {
              if (key !== currentFilterKey) {
                delete state.columnFilterCache[columnId][key];
              }
            }
            if (currentFilterKey && page && state.columnFilterCache[columnId][currentFilterKey]) {
              state.columnFilterCache[columnId][currentFilterKey] = {
                taskIds: [...state.columnTaskIds[columnId]],
                nextCursor: page.nextCursor,
                totalCount: page.totalCount,
              };
            }
          }
        });
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          if (!state.tasks[taskId]) return;

          const previousTask = state.tasks[taskId];
          state.tasks[taskId] = { ...previousTask, ...updates };

          const task = state.tasks[taskId];
          const page = state.columnPages[task.columnId];
          if (page && !checkTaskMatchesFilter(task, page.filter)) {
            state.columnTaskIds[task.columnId] = (
              state.columnTaskIds[task.columnId] ?? []
            ).filter((id) => id !== taskId);
          }

          if (state.columnFilterCache[task.columnId]) {
            const currentFilterKey = page ? getBoardFilterKey(page.filter) : null;
            for (const key of Object.keys(state.columnFilterCache[task.columnId])) {
              if (key !== currentFilterKey) {
                delete state.columnFilterCache[task.columnId][key];
              }
            }
            if (currentFilterKey && page && state.columnFilterCache[task.columnId][currentFilterKey]) {
              state.columnFilterCache[task.columnId][currentFilterKey] = {
                taskIds: [...(state.columnTaskIds[task.columnId] ?? [])],
                nextCursor: page.nextCursor,
                totalCount: page.totalCount,
              };
            }
          }
        });
      },

      deleteTask: (columnId, taskId) => {
        set((state) => {
          if (!state.tasks[taskId]) return;

          delete state.tasks[taskId];

          if (state.columnTaskIds[columnId]) {
            state.columnTaskIds[columnId] = state.columnTaskIds[
              columnId
            ].filter((id) => id !== taskId);

            if (state.columnTaskIds[columnId].length === 0) {
              delete state.columnTaskIds[columnId];
            }
          }

          const page = state.columnPages[columnId];
          if (page) page.totalCount = Math.max(0, page.totalCount - 1);

          if (state.columnFilterCache[columnId]) {
            for (const key of Object.keys(state.columnFilterCache[columnId])) {
              const entry = state.columnFilterCache[columnId][key];
              if (entry.taskIds.includes(taskId)) {
                entry.taskIds = entry.taskIds.filter((id) => id !== taskId);
                entry.totalCount = Math.max(0, entry.totalCount - 1);
              }
            }
          }

          if (state.activeTaskId === taskId) {
            state.activeTaskId = null;
          }
        });
      },

      reorderTaskWithinColumn: (columnId, activeTaskId, overId) => {
        set((state) => {
          const column = state.columnTaskIds[columnId];
          if (!column) return;

          const oldIndex = column.indexOf(activeTaskId);
          const newIndex = column.indexOf(overId);

          if (oldIndex === -1 || newIndex === -1) return;
          if (oldIndex === newIndex) return;

          column.splice(oldIndex, 1);
          column.splice(newIndex, 0, activeTaskId);

          const page = state.columnPages[columnId];
          if (page && state.columnFilterCache[columnId]) {
            const currentFilterKey = getBoardFilterKey(page.filter);
            if (state.columnFilterCache[columnId][currentFilterKey]) {
              state.columnFilterCache[columnId][currentFilterKey].taskIds = [...column];
            }
          }
        });
      },

      moveTaskBetweenColumns: (
        taskId,
        fromColumnId,
        toColumnId,
        targetTaskId,
        includeInDestination = true,
      ) => {
        set((state) => {
          const fromColumn = state.columnTaskIds[fromColumnId];
          if (!fromColumn) return;

          if (!state.columnTaskIds[toColumnId]) {
            state.columnTaskIds[toColumnId] = [];
          }

          const toColumn = state.columnTaskIds[toColumnId];
          const fromIndex = fromColumn.indexOf(taskId);

          if (fromIndex === -1) return;
          if (
            fromColumnId === toColumnId &&
            !targetTaskId &&
            fromIndex === toColumn.length - 1
          ) {
            return;
          }

          fromColumn.splice(fromIndex, 1);

          if (includeInDestination) {
            let toIndex = targetTaskId
              ? toColumn.indexOf(targetTaskId)
              : toColumn.length;

            if (toIndex === -1) toIndex = toColumn.length;

            toColumn.splice(toIndex, 0, taskId);
          }

          if (fromColumnId !== toColumnId) {
            const sourcePage = state.columnPages[fromColumnId];
            const targetPage = state.columnPages[toColumnId];
            if (sourcePage) {
              sourcePage.totalCount = Math.max(0, sourcePage.totalCount - 1);
            }
            if (targetPage) targetPage.totalCount += 1;

            if (state.columnFilterCache[fromColumnId]) {
              for (const key of Object.keys(state.columnFilterCache[fromColumnId])) {
                const entry = state.columnFilterCache[fromColumnId][key];
                if (entry.taskIds.includes(taskId)) {
                  entry.taskIds = entry.taskIds.filter((id) => id !== taskId);
                  entry.totalCount = Math.max(0, entry.totalCount - 1);
                }
              }
            }

            if (state.columnFilterCache[toColumnId]) {
              const targetFilterKey = targetPage ? getBoardFilterKey(targetPage.filter) : null;
              for (const key of Object.keys(state.columnFilterCache[toColumnId])) {
                if (key !== targetFilterKey) {
                  delete state.columnFilterCache[toColumnId][key];
                }
              }
              if (targetFilterKey && targetPage && state.columnFilterCache[toColumnId][targetFilterKey]) {
                state.columnFilterCache[toColumnId][targetFilterKey] = {
                  taskIds: [...state.columnTaskIds[toColumnId]],
                  nextCursor: targetPage.nextCursor,
                  totalCount: targetPage.totalCount,
                };
              }
            }
          }
        });
      },

      getTask: (taskId: string) => {
        return get().tasks[taskId];
      },

      getColumnTasks: (columnId: string) => {
        const state = get();
        const taskIds = state.columnTaskIds[columnId] || [];
        return taskIds.map((id) => state.tasks[id]).filter(Boolean);
      },

      rollback: (operationId) => {
        set((state) => {
          const id = operationId ?? Object.keys(state.optimisticOperations).at(-1);
          if (!id) return;
          const operation = state.optimisticOperations[id];
          if (!operation) return;
          if (operation.boardId !== state.activeBoardId) {
            delete state.optimisticOperations[id];
            return;
          }

          const currentColumns = state.columnTaskIds;
          const currentColumnId = Object.entries(currentColumns).find(([, ids]) =>
            ids.includes(operation.taskId),
          )?.[0];
          for (const ids of Object.values(currentColumns)) {
            const index = ids.indexOf(operation.taskId);
            if (index !== -1) ids.splice(index, 1);
          }
          const original = currentColumns[operation.previousColumnId] ?? [];
          original.splice(operation.previousIndex, 0, operation.taskId);
          currentColumns[operation.previousColumnId] = original;
          if (currentColumnId && currentColumnId !== operation.previousColumnId) {
            const sourcePage = state.columnPages[operation.previousColumnId];
            const targetPage = state.columnPages[currentColumnId];
            if (sourcePage) sourcePage.totalCount += 1;
            if (targetPage) targetPage.totalCount = Math.max(0, targetPage.totalCount - 1);
          }
          if (state.columnFilterCache[operation.previousColumnId]) {
            delete state.columnFilterCache[operation.previousColumnId];
          }
          if (currentColumnId && state.columnFilterCache[currentColumnId]) {
            delete state.columnFilterCache[currentColumnId];
          }
          delete state.optimisticOperations[id];
        });
      },
    })),
  ),
);

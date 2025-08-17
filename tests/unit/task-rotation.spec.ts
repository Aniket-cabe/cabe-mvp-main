import { describe, it, expect, beforeEach, vi } from 'vitest';

// Task Rotation System Implementation
interface Task {
  id: string;
  title: string;
  description: string;
  skillCategory: string;
  taskType: 'practice' | 'mini_project';
  basePoints: number;
  maxPoints: number;
  estimatedDuration: number; // in minutes
  createdAt: Date;
  expiresAt?: Date;
  completionCount: number;
  maxCompletions: number;
  isActive: boolean;
  rotationReason?: 'time_expired' | 'completion_limit' | 'manual';
}

interface TaskRotationConfig {
  maxAgeDays: number;
  maxCompletions: number;
  rotationCheckInterval: number; // in milliseconds
  enableAutoRotation: boolean;
}

class TaskRotationSystem {
  private config: TaskRotationConfig;

  constructor(config: TaskRotationConfig = {
    maxAgeDays: 14,
    maxCompletions: 50,
    rotationCheckInterval: 3600000, // 1 hour
    enableAutoRotation: true
  }) {
    this.config = config;
  }

  // Check if a task should be rotated
  shouldRotateTask(task: Task): { shouldRotate: boolean; reason: string } {
    const now = new Date();
    
    // Check if task has exceeded maximum age
    const maxAgeDate = new Date(task.createdAt.getTime() + (this.config.maxAgeDays * 24 * 60 * 60 * 1000));
    if (now > maxAgeDate) {
      return {
        shouldRotate: true,
        reason: 'time_expired'
      };
    }

    // Check if task has reached completion limit
    if (task.completionCount >= this.config.maxCompletions) {
      return {
        shouldRotate: true,
        reason: 'completion_limit'
      };
    }

    // Check if task has been manually deactivated
    if (!task.isActive) {
      return {
        shouldRotate: true,
        reason: 'manual'
      };
    }

    return {
      shouldRotate: false,
      reason: 'active'
    };
  }

  // Rotate a task (mark as inactive and set rotation reason)
  rotateTask(task: Task, reason: string): Task {
    return {
      ...task,
      isActive: false,
      rotationReason: reason as 'time_expired' | 'completion_limit' | 'manual',
      expiresAt: new Date()
    };
  }

  // Get tasks that need rotation
  getTasksForRotation(tasks: Task[]): Task[] {
    return tasks.filter(task => {
      const { shouldRotate } = this.shouldRotateTask(task);
      return shouldRotate;
    });
  }

  // Batch rotate tasks
  rotateTasks(tasks: Task[]): { rotated: Task[]; remaining: Task[] } {
    const rotated: Task[] = [];
    const remaining: Task[] = [];

    tasks.forEach(task => {
      const { shouldRotate, reason } = this.shouldRotateTask(task);
      
      if (shouldRotate) {
        rotated.push(this.rotateTask(task, reason));
      } else {
        remaining.push(task);
      }
    });

    return { rotated, remaining };
  }

  // Calculate task age in days
  getTaskAge(task: Task): number {
    const now = new Date();
    const ageInMs = now.getTime() - task.createdAt.getTime();
    return Math.floor(ageInMs / (24 * 60 * 60 * 1000));
  }

  // Calculate remaining completions
  getRemainingCompletions(task: Task): number {
    return Math.max(0, this.config.maxCompletions - task.completionCount);
  }

  // Check if task is approaching rotation
  isTaskApproachingRotation(task: Task): { approaching: boolean; daysLeft: number; completionsLeft: number } {
    const age = this.getTaskAge(task);
    const remainingCompletions = this.getRemainingCompletions(task);
    
    const daysLeft = Math.max(0, this.config.maxAgeDays - age);
    const completionsLeft = remainingCompletions;
    
    // Task is approaching rotation if less than 3 days or less than 10 completions left
    const approaching = daysLeft <= 3 || completionsLeft <= 10;
    
    return {
      approaching,
      daysLeft,
      completionsLeft
    };
  }

  // Generate new task to replace rotated one
  generateReplacementTask(originalTask: Task): Task {
    const now = new Date();
    
    return {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Updated ${originalTask.title}`,
      description: `Enhanced version of: ${originalTask.description}`,
      skillCategory: originalTask.skillCategory,
      taskType: originalTask.taskType,
      basePoints: originalTask.basePoints,
      maxPoints: originalTask.maxPoints,
      estimatedDuration: originalTask.estimatedDuration,
      createdAt: now,
      completionCount: 0,
      maxCompletions: this.config.maxCompletions,
      isActive: true
    };
  }

  // Get rotation statistics
  getRotationStats(tasks: Task[]): {
    totalTasks: number;
    activeTasks: number;
    rotatedTasks: number;
    approachingRotation: number;
    averageAge: number;
    averageCompletions: number;
  } {
    const totalTasks = tasks.length;
    const activeTasks = tasks.filter(task => task.isActive).length;
    const rotatedTasks = totalTasks - activeTasks;
    
    const approachingTasks = tasks.filter(task => {
      const { approaching } = this.isTaskApproachingRotation(task);
      return approaching && task.isActive;
    }).length;

    const activeTaskAges = tasks
      .filter(task => task.isActive)
      .map(task => this.getTaskAge(task));
    
    const averageAge = activeTaskAges.length > 0 
      ? activeTaskAges.reduce((sum, age) => sum + age, 0) / activeTaskAges.length 
      : 0;

    const averageCompletions = tasks.length > 0
      ? tasks.reduce((sum, task) => sum + task.completionCount, 0) / tasks.length
      : 0;

    return {
      totalTasks,
      activeTasks,
      rotatedTasks,
      approachingRotation: approachingTasks,
      averageAge: Math.round(averageAge * 100) / 100,
      averageCompletions: Math.round(averageCompletions * 100) / 100
    };
  }
}

describe('Task Rotation System', () => {
  let rotationSystem: TaskRotationSystem;
  let mockTask: Task;

  beforeEach(() => {
    rotationSystem = new TaskRotationSystem();
    
    mockTask = {
      id: 'task-1',
      title: 'Build a React Component',
      description: 'Create a responsive navigation component',
      skillCategory: 'Full-Stack Software Development',
      taskType: 'practice',
      basePoints: 50,
      maxPoints: 200,
      estimatedDuration: 30,
      createdAt: new Date(),
      completionCount: 0,
      maxCompletions: 50,
      isActive: true
    };
  });

  describe('Task Age Calculation', () => {
    it('should calculate task age correctly', () => {
      const oldTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      };

      const age = rotationSystem.getTaskAge(oldTask);
      expect(age).toBe(7);
    });

    it('should return 0 for newly created tasks', () => {
      const newTask = {
        ...mockTask,
        createdAt: new Date()
      };

      const age = rotationSystem.getTaskAge(newTask);
      expect(age).toBe(0);
    });

    it('should handle future creation dates', () => {
      const futureTask = {
        ...mockTask,
        createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day in future
      };

      const age = rotationSystem.getTaskAge(futureTask);
      expect(age).toBe(-1);
    });
  });

  describe('Completion Count Tracking', () => {
    it('should calculate remaining completions correctly', () => {
      const taskWithCompletions = {
        ...mockTask,
        completionCount: 25
      };

      const remaining = rotationSystem.getRemainingCompletions(taskWithCompletions);
      expect(remaining).toBe(25); // 50 - 25 = 25
    });

    it('should return 0 when completion limit is reached', () => {
      const maxedTask = {
        ...mockTask,
        completionCount: 50
      };

      const remaining = rotationSystem.getRemainingCompletions(maxedTask);
      expect(remaining).toBe(0);
    });

    it('should handle over-completed tasks', () => {
      const overCompletedTask = {
        ...mockTask,
        completionCount: 60
      };

      const remaining = rotationSystem.getRemainingCompletions(overCompletedTask);
      expect(remaining).toBe(0);
    });
  });

  describe('Rotation Decision Logic', () => {
    it('should not rotate new tasks', () => {
      const newTask = {
        ...mockTask,
        createdAt: new Date(),
        completionCount: 0
      };

      const { shouldRotate, reason } = rotationSystem.shouldRotateTask(newTask);
      
      expect(shouldRotate).toBe(false);
      expect(reason).toBe('active');
    });

    it('should rotate tasks that exceed age limit', () => {
      const oldTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        completionCount: 10
      };

      const { shouldRotate, reason } = rotationSystem.shouldRotateTask(oldTask);
      
      expect(shouldRotate).toBe(true);
      expect(reason).toBe('time_expired');
    });

    it('should rotate tasks that reach completion limit', () => {
      const completedTask = {
        ...mockTask,
        createdAt: new Date(),
        completionCount: 50
      };

      const { shouldRotate, reason } = rotationSystem.shouldRotateTask(completedTask);
      
      expect(shouldRotate).toBe(true);
      expect(reason).toBe('completion_limit');
    });

    it('should rotate manually deactivated tasks', () => {
      const deactivatedTask = {
        ...mockTask,
        isActive: false
      };

      const { shouldRotate, reason } = rotationSystem.shouldRotateTask(deactivatedTask);
      
      expect(shouldRotate).toBe(true);
      expect(reason).toBe('manual');
    });
  });

  describe('Task Rotation Execution', () => {
    it('should rotate task and set proper fields', () => {
      const rotatedTask = rotationSystem.rotateTask(mockTask, 'completion_limit');
      
      expect(rotatedTask.isActive).toBe(false);
      expect(rotatedTask.rotationReason).toBe('completion_limit');
      expect(rotatedTask.expiresAt).toBeInstanceOf(Date);
    });

    it('should preserve original task data during rotation', () => {
      const rotatedTask = rotationSystem.rotateTask(mockTask, 'time_expired');
      
      expect(rotatedTask.id).toBe(mockTask.id);
      expect(rotatedTask.title).toBe(mockTask.title);
      expect(rotatedTask.skillCategory).toBe(mockTask.skillCategory);
      expect(rotatedTask.completionCount).toBe(mockTask.completionCount);
    });
  });

  describe('Batch Rotation Operations', () => {
    it('should identify tasks for rotation', () => {
      const tasks = [
        mockTask, // Active task
        { ...mockTask, id: 'task-2', completionCount: 50 }, // Should rotate
        { ...mockTask, id: 'task-3', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }, // Should rotate
        { ...mockTask, id: 'task-4', isActive: false } // Should rotate
      ];

      const tasksForRotation = rotationSystem.getTasksForRotation(tasks);
      
      expect(tasksForRotation).toHaveLength(3);
      expect(tasksForRotation.map(t => t.id)).toContain('task-2');
      expect(tasksForRotation.map(t => t.id)).toContain('task-3');
      expect(tasksForRotation.map(t => t.id)).toContain('task-4');
    });

    it('should batch rotate tasks correctly', () => {
      const tasks = [
        mockTask, // Active task
        { ...mockTask, id: 'task-2', completionCount: 50 }, // Should rotate
        { ...mockTask, id: 'task-3', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) } // Should rotate
      ];

      const { rotated, remaining } = rotationSystem.rotateTasks(tasks);
      
      expect(rotated).toHaveLength(2);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('task-1');
      expect(rotated.every(task => !task.isActive)).toBe(true);
    });
  });

  describe('Approaching Rotation Detection', () => {
    it('should detect tasks approaching age limit', () => {
      const approachingAgeTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago (2 days left)
      };

      const { approaching, daysLeft, completionsLeft } = rotationSystem.isTaskApproachingRotation(approachingAgeTask);
      
      expect(approaching).toBe(true);
      expect(daysLeft).toBe(2);
      expect(completionsLeft).toBe(50);
    });

    it('should detect tasks approaching completion limit', () => {
      const approachingCompletionTask = {
        ...mockTask,
        completionCount: 45 // 5 completions left
      };

      const { approaching, daysLeft, completionsLeft } = rotationSystem.isTaskApproachingRotation(approachingCompletionTask);
      
      expect(approaching).toBe(true);
      expect(daysLeft).toBe(14);
      expect(completionsLeft).toBe(5);
    });

    it('should not flag tasks that are not approaching rotation', () => {
      const healthyTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completionCount: 20
      };

      const { approaching, daysLeft, completionsLeft } = rotationSystem.isTaskApproachingRotation(healthyTask);
      
      expect(approaching).toBe(false);
      expect(daysLeft).toBe(9);
      expect(completionsLeft).toBe(30);
    });
  });

  describe('Replacement Task Generation', () => {
    it('should generate replacement task with unique ID', () => {
      const replacement = rotationSystem.generateReplacementTask(mockTask);
      
      expect(replacement.id).not.toBe(mockTask.id);
      expect(replacement.id).toMatch(/^task-\d+-[a-z0-9]+$/);
      expect(replacement.title).toContain('Updated');
      expect(replacement.completionCount).toBe(0);
      expect(replacement.isActive).toBe(true);
    });

    it('should preserve skill category and task type', () => {
      const replacement = rotationSystem.generateReplacementTask(mockTask);
      
      expect(replacement.skillCategory).toBe(mockTask.skillCategory);
      expect(replacement.taskType).toBe(mockTask.taskType);
      expect(replacement.basePoints).toBe(mockTask.basePoints);
      expect(replacement.maxPoints).toBe(mockTask.maxPoints);
    });

    it('should set new creation date', () => {
      const originalDate = mockTask.createdAt;
      const replacement = rotationSystem.generateReplacementTask(mockTask);
      
      expect(replacement.createdAt.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });

  describe('Rotation Statistics', () => {
    it('should calculate accurate rotation statistics', () => {
      const tasks = [
        mockTask, // Active
        { ...mockTask, id: 'task-2', isActive: false, rotationReason: 'completion_limit' }, // Rotated
        { ...mockTask, id: 'task-3', isActive: false, rotationReason: 'time_expired' }, // Rotated
        { ...mockTask, id: 'task-4', completionCount: 45 }, // Approaching rotation
        { ...mockTask, id: 'task-5', createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) } // Approaching rotation
      ];

      const stats = rotationSystem.getRotationStats(tasks);
      
      expect(stats.totalTasks).toBe(5);
      expect(stats.activeTasks).toBe(3);
      expect(stats.rotatedTasks).toBe(2);
      expect(stats.approachingRotation).toBe(2);
      expect(stats.averageAge).toBeGreaterThan(0);
      expect(stats.averageCompletions).toBeGreaterThan(0);
    });

    it('should handle empty task list', () => {
      const stats = rotationSystem.getRotationStats([]);
      
      expect(stats.totalTasks).toBe(0);
      expect(stats.activeTasks).toBe(0);
      expect(stats.rotatedTasks).toBe(0);
      expect(stats.approachingRotation).toBe(0);
      expect(stats.averageAge).toBe(0);
      expect(stats.averageCompletions).toBe(0);
    });

    it('should calculate averages correctly', () => {
      const tasks = [
        { ...mockTask, id: 'task-1', completionCount: 10 },
        { ...mockTask, id: 'task-2', completionCount: 20 },
        { ...mockTask, id: 'task-3', completionCount: 30 }
      ];

      const stats = rotationSystem.getRotationStats(tasks);
      
      expect(stats.averageCompletions).toBe(20); // (10 + 20 + 30) / 3
    });
  });

  describe('Configuration Options', () => {
    it('should respect custom configuration', () => {
      const customConfig = {
        maxAgeDays: 7,
        maxCompletions: 25,
        rotationCheckInterval: 1800000, // 30 minutes
        enableAutoRotation: false
      };

      const customRotationSystem = new TaskRotationSystem(customConfig);
      
      const oldTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      };

      const { shouldRotate } = customRotationSystem.shouldRotateTask(oldTask);
      expect(shouldRotate).toBe(true);

      const completedTask = {
        ...mockTask,
        completionCount: 25
      };

      const { shouldRotate: shouldRotateCompleted } = customRotationSystem.shouldRotateTask(completedTask);
      expect(shouldRotateCompleted).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tasks with zero completions', () => {
      const zeroCompletionTask = {
        ...mockTask,
        completionCount: 0
      };

      const { shouldRotate } = rotationSystem.shouldRotateTask(zeroCompletionTask);
      expect(shouldRotate).toBe(false);
    });

    it('should handle tasks created exactly at the age limit', () => {
      const exactAgeTask = {
        ...mockTask,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Exactly 14 days ago
      };

      const { shouldRotate } = rotationSystem.shouldRotateTask(exactAgeTask);
      expect(shouldRotate).toBe(true);
    });

    it('should handle tasks with completion count exactly at limit', () => {
      const exactCompletionTask = {
        ...mockTask,
        completionCount: 50
      };

      const { shouldRotate } = rotationSystem.shouldRotateTask(exactCompletionTask);
      expect(shouldRotate).toBe(true);
    });

    it('should handle tasks with negative completion count', () => {
      const negativeCompletionTask = {
        ...mockTask,
        completionCount: -5
      };

      const remaining = rotationSystem.getRemainingCompletions(negativeCompletionTask);
      expect(remaining).toBe(55); // 50 - (-5) = 55
    });
  });
});

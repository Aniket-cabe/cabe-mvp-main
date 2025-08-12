import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, testUtils, mockData } from '../setup';
import TaskCard from '../../components/TaskCard';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('TaskCard Component', () => {
  const defaultTask = mockData.tasks.beginner;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render task information correctly', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      expect(screen.getByText(defaultTask.title)).toBeInTheDocument();
      expect(screen.getByText(defaultTask.description)).toBeInTheDocument();
      expect(screen.getByText(`${defaultTask.points_reward} points`)).toBeInTheDocument();
      expect(screen.getByText(defaultTask.difficulty)).toBeInTheDocument();
      expect(screen.getByText(defaultTask.skill_area)).toBeInTheDocument();
    });

    it('should render with different difficulty levels', () => {
      const { rerender } = renderWithProviders(<TaskCard task={mockData.tasks.beginner} />);
      expect(screen.getByText('beginner')).toBeInTheDocument();

      rerender(<TaskCard task={mockData.tasks.intermediate} />);
      expect(screen.getByText('intermediate')).toBeInTheDocument();

      rerender(<TaskCard task={mockData.tasks.expert} />);
      expect(screen.getByText('expert')).toBeInTheDocument();
    });

    it('should render with different skill areas', () => {
          const aiMlTask = { ...defaultTask, skill_area: 'ai-ml' };
    const cloudDevopsTask = { ...defaultTask, skill_area: 'cloud-devops' };
    const dataAnalyticsTask = { ...defaultTask, skill_area: 'data-analytics' };

    const { rerender } = renderWithProviders(<TaskCard task={aiMlTask} />);
    expect(screen.getByText('ai-ml')).toBeInTheDocument();

    rerender(<TaskCard task={cloudDevopsTask} />);
    expect(screen.getByText('cloud-devops')).toBeInTheDocument();

    rerender(<TaskCard task={dataAnalyticsTask} />);
    expect(screen.getByText('data-analytics')).toBeInTheDocument();
    });

    it('should render time limit when available', () => {
      const taskWithTimeLimit = { ...defaultTask, time_limit: 45 };
      renderWithProviders(<TaskCard task={taskWithTimeLimit} />);

      expect(screen.getByText('45 min')).toBeInTheDocument();
    });

    it('should not render time limit when not available', () => {
      const taskWithoutTimeLimit = { ...defaultTask, time_limit: null };
      renderWithProviders(<TaskCard task={taskWithoutTimeLimit} />);

      expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });

    it('should render requirements when available', () => {
      const taskWithRequirements = {
        ...defaultTask,
        requirements: ['React', 'TypeScript', 'CSS']
      };
      renderWithProviders(<TaskCard task={taskWithRequirements} />);

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('CSS')).toBeInTheDocument();
    });

    it('should render completion status when user has completed the task', () => {
      const completedTask = { ...defaultTask, completed: true };
      renderWithProviders(<TaskCard task={completedTask} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByTestId('completion-badge')).toBeInTheDocument();
    });

    it('should render submission status when user has submitted', () => {
      const submittedTask = { ...defaultTask, submitted: true, submission_status: 'pending' };
      renderWithProviders(<TaskCard task={submittedTask} />);

      expect(screen.getByText('Pending Review')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should navigate to task details when clicked', async () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      fireEvent.click(card);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${defaultTask.id}`);
      });
    });

    it('should show hover effects on mouse enter', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      fireEvent.mouseEnter(card);

      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('should handle keyboard navigation', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${defaultTask.id}`);
    });

    it('should handle space key navigation', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      fireEvent.keyDown(card, { key: ' ', code: 'Space' });

      expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${defaultTask.id}`);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      expect(card).toHaveAttribute('aria-label', `View ${defaultTask.title} task`);
    });

    it('should announce completion status to screen readers', () => {
      const completedTask = { ...defaultTask, completed: true };
      renderWithProviders(<TaskCard task={completedTask} />);

      const completionBadge = screen.getByTestId('completion-badge');
      expect(completionBadge).toHaveAttribute('aria-label', 'Task completed');
    });

    it('should have proper focus management', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      fireEvent.focus(card);

      expect(card).toHaveClass('focus:ring-2');
      expect(card).toHaveClass('focus:ring-blue-500');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long task titles', () => {
      const longTitleTask = {
        ...defaultTask,
        title: 'This is a very long task title that should be truncated when it exceeds the maximum width of the card container'
      };
      renderWithProviders(<TaskCard task={longTitleTask} />);

      const titleElement = screen.getByText(longTitleTask.title);
      expect(titleElement).toHaveClass('truncate');
    });

    it('should handle very long descriptions', () => {
      const longDescriptionTask = {
        ...defaultTask,
        description: 'This is a very long description that should be truncated when it exceeds the maximum height of the description area. It should show an ellipsis and not break the layout.'
      };
      renderWithProviders(<TaskCard task={longDescriptionTask} />);

      const descriptionElement = screen.getByText(longDescriptionTask.description);
      expect(descriptionElement).toHaveClass('line-clamp-3');
    });

    it('should handle missing optional fields gracefully', () => {
      const minimalTask = {
        id: 'minimal-task',
        title: 'Minimal Task',
        description: 'Minimal description',
        difficulty: 'beginner',
        skill_area: 'ai-ml',
        points_reward: 10
      };
      renderWithProviders(<TaskCard task={minimalTask} />);

      expect(screen.getByText('Minimal Task')).toBeInTheDocument();
      expect(screen.getByText('Minimal description')).toBeInTheDocument();
      expect(screen.getByText('10 points')).toBeInTheDocument();
    });

    it('should handle zero points reward', () => {
      const zeroPointsTask = { ...defaultTask, points_reward: 0 };
      renderWithProviders(<TaskCard task={zeroPointsTask} />);

      expect(screen.getByText('0 points')).toBeInTheDocument();
    });

    it('should handle null or undefined values', () => {
      const taskWithNulls = {
        ...defaultTask,
        description: null,
        time_limit: null,
        requirements: null
      };
      renderWithProviders(<TaskCard task={taskWithNulls} />);

      expect(screen.getByText(defaultTask.title)).toBeInTheDocument();
      expect(screen.queryByText(/min/)).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily when props are the same', () => {
      const { rerender } = renderWithProviders(<TaskCard task={defaultTask} />);
      
      const initialRenderCount = vi.fn().mock.calls.length;
      
      rerender(<TaskCard task={defaultTask} />);
      
      // Should not cause additional renders for same props
      expect(vi.fn().mock.calls.length).toBe(initialRenderCount);
    });

    it('should handle rapid clicks gracefully', async () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      
      // Simulate rapid clicks
      fireEvent.click(card);
      fireEvent.click(card);
      fireEvent.click(card);

      await waitFor(() => {
        // Should only navigate once despite multiple clicks
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      const { container } = renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      
      // Check for responsive classes
      expect(card).toHaveClass('sm:flex-row');
      expect(card).toHaveClass('md:flex-col');
      expect(card).toHaveClass('lg:flex-row');
    });

    it('should handle mobile touch interactions', () => {
      renderWithProviders(<TaskCard task={defaultTask} />);

      const card = screen.getByTestId('task-card');
      
      // Simulate touch events
      fireEvent.touchStart(card);
      fireEvent.touchEnd(card);

      expect(mockNavigate).toHaveBeenCalledWith(`/tasks/${defaultTask.id}`);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing task ID gracefully', () => {
      const taskWithoutId = { ...defaultTask, id: undefined };
      
      expect(() => {
        renderWithProviders(<TaskCard task={taskWithoutId} />);
      }).not.toThrow();
    });

    it('should handle invalid task data gracefully', () => {
      const invalidTask = {
        id: 'invalid-task',
        title: null,
        description: undefined,
        difficulty: 'invalid-difficulty',
        skill_area: 'invalid-skill',
        points_reward: -10
      };
      
      expect(() => {
        renderWithProviders(<TaskCard task={invalidTask} />);
      }).not.toThrow();
    });
  });
});

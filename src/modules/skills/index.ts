// Pages
export { default as SkillDashboard } from './pages/SkillDashboard';

// Components
export { default as SkillHeader } from './components/SkillHeader';
export { default as SkillStats } from './components/SkillStats';
export { default as SkillTaskList } from './components/SkillTaskList';
export { default as BadgeStrip } from './components/BadgeStrip';
export { default as ActivityHeatmap } from './components/ActivityHeatmap';
export { default as SkillXPBar } from './components/SkillXPBar';
export { default as SkillsDemo } from './components/SkillsDemo';

// Hooks
export { useSkillData } from './hooks/useSkillData';

// Types
export type {
  SkillArea,
  SkillTask,
  SkillStats,
  Badge,
  XPProgress,
  HeatmapData,
  SkillData,
} from './types';

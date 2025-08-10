import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AITrainingPipeline } from '../backend/src/ai/trainPipeline';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs-node', () => ({
  tensor2d: vi.fn(() => ({ dispose: vi.fn() })),
  sequential: vi.fn(() => ({
    add: vi.fn().mockReturnThis(),
    compile: vi.fn().mockReturnThis(),
    fit: vi.fn().mockResolvedValue({
      history: { acc: [0.85], loss: [0.3] },
    }),
    save: vi.fn().mockResolvedValue(undefined),
  })),
  layers: { dense: vi.fn(() => ({})) },
  train: { adam: vi.fn(() => ({})) },
}));

// Mock file system
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Mock database and logger
vi.mock('../backend/db', () => ({ executeWithRetry: vi.fn() }));
vi.mock('../backend/src/utils/logger', () => ({
  default: { info: vi.fn(), error: vi.fn() },
}));

describe('AI Training Pipeline', () => {
  let pipeline: AITrainingPipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = new AITrainingPipeline();
  });

  describe('Data Preprocessing', () => {
    it('should preprocess training data successfully', async () => {
      const trainingData = await pipeline.preprocessData();

      expect(trainingData).toBeDefined();
      expect(Array.isArray(trainingData)).toBe(true);
      expect(trainingData.length).toBeGreaterThan(0);

      const sample = trainingData[0];
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('code');
      expect(sample).toHaveProperty('language');
      expect(sample).toHaveProperty('quality_score');
      expect(sample).toHaveProperty('features');
    });

    it('should extract features correctly', () => {
      const code = 'function hello() { return "world"; }';
      const language = 'javascript';

      const features = (pipeline as any).extractFeatures(code, language);

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
      expect(features.every((f) => typeof f === 'number')).toBe(true);
    });
  });

  describe('Model Training', () => {
    it('should train model without errors', async () => {
      const trainingData = [
        {
          id: '1',
          code: 'function test() {}',
          language: 'javascript',
          quality_score: 85,
          features: new Array(50).fill(0),
        },
      ];

      const model = await pipeline.trainModel(trainingData);

      expect(model).toBeDefined();
      expect(typeof model.add).toBe('function');
      expect(typeof model.compile).toBe('function');
      expect(typeof model.fit).toBe('function');
    });

    it('should encode quality scores correctly', () => {
      const score = 85;
      const encoding = (pipeline as any).oneHotEncode(score);

      expect(Array.isArray(encoding)).toBe(true);
      expect(encoding.length).toBe(10);
      expect(encoding.filter((x) => x === 1).length).toBe(1);
    });
  });

  describe('Full Pipeline', () => {
    it('should run complete training pipeline', async () => {
      const result = await pipeline.runFullPipeline();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('modelPath');
      expect(result).toHaveProperty('accuracy');
      expect(result).toHaveProperty('version');
      expect(typeof result.modelPath).toBe('string');
      expect(typeof result.accuracy).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle insufficient training data', async () => {
      // Mock insufficient data
      vi.mocked(pipeline.preprocessData).mockResolvedValue([]);

      await expect(pipeline.runFullPipeline()).rejects.toThrow(
        'Insufficient training data'
      );
    });
  });
});

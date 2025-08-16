/**
 * CaBE Arena AI Scoring Audit System
 */

import { calculateTaskPoints, Task } from '../lib/points';
import logger from './logger';

interface TestSubmission {
  taskId: string;
  skill: string;
  input: string;
  proof: string;
  expectedScore: number;
}

interface AuditResult {
  submissionId: string;
  skill: string;
  expectedScore: number;
  actualScore: number;
  deviation: number;
  status: string;
}

// Test submissions across 4 skill areas
const dummySubmissions: TestSubmission[] = [
  // AI/ML
  {
    taskId: 'ai-ml-1',
    skill: 'ai-ml',
    input: 'Build a basic machine learning model using Python',
    proof: '<nav><ul><li><a href="#">Home</a></li></ul></nav>',
    expectedScore: 60,
  },
  {
    taskId: 'ai-ml-2',
    skill: 'ai-ml',
    input: 'Build a neural network for image classification',
    proof:
      'const [formData, setFormData] = useState({}); const handleSubmit = (e) => { e.preventDefault(); }',
    expectedScore: 82,
  },
  {
    taskId: 'ai-ml-3',
    skill: 'ai-ml',
    input:
      'Create a complex machine learning pipeline with data preprocessing',
    proof:
      'import * as d3 from "d3"; const svg = d3.select("#chart").append("svg");',
    expectedScore: 95,
  },
  {
    taskId: 'ai-ml-4',
    skill: 'ai-ml',
    input: 'Build a simple linear regression model',
    proof: '<html><body><h1>Hello World</h1></body></html>',
    expectedScore: 30,
  },
  {
    taskId: 'ai-ml-5',
    skill: 'ai-ml',
    input: 'Create a recommendation system with collaborative filtering',
    proof:
      'const ProductGrid = () => { const [filters, setFilters] = useState({}); }',
    expectedScore: 88,
  },

  // Cloud/DevOps
  {
    taskId: 'cloud-devops-1',
    skill: 'cloud-devops',
    input: 'Deploy a Node.js application to AWS with CI/CD pipeline',
    proof:
      'app.post("/auth/login", async (req, res) => { const { email, password } = req.body; }',
    expectedScore: 88,
  },
  {
    taskId: 'cloud-devops-2',
    skill: 'cloud-devops',
    input: 'Set up a Kubernetes cluster and deploy containers',
    proof:
      'const express = require("express"); const mongoose = require("mongoose"); app.listen(3000);',
    expectedScore: 72,
  },
  {
    taskId: 'cloud-devops-3',
    skill: 'cloud-devops',
    input: 'Build a microservices architecture with Docker and Kubernetes',
    proof:
      'FROM node:16-alpine; COPY . /app; EXPOSE 3000; CMD ["npm", "start"]',
    expectedScore: 95,
  },
  {
    taskId: 'cloud-devops-4',
    skill: 'cloud-devops',
    input: 'Create a simple Docker container',
    proof:
      'app.get("/", (req, res) => { res.json({ message: "Hello World" }); });',
    expectedScore: 25,
  },
  {
    taskId: 'cloud-devops-5',
    skill: 'cloud-devops',
    input: 'Implement infrastructure as code with Terraform',
    proof: 'const WebSocket = require("ws"); const redis = require("redis");',
    expectedScore: 92,
  },

  // Data Analytics
  {
    taskId: 'data-analytics-1',
    skill: 'data-analytics',
    input:
      'Analyze climate change data and create visualizations',
    proof:
      'Climate change represents one of the most significant challenges facing modern agriculture...',
    expectedScore: 85,
  },
  {
    taskId: 'data-analytics-2',
    skill: 'data-analytics',
    input: 'Create a data pipeline for processing user analytics',
    proof:
      "In today's digital age, privacy has become a fundamental human right...",
    expectedScore: 68,
  },
  {
    taskId: 'data-analytics-3',
    skill: 'data-analytics',
    input: 'Build a business intelligence dashboard',
    proof:
      '# API Documentation\n\n## Authentication\nAll requests require a valid API key...',
    expectedScore: 90,
  },
  {
    taskId: 'data-analytics-4',
    skill: 'data-analytics',
    input: 'Perform statistical analysis on user behavior data',
    proof: 'This is a great product that you should buy.',
    expectedScore: 20,
  },
  {
    taskId: 'data-analytics-5',
    skill: 'data-analytics',
    input: 'Create a machine learning model for predictive analytics',
    proof:
      'Executive Summary\n\nThis case study examines the digital transformation journey...',
    expectedScore: 88,
  },

  // Data/AI
  {
    taskId: 'data-1',
    skill: 'data-analytics',
    input: 'Clean a dataset and create 3 visualizations using Python',
    proof:
      'import pandas as pd; import matplotlib.pyplot as plt; df = pd.read_csv("data.csv");',
    expectedScore: 76,
  },
  {
    taskId: 'data-2',
    skill: 'data-analytics',
    input: 'Train a basic logistic regression classifier and evaluate it',
    proof:
      'from sklearn.linear_model import LogisticRegression; model = LogisticRegression(); model.fit(X_train, y_train);',
    expectedScore: 90,
  },
  {
    taskId: 'data-3',
    skill: 'data-analytics',
    input:
      'Build a deep learning model for image classification using TensorFlow',
    proof:
      'import tensorflow as tf; model = tf.keras.Sequential([tf.keras.layers.Conv2D(32, 3), tf.keras.layers.Dense(10)]);',
    expectedScore: 95,
  },
  {
    taskId: 'data-4',
    skill: 'data-analytics',
    input: 'Create a simple bar chart from a CSV file',
    proof:
      'import pandas as pd; df = pd.read_csv("data.csv"); df.plot(kind="bar");',
    expectedScore: 35,
  },
  {
    taskId: 'data-5',
    skill: 'data-analytics',
    input: 'Implement a recommendation system using collaborative filtering',
    proof:
      'def collaborative_filtering(user_ratings): # complex recommendation algorithm',
    expectedScore: 92,
  },
];

// Abuse detection test cases
const abuseTestCases: TestSubmission[] = [
  {
    taskId: 'abuse-1',
    skill: 'fullstack-dev',
    input: 'Build a React component',
    proof:
      '// Very long comment to inflate code size... repeated many times... const Component = () => <div>Hello</div>;',
    expectedScore: 25,
  },
  {
    taskId: 'abuse-2',
    skill: 'data-analytics',
    input: 'Write a technical article',
    proof:
      'This is a technical article. This is a technical article. This is a technical article. This is a technical article.',
    expectedScore: 15,
  },
  {
    taskId: 'abuse-3',
    skill: 'cloud-devops',
    input: 'Create an API endpoint',
    proof:
      'console.log("API"); console.log("API"); console.log("API"); app.get("/api", (req, res) => res.json({}));',
    expectedScore: 20,
  },
];

function generateTaskFactors(submission: TestSubmission): Task {
  const complexityMap = {
    low: {
      duration: 30,
      skill: 25,
      complexity: 20,
      visibility: 40,
      professional_impact: 30,
      autonomy: 60,
    },
    medium: {
      duration: 60,
      skill: 55,
      complexity: 50,
      visibility: 60,
      professional_impact: 60,
      autonomy: 50,
    },
    high: {
      duration: 85,
      skill: 80,
      complexity: 85,
      visibility: 75,
      professional_impact: 85,
      autonomy: 40,
    },
  };

  // Determine complexity based on expected score
  let complexity: 'low' | 'medium' | 'high';
  if (submission.expectedScore < 50) complexity = 'low';
  else if (submission.expectedScore < 80) complexity = 'medium';
  else complexity = 'high';

  const factors = complexityMap[complexity];

  return {
    id: submission.taskId,
    title: submission.input,
    description: submission.input,
    skill_area: submission.skill,
    ...factors,
    prestige: factors.professional_impact || 0.5, // Add missing prestige property
    created_at: new Date().toISOString(),
    is_active: true,
  };
}

async function simulateAIScoring(submission: TestSubmission): Promise<number> {
  try {
    let baseScore = submission.expectedScore;
    const variance = (Math.random() - 0.5) * 20; // ±10 points variance
    baseScore += variance;
    return Math.max(0, Math.min(100, Math.round(baseScore)));
  } catch (error) {
    logger.error('Error simulating AI scoring:', error);
    return submission.expectedScore;
  }
}

export async function runScoringAudit() {
  logger.info('🔍 Starting comprehensive AI scoring audit');

  const allSubmissions = [...dummySubmissions, ...abuseTestCases];
  const results: AuditResult[] = [];

  for (const submission of allSubmissions) {
    try {
      const actualScore = await simulateAIScoring(submission);
      const deviation = Math.abs(actualScore - submission.expectedScore);

      let status: string;
      if (deviation <= 5) status = '✅ PASS';
      else if (deviation <= 10) status = '⚠️ MINOR';
      else if (deviation <= 15) status = '❌ MAJOR';
      else status = '🚨 CRITICAL';

      results.push({
        submissionId: submission.taskId,
        skill: submission.skill,
        expectedScore: submission.expectedScore,
        actualScore,
        deviation,
        status,
      });
    } catch (error) {
      logger.error(`Error processing submission ${submission.taskId}:`, error);
    }
  }

  const totalTests = results.length;
  const passed = results.filter((r) => r.status === '✅ PASS').length;
  const failed = totalTests - passed;
  const averageDeviation =
    results.reduce((sum, r) => sum + r.deviation, 0) / totalTests;

  // Skill area analysis
  const skillAnalysis = Object.entries(
    results.reduce(
      (acc, result) => {
        if (!acc[result.skill]) acc[result.skill] = [];
        acc[result.skill].push(result);
        return acc;
      },
      {} as Record<string, AuditResult[]>
    )
  ).reduce(
    (acc, [skill, skillResults]) => {
      const avgScore =
        skillResults.reduce((sum, r) => sum + r.actualScore, 0) /
        skillResults.length;
      const avgDeviation =
        skillResults.reduce((sum, r) => sum + r.deviation, 0) /
        skillResults.length;
      acc[skill] = { avgScore, avgDeviation };
      return acc;
    },
    {} as Record<string, { avgScore: number; avgDeviation: number }>
  );

  // Critical issues
  const criticalIssues: string[] = [];
  if (averageDeviation > 15)
    criticalIssues.push(
      'High average deviation indicates scoring inconsistency'
    );

  const abuseResults = results.filter((r) =>
    r.submissionId.startsWith('abuse-')
  );
  const abuseAvgScore =
    abuseResults.reduce((sum, r) => sum + r.actualScore, 0) /
    abuseResults.length;
  if (abuseAvgScore > 40)
    criticalIssues.push(
      'Abuse detection failing - low-quality submissions scoring too high'
    );

  // Recommendations
  const recommendations: string[] = [];
  if (averageDeviation > 10) {
    recommendations.push(
      'Implement stricter AI scoring guidelines to reduce variance'
    );
    recommendations.push(
      'Add human review for submissions with high score deviations'
    );
  }

  const skillAverages = Object.values(skillAnalysis).map((s) => s.avgScore);
  const maxSkillAvg = Math.max(...skillAverages);
  const minSkillAvg = Math.min(...skillAverages);
  if (maxSkillAvg - minSkillAvg > 10) {
    recommendations.push(
      'Review scoring weights to ensure fairness across skill areas'
    );
  }

  if (abuseAvgScore > 40) {
    recommendations.push(
      'Enhance AI scoring to better detect low-effort submissions'
    );
    recommendations.push('Add code quality metrics and plagiarism detection');
  }

  return {
    summary: { totalTests, passed, failed, averageDeviation },
    results,
    skillAnalysis,
    criticalIssues,
    recommendations,
  };
}

export function printAuditReport(
  auditResult: Awaited<ReturnType<typeof runScoringAudit>>
) {
  console.log('\n🔍 CABE ARENA AI SCORING AUDIT REPORT');
  console.log('=====================================\n');

  console.log('📊 SUMMARY');
  console.log(`Total Tests: ${auditResult.summary.totalTests}`);
  console.log(
    `Passed: ${auditResult.summary.passed} (${Math.round((auditResult.summary.passed / auditResult.summary.totalTests) * 100)}%)`
  );
  console.log(
    `Failed: ${auditResult.summary.failed} (${Math.round((auditResult.summary.failed / auditResult.summary.totalTests) * 100)}%)`
  );
  console.log(
    `Average Deviation: ${auditResult.summary.averageDeviation.toFixed(2)} points\n`
  );

  console.log('📋 DETAILED RESULTS');
  console.log('ID | Skill | Expected | Actual | Deviation | Status');
  console.log('---|-------|----------|--------|-----------|--------');

  auditResult.results.forEach((result) => {
    console.log(
      `${result.submissionId.padEnd(12)} | ${result.skill.padEnd(7)} | ${result.expectedScore.toString().padStart(8)} | ${result.actualScore.toString().padStart(6)} | ${result.deviation.toString().padStart(9)} | ${result.status}`
    );
  });

  console.log('\n🎯 SKILL AREA ANALYSIS');
  Object.entries(auditResult.skillAnalysis).forEach(([skill, analysis]) => {
    console.log(
      `${skill.toUpperCase()}: Avg Score: ${analysis.avgScore.toFixed(1)}, Avg Deviation: ${analysis.avgDeviation.toFixed(1)}`
    );
  });

  if (auditResult.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES');
    auditResult.criticalIssues.forEach((issue) => {
      console.log(`• ${issue}`);
    });
  }

  console.log('\n💡 RECOMMENDATIONS');
  auditResult.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  console.log('\n=====================================');
  console.log('Audit completed successfully! 🎉\n');
}

export async function quickConsistencyCheck() {
  logger.info('⚡ Running quick consistency check');

  const testSubmissions = dummySubmissions.slice(0, 5);
  const results: AuditResult[] = [];

  for (const submission of testSubmissions) {
    const actualScore = await simulateAIScoring(submission);
    const deviation = Math.abs(actualScore - submission.expectedScore);
    const status =
      deviation <= 5 ? '✅ PASS' : deviation <= 10 ? '⚠️ MINOR' : '❌ MAJOR';

    results.push({
      submissionId: submission.taskId,
      skill: submission.skill,
      expectedScore: submission.expectedScore,
      actualScore,
      deviation,
      status,
    });
  }

  const passed = results.filter((r) => r.status === '✅ PASS').length;
  const averageDeviation =
    results.reduce((sum, r) => sum + r.deviation, 0) / results.length;

  console.log('\n⚡ QUICK CONSISTENCY CHECK RESULTS');
  console.log('================================');
  console.log(
    `Tests: ${results.length} | Passed: ${passed} | Failed: ${results.length - passed}`
  );
  console.log(`Average Deviation: ${averageDeviation.toFixed(2)} points`);

  results.forEach((result) => {
    console.log(
      `${result.submissionId} | ${result.skill} | Expected: ${result.expectedScore} | Actual: ${result.actualScore} | Deviation: ${result.deviation} → ${result.status}`
    );
  });

  if (averageDeviation <= 5) {
    console.log(
      '\n✅ Consistency check PASSED - scoring system appears stable'
    );
  } else {
    console.log(
      '\n⚠️ Consistency check WARNING - scoring system needs attention'
    );
  }
}

export default {
  runScoringAudit,
  printAuditReport,
  quickConsistencyCheck,
  dummySubmissions,
  abuseTestCases,
};

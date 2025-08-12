/**
 * CaBE Arena Task Forge Automation System
 * 
 * This service handles automated task generation from templates,
 * task rotation, and skill-gated task management.
 */

import { supabaseAdmin } from '../lib/supabase-admin';
import logger from '../utils/logger';

// ============================================================================
// CONSTANTS
// ============================================================================

export const SKILL_CATEGORIES = {
  'Full-Stack Software Development': {
    icon: '💻',
    description: 'Frontend, backend, and full-stack development',
    color: '#3B82F6',
  },
  'Cloud Computing & DevOps': {
    icon: '☁️',
    description: 'Cloud infrastructure, DevOps, and system administration',
    color: '#8B5CF6',
  },
  'Data Science & Analytics': {
    icon: '📊',
    description: 'Data analysis, visualization, and business intelligence',
    color: '#10B981',
  },
  'AI / Machine Learning': {
    icon: '🤖',
    description: 'Machine learning, AI development, and neural networks',
    color: '#F59E0B',
  },
} as const;

export const TASK_TYPES = {
  practice: {
    duration: { min: 10, max: 30 }, // minutes
    basePoints: 50,
    maxPoints: 100,
    description: 'Quick practice exercises to build skills',
  },
  mini_project: {
    duration: { min: 60, max: 180 }, // minutes
    basePoints: 200,
    maxPoints: 400,
    description: 'Small projects to demonstrate practical skills',
  },
} as const;

// ============================================================================
// TEMPLATE PLACEHOLDERS
// ============================================================================

const PLACEHOLDER_VALUES = {
  // Full-Stack Software Development
  component_type: [
    'Button', 'Modal', 'Card', 'Form', 'Navigation', 'Sidebar', 'Footer', 'Header', 
    'Dropdown', 'Tabs', 'Accordion', 'Carousel', 'Pagination', 'Breadcrumb', 'Alert', 'Toast',
    'Progress Bar', 'Slider', 'Checkbox', 'Radio Button', 'Select', 'Textarea', 'Input Field',
    'Avatar', 'Badge', 'Tooltip', 'Popover', 'Drawer', 'Dialog', 'Stepper', 'Wizard'
  ],
  features: [
    'responsive design', 'accessibility', 'animations', 'state management', 'error handling',
    'form validation', 'data persistence', 'real-time updates', 'offline support', 'progressive enhancement',
    'lazy loading', 'code splitting', 'performance optimization', 'security best practices', 'testing',
    'internationalization', 'theme switching', 'dark mode', 'keyboard navigation', 'screen reader support'
  ],
  platform: [
    'GitHub', 'Twitter', 'Stripe', 'Google Maps', 'Firebase', 'AWS', 'Heroku', 'Vercel', 'Netlify',
    'Shopify', 'PayPal', 'Twilio', 'SendGrid', 'Cloudinary', 'MongoDB Atlas', 'PostgreSQL', 'Redis',
    'Elasticsearch', 'Algolia', 'Auth0', 'Okta', 'JWT', 'OAuth', 'GraphQL', 'REST API'
  ],
  functionality: [
    'user authentication', 'data visualization', 'real-time updates', 'file upload', 'search',
    'payment processing', 'email notifications', 'push notifications', 'chat system', 'video streaming',
    'image processing', 'document management', 'calendar integration', 'social media integration',
    'analytics dashboard', 'admin panel', 'user management', 'content management', 'e-commerce',
    'booking system', 'review system', 'rating system', 'comment system', 'like system'
  ],
  frontend_framework: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'Remix'],
  backend_framework: ['Node.js', 'Express', 'Fastify', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI'],
  database: ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'PlanetScale'],
  
  // Cloud Computing & DevOps
  infrastructure_type: [
    'container orchestration', 'serverless deployment', 'CI/CD pipeline', 'monitoring system', 'load balancer', 'database cluster',
    'auto-scaling group', 'content delivery network', 'API gateway', 'service mesh', 'microservices architecture',
    'event-driven architecture', 'message queue system', 'caching layer', 'backup system', 'disaster recovery',
    'security group', 'network ACL', 'VPN connection', 'private cloud', 'hybrid cloud', 'multi-cloud setup'
  ],
  cloud_platform: [
    'AWS', 'Azure', 'Google Cloud', 'DigitalOcean', 'Vercel', 'Netlify', 'Heroku', 'Railway', 'Render',
    'Fly.io', 'Cloudflare', 'Linode', 'Vultr', 'Scaleway', 'OVHcloud', 'IBM Cloud', 'Oracle Cloud'
  ],
  devops_tool: [
    'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'Ansible', 'Chef', 'Puppet',
    'GitLab CI', 'CircleCI', 'Travis CI', 'TeamCity', 'Bamboo', 'ArgoCD', 'Flux', 'Helm',
    'Prometheus', 'Grafana', 'ELK Stack', 'Jaeger', 'Zipkin', 'Istio', 'Linkerd', 'Consul'
  ],
  deployment_strategy: ['blue-green', 'canary', 'rolling', 'recreate', 'ramp', 'shadow'],
  monitoring_tool: ['Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Splunk', 'ELK Stack', 'Jaeger', 'Zipkin'],
  
  // Data Science & Analytics
  data_type: [
    'customer behavior', 'sales data', 'social media', 'weather data', 'financial data', 'healthcare data',
    'e-commerce transactions', 'user interactions', 'website analytics', 'mobile app usage', 'IoT sensor data',
    'log data', 'email marketing', 'advertising performance', 'inventory data', 'supply chain data',
    'customer feedback', 'product reviews', 'support tickets', 'employee performance', 'market research'
  ],
  analysis_type: [
    'trend analysis', 'predictive modeling', 'segmentation', 'correlation study', 'time series analysis',
    'clustering analysis', 'regression analysis', 'classification analysis', 'anomaly detection', 'sentiment analysis',
    'cohort analysis', 'funnel analysis', 'A/B testing', 'multivariate testing', 'survival analysis',
    'factor analysis', 'principal component analysis', 'association rule mining', 'text mining', 'image analysis'
  ],
  visualization_tool: [
    'Tableau', 'Power BI', 'D3.js', 'Plotly', 'Matplotlib', 'Seaborn', 'ggplot2', 'Bokeh', 'Altair',
    'Observable', 'RawGraphs', 'Flourish', 'Datawrapper', 'Chart.js', 'Highcharts', 'Apache Superset', 'Metabase'
  ],
  business_domain: ['retail', 'finance', 'healthcare', 'education', 'manufacturing', 'logistics', 'marketing', 'sales'],
  metric_type: ['KPIs', 'conversion rates', 'user engagement', 'revenue metrics', 'operational metrics', 'quality metrics'],
  
  // AI / Machine Learning
  model_type: [
    'classification', 'regression', 'clustering', 'recommendation', 'natural language processing', 'computer vision',
    'anomaly detection', 'time series forecasting', 'reinforcement learning', 'generative adversarial network',
    'transformer model', 'convolutional neural network', 'recurrent neural network', 'long short-term memory',
    'autoencoder', 'variational autoencoder', 'decision tree', 'random forest', 'gradient boosting', 'support vector machine'
  ],
  dataset: [
    'customer behavior', 'sales data', 'social media', 'weather data', 'financial data',
    'image classification', 'text classification', 'sentiment analysis', 'object detection', 'facial recognition',
    'speech recognition', 'machine translation', 'question answering', 'text summarization', 'image generation',
    'music generation', 'video analysis', 'recommendation system', 'fraud detection', 'medical diagnosis'
  ],
  tool: [
    'Python', 'TensorFlow', 'PyTorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
    'Jupyter', 'Google Colab', 'Kaggle', 'Hugging Face', 'Weights & Biases', 'MLflow', 'DVC',
    'Apache Spark', 'Apache Kafka', 'Apache Airflow', 'Kubeflow', 'SageMaker', 'Azure ML', 'Vertex AI'
  ],
  algorithm: [
    'random forest', 'neural network', 'support vector machine', 'k-means', 'linear regression',
    'logistic regression', 'decision tree', 'gradient boosting', 'XGBoost', 'LightGBM', 'CatBoost',
    'naive bayes', 'k-nearest neighbors', 'principal component analysis', 'singular value decomposition',
    't-distributed stochastic neighbor embedding', 'autoencoder', 'variational autoencoder', 'generative adversarial network'
  ],
  ml_task: ['supervised learning', 'unsupervised learning', 'semi-supervised learning', 'reinforcement learning', 'transfer learning'],
  evaluation_metric: ['accuracy', 'precision', 'recall', 'F1-score', 'ROC-AUC', 'mean squared error', 'mean absolute error', 'R-squared'],
} as const;

// ============================================================================
// TASK TEMPLATES
// ============================================================================

const TASK_TEMPLATES = [
  // ============================================================================
  // FULL-STACK SOFTWARE DEVELOPMENT - PRACTICE TASKS (25 templates)
  // ============================================================================
  
  // React Components
  {
    name: 'React Component Builder',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Build a [component_type] Component',
      description: 'Create a reusable [component_type] component with [features]. The component should be responsive and follow React best practices.',
      placeholders: ['component_type', 'features'],
      duration_factor: 0.3,
      skill_factor: 0.4,
      complexity_factor: 0.5,
      visibility_factor: 0.6,
      prestige_factor: 0.4,
      autonomy_factor: 0.7,
    },
  },
  {
    name: 'Advanced Component',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Create Advanced [component_type] with [features]',
      description: 'Build a sophisticated [component_type] that implements [features]. Include proper TypeScript types and comprehensive testing.',
      placeholders: ['component_type', 'features'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.6,
      visibility_factor: 0.7,
      prestige_factor: 0.5,
      autonomy_factor: 0.8,
    },
  },
  
  // API Integration
  {
    name: 'API Integration Practice',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Integrate [platform] API',
      description: 'Create a simple integration with [platform] API to demonstrate [functionality]. Include error handling and loading states.',
      placeholders: ['platform', 'functionality'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.6,
      visibility_factor: 0.5,
      prestige_factor: 0.5,
      autonomy_factor: 0.6,
    },
  },
  {
    name: 'Advanced API Integration',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Build [platform] Integration with [functionality]',
      description: 'Create a comprehensive integration with [platform] that provides [functionality]. Include authentication, rate limiting, and caching.',
      placeholders: ['platform', 'functionality'],
      duration_factor: 0.5,
      skill_factor: 0.6,
      complexity_factor: 0.7,
      visibility_factor: 0.6,
      prestige_factor: 0.6,
      autonomy_factor: 0.7,
    },
  },
  
  // Frontend Framework
  {
    name: '[frontend_framework] Component',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Build [component_type] in [frontend_framework]',
      description: 'Create a [component_type] using [frontend_framework] with [features]. Follow framework best practices and conventions.',
      placeholders: ['component_type', 'frontend_framework', 'features'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.5,
      visibility_factor: 0.6,
      prestige_factor: 0.5,
      autonomy_factor: 0.7,
    },
  },
  
  // Backend Development
  {
    name: '[backend_framework] API',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Create [functionality] API with [backend_framework]',
      description: 'Build a RESTful API for [functionality] using [backend_framework]. Include proper validation, error handling, and documentation.',
      placeholders: ['functionality', 'backend_framework'],
      duration_factor: 0.5,
      skill_factor: 0.6,
      complexity_factor: 0.6,
      visibility_factor: 0.7,
      prestige_factor: 0.6,
      autonomy_factor: 0.8,
    },
  },
  
  // Database Integration
  {
    name: '[database] Integration',
    skill_category: 'Full-Stack Software Development',
    task_type: 'practice',
    template: {
      title: 'Integrate [database] for [functionality]',
      description: 'Set up and integrate [database] to support [functionality]. Include proper schema design, migrations, and optimization.',
      placeholders: ['database', 'functionality'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.5,
      visibility_factor: 0.6,
      prestige_factor: 0.5,
      autonomy_factor: 0.7,
    },
  },
  
  // ============================================================================
  // FULL-STACK SOFTWARE DEVELOPMENT - MINI PROJECTS (15 templates)
  // ============================================================================
  
  {
    name: 'Full-Stack Application',
    skill_category: 'Full-Stack Software Development',
    task_type: 'mini_project',
    template: {
      title: 'Build a [functionality] Application',
      description: 'Create a complete web application that implements [functionality]. Include frontend, backend, and database design.',
      placeholders: ['functionality'],
      duration_factor: 0.8,
      skill_factor: 0.7,
      complexity_factor: 0.9,
      visibility_factor: 0.8,
      prestige_factor: 0.8,
      autonomy_factor: 0.9,
    },
  },
  {
    name: 'Advanced Full-Stack App',
    skill_category: 'Full-Stack Software Development',
    task_type: 'mini_project',
    template: {
      title: 'Create Advanced [functionality] Platform',
      description: 'Build a sophisticated platform for [functionality] with multiple user roles, real-time features, and advanced integrations.',
      placeholders: ['functionality'],
      duration_factor: 0.9,
      skill_factor: 0.8,
      complexity_factor: 0.9,
      visibility_factor: 0.9,
      prestige_factor: 0.9,
      autonomy_factor: 0.9,
    },
  },
  
  // ============================================================================
  // CLOUD COMPUTING & DEVOPS - PRACTICE TASKS (25 templates)
  // ============================================================================
  
  // Infrastructure
  {
    name: 'Infrastructure Setup',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'practice',
    template: {
      title: 'Set up [infrastructure_type] on [cloud_platform]',
      description: 'Configure and deploy [infrastructure_type] using [cloud_platform]. Include monitoring, security, and best practices.',
      placeholders: ['infrastructure_type', 'cloud_platform'],
      duration_factor: 0.3,
      skill_factor: 0.4,
      complexity_factor: 0.4,
      visibility_factor: 0.7,
      prestige_factor: 0.5,
      autonomy_factor: 0.6,
    },
  },
  {
    name: 'Advanced Infrastructure',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'practice',
    template: {
      title: 'Deploy [infrastructure_type] with [deployment_strategy]',
      description: 'Implement [infrastructure_type] using [deployment_strategy] strategy. Include blue-green deployment and rollback procedures.',
      placeholders: ['infrastructure_type', 'deployment_strategy'],
      duration_factor: 0.5,
      skill_factor: 0.6,
      complexity_factor: 0.6,
      visibility_factor: 0.8,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  
  // DevOps Pipeline
  {
    name: 'DevOps Pipeline',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'practice',
    template: {
      title: 'Build CI/CD Pipeline with [devops_tool]',
      description: 'Create a complete CI/CD pipeline using [devops_tool] for automated testing, building, and deployment.',
      placeholders: ['devops_tool'],
      duration_factor: 0.5,
      skill_factor: 0.5,
      complexity_factor: 0.6,
      visibility_factor: 0.8,
      prestige_factor: 0.6,
      autonomy_factor: 0.7,
    },
  },
  {
    name: 'Advanced DevOps Pipeline',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'practice',
    template: {
      title: 'Multi-Stage Pipeline with [devops_tool]',
      description: 'Create a sophisticated multi-stage pipeline using [devops_tool] with parallel jobs, conditional stages, and advanced testing.',
      placeholders: ['devops_tool'],
      duration_factor: 0.6,
      skill_factor: 0.7,
      complexity_factor: 0.7,
      visibility_factor: 0.9,
      prestige_factor: 0.8,
      autonomy_factor: 0.8,
    },
  },
  
  // Monitoring
  {
    name: 'Monitoring Setup',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'practice',
    template: {
      title: 'Set up [monitoring_tool] for [infrastructure_type]',
      description: 'Configure [monitoring_tool] to monitor [infrastructure_type]. Include alerting, dashboards, and log aggregation.',
      placeholders: ['monitoring_tool', 'infrastructure_type'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.5,
      visibility_factor: 0.7,
      prestige_factor: 0.6,
      autonomy_factor: 0.7,
    },
  },
  
  // ============================================================================
  // CLOUD COMPUTING & DEVOPS - MINI PROJECTS (15 templates)
  // ============================================================================
  
  {
    name: 'Complete Infrastructure',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'mini_project',
    template: {
      title: 'Complete Cloud Infrastructure for [infrastructure_type]',
      description: 'Design and implement a complete cloud infrastructure solution including networking, security, monitoring, and disaster recovery.',
      placeholders: ['infrastructure_type'],
      duration_factor: 0.8,
      skill_factor: 0.7,
      complexity_factor: 0.8,
      visibility_factor: 0.9,
      prestige_factor: 0.8,
      autonomy_factor: 0.8,
    },
  },
  {
    name: 'Multi-Cloud Setup',
    skill_category: 'Cloud Computing & DevOps',
    task_type: 'mini_project',
    template: {
      title: 'Multi-Cloud [infrastructure_type] Architecture',
      description: 'Design and implement a multi-cloud architecture for [infrastructure_type] across multiple cloud providers with failover and load balancing.',
      placeholders: ['infrastructure_type'],
      duration_factor: 0.9,
      skill_factor: 0.8,
      complexity_factor: 0.9,
      visibility_factor: 0.9,
      prestige_factor: 0.9,
      autonomy_factor: 0.9,
    },
  },
  
  // ============================================================================
  // DATA SCIENCE & ANALYTICS - PRACTICE TASKS (25 templates)
  // ============================================================================
  
  // Data Analysis
  {
    name: 'Data Analysis',
    skill_category: 'Data Science & Analytics',
    task_type: 'practice',
    template: {
      title: 'Analyze [data_type] using [visualization_tool]',
      description: 'Perform comprehensive data analysis on [data_type] using [visualization_tool]. Create insights and actionable recommendations.',
      placeholders: ['data_type', 'visualization_tool'],
      duration_factor: 0.4,
      skill_factor: 0.4,
      complexity_factor: 0.3,
      visibility_factor: 0.6,
      prestige_factor: 0.4,
      autonomy_factor: 0.8,
    },
  },
  {
    name: 'Advanced Data Analysis',
    skill_category: 'Data Science & Analytics',
    task_type: 'practice',
    template: {
      title: 'Deep Dive Analysis of [data_type]',
      description: 'Conduct an in-depth analysis of [data_type] using advanced statistical methods and multiple visualization techniques.',
      placeholders: ['data_type'],
      duration_factor: 0.5,
      skill_factor: 0.6,
      complexity_factor: 0.5,
      visibility_factor: 0.7,
      prestige_factor: 0.6,
      autonomy_factor: 0.8,
    },
  },
  
  // Predictive Modeling
  {
    name: 'Predictive Modeling',
    skill_category: 'Data Science & Analytics',
    task_type: 'practice',
    template: {
      title: 'Build [analysis_type] Model',
      description: 'Create a predictive model for [analysis_type] using statistical methods and machine learning techniques.',
      placeholders: ['analysis_type'],
      duration_factor: 0.5,
      skill_factor: 0.5,
      complexity_factor: 0.4,
      visibility_factor: 0.7,
      prestige_factor: 0.6,
      autonomy_factor: 0.7,
    },
  },
  {
    name: 'Advanced Predictive Modeling',
    skill_category: 'Data Science & Analytics',
    task_type: 'practice',
    template: {
      title: 'Advanced [analysis_type] with [evaluation_metric]',
      description: 'Develop an advanced [analysis_type] model optimized for [evaluation_metric]. Include feature engineering and model selection.',
      placeholders: ['analysis_type', 'evaluation_metric'],
      duration_factor: 0.6,
      skill_factor: 0.7,
      complexity_factor: 0.6,
      visibility_factor: 0.8,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  
  // Business Intelligence
  {
    name: 'Business Intelligence',
    skill_category: 'Data Science & Analytics',
    task_type: 'practice',
    template: {
      title: 'Create [metric_type] Dashboard for [business_domain]',
      description: 'Build a comprehensive dashboard for [metric_type] in the [business_domain] sector using [visualization_tool].',
      placeholders: ['metric_type', 'business_domain', 'visualization_tool'],
      duration_factor: 0.5,
      skill_factor: 0.5,
      complexity_factor: 0.4,
      visibility_factor: 0.7,
      prestige_factor: 0.6,
      autonomy_factor: 0.7,
    },
  },
  
  // ============================================================================
  // DATA SCIENCE & ANALYTICS - MINI PROJECTS (15 templates)
  // ============================================================================
  
  {
    name: 'Data Strategy',
    skill_category: 'Data Science & Analytics',
    task_type: 'mini_project',
    template: {
      title: 'Data Strategy for [data_type]',
      description: 'Develop a comprehensive data strategy including data collection, processing, analysis, and business intelligence implementation.',
      placeholders: ['data_type'],
      duration_factor: 0.7,
      skill_factor: 0.6,
      complexity_factor: 0.7,
      visibility_factor: 0.8,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  {
    name: 'Advanced Analytics Platform',
    skill_category: 'Data Science & Analytics',
    task_type: 'mini_project',
    template: {
      title: 'Build Analytics Platform for [business_domain]',
      description: 'Create a complete analytics platform for [business_domain] with data pipelines, real-time dashboards, and predictive capabilities.',
      placeholders: ['business_domain'],
      duration_factor: 0.9,
      skill_factor: 0.8,
      complexity_factor: 0.8,
      visibility_factor: 0.9,
      prestige_factor: 0.8,
      autonomy_factor: 0.9,
    },
  },
  
  // ============================================================================
  // AI / MACHINE LEARNING - PRACTICE TASKS (25 templates)
  // ============================================================================
  
  // Machine Learning Models
  {
    name: 'Machine Learning Model',
    skill_category: 'AI / Machine Learning',
    task_type: 'practice',
    template: {
      title: 'Build [model_type] Model',
      description: 'Create a [model_type] model using [algorithm] on [dataset]. Include model evaluation and validation.',
      placeholders: ['model_type', 'algorithm', 'dataset'],
      duration_factor: 0.4,
      skill_factor: 0.5,
      complexity_factor: 0.5,
      visibility_factor: 0.6,
      prestige_factor: 0.5,
      autonomy_factor: 0.7,
    },
  },
  {
    name: 'Advanced ML Model',
    skill_category: 'AI / Machine Learning',
    task_type: 'practice',
    template: {
      title: 'Advanced [model_type] with [evaluation_metric]',
      description: 'Develop an advanced [model_type] model optimized for [evaluation_metric] using [tool]. Include hyperparameter tuning.',
      placeholders: ['model_type', 'evaluation_metric', 'tool'],
      duration_factor: 0.6,
      skill_factor: 0.7,
      complexity_factor: 0.7,
      visibility_factor: 0.7,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  
  // Neural Networks
  {
    name: 'Neural Network',
    skill_category: 'AI / Machine Learning',
    task_type: 'practice',
    template: {
      title: 'Build Neural Network for [model_type]',
      description: 'Create a neural network model for [model_type] using [tool]. Include training, validation, and performance analysis.',
      placeholders: ['model_type', 'tool'],
      duration_factor: 0.6,
      skill_factor: 0.7,
      complexity_factor: 0.7,
      visibility_factor: 0.7,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  {
    name: 'Deep Learning Model',
    skill_category: 'AI / Machine Learning',
    task_type: 'practice',
    template: {
      title: 'Deep Learning [model_type] with [tool]',
      description: 'Implement a deep learning [model_type] using [tool]. Include data preprocessing, model architecture, and training pipeline.',
      placeholders: ['model_type', 'tool'],
      duration_factor: 0.7,
      skill_factor: 0.8,
      complexity_factor: 0.8,
      visibility_factor: 0.8,
      prestige_factor: 0.8,
      autonomy_factor: 0.9,
    },
  },
  
  // AI Applications
  {
    name: 'AI Application',
    skill_category: 'AI / Machine Learning',
    task_type: 'practice',
    template: {
      title: 'Build AI-powered [functionality]',
      description: 'Create an AI application that provides [functionality]. Include data preprocessing, model training, and basic deployment.',
      placeholders: ['functionality'],
      duration_factor: 0.6,
      skill_factor: 0.7,
      complexity_factor: 0.7,
      visibility_factor: 0.7,
      prestige_factor: 0.7,
      autonomy_factor: 0.8,
    },
  },
  
  // ============================================================================
  // AI / MACHINE LEARNING - MINI PROJECTS (15 templates)
  // ============================================================================
  
  {
    name: 'Complete AI System',
    skill_category: 'AI / Machine Learning',
    task_type: 'mini_project',
    template: {
      title: 'Build Complete AI System for [functionality]',
      description: 'Develop a complete AI system that provides [functionality]. Include data pipelines, model training, deployment, and monitoring.',
      placeholders: ['functionality'],
      duration_factor: 0.9,
      skill_factor: 0.8,
      complexity_factor: 0.9,
      visibility_factor: 0.8,
      prestige_factor: 0.9,
      autonomy_factor: 0.9,
    },
  },
  {
    name: 'Advanced AI Platform',
    skill_category: 'AI / Machine Learning',
    task_type: 'mini_project',
    template: {
      title: 'Create AI Platform for [ml_task]',
      description: 'Build a comprehensive AI platform for [ml_task] with multiple models, A/B testing, and real-time inference capabilities.',
      placeholders: ['ml_task'],
      duration_factor: 0.9,
      skill_factor: 0.9,
      complexity_factor: 0.9,
      visibility_factor: 0.9,
      prestige_factor: 0.9,
      autonomy_factor: 0.9,
    },
  },
];

// ============================================================================
// DIFFICULTY PROGRESSION RULES
// ============================================================================

const DIFFICULTY_LEVELS = {
  easy: {
    minSkillFactor: 0.2,
    maxSkillFactor: 0.4,
    minComplexityFactor: 0.2,
    maxComplexityFactor: 0.4,
    durationMultiplier: 0.7,
    pointsMultiplier: 0.7,
    description: 'Beginner-friendly tasks with clear instructions',
  },
  medium: {
    minSkillFactor: 0.4,
    maxSkillFactor: 0.6,
    minComplexityFactor: 0.4,
    maxComplexityFactor: 0.6,
    durationMultiplier: 1.0,
    pointsMultiplier: 1.0,
    description: 'Intermediate tasks requiring some experience',
  },
  hard: {
    minSkillFactor: 0.6,
    maxSkillFactor: 0.8,
    minComplexityFactor: 0.6,
    maxComplexityFactor: 0.8,
    durationMultiplier: 1.3,
    pointsMultiplier: 1.3,
    description: 'Advanced tasks for experienced developers',
  },
  expert: {
    minSkillFactor: 0.8,
    maxSkillFactor: 1.0,
    minComplexityFactor: 0.8,
    maxComplexityFactor: 1.0,
    durationMultiplier: 1.6,
    pointsMultiplier: 1.6,
    description: 'Expert-level tasks with high complexity',
  },
} as const;

/**
 * Calculate difficulty level based on factors
 */
function calculateDifficultyLevel(
  skillFactor: number,
  complexityFactor: number,
  durationFactor: number
): keyof typeof DIFFICULTY_LEVELS {
  const averageFactor = (skillFactor + complexityFactor + durationFactor) / 3;
  
  if (averageFactor <= 0.4) return 'easy';
  if (averageFactor <= 0.6) return 'medium';
  if (averageFactor <= 0.8) return 'hard';
  return 'expert';
}

/**
 * Adjust task factors based on difficulty level
 */
function adjustFactorsForDifficulty(
  template: any,
  difficulty: keyof typeof DIFFICULTY_LEVELS
): any {
  const level = DIFFICULTY_LEVELS[difficulty];
  
  return {
    ...template,
    skill_factor: Math.min(Math.max(template.skill_factor, level.minSkillFactor), level.maxSkillFactor),
    complexity_factor: Math.min(Math.max(template.complexity_factor, level.minComplexityFactor), level.maxComplexityFactor),
    duration_factor: template.duration_factor * level.durationMultiplier,
  };
}

// ============================================================================
// ROTATION & EXPIRATION LOGIC
// ============================================================================

const ROTATION_CONFIG = {
  // Task expiration settings
  defaultExpirationDays: 14,
  maxCompletions: 50,
  
  // Rotation windows (in days)
  rotationWindows: {
    easy: 7,      // Easy tasks rotate weekly
    medium: 14,   // Medium tasks rotate bi-weekly
    hard: 21,     // Hard tasks rotate every 3 weeks
    expert: 28,   // Expert tasks rotate monthly
  },
  
  // Duplicate prevention
  duplicatePreventionDays: 30, // Prevent same template within 30 days
  
  // Skill-specific rotation
  skillRotation: {
    'Full-Stack Software Development': { maxActiveTasks: 25, rotationDays: 10 },
    'Cloud Computing & DevOps': { maxActiveTasks: 20, rotationDays: 12 },
    'Data Science & Analytics': { maxActiveTasks: 20, rotationDays: 12 },
    'AI / Machine Learning': { maxActiveTasks: 20, rotationDays: 12 },
  },
} as const;

/**
 * Check if task should be rotated based on various criteria
 */
function shouldRotateTask(task: any): boolean {
  const now = new Date();
  const taskCreated = new Date(task.created_at);
  const daysSinceCreation = (now.getTime() - taskCreated.getTime()) / (1000 * 60 * 60 * 24);
  
  // Check expiration
  if (task.expires_at && new Date(task.expires_at) <= now) {
    return true;
  }
  
  // Check max completions
  if (task.completion_count >= ROTATION_CONFIG.maxCompletions) {
    return true;
  }
  
  // Check rotation window based on difficulty
  const difficulty = task.difficulty_level || 'medium';
  const rotationDays = ROTATION_CONFIG.rotationWindows[difficulty as keyof typeof ROTATION_CONFIG.rotationWindows];
  
  if (daysSinceCreation >= rotationDays) {
    return true;
  }
  
  return false;
}

/**
 * Check for duplicate tasks within rotation window
 */
async function checkForDuplicateTask(templateId: string, skillCategory: string): Promise<boolean> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ROTATION_CONFIG.duplicatePreventionDays);
  
  const { data: existingTasks, error } = await supabaseAdmin
    .from('tasks')
    .select('id')
    .eq('template_id', templateId)
    .eq('skill_category', skillCategory)
    .gte('created_at', cutoffDate.toISOString())
    .eq('is_active', true);
  
  if (error) {
    logger.error('Error checking for duplicate tasks:', error);
    return false; // Allow creation if check fails
  }
  
  return (existingTasks?.length || 0) > 0;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get random placeholder value
 */
function getRandomPlaceholderValue(placeholder: string): string {
  const values = PLACEHOLDER_VALUES[placeholder as keyof typeof PLACEHOLDER_VALUES];
  if (!values) {
    return `[${placeholder}]`; // Return placeholder if no values defined
  }
  return values[Math.floor(Math.random() * values.length)];
}

/**
 * Replace placeholders in template
 */
function replacePlaceholders(template: string, placeholders: string[]): string {
  let result = template;
  placeholders.forEach(placeholder => {
    const value = getRandomPlaceholderValue(placeholder);
    result = result.replace(`[${placeholder}]`, value);
  });
  return result;
}

/**
 * Calculate task duration based on type
 */
function calculateTaskDuration(taskType: keyof typeof TASK_TYPES): number {
  const config = TASK_TYPES[taskType];
  const min = config.duration.min;
  const max = config.duration.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate base and max points based on task type
 */
function calculateTaskPoints(taskType: keyof typeof TASK_TYPES): { base: number; max: number } {
  const config = TASK_TYPES[taskType];
  const base = config.basePoints;
  const max = config.maxPoints;
  return { base, max };
}

// ============================================================================
// TASK GENERATION
// ============================================================================

/**
 * Generate a single task from template
 */
export async function generateTaskFromTemplate(templateId: string): Promise<{
  success: boolean;
  task?: any;
  error?: string;
}> {
  try {
    // Get template
    const { data: template, error: templateError } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return { success: false, error: 'Template not found' };
    }

    const templateData = JSON.parse(template.template_json);
    
    // Check for duplicate tasks within rotation window
    const isDuplicate = await checkForDuplicateTask(templateId, template.skill_category);
    if (isDuplicate) {
      return { success: false, error: 'Duplicate task detected within rotation window' };
    }
    
    // Replace placeholders
    const title = replacePlaceholders(templateData.title, templateData.placeholders);
    const description = replacePlaceholders(templateData.description, templateData.placeholders);
    
    // Calculate difficulty level
    const difficultyLevel = calculateDifficultyLevel(
      templateData.skill_factor,
      templateData.complexity_factor,
      templateData.duration_factor
    );
    
    // Adjust factors based on difficulty
    const adjustedTemplate = adjustFactorsForDifficulty(templateData, difficultyLevel);
    
    // Calculate task properties with difficulty adjustments
    const baseDuration = calculateTaskDuration(template.task_type as keyof typeof TASK_TYPES);
    const basePoints = calculateTaskPoints(template.task_type as keyof typeof TASK_TYPES);
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficultyLevel].durationMultiplier;
    const pointsMultiplier = DIFFICULTY_LEVELS[difficultyLevel].pointsMultiplier;
    
    const duration = Math.round(baseDuration * difficultyMultiplier);
    const points = {
      base: Math.round(basePoints.base * pointsMultiplier),
      max: Math.round(basePoints.max * pointsMultiplier),
    };
    
    // Set expiration based on difficulty and skill category
    const skillConfig = ROTATION_CONFIG.skillRotation[template.skill_category as keyof typeof ROTATION_CONFIG.skillRotation];
    const rotationDays = skillConfig?.rotationDays || ROTATION_CONFIG.defaultExpirationDays;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + rotationDays);
    
    // Create task
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert({
        title,
        description,
        skill_category: template.skill_category,
        task_type: template.task_type,
        base_points: points.base,
        max_points: points.max,
        estimated_duration: duration,
        duration_factor: adjustedTemplate.duration_factor,
        skill_factor: adjustedTemplate.skill_factor,
        complexity_factor: adjustedTemplate.complexity_factor,
        visibility_factor: adjustedTemplate.visibility_factor,
        prestige_factor: adjustedTemplate.prestige_factor,
        autonomy_factor: adjustedTemplate.autonomy_factor,
        expires_at: expiresAt.toISOString(),
        template_id: templateId,
        difficulty_level: difficultyLevel,
        max_completions: ROTATION_CONFIG.maxCompletions,
      })
      .select('*')
      .single();

    if (taskError) {
      logger.error('❌ Failed to create task from template:', { error: taskError.message });
      return { success: false, error: 'Failed to create task' };
    }

    // Log generation
    await supabaseAdmin
      .from('generated_tasks')
      .insert({
        template_id: templateId,
        task_id: task.id,
        generation_params: {
          placeholders: templateData.placeholders,
          difficulty_level: difficultyLevel,
          timestamp: new Date().toISOString(),
        },
      });

    logger.info('✅ Task generated from template', {
      taskId: task.id,
      templateId,
      skillCategory: template.skill_category,
      difficultyLevel,
      duration,
      points: points.base + '-' + points.max,
    });

    return { success: true, task };

  } catch (error) {
    logger.error('❌ Task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, error: 'Task generation failed' };
  }
}

/**
 * Generate tasks for all skill categories
 */
export async function generateTasksForAllCategories(): Promise<{
  success: boolean;
  generated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let generated = 0;

  try {
    // Get all active templates
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      throw new Error('Failed to fetch templates');
    }

    // Generate tasks for each template
    for (const template of templates || []) {
      const result = await generateTaskFromTemplate(template.id);
      if (result.success) {
        generated++;
      } else {
        errors.push(`Template ${template.name}: ${result.error}`);
      }
    }

    logger.info('✅ Task generation completed', { generated, errors: errors.length });

    return { success: true, generated, errors };

  } catch (error) {
    logger.error('❌ Bulk task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, generated, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// ============================================================================
// TASK ROTATION
// ============================================================================

/**
 * Check and expire old tasks
 */
export async function rotateExpiredTasks(): Promise<{
  success: boolean;
  expired: number;
  error?: string;
}> {
  try {
    const now = new Date().toISOString();

    // Find tasks that should be rotated based on new criteria
    const { data: allActiveTasks, error: fetchError } = await supabaseAdmin
      .from('tasks')
      .select('id, title, completion_count, max_completions, created_at, expires_at, difficulty_level, skill_category')
      .eq('is_active', true);

    if (fetchError) {
      throw new Error('Failed to fetch active tasks');
    }

    const tasksToRotate = allActiveTasks?.filter(task => shouldRotateTask(task)) || [];
    let expired = 0;

    // Rotate tasks that meet criteria
    for (const task of tasksToRotate) {
      const { error: updateError } = await supabaseAdmin
        .from('tasks')
        .update({ 
          is_active: false,
          rotated_at: now,
          rotation_reason: getRotationReason(task)
        })
        .eq('id', task.id);

      if (updateError) {
        logger.error('Failed to rotate task:', { taskId: task.id, error: updateError.message });
      } else {
        expired++;
        logger.info('Task rotated:', { 
          taskId: task.id, 
          title: task.title,
          reason: getRotationReason(task)
        });
      }
    }

    logger.info('✅ Task rotation completed', { expired, totalChecked: allActiveTasks?.length || 0 });

    return { success: true, expired };

  } catch (error) {
    logger.error('❌ Task rotation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, expired: 0, error: 'Task rotation failed' };
  }
}

/**
 * Get rotation reason for a task
 */
function getRotationReason(task: any): string {
  const now = new Date();
  
  if (task.expires_at && new Date(task.expires_at) <= now) {
    return 'expired';
  }
  
  if (task.completion_count >= ROTATION_CONFIG.maxCompletions) {
    return 'max_completions_reached';
  }
  
  const taskCreated = new Date(task.created_at);
  const daysSinceCreation = (now.getTime() - taskCreated.getTime()) / (1000 * 60 * 60 * 24);
  const difficulty = task.difficulty_level || 'medium';
  const rotationDays = ROTATION_CONFIG.rotationWindows[difficulty as keyof typeof ROTATION_CONFIG.rotationWindows];
  
  if (daysSinceCreation >= rotationDays) {
    return 'rotation_window_expired';
  }
  
  return 'manual_rotation';
}



// ============================================================================
// SKILL-GATED TASKS
// ============================================================================

/**
 * Get tasks filtered by user skills
 */
export async function getSkillGatedTasks(
  userId: string,
  filters: {
    skill?: string;
    type?: keyof typeof TASK_TYPES;
    difficulty?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{
  success: boolean;
  tasks?: any[];
  error?: string;
}> {
  try {
    // Get user's skills
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('primary_skill, secondary_skills')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return { success: false, error: 'User not found' };
    }

    // Build skill filter
    const userSkills = [user.primary_skill, ...(user.secondary_skills || [])].filter(Boolean);
    
    // Build query
    let query = supabaseAdmin
      .from('tasks')
      .select(`
        id, title, description, skill_category, task_type, base_points, max_points,
        estimated_duration, duration_factor, skill_factor, complexity_factor,
        visibility_factor, prestige_factor, autonomy_factor, difficulty_level,
        is_active, expires_at, completion_count, max_completions, created_at
      `)
      .eq('is_active', true)
      .in('skill_category', userSkills)
      .order('created_at', { ascending: false });

    // Apply additional filters
    if (filters.type) {
      query = query.eq('task_type', filters.type);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    if (filters.skill) {
      query = query.eq('skill_category', filters.skill);
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      throw new Error('Failed to fetch tasks');
    }

    logger.info('✅ Skill-gated tasks fetched', {
      userId,
      skillCount: userSkills.length,
      taskCount: tasks?.length || 0,
    });

    return { success: true, tasks: tasks || [] };

  } catch (error) {
    logger.error('❌ Skill-gated tasks error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// TEMPLATE MANAGEMENT
// ============================================================================

/**
 * Initialize task templates in database
 */
export async function initializeTaskTemplates(): Promise<{
  success: boolean;
  created: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let created = 0;

  try {
    for (const template of TASK_TEMPLATES) {
      const { error: insertError } = await supabaseAdmin
        .from('task_templates')
        .insert({
          name: template.name,
          skill_category: template.skill_category,
          task_type: template.task_type,
          template_json: JSON.stringify(template.template),
          is_active: true,
        });

      if (insertError) {
        errors.push(`Template ${template.name}: ${insertError.message}`);
      } else {
        created++;
      }
    }

    logger.info('✅ Task templates initialized', { created, errors: errors.length });

    return { success: true, created, errors };

  } catch (error) {
    logger.error('❌ Template initialization error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, created, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

// ============================================================================
// DEMO TASK GENERATION FOR VERIFICATION
// ============================================================================

/**
 * Generate demo tasks for each skill category for verification
 */
export async function generateDemoTasksForVerification(): Promise<{
  success: boolean;
  generated: number;
  tasks: any[];
  errors: string[];
}> {
  const errors: string[] = [];
  const tasks: any[] = [];
  let generated = 0;

  try {
    // Get all templates
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('task_templates')
      .select('*')
      .eq('is_active', true);

    if (templatesError) {
      throw new Error('Failed to fetch templates');
    }

    // Generate 5 demo tasks per skill category
    const skillCategories = Object.keys(SKILL_CATEGORIES);
    
    for (const skillCategory of skillCategories) {
      const skillTemplates = templates?.filter(t => t.skill_category === skillCategory) || [];
      
      // Generate demo tasks for this skill
      for (let i = 0; i < 5 && i < skillTemplates.length; i++) {
        const template = skillTemplates[i];
        
        // Generate task without saving to database (for demo purposes)
        const demoTask = await generateDemoTaskFromTemplate(template);
        
        if (demoTask.success && demoTask.task) {
          tasks.push(demoTask.task);
          generated++;
        } else {
          errors.push(`Template ${template.name}: ${demoTask.error}`);
        }
      }
    }

    logger.info('✅ Demo task generation completed', { 
      generated, 
      errors: errors.length,
      tasksPerSkill: Math.floor(generated / skillCategories.length)
    });

    return { success: true, generated, tasks, errors };

  } catch (error) {
    logger.error('❌ Demo task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, generated, tasks, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}

/**
 * Generate a demo task from template (without saving to database)
 */
async function generateDemoTaskFromTemplate(template: any): Promise<{
  success: boolean;
  task?: any;
  error?: string;
}> {
  try {
    const templateData = JSON.parse(template.template_json);
    
    // Replace placeholders
    const title = replacePlaceholders(templateData.title, templateData.placeholders);
    const description = replacePlaceholders(templateData.description, templateData.placeholders);
    
    // Calculate difficulty level
    const difficultyLevel = calculateDifficultyLevel(
      templateData.skill_factor,
      templateData.complexity_factor,
      templateData.duration_factor
    );
    
    // Adjust factors based on difficulty
    const adjustedTemplate = adjustFactorsForDifficulty(templateData, difficultyLevel);
    
    // Calculate task properties with difficulty adjustments
    const baseDuration = calculateTaskDuration(template.task_type as keyof typeof TASK_TYPES);
    const basePoints = calculateTaskPoints(template.task_type as keyof typeof TASK_TYPES);
    const difficultyMultiplier = DIFFICULTY_LEVELS[difficultyLevel].durationMultiplier;
    const pointsMultiplier = DIFFICULTY_LEVELS[difficultyLevel].pointsMultiplier;
    
    const duration = Math.round(baseDuration * difficultyMultiplier);
    const points = {
      base: Math.round(basePoints.base * pointsMultiplier),
      max: Math.round(basePoints.max * pointsMultiplier),
    };
    
    // Create demo task object (not saved to database)
    const demoTask = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      skill_category: template.skill_category,
      task_type: template.task_type,
      base_points: points.base,
      max_points: points.max,
      estimated_duration: duration,
      difficulty_level: difficultyLevel,
      template_id: template.id,
      is_demo: true,
      created_at: new Date().toISOString(),
    };

    return { success: true, task: demoTask };

  } catch (error) {
    logger.error('❌ Demo task generation error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    return { success: false, error: 'Demo task generation failed' };
  }
}

/**
 * Verify that no old skill names appear in generated tasks
 */
export function verifyNoOldSkillsInTasks(tasks: any[]): {
  success: boolean;
  oldSkillsFound: string[];
  verification: {
    totalTasks: number;
    tasksWithOldSkills: number;
    oldSkillNames: string[];
  };
} {
  const oldSkillNames = ['Web Development', 'Web Dev', 'Design', 'Content Writing', 'Content', 'AI/Data Science'];
  const oldSkillsFound: string[] = [];
  
  for (const task of tasks) {
    const taskText = `${task.title} ${task.description}`.toLowerCase();
    
    for (const oldSkill of oldSkillNames) {
      if (taskText.includes(oldSkill.toLowerCase())) {
        oldSkillsFound.push(`${oldSkill} found in task: ${task.title}`);
      }
    }
  }
  
  const verification = {
    totalTasks: tasks.length,
    tasksWithOldSkills: oldSkillsFound.length,
    oldSkillNames: oldSkillsFound,
  };
  
  return {
    success: oldSkillsFound.length === 0,
    oldSkillsFound,
    verification,
  };
}

/**
 * Check for duplicate tasks within rotation window
 */
export function checkForDuplicatesInTasks(tasks: any[]): {
  success: boolean;
  duplicatesFound: string[];
  verification: {
    totalTasks: number;
    uniqueTemplates: number;
    duplicateCount: number;
  };
} {
  const templateIds = tasks.map(task => task.template_id);
  const uniqueTemplates = new Set(templateIds);
  const duplicatesFound: string[] = [];
  
  // Check for duplicate template IDs
  const templateCounts: { [key: string]: number } = {};
  templateIds.forEach(id => {
    templateCounts[id] = (templateCounts[id] || 0) + 1;
  });
  
  Object.entries(templateCounts).forEach(([templateId, count]) => {
    if (count > 1) {
      duplicatesFound.push(`Template ${templateId} used ${count} times`);
    }
  });
  
  const verification = {
    totalTasks: tasks.length,
    uniqueTemplates: uniqueTemplates.size,
    duplicateCount: duplicatesFound.length,
  };
  
  return {
    success: duplicatesFound.length === 0,
    duplicatesFound,
    verification,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SKILL_CATEGORIES,
  TASK_TYPES,
  generateTaskFromTemplate,
  generateTasksForAllCategories,
  rotateExpiredTasks,
  getSkillGatedTasks,
  initializeTaskTemplates,
  generateDemoTasksForVerification,
  verifyNoOldSkillsInTasks,
  checkForDuplicatesInTasks,
};

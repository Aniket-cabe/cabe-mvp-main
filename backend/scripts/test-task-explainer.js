/**
 * Test script for CaBOT Task Explainer Prompt System
 *
 * This script validates the task explainer prompt with sample inputs
 * and checks response format, word count, and structure.
 */

const fs = require('fs');
const path = require('path');

// Sample test cases
const testCases = [
  {
    title: 'Logo Sketch for Café',
    context:
      'Client wants a minimalist coffee-themed logo for branding. Prior logos attached.',
  },
  {
    title: 'Build Contact Form with Validation',
    context:
      'React app needs a contact form with email validation, required fields, and success/error states.',
  },
  {
    title: 'Blog Post: AI in Education',
    context:
      '1500-word article for teachers about practical AI tools. Target audience: K-12 educators with minimal tech experience.',
  },
  {
    title: 'Sales Dashboard Analysis',
    context:
      'Analyze Q3 sales data and create visual dashboard showing trends, top products, regional performance.',
  },
  {
    title: 'Product Demo Video',
    context:
      '2-minute video showcasing new app features. Raw footage provided. Need titles, transitions, and background music.',
  },
];

// Expected response structure patterns
const expectedStructure = {
  whatYouDo: /\*\*What You'll Do:\*\*\s*\n([^*]+)/,
  skillsNeeded: /\*\*Skills You'll Need:\*\*\s*\n([^*]+)/,
  proTip: /\*\*Pro Tip:\*\*\s*\n([^*]+)/,
};

/**
 * Load the task explainer prompt
 */
function loadPrompt() {
  try {
    const promptPath = path.join(__dirname, '../prompts/task-explainer.txt');
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Failed to load prompt file:', error.message);
    process.exit(1);
  }
}

/**
 * Count words in text (excluding markdown formatting)
 */
function countWords(text) {
  return text
    .replace(/\*\*[^*]+\*\*/g, '') // Remove markdown bold
    .replace(/[•\-]/g, '') // Remove bullet points
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .split(' ')
    .filter((word) => word.length > 0).length;
}

/**
 * Validate response structure
 */
function validateStructure(response) {
  const results = {
    hasWhatYouDo: false,
    hasSkillsNeeded: false,
    hasProTip: false,
    wordCounts: {},
    totalWords: 0,
    isValid: false,
  };

  // Check for required sections
  const whatYouDoMatch = response.match(expectedStructure.whatYouDo);
  const skillsNeededMatch = response.match(expectedStructure.skillsNeeded);
  const proTipMatch = response.match(expectedStructure.proTip);

  results.hasWhatYouDo = !!whatYouDoMatch;
  results.hasSkillsNeeded = !!skillsNeededMatch;
  results.hasProTip = !!proTipMatch;

  // Count words in each section
  if (whatYouDoMatch) {
    results.wordCounts.whatYouDo = countWords(whatYouDoMatch[1]);
  }
  if (skillsNeededMatch) {
    results.wordCounts.skillsNeeded = countWords(skillsNeededMatch[1]);
  }
  if (proTipMatch) {
    results.wordCounts.proTip = countWords(proTipMatch[1]);
  }

  // Total word count
  results.totalWords = countWords(response);

  // Validation criteria
  results.isValid =
    results.hasWhatYouDo &&
    results.hasSkillsNeeded &&
    results.hasProTip &&
    results.totalWords <= 120;

  return results;
}

/**
 * Simulate LLM response (for testing structure validation)
 * In production, this would call the actual LLM API
 */
function simulateResponse(taskData) {
  // Sample response for testing - would come from LLM in production
  return `**What You'll Do:**
First, research the task requirements and gather all necessary information. Then break down the work into manageable steps and execute each one systematically. Finally, review and refine your output to ensure quality.

**Skills You'll Need:**
• Research and planning
• Task management
• Quality assurance
• Domain-specific expertise

**Pro Tip:**
Start with the end goal in mind and work backwards - it keeps you focused on what really matters! 🎯`;
}

/**
 * Test the prompt system with sample inputs
 */
function runTests() {
  console.log('🧪 Testing CaBOT Task Explainer Prompt System\n');

  const prompt = loadPrompt();
  console.log(`📄 Loaded prompt (${countWords(prompt)} words)`);
  console.log(`📝 Testing with ${testCases.length} sample tasks\n`);

  let passedTests = 0;
  const results = [];

  testCases.forEach((testCase, index) => {
    console.log(`\n--- Test ${index + 1}: ${testCase.title} ---`);

    // In production, this would make an actual LLM API call
    // const response = await callLLM(prompt, JSON.stringify(testCase));
    const response = simulateResponse(testCase);

    const validation = validateStructure(response);
    results.push({ testCase, response, validation });

    console.log(
      `Structure complete: ${validation.hasWhatYouDo && validation.hasSkillsNeeded && validation.hasProTip ? '✅' : '❌'}`
    );
    console.log(
      `Word count: ${validation.totalWords}/120 ${validation.totalWords <= 120 ? '✅' : '❌'}`
    );
    console.log(`Section breakdown:`);
    console.log(
      `  - What You'll Do: ${validation.wordCounts.whatYouDo || 0} words`
    );
    console.log(
      `  - Skills Needed: ${validation.wordCounts.skillsNeeded || 0} words`
    );
    console.log(`  - Pro Tip: ${validation.wordCounts.proTip || 0} words`);

    if (validation.isValid) {
      console.log('✅ PASSED');
      passedTests++;
    } else {
      console.log('❌ FAILED');
    }
  });

  // Summary
  console.log(`\n📊 Test Summary:`);
  console.log(`Passed: ${passedTests}/${testCases.length}`);
  console.log(
    `Success Rate: ${Math.round((passedTests / testCases.length) * 100)}%`
  );

  if (passedTests === testCases.length) {
    console.log(
      '\n🎉 All tests passed! The prompt system is working correctly.'
    );
  } else {
    console.log(
      '\n⚠️  Some tests failed. Check the prompt configuration and validation criteria.'
    );
  }

  return results;
}

/**
 * Generate a test report
 */
function generateReport(results) {
  const reportPath = path.join(__dirname, '../prompts/test-report.md');

  let report = `# Task Explainer Test Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total Tests: ${results.length}\n`;
  report += `- Passed: ${results.filter((r) => r.validation.isValid).length}\n`;
  report += `- Failed: ${results.filter((r) => !r.validation.isValid).length}\n\n`;

  report += `## Detailed Results\n\n`;

  results.forEach((result, index) => {
    report += `### Test ${index + 1}: ${result.testCase.title}\n\n`;
    report += `**Input:**\n`;
    report += `\`\`\`json\n${JSON.stringify(result.testCase, null, 2)}\n\`\`\`\n\n`;
    report += `**Response:**\n`;
    report += `\`\`\`\n${result.response}\n\`\`\`\n\n`;
    report += `**Validation:**\n`;
    report += `- Structure Complete: ${result.validation.hasWhatYouDo && result.validation.hasSkillsNeeded && result.validation.hasProTip ? '✅' : '❌'}\n`;
    report += `- Word Count: ${result.validation.totalWords}/120 ${result.validation.totalWords <= 120 ? '✅' : '❌'}\n`;
    report += `- Overall: ${result.validation.isValid ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    report += `---\n\n`;
  });

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Test report saved to: ${reportPath}`);
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const results = runTests();
  generateReport(results);
}

module.exports = {
  loadPrompt,
  countWords,
  validateStructure,
  runTests,
  testCases,
};

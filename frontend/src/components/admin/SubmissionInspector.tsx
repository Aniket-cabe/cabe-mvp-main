import React from 'react';

interface Submission {
  id: string;
  userId: string;
  userScore: number;
  aiScore: number;
  deviationType: 'none' | 'minor' | 'major' | 'critical';
  suggestedAction: 'allow' | 'flag_for_review' | 'escalate' | 'override';
  taskTitle: string;
  skillArea: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  timestamp: string;
  reasoning: string;
  userProof: string;
  userCode: string;
  taskDescription: string;
}

interface SubmissionInspectorProps {
  submission?: Submission | null;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const SubmissionInspector: React.FC<SubmissionInspectorProps> = ({
  submission,
  isOpen = false,
  // onClose,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Submission Inspector
      </h3>
      {submission ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Inspecting submission: {submission.id}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User Score</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{submission.userScore}/100</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Score</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{submission.aiScore}/100</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Select a submission to inspect
        </p>
      )}
    </div>
  );
};

export default SubmissionInspector;

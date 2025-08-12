import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import {
  // ChatBubbleLeftIcon,
  // CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface ReviewComment {
  commentId: string;
  reviewerId: string;
  reviewerName: string;
  lineNumber: number;
  content: string;
  timestamp: Date;
  replies: ReviewComment[];
}

interface ReviewProps {
  submissionId: string;
  currentUserId: string;
  currentUsername: string;
  isReviewer: boolean;
}

export const CollaborationReview: React.FC<ReviewProps> = ({
  // submissionId,
  currentUserId,
  currentUsername,
  isReviewer,
}) => {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  // const [isConnected, setIsConnected] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useWebSocket({
    url: `ws://localhost:8081?token=${localStorage.getItem('authToken')}`,
    handlers: {
      chatMessage: () => {}, // Placeholder handler
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // function handleWebSocketMessage(event: any) {
  //   const message = JSON.parse(event.data);

  //   switch (message.type) {
  //     case 'review_comment':
  //       setComments((prev) => [...prev, message.comment]);
  //       break;
  //   }
  // }

  // function handleLineClick(lineNumber: number) {
  //   if (!isReviewer) return;
  //   setSelectedLine(lineNumber);
  // }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();

    if (!newComment.trim() || !selectedLine) return;

    const comment: Omit<ReviewComment, 'commentId' | 'timestamp'> = {
      reviewerId: currentUserId,
      reviewerName: currentUsername,
      lineNumber: selectedLine,
      content: newComment.trim(),
      replies: [],
    };

    const tempComment: ReviewComment = {
      ...comment,
      commentId: `temp-${Date.now()}`,
      timestamp: new Date(),
    };
    setComments((prev) => [...prev, tempComment]);
    setNewComment('');
    setSelectedLine(null);

    sendMessage({
      type: 'review_comment',
      comment,
    });

    toast.success('Comment added! 💬');
  }

  function scrollToBottom() {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes < 1 ? 'Just now' : `${minutes}m ago`;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">🔍</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Code Review
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {comments.length} comments
            </p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No comments yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isReviewer
                ? 'Click on a line number to add your first comment!'
                : 'Reviewers will add comments here.'}
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.commentId}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {comment.reviewerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {comment.reviewerName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Line {comment.lineNumber}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Add Comment Form */}
      {isReviewer && selectedLine && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add comment for line {selectedLine}
            </span>
            <button
              onClick={() => setSelectedLine(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your review comment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedLine(null)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Comment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instructions */}
      {isReviewer && !selectedLine && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Click on any line number in the code editor to add a review
            comment
          </p>
        </div>
      )}
    </div>
  );
};

export default CollaborationReview;

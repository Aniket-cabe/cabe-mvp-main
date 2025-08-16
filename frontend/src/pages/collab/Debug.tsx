import { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { BugAntIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

interface DebugProps {
  roomId: string;
  currentUserId: string;
  currentUsername: string;
}

export const CollaborationDebug: React.FC<DebugProps> = ({
  roomId,
  currentUserId,
  currentUsername,
}) => {
  // const [logs, setLogs] = useState<
  //   Array<{ id: string; message: string; username: string; timestamp: Date }>
  // >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [newLogMessage, setNewLogMessage] = useState('');

  const { sendMessage } = useWebSocket({
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8081',
    handlers: {
      chatMessage: () => {}, // Placeholder handler
    },
  });

  // function handleWebSocketMessage(event: any) {
  //   try {
  //     const data = JSON.parse(event.data);
  //     if (data.type === 'debug_state' && data.action === 'add_log') {
  //       setLogs((prev) => [
  //         ...prev,
  //         {
  //           id: `log_${Date.now()}`,
  //           message: data.data.message,
  //           username: data.data.username,
  //           timestamp: new Date(),
  //         },
  //       ]);
  //     }
  //   } catch (error) {
  //     console.error('Error parsing WebSocket message:', error);
  //   }
  // }

  function handleAddLog() {
    if (!newLogMessage.trim()) return;

    sendMessage({
      type: 'debug_state',
      roomId,
      action: 'add_log',
      data: {
        message: newLogMessage,
        userId: currentUserId,
        username: currentUsername,
      },
    });

    setNewLogMessage('');
    toast.success('Log message added');
  }

  function toggleDebug() {
    setIsRunning(!isRunning);
    toast.success(isRunning ? 'Debugging paused' : 'Debugging started');
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BugAntIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Collaborative Debugging
          </h2>
        </div>
        <button
          onClick={toggleDebug}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            isRunning
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {isRunning ? (
            <PauseIcon className="h-4 w-4" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Debug Logs</h3>

        <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
          {/* {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No logs yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {log.username}:
                  </span>
                  <span className="text-sm text-gray-800">{log.message}</span>
                </div>
              ))}
            </div>
          )} */}
          <p className="text-gray-500 text-sm">No logs yet</p>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newLogMessage}
            onChange={(e) => setNewLogMessage(e.target.value)}
            placeholder="Add debug message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddLog()}
          />
          <button
            onClick={handleAddLog}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDebug;

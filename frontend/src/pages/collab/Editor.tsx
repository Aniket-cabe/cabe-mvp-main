import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
// import { toast } from 'react-hot-toast';

// interface CollaborationUser {
//   userId: string;
//   username: string;
//   avatarUrl?: string;
//   cursor?: { line: number; column: number };
//   color: string;
// }

interface CodeChange {
  userId: string;
  operation: 'insert' | 'delete';
  position: number;
  text?: string;
  length?: number;
}

interface EditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
}

export const CollaborationEditor: React.FC<EditorProps> = ({
  initialCode = '',
  language = 'javascript',
  readOnly = false,
}) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState(initialCode);
  // const [users, setUsers] = useState<CollaborationUser[]>([]);
  // const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);
  // const cursorDecorations = useRef<string[]>([]);

  const { sendMessage, joinRoom, leaveRoom } = useWebSocket({
    url: `ws://localhost:8081?token=${localStorage.getItem('authToken')}`,
    handlers: {
      chatMessage: () => {}, // Placeholder handler
    },
  });

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      setIsLoading(false);
    }
  }, [roomId, joinRoom]);

  useEffect(() => {
    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, leaveRoom]);

  // function handleConnect() {
  //   setIsConnected(true);
  //   toast.success('Connected to collaboration session! 🚀');
  // }

  // function handleDisconnect() {
  //   setIsConnected(false);
  //   toast.error('Disconnected from collaboration session');
  // }

  // function handleWebSocketMessage(event: any) {
  //   const message = JSON.parse(event.data);

  //   switch (message.type) {
  //     case 'room_state':
  //       setUsers(message.users || []);
  //       if (message.code) {
  //         setCode(message.code);
  //       }
  //       break;

  //     case 'user_joined':
  //       setUsers((prev) => [...prev, message.user]);
  //       toast.success(message.message);
  //       break;

  //     case 'user_left':
  //       setUsers((prev) =>
  //         prev.filter((user) => user.userId !== message.userId)
  //       );
  //       // toast.info(message.message);
  //       break;

  //     case 'code_change':
  //       if (message.change.userId !== localStorage.getItem('userId')) {
  //         applyRemoteChange(message.change, message.newCode);
  //       }
  //       break;

  //     case 'cursor_update':
  //       updateRemoteCursor(message.userId, message.cursor);
  //       break;

  //     case 'error':
  //       toast.error(message.error);
  //       break;
  //   }
  // }

  // function applyRemoteChange(_change: CodeChange, newCode: string) {
  //   setCode(newCode);
  //   if (editorRef.current) {
  //     editorRef.current.setValue(newCode);
  //   }
  // }

  // function updateRemoteCursor(
  //   userId: string,
  //   cursor: { line: number; column: number }
  // ) {
  //   if (!editorRef.current) return;

  //   // Remove old cursor decoration for this user
  //   const decorations = editorRef.current.getModel().getDecorationsInRange({
  //     startLineNumber: 1,
  //     startColumn: 1,
  //     endLineNumber: 1000,
  //     endColumn: 1000,
  //   });

  //   const userDecoration = decorations.find(
  //     (d: any) => d.options.className === `cursor-${userId}`
  //   );

  //   if (userDecoration) {
  //     editorRef.current.deltaDecorations([userDecoration.id], []);
  //   }

  //   // Add new cursor decoration
  //   const user = users.find((u) => u.userId === userId);
  //   if (user) {
  //     const newDecoration = editorRef.current.deltaDecorations(
  //       [],
  //       [
  //         {
  //           range: {
  //             startLineNumber: cursor.line,
  //             startColumn: cursor.column,
  //             endLineNumber: cursor.line,
  //             endColumn: cursor.column + 1,
  //           },
  //           options: {
  //             className: `cursor-${userId}`,
  //             hoverMessage: { value: `${user.username}'s cursor` },
  //             beforeContentClassName: `cursor-before-${userId}`,
  //             afterContentClassName: `cursor-after-${userId}`,
  //           },
  //         },
  //       ]
  //     );

  //     cursorDecorations.current.push(newDecoration[0]);
  //   }
  // }

  function handleEditorChange(value: string, event: any) {
    if (readOnly) return;

    const changes = event.changes;
    changes.forEach((change: any) => {
      const codeChange: CodeChange = {
        userId: localStorage.getItem('userId') || '',
        operation: change.text ? 'insert' : 'delete',
        position: change.rangeOffset,
        text: change.text,
        length: change.rangeLength,
      };

      sendMessage({
        type: 'code_change',
        change: codeChange,
      });
    });

    setCode(value);
  }

  // function handleCursorMove(event: any) {
  //   const position = event.position;
  //   sendMessage({
  //     type: 'cursor_move',
  //     cursor: {
  //       line: position.lineNumber,
  //       column: position.column,
  //     },
  //   });
  // }

  // function handleEditorDidMount(editor: any) {
  //   editorRef.current = editor;

  //   // Set up cursor tracking
  //   editor.onDidChangeCursorPosition(handleCursorMove);

  //   // Set initial value
  //   editor.setValue(code);

  //   // Configure editor options
  //   editor.updateOptions({
  //     readOnly,
  //     minimap: { enabled: false },
  //     fontSize: 14,
  //     lineNumbers: 'on',
  //     roundedSelection: false,
  //     scrollBeyondLastLine: false,
  //     automaticLayout: true,
  //   });
  // }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">
            Live Collaboration Editor
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full bg-green-500"
            />
            <span className="text-sm text-gray-300">
              Connected
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Active users:</span>
          <div className="flex -space-x-2">
            {/* {users.slice(0, 5).map((user) => (
              <div
                key={user.userId}
                className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: user.color }}
                title={user.username}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {users.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                +{users.length - 5}
              </div>
            )} */}
            <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
              0
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-300">
                Connecting to collaboration session...
              </span>
            </div>
          </div>
        ) : (
          <div
            id="monaco-editor"
            className="h-full"
            ref={(el) => {
              if (el && !editorRef.current) {
                // Monaco Editor would be initialized here
                // For now, we'll use a textarea as placeholder
                const textarea = document.createElement('textarea');
                textarea.className =
                  'w-full h-full bg-gray-900 text-white p-4 font-mono text-sm resize-none border-none outline-none';
                textarea.value = code;
                textarea.readOnly = readOnly;
                textarea.onchange = (e: any) =>
                  handleEditorChange(e.target.value, {
                    changes: [{ text: e.target.value, rangeOffset: 0 }],
                  });
                el.appendChild(textarea);
              }
            }}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700 text-sm text-gray-300">
        <div className="flex items-center space-x-4">
          <span>Language: {language}</span>
          <span>Users: 0</span>
          <span>Room: {roomId}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Ready for collaboration! 🚀</span>
        </div>
      </div>

      {/* Cursor Styles */}
      {/* <style>{`
        .cursor-before-${users.map((u) => u.userId).join(', .cursor-before-')} {
          background-color: ${users.map((u) => u.color).join(', ')};
          width: 2px;
          height: 1.2em;
          display: inline-block;
          margin-right: -2px;
        }

        .cursor-after-${users.map((u) => u.userId).join(', .cursor-after-')} {
          background-color: ${users.map((u) => u.color).join(', ')};
          width: 2px;
          height: 1.2em;
          display: inline-block;
          margin-left: -2px;
        }
      `}</style> */}
    </div>
  );
};

export default CollaborationEditor;

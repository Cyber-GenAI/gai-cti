import { createContext, useContext, useEffect, useRef, useState, ReactNode, memo } from "react";
import { io, Socket } from "socket.io-client";
import { WEBSOCKET_API_ROOT } from "../api/routes";
import Cookies from 'universal-cookie';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  sessionId: string | undefined
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

interface SocketConnectionWrapperProps {
  children: ReactNode;
  options?: Parameters<typeof io>[1];
  fallback?: ReactNode;
}

const SocketConnectionWrapperComponent = ({
  children,
  options,
  fallback = <div>Connecting...</div>,
}: SocketConnectionWrapperProps) => {
  const cookies = new Cookies();
  const cookieAuth = cookies.get('auth');
  
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>();

  useEffect(() => {
    const socket = io(WEBSOCKET_API_ROOT, {
      transports: ["websocket"],
      auth: {
        ...(cookieAuth ? { token: `Basic ${cookieAuth}` } : {}),
      },
      ...options
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.error("Connection error:", err);
      setConnected(false);
    };

    const onSessionStart = ({ chat_sid }: {chat_sid: string}) => {
      setSessionId(chat_sid);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("on_session_start", onSessionStart)

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("on_session_start", onSessionStart)
      socket.disconnect();
    };
  }, [options]);

  if (!connected) {
    return <>{fallback}</>;
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, sessionId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketConnectionWrapper = memo(SocketConnectionWrapperComponent);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketConnectionWrapper");
  }
  return context;
};

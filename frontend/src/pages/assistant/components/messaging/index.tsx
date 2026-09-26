import { EuiAvatar, EuiBadge, EuiCommentList, EuiCommentProps, EuiMarkdownFormat, EuiPanel } from "@elastic/eui"
import { AssistantInput } from "./input"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSocket } from "../../../../context/socketContext"
import { useLocation } from "react-router-dom"
import { useAssistant } from "../../../../context/assistant/assistant-context"
import { LoadingPrompt } from "../../../../components"
import { message } from "../../../../types/assistant"
import { formatDate } from "../../../../utils"

const AssistantMessagingComponent = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { llm, messages, setMessages } = useAssistant();
  const { socket, sessionId } = useSocket();
  const location = useLocation();
  const fullPath = location.pathname + location.search;

  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  useEffect(() => {
    if (!socket) return;

    const handleMessageInit = ({ chat_sid, date, msg_id, type, msg, title }: Omit<message, 'isStreaming'>) => {
      setIsLoading(true)
      setMessages(prev => {
        if (prev.some(message => message.msg_id === msg_id)) return prev;
        return [...prev, { chat_sid, date, msg_id, type, msg, isStreaming: true, title: title }];
      });
    };

    const handleMessageAppend = ({ msg_id, msg }: Omit<message, 'isStreaming' | 'type'>) => {
      setMessages(prev => prev.map((item) => {
        return item.msg_id === msg_id ? { ...item, msg: `${item.msg}${msg}` } : item
      }));
    };

    const handleMessageEnd = ({ msg_id }: { msg_id: string }) => {
      setIsLoading(false)
      setMessages(prev => prev.map((item) =>
        item.msg_id === msg_id ? { ...item, isStreaming: false } : item
      ));
    };

    socket.on('on_msg_init', handleMessageInit);
    socket.on('on_msg_append', handleMessageAppend);
    socket.on('on_msg_end', handleMessageEnd);

    return () => {
      socket.off('on_msg_init', handleMessageInit);
      socket.off('on_msg_append', handleMessageAppend);
      socket.off('on_msg_end', handleMessageEnd);
    };
  }, [location.pathname, setMessages, socket]);

  const handleSendMessage = useCallback((message: string) => {
    if (!socket) return;

    socket.emit('on_user_msg', {
      route: fullPath.substring(1),
      msg: message,
      chat_sid: sessionId,
      llm: llm.data ?? ''
    });
  }, [llm, fullPath, sessionId, socket]);

  const handleClearChat = useCallback(() => {
    if (!socket) return;

    socket.emit("on_session_start", fullPath.substring(1));
    setMessages([]);
  }, [socket, fullPath, setMessages]);

  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
      shouldAutoScroll.current = isAtBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formattedMessages: EuiCommentProps[] = useMemo(() => messages?.data?.map((message) => ({
    username: message.type === 'assistant' ? 'Assistant' : 'Me',
    timelineAvatarAriaLabel: message.type,
    timestamp: formatDate(Number(message.date) * 1000),
    children: <EuiMarkdownFormat>{message.msg}</EuiMarkdownFormat>,
    ...(message.title?.length ? { event: <EuiBadge className="!mx-2 !first-letter:uppercase">{message?.title?.length ? message.title : "General"}</EuiBadge> } : {}),
    eventColor: message.type === "assistant" ? 'primary' : "subdued",
    timelineAvatar: <EuiAvatar color={message.type === "assistant" ? "#42928e" : "#d4dadc"} name={message.type} iconType={message.type === "assistant" ? "sparkles" : "userAvatar"} />
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })) ?? [], [messages?.data])

  return (
    <div className="relative w-full h-[70vh] flex flex-col justify-start items-center">
      <div className="flex flex-col eui-yScrollWithShadows gap-4 justify-start items-start w-full max-h-full">
        {
          messages.isLoading ? <LoadingPrompt size="s" rows={5} /> :
            <EuiCommentList comments={formattedMessages} className="!w-full" aria-label="AI Assistant chat." />
        }
        <div ref={bottomRef} />
      </div>
      <EuiPanel color="subdued" className="!fixed !rounded-none bottom-0 z-20 !w-full !px-6">
        <AssistantInput
          disabled={isLoading || messages.isLoading || !socket}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
        />
      </EuiPanel>
    </div>
  )
}

export default AssistantMessagingComponent
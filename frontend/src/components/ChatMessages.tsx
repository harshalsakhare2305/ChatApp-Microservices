import React, { useEffect, useMemo, useRef } from 'react';
import { Message } from '../app/chat/page';
import { User } from '../context/AppContext';
import moment from 'moment';
import { Check, CheckCheck } from 'lucide-react';

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;  
  loggedInUser: User | null;
}

function ChatMessages({ selectedUser, messages, loggedInUser }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Remove duplicate messages by _id
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages?.filter((msg) => {
      if (seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser, uniqueMessages]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full max-h-[calc(100vh-215px)] overflow-y-auto p-2 space-y-2 custom-scroll">
        {!selectedUser ? (
          <p className="text-gray-400 text-center mt-20">
            Please select a user to start chatting
          </p>
        ) : (
          <>
            {uniqueMessages?.map((e, i) => {
              const isSendByMe = e.sender === loggedInUser?._id;
              const uniqueKey = `${e._id}-${i}`;
           
              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col gap-1 mt-2 ${
                    isSendByMe ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-sm ${
                      isSendByMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                    }`}
                  >
                    {e.messageType === 'image' && e.image && (
                    
                      
                      <img
                        src={e.image.url}
                        alt="Shared"
                        className="max-w-full h-auto rounded-lg"
                      />
                    )}
                    {e.text && <p className="mt-1">{e.text}</p>}
                  </div>

                  <div
                    className={`flex items-center gap-1 text-xs text-gray-400 ${
                      isSendByMe ? 'pr-2 flex-row-reverse' : 'pl-2'
                    }`}
                  >
                    <span>{moment(e.createdAt).format('hh:mm A · MMM D')}</span>

                    {isSendByMe && (
                      <div className="flex items-center ml-1">
                        {e.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="w-3 h-3" />
                            {e.seenAt && (
                              <span>{moment(e.seenAt).format('hh:mm A')}</span>
                            )}
                          </div>
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>
    </div>
  );
}

export default ChatMessages;
// ChatTab.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUser } from '@/hooks/useUser';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, onValue, push } from 'firebase/database';
import { rtdb } from '@/lib/firebase'; // Ensure you have initialized RTDB in your firebase config
import { format } from 'date-fns';
import Confetti from 'react-confetti';

// Import custom animation components
import ConfettiAnimation from '@/components/animations/ConfettiAnimation';
import SparklesAnimation from '@/components/animations/SparklesAnimation';
import FireworksAnimation from '@/components/animations/FireworksAnimation';
import EmojiRainAnimation from '@/components/animations/EmojiRainAnimation';

// Define super message types with enhanced styles and animations
const superMessageTypes = [
  {
    points: 100,
    icon: '✨',
    class: 'bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-500 shadow-md',
    textColor: 'text-yellow-700',
    animation: 'sparkle',
  },
  {
    points: 500,
    icon: '🔥',
    class: 'bg-gradient-to-r from-orange-400 to-red-500 border-orange-500 shadow-lg',
    textColor: 'text-orange-700',
    animation: 'flame',
  },
  {
    points: 1000,
    icon: '🎉',
    class: 'bg-gradient-to-r from-purple-400 to-pink-500 border-purple-500 shadow-xl',
    textColor: 'text-purple-700',
    animation: 'confetti',
  },
];

// MessageComponent with enhanced animations and styles
const MessageComponent = ({ message, animationsEnabled = true, containerRef, isNew }) => {
  const superType = message.superType
    ? superMessageTypes.find((t) => t.points === message.superType.points)
    : null;

  const formattedTime = format(new Date(message.timestamp), 'p');
  const messageRef = useRef(null);
  const controls = useAnimation();

  useEffect(() => {
    if (isNew && superType && animationsEnabled) {
      controls.start('superAnimate');
    }
  }, [isNew, superType, animationsEnabled, controls]);

  const superVariants = {
    sparkle: {
      initial: { scale: 0.9, y: 20 },
      animate: { 
        scale: [0.9, 1.1, 1],
        y: [20, -5, 0],
        transition: { duration: 0.8, ease: "easeOut" }
      }
    },
    flame: {
      initial: { scale: 0.9, rotate: -5, y: 20 },
      animate: { 
        scale: [0.9, 1.2, 1],
        rotate: [-5, 5, 0],
        y: [20, -10, 0],
        transition: { duration: 1, ease: "easeOut" }
      }
    },
    confetti: {
      initial: { scale: 0.8, y: 30 },
      animate: { 
        scale: [0.8, 1.2, 1, 1.1, 1],
        y: [30, -15, 0, -5, 0],
        transition: { 
          duration: 1.2,
          ease: "easeOut",
          times: [0, 0.4, 0.6, 0.8, 1],
          scale: { type: "spring", damping: 5, stiffness: 100 }
        }
      }
    }
  };

  return (
    <motion.div
      ref={messageRef}
      id={message.id}
      initial={superType && isNew ? "initial" : { scale: 0.9, y: 20 }}
      animate={superType && isNew ? "animate" : { scale: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      variants={superType ? superVariants[superType.animation] : {}}
      className={`relative flex items-start space-x-3 mb-4 p-4 rounded-lg overflow-hidden ${
        superType ? `${superType.class} border` : 'bg-white border-gray-300'
      }`}
    >
      {superType && animationsEnabled && superType.points !== 1000 && (
        <superType.animation />
      )}
      <Avatar
        className={`relative z-10 ${
          superType ? 'w-12 h-12' : 'w-8 h-8'
        }`}
      >
        <AvatarImage src={message.avatar} alt={message.user} />
        <AvatarFallback>{message.user[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-grow relative z-10">
        <div className="flex items-center gap-2">
          <p
            className={`font-bold ${
              superType ? `text-xl ${superType.textColor}` : 'text-black'
            }`}
          >
            {message.user}
          </p>
          {superType && (
            <motion.span
              initial={{ rotate: -45, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-2xl"
            >
              {superType.icon}
            </motion.span>
          )}
          <span className="text-xs text-gray-600">{formattedTime}</span>
        </div>
        <p
          className={`${
            superType ? 'text-lg font-semibold text-black' : 'text-sm text-gray-800'
          }`}
        >
          {message.message}
        </p>
      </div>
    </motion.div>
  );
};

export default function ChatTab({
  chatMessages,
  onSendMessage,
  isUserLoggedIn,
  setShowLoginDialog,
}) {
  const [newMessage, setNewMessage] = useState('');
  const [superMessageType, setSuperMessageType] = useState(null);
  const { user, userProfile } = useUser();
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState(null);

  useEffect(() => {
    const messagesRef = ref(rtdb, 'chat');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data 
        ? Object.entries(data).map(([id, message]) => ({...message, id, isNew: true}))
        : [];
      
      setMessages(prevMessages => {
        const newMessages = loadedMessages.filter(
          newMsg => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
        );
        return [...prevMessages, ...newMessages];
      });

      // Check for new 1000-point messages and trigger confetti
      const latestMessage = loadedMessages[loadedMessages.length - 1];
      if (latestMessage && latestMessage.superType && latestMessage.superType.points === 1000) {
        setTimeout(() => {
          const messageElement = document.getElementById(latestMessage.id);
          triggerConfetti(messageElement);
        }, 100);
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerConfetti = useCallback((messageElement) => {
    if (messageElement && chatContainerRef.current) {
      const rect = messageElement.getBoundingClientRect();
      const containerRect = chatContainerRef.current.getBoundingClientRect();
      
      setConfettiConfig({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        width: chatContainerRef.current.offsetWidth,
        height: chatContainerRef.current.offsetHeight,
      });
      setShowConfetti(true);
      
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!isUserLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    if (newMessage.trim()) {
      try {
        const messageData = {
          message: newMessage.trim(),
          user: userProfile?.displayName || 'Anonymous',
          avatar: userProfile?.photoURL || '',
          superType: superMessageType
            ? { points: superMessageType.points, icon: superMessageType.icon }
            : null,
          timestamp: Date.now(),
          isNew: true,
        };

        const newMessageRef = await push(ref(rtdb, 'chat'), messageData);

        if (superMessageType && userProfile?.points >= superMessageType.points) {
          const newPoints = userProfile.points - superMessageType.points;
          await updateDoc(doc(db, 'users', user.uid), { points: newPoints });

          // Trigger animation for the new message
          setTimeout(() => {
            const messageElement = document.getElementById(newMessageRef.key);
            if (superMessageType.points === 1000) {
              triggerConfetti(messageElement);
            }
          }, 100);
        }

        setNewMessage('');
        setSuperMessageType(null);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const toggleSuperMessage = (points) => {
    if (userProfile && userProfile.points >= points) {
      setSuperMessageType(
        superMessageType?.points === points
          ? null
          : superMessageTypes.find((t) => t.points === points)
      );
    }
  };

  return (
    <div className="h-full flex flex-col" ref={chatContainerRef}>
      {/* Header - Exactly matching Leaderboard styling */}
      <div className="flex items-center space-x-2 p-4 border-b">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Chat da Corrida</h2>
      </div>
      
      {/* Messages - Matching Leaderboard's content area */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-[120px]">
          {messages.map((message) => (
            <MessageComponent
              key={message.id}
              message={message}
              animationsEnabled={animationsEnabled}
              containerRef={chatContainerRef}
              isNew={message.isNew}
            />
          ))}
        </div>
      </ScrollArea>

      {showConfetti && confettiConfig && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          width={confettiConfig.width}
          height={confettiConfig.height}
          confettiSource={{
            x: confettiConfig.x,
            y: confettiConfig.y,
            w: 10,
            h: 10,
          }}
          run={showConfetti}
        />
      )}

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="p-4 space-y-3">
          {/* Super Message Buttons */}
          <div className="flex justify-center space-x-2">
            {superMessageTypes.map((type) => (
              <TooltipProvider key={type.points}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant={superMessageType?.points === type.points ? "default" : "outline"}
                      onClick={() => toggleSuperMessage(type.points)}
                      disabled={!userProfile || userProfile.points < type.points}
                      className="hover:bg-primary/20 focus:bg-primary/20"
                    >
                      <span className="text-lg mr-1">{type.icon}</span>
                      <span>{type.points}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar mensagem por {type.points} pontos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="relative">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="w-full pr-12"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
            >
              <Send className="w-4 h-4 text-primary" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

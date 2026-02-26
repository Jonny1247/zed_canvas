
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Image as ImageIcon, MoreVertical, Phone } from "lucide-react";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const contacts = [
    { id: 0, name: "Musa Roy", lastMsg: "Is the shipping to Ndola available?", time: "2m ago", active: true },
    { id: 1, name: "Lusaka Art Collective", lastMsg: "We loved your latest submission!", time: "1h ago", active: false },
    { id: 2, name: "Kelvin Phiri", lastMsg: "What is your best price for the carving?", time: "Yesterday", active: false },
    { id: 3, name: "Mercy Banda", lastMsg: "The painting arrived safely, thank you!", time: "Oct 12", active: false },
  ];

  const messages = [
    { id: 1, text: "Hello! I saw your 'Ingoma' piece and I'm very interested.", sender: "user", time: "10:30 AM" },
    { id: 2, text: "Hi there! Thank you for your interest. It's one of my favorite recent works inspired by our heritage.", sender: "them", time: "10:32 AM" },
    { id: 3, text: "Is the frame included in the price listed?", sender: "user", time: "10:33 AM" },
    { id: 4, text: "Yes, it comes with a custom-made dark wood frame that complements the earthy tones.", sender: "them", time: "10:35 AM" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full border border-white/5 rounded-2xl overflow-hidden shadow-xl flex bg-background">
          {/* Contacts List */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 bg-background">
            <div className="p-4 border-b border-white/5 space-y-4">
              <h2 className="text-xl font-bold font-headline text-white">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10 h-10 rounded-full bg-white/5 border-none text-white placeholder:text-muted-foreground" />
              </div>
            </div>
            <ScrollArea className="flex-grow">
              {contacts.map((contact, idx) => (
                <div 
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${activeChat === contact.id ? 'bg-white/10 border-l-4 border-l-white' : ''}`}
                >
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/contact${idx}/100/100`} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm truncate text-white">{contact.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{contact.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{contact.lastMsg}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="hidden md:flex flex-col flex-grow">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background z-10">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/contact${activeChat}/100/100`} />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white">{contacts[activeChat].name}</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/5"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/5"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-grow p-6 bg-black/50 african-pattern">
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] space-y-1`}>
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-white text-black rounded-tr-none font-medium' 
                        : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/5"><ImageIcon className="h-5 w-5" /></Button>
                <Input 
                  placeholder="Type your message..." 
                  className="flex-grow rounded-full bg-white/5 border-none h-11 text-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setNewMessage("")}
                />
                <Button 
                  size="icon" 
                  className="shrink-0 rounded-full h-11 w-11 bg-white text-black hover:bg-neutral-200"
                  onClick={() => setNewMessage("")}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

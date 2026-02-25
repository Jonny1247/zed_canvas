
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Image as ImageIcon, MoreVertical, Phone } from "lucide-react";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const contacts = [
    { id: 0, name: "Chanda Mwamba", lastMsg: "Is the shipping to Ndola available?", time: "2m ago", active: true },
    { id: 1, name: "Lusaka Art Collective", lastMsg: "We loved your latest submission!", time: "1h ago", active: false },
    { id: 2, name: "Kelvin Phiri", lastMsg: "What is your best price for the carving?", time: "Yesterday", active: false },
    { id: 3, name: "Mercy Banda", lastMsg: "The painting arrived safely, thank you!", time: "Oct 12", active: false },
  ];

  const messages = [
    { id: 1, text: "Hello! I saw your 'Savannah Rhythms' piece and I'm very interested.", sender: "user", time: "10:30 AM" },
    { id: 2, text: "Hi there! Thank you for your interest. It's one of my favorite recent works.", sender: "them", time: "10:32 AM" },
    { id: 3, text: "Is the frame included in the price listed?", sender: "user", time: "10:33 AM" },
    { id: 4, text: "Yes, it comes with a custom-made dark wood frame that complements the earthy tones.", sender: "them", time: "10:35 AM" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full border rounded-2xl overflow-hidden shadow-xl flex bg-white">
          {/* Contacts List */}
          <div className="w-full md:w-80 border-r flex flex-col shrink-0">
            <div className="p-4 border-b space-y-4">
              <h2 className="text-xl font-bold font-headline">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10 h-10 rounded-full bg-secondary/30 border-none" />
              </div>
            </div>
            <ScrollArea className="flex-grow">
              {contacts.map((contact, idx) => (
                <div 
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`p-4 flex gap-3 cursor-pointer hover:bg-secondary/20 transition-colors border-b last:border-0 ${activeChat === contact.id ? 'bg-secondary/40 border-l-4 border-l-primary' : ''}`}
                >
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/contact${idx}/100/100`} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm truncate">{contact.name}</p>
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
            <div className="p-4 border-b flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/contact${activeChat}/100/100`} />
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{contacts[activeChat].name}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-grow p-6 bg-secondary/10 african-pattern">
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] space-y-1`}>
                      <div className={`p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-white rounded-tl-none'
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
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0"><ImageIcon className="h-5 w-5 text-muted-foreground" /></Button>
                <Input 
                  placeholder="Type your message..." 
                  className="flex-grow rounded-full bg-secondary/20 border-none h-11"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setNewMessage("")}
                />
                <Button 
                  size="icon" 
                  className="shrink-0 rounded-full h-11 w-11 shadow-md clay-shadow"
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

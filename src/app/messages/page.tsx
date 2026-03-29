"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Image as ImageIcon, MoreVertical, ShieldAlert, Ban, AlertTriangle, MessageSquare, Loader2, DollarSign, ShoppingCart, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { getUserById, getArtworkById, sendMessage, resetUnreadCount, reportConversation, blockUser, createOrder, updateMessage } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams?.get('id');
  const { toast } = useToast();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(preselectedId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // New State features
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const enhancedConvs = await Promise.all(convsData.map(async (conv: any) => {
        const otherUserId = conv.participants.find((p: string) => p !== user.uid);
        const [otherUser, artwork] = await Promise.all([
          getUserById(otherUserId).catch(() => null),
          getArtworkById(conv.artworkId).catch(() => null)
        ]);
        return {
          ...conv,
          otherUser,
          artwork,
          otherUserId,
          isCustomer: conv.participants[0] === user.uid // First index is buyer
        };
      }));

      enhancedConvs.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis() || 0;
        const timeB = b.updatedAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setConversations(enhancedConvs);
      if (enhancedConvs.length > 0 && !activeChatId && !preselectedId) {
        setActiveChatId(enhancedConvs[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle activeChatId setting from URL after convs load
  useEffect(() => {
    if (preselectedId && !activeChatId) {
      setActiveChatId(preselectedId);
    }
  }, [preselectedId, activeChatId]);

  // Fetch active chat messages
  useEffect(() => {
    if (!activeChatId) return;

    if (user) {
      resetUnreadCount(activeChatId, user.uid).catch(() => {});
    }

    const q = query(
      collection(db, "conversations", activeChatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgsData);
      
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChatId, user]);

  const activeConv = conversations.find(c => c.id === activeChatId);

  const handleSend = async () => {
    if (!user || (!newMessage.trim() && !newMessage) || !activeChatId || !activeConv) return;
    
    if (activeConv.status === 'blocked') {
      toast({ title: "Blocked", description: "This conversation is blocked.", variant: "destructive" });
      return;
    }

    const textToSend = newMessage;
    setNewMessage(""); 
    
    try {
      await sendMessage(activeChatId, user.uid, textToSend, activeConv.otherUserId);
    } catch (e) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      setNewMessage(textToSend);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeChatId || !activeConv) return;

    if (activeConv.status === 'blocked') {
      toast({ title: "Blocked", description: "This conversation is blocked.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadFile(file, `messages/${user.uid}`);
      await sendMessage(activeChatId, user.uid, "Sent an image", activeConv.otherUserId, {
        type: 'image',
        imageUrl
      });
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload the image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMakeOffer = async () => {
    if (!user || !activeConv || !offerAmount) return;
    const amount = Number(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await sendMessage(activeChatId!, user.uid, `I would like to offer ZMW ${amount.toLocaleString()} for this artwork.`, activeConv.otherUserId, {
        type: 'offer',
        offerAmount: amount,
        offerStatus: 'pending'
      });
      setShowOfferDialog(false);
      setOfferAmount("");
      toast({ title: "Offer Sent", description: "Your offer has been sent to the artist." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send offer.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptOffer = async (msgId: string, amount: number) => {
    if (!user || !activeConv) return;
    
    try {
      await updateMessage(activeConv.id, msgId, { offerStatus: 'accepted' });
      // Create Order
      const customerId = activeConv.participants[0];
      await createOrder(activeConv.artworkId, customerId, amount);
      // Send system message notification
      await sendMessage(activeConv.id, "system", `The offer of ZMW ${amount.toLocaleString()} was accepted. An order has been created.`, activeConv.otherUserId, { type: 'system' });
      toast({ title: "Offer Accepted", description: "The order has been created successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to accept offer.", variant: "destructive" });
    }
  };

  const handleDeclineOffer = async (msgId: string) => {
    if (!activeConv) return;
    try {
      await updateMessage(activeConv.id, msgId, { offerStatus: 'declined' });
      toast({ title: "Offer Declined" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to decline offer.", variant: "destructive" });
    }
  };

  const handleBuyNow = async () => {
    if (!user || !activeConv) return;
    setIsProcessing(true);
    try {
      const customerId = activeConv.participants[0];
      await createOrder(activeConv.artworkId, customerId, activeConv.artwork.price);
      await sendMessage(activeConv.id, "system", `The customer has opted to Buy Now for ZMW ${activeConv.artwork.price.toLocaleString()}. An order has been created.`, activeConv.otherUserId, { type: 'system' });
      toast({ title: "Order Created", description: "You have successfully purchased this artwork." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create order.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReport = async () => { ... } // (Skipping repetition, implementing inline below)
  const handleBlock = async () => { ... } 

  // Wait, I need to implement them inside to avoid undefined behavior.
  const handleReportAction = async () => {
    if (!user || !activeConv) return;
    try {
      await reportConversation(activeConv.id, user.uid, messages);
      toast({ title: "Report Submitted", description: "An admin will review this conversation." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to report conversation.", variant: "destructive" });
    }
  };

  const handleBlockAction = async () => {
    if (!user || !activeConv) return;
    try {
      await blockUser(activeConv.id, user.uid);
      toast({ title: "User Blocked", description: "They can no longer send you messages." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to block user.", variant: "destructive" });
    }
  };


  if (loading) return (
     <div className="h-screen flex flex-col bg-background text-foreground">
       <Navbar />
       <main className="flex-grow flex items-center justify-center">
         <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
       </main>
     </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 overflow-hidden">
        <div className="h-full border border-white/5 rounded-2xl overflow-hidden shadow-xl flex bg-background">
          
          {/* Contacts List */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 bg-background z-20">
            <div className="p-4 border-b border-white/5 space-y-4">
              <h2 className="text-xl font-bold font-headline text-white uppercase tracking-widest">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search chats..." className="pl-10 h-10 rounded-none bg-white/5 border-none text-white placeholder:text-muted-foreground" />
              </div>
            </div>
            <ScrollArea className="flex-grow">
              {conversations.map((conv) => {
                const unread = conv.unreadCount?.[user?.uid || ''] || 0;
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveChatId(conv.id)}
                    className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${activeChatId === conv.id ? 'bg-white/10 border-l-4 border-l-white' : ''}`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.otherUser?.profileImage} />
                      <AvatarFallback>{conv.otherUser?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm truncate text-white">{conv.otherUser?.name || 'Unknown User'}</p>
                        {!!conv.updatedAt && (
                          <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-tighter">
                            {new Date(conv.updatedAt.toMillis()).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-2">
                         <p className="text-xs text-muted-foreground truncate">{conv.lastMessage?.text || 'No messages yet'}</p>
                         {unread > 0 && (
                           <span className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                             {unread}
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {conversations.length === 0 && (
                <div className="p-8 text-center text-white/30 text-xs uppercase tracking-widest font-bold">
                  No open conversations
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="hidden md:flex flex-col flex-grow">
            {activeConv ? (
              <>
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background z-10">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeConv.otherUser?.profileImage} />
                      <AvatarFallback>{activeConv.otherUser?.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-white">{activeConv.otherUser?.name || 'Unknown User'}</p>
                      {activeConv.status === 'blocked' ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Blocked</p>
                      ) : (
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Online</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/5"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10 text-white w-48 rounded-none shadow-xl">
                         <DropdownMenuItem onClick={handleReportAction} className="hover:bg-red-500/20 text-red-400 focus:text-red-300 focus:bg-red-500/20 cursor-pointer text-xs font-bold uppercase tracking-widest">
                           <AlertTriangle className="mr-2 h-4 w-4" /> Report
                         </DropdownMenuItem>
                         {activeConv.status !== 'blocked' && (
                           <DropdownMenuItem onClick={handleBlockAction} className="hover:bg-red-500/20 text-red-400 focus:text-red-300 focus:bg-red-500/20 cursor-pointer text-xs font-bold uppercase tracking-widest">
                             <Ban className="mr-2 h-4 w-4" /> Block
                           </DropdownMenuItem>
                         )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Artwork Context Header */}
                {activeConv.artwork && (
                  <div className="bg-white/5 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 text-xs border-b border-white/5">
                    <div className="flex items-center gap-4 flex-grow">
                      <div className="h-16 w-16 relative border border-white/10 shrink-0">
                        <Image src={activeConv.artwork.imageUrls?.[0] || activeConv.artwork.imageUrl || "https://picsum.photos/100/100"} alt={activeConv.artwork.title || "Artwork"} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-widest text-[#d4af37] text-[10px]">Discussing Artwork</p>
                        <p className="font-headline text-lg font-bold text-white">{activeConv.artwork.title}</p>
                        <p className="font-bold text-white/80">ZMW {activeConv.artwork.price?.toLocaleString()}</p>
                      </div>
                    </div>
                    {/* Action Buttons for Buyer */}
                    {activeConv.isCustomer && activeConv.status !== 'blocked' && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0 ml-auto shrink-0 flex-wrap justify-end">
                        {activeConv.artwork.isNegotiable && (
                           <Button 
                             onClick={() => setShowOfferDialog(true)}
                             disabled={isProcessing}
                             variant="outline" 
                             className="border-white/20 hover:border-white/50 bg-transparent text-white rounded-none uppercase text-[10px] font-bold tracking-widest h-10"
                           >
                             <DollarSign className="w-3 h-3 mr-2" />
                             Make Offer
                           </Button>
                        )}
                        <Button 
                           onClick={handleBuyNow}
                           disabled={isProcessing}
                           className="bg-[#d4af37] hover:bg-[#b08e26] text-black rounded-none uppercase text-[10px] font-bold tracking-widest h-10 shadow-lg shadow-[#d4af37]/20"
                        >
                           <ShoppingCart className="w-3 h-3 mr-2" />
                           Buy Now
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <ScrollArea className="flex-grow p-6 bg-black/50 african-pattern">
                  <div className="space-y-6">
                    {messages.map((msg, i) => {
                      if (msg.type === 'system') {
                        return (
                          <div key={msg.id || i} className="flex justify-center w-full my-6">
                             <div className="bg-yellow-500/10 border border-yellow-500/20 max-w-lg p-4 text-center">
                               {msg.text.includes("offer") ? <DollarSign className="h-6 w-6 text-yellow-500 mx-auto mb-2" /> : <ShieldAlert className="h-6 w-6 text-yellow-500 mx-auto mb-2" />}
                               <p className="text-xs text-yellow-200/80 leading-relaxed font-bold">{msg.text}</p>
                             </div>
                          </div>
                        );
                      }

                      const isMe = msg.senderId === user?.uid;
                      return (
                        <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] space-y-1`}>
                            <div className={`p-4 rounded-xl shadow-sm ${
                              isMe 
                              ? 'bg-primary text-primary-foreground font-medium rounded-br-none' 
                              : 'bg-white/10 text-white border border-white/5 rounded-bl-none'
                            }`}>
                              
                              {/* Image Type */}
                              {msg.type === 'image' && msg.imageUrl && (
                                <div className="mb-3">
                                  <a href={msg.imageUrl} target="_blank" rel="noreferrer">
                                    <img src={msg.imageUrl} alt="Attachment" className="max-w-full max-h-64 object-contain rounded-md border border-white/10" />
                                  </a>
                                </div>
                              )}

                              {/* Offer Type */}
                              {msg.type === 'offer' && msg.offerAmount && (
                                <div className="mb-3 bg-black/20 p-4 border border-white/10 text-center">
                                  <p className="uppercase tracking-widest text-[10px] font-bold opacity-60 mb-2">Offer Submitted</p>
                                  <p className="text-2xl font-bold font-headline mb-3 text-[#d4af37]">ZMW {msg.offerAmount.toLocaleString()}</p>
                                  
                                  {msg.offerStatus === 'pending' ? (
                                    isMe ? (
                                      <div className="text-xs text-yellow-400 font-bold tracking-widest uppercase">Waiting for response</div>
                                    ) : (
                                       <div className="flex justify-center gap-2">
                                         <Button onClick={() => handleDeclineOffer(msg.id)} variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10 text-[10px] uppercase font-bold tracking-wider rounded-none">Decline</Button>
                                          <Button onClick={() => handleAcceptOffer(msg.id, msg.offerAmount!)} size="sm" className="bg-[#d4af37] text-black hover:bg-[#b08e26] text-[10px] uppercase font-bold tracking-wider rounded-none"><Check className="w-3 h-3 mr-1"/> Accept</Button>
                                       </div>
                                    )
                                  ) : (
                                     <div className={`text-xs font-bold tracking-widest uppercase ${msg.offerStatus === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
                                       {msg.offerStatus === 'accepted' ? 'Accepted' : 'Declined'}
                                     </div>
                                  )}
                                </div>
                              )}

                              {/* Message Text */}
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <p className={`text-[10px] text-muted-foreground uppercase tracking-widest ${isMe ? 'text-right' : 'text-left'}`}>
                              {msg.timestamp ? new Date(msg.timestamp.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/5 bg-background">
                  {activeConv.status === 'blocked' ? (
                     <div className="text-center p-3 border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold uppercase tracking-widest">
                       This conversation is blocked.
                     </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       {/* Hidden File Input */}
                       <input 
                         type="file" 
                         accept="image/*" 
                         ref={fileInputRef} 
                         className="hidden" 
                         onChange={handleFileUpload} 
                       />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/5"
                      >
                         {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
                      </Button>
                      
                      <Input 
                        placeholder="Type your message..." 
                        className="flex-grow rounded-xl bg-white/5 border-white/10 h-12 text-white focus-visible:ring-1 focus-visible:ring-primary px-4"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                      />
                      
                      <Button 
                        size="icon" 
                        disabled={!newMessage.trim() || isUploading}
                        className="shrink-0 rounded-full h-12 w-12 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ml-2"
                        onClick={handleSend}
                      >
                        <Send className="h-5 w-5 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center flex-col gap-4 text-white/30">
                <MessageSquare className="h-12 w-12 opacity-50" />
                <p className="text-xs uppercase font-bold tracking-[0.3em]">Select a conversation to start</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Make an Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="bg-neutral-900 border-white/10 text-white rounded-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline text-[#d4af37]">Make an Offer</DialogTitle>
            <DialogDescription className="text-white/60">
              Submit a custom price proposal to the artist for {activeConv?.artwork?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="relative">
               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
               <Input 
                 type="number"
                 placeholder="0.00"
                 value={offerAmount}
                 onChange={(e) => setOfferAmount(e.target.value)}
                 className="pl-10 h-14 text-2xl font-bold bg-white/5 border-white/10"
                 min="1"
               />
            </div>
            <p className="text-xs text-white/40 mt-3 text-center">Original Price: ZMW {activeConv?.artwork?.price?.toLocaleString()}</p>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setShowOfferDialog(false)} className="rounded-none border-white/20 uppercase tracking-widest text-[10px] font-bold">Cancel</Button>
             <Button onClick={handleMakeOffer} disabled={isProcessing || !offerAmount} className="bg-[#d4af37] text-black hover:bg-[#b08e26] rounded-none uppercase tracking-widest text-[10px] font-bold">
               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Offer"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

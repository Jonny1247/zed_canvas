"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { getReportedConversations, resolveReport, getUserById } from "@/lib/firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminMessagesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getReportedConversations();
      // fetch user names for reporter
      const withUsers = await Promise.all(
        data.map(async (rep: any) => {
          const reporter = await getUserById(rep.reportedBy).catch(() => null);
          return { ...rep, reporterName: reporter?.name || "Unknown User" };
        })
      );
      setReports(withUsers);
    } catch (e) {
      toast({ title: "Error", description: "Failed to fetch reports." });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string) => {
    try {
      await resolveReport(reportId, "Reviewed by admin and closed.");
      setReports(reports.filter(r => r.id !== reportId));
      toast({ title: "Report Resolved", description: "The conversation has been marked as reviewed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to resolve report.", variant: "destructive" });
    }
  };

  if (loading) {
     return (
       <AdminLayout>
         <div className="flex justify-center items-center h-64">
           <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
         </div>
       </AdminLayout>
     );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-headline uppercase tracking-widest text-[#d4af37]">Flagged Chats</h1>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-primary mb-4 opacity-50" />
            <p className="text-white/60 font-bold tracking-widest uppercase">No pending reports.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-neutral-900 border-white/10 text-white shadow-xl">
                <CardHeader className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/50 uppercase tracking-widest text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3 mr-1" />
                          Requires Review
                        </Badge>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest">
                          {report.reportedAt ? new Date(report.reportedAt.toMillis()).toLocaleString() : "Recently"}
                        </span>
                      </div>
                      <CardTitle className="text-lg">Reported by {report.reporterName}</CardTitle>
                      <CardDescription className="text-white/60 text-xs">Conversation ID: {report.conversationId}</CardDescription>
                    </div>
                    <Button onClick={() => handleResolve(report.id)} className="bg-primary text-primary-foreground hover:bg-primary/80 uppercase font-bold tracking-widest text-xs rounded-none">
                      Mark as Resolved
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Conversation Transcript</h3>
                    <div className="bg-black/50 border border-white/5 p-4 rounded-xl max-h-96 overflow-y-auto space-y-4 font-mono text-xs">
                      {report.transcript?.map((msg: any, i: number) => (
                        <div key={i} className={`flex flex-col ${msg.senderId === report.reportedBy ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-md ${msg.senderId === report.reportedBy ? 'bg-primary/20 border border-primary/30 text-primary-foreground' : 'bg-white/5 text-white/80'}`}>
                            {msg.type === 'system' ? (
                              <p className="text-yellow-400/80 italic">{msg.text}</p>
                            ) : (
                              <p>{msg.text}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">
                             {msg.senderId === report.reportedBy ? 'Reporter' : 'Other User'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

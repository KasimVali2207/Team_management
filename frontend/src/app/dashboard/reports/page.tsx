"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function ReportsPage() {
  const { user } = useAuth();
  
  if (user?.role !== 'Lead') {
    return <div>Access Denied</div>;
  }

  const generateReport = (type: string) => {
    // In a real app, this would call a backend endpoint that generates and returns a file blob
    alert(`Generating ${type} report... (Mock)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Export team data in various formats.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Complete Team Roster
            </CardTitle>
            <CardDescription>Export all active employees and their details.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => generateReport('PDF')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => generateReport('CSV')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Leave Calendar
            </CardTitle>
            <CardDescription>Export all leave plans for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => generateReport('PDF')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => generateReport('CSV')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Training Status
            </CardTitle>
            <CardDescription>Export pending and completed certifications.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => generateReport('PDF')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => generateReport('CSV')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

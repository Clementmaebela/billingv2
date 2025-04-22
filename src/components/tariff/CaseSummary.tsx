import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CaseSummaryProps {
  caseInfo: {
    clientName: string;
    caseNumber: string;
    caseTitle: string;
    filePages: number;
    court: string;
    scale: string;
  };
}

const CaseSummary = ({ caseInfo }: CaseSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><span className="font-medium text-muted-foreground">Client:</span> {caseInfo.clientName}</p>
            <p><span className="font-medium text-muted-foreground">Case Number:</span> {caseInfo.caseNumber}</p>
            <p><span className="font-medium text-muted-foreground">Case Title:</span> {caseInfo.caseTitle}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium text-muted-foreground">Court Type:</span> {caseInfo.court.toLowerCase() === "magistrate" ? "Magistrate Court" : "High Court"}</p>
            <p><span className="font-medium text-muted-foreground">Scale/Column:</span> {caseInfo.scale}</p>
            <p><span className="font-medium text-muted-foreground">File Pages:</span> {caseInfo.filePages}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseSummary;

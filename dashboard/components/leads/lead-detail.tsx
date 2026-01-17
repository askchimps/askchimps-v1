import { Lead } from "@/lib/api/lead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  FileText,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadDetailProps {
  lead: Lead;
}

const statusColors: Record<string, string> = {
  "New": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Contacted": "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  "Qualified": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Converted": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Lost": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const dispositionColors: Record<string, string> = {
  "Interested": "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  "Not Interested": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Callback": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "No Answer": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Wrong Number": "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadDetail({ lead }: LeadDetailProps) {
  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "Unknown";
  const statusColor = statusColors[lead.status || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  const dispositionColor = dispositionColors[lead.disposition || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{fullName}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {lead.status && (
                <Badge className={cn("border-0 pointer-events-none", statusColor)}>
                  {lead.status}
                </Badge>
              )}
              {lead.disposition && (
                <Badge variant="outline" className={cn("pointer-events-none", dispositionColor)}>
                  {lead.disposition}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 shrink-0">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Timeline
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="details" className="p-6 space-y-6 m-0">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{lead.phone}</p>
                    </div>
                  </div>
                )}

                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            {(lead.city || lead.state || lead.country) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.source && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Source</p>
                      <p className="text-sm text-muted-foreground">{lead.source}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(lead.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(lead.updatedAt)}
                    </p>
                  </div>
                </div>

                {lead.reasonForCold && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Reason for Cold</p>
                      <p className="text-sm text-muted-foreground">{lead.reasonForCold}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Information */}
            {lead.owner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lead Owner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {[lead.owner.firstName, lead.owner.lastName].filter(Boolean).join(" ") || "Unknown"}
                      </p>
                      {lead.owner.email && (
                        <p className="text-sm text-muted-foreground">{lead.owner.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="p-6 m-0">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Timeline Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Lead activity timeline will be available here
              </p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}


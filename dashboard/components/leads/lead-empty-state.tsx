import { Users } from "lucide-react";

interface LeadEmptyStateProps {
    message: string;
    description?: string;
}

export function LeadEmptyState({ message, description }: LeadEmptyStateProps) {
    return (
        <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md text-center">
                <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{message}</h3>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CallPaginationProps {
    total: number;
    limit: number;
    offset: number;
    onLimitChange: (limit: number) => void;
    onOffsetChange: (offset: number) => void;
}

export function CallPagination({
    total,
    limit,
    offset,
    onOffsetChange,
}: CallPaginationProps) {
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const startItem = total === 0 ? 0 : offset + 1;
    const endItem = Math.min(offset + limit, total);

    const handlePrevious = () => {
        if (offset > 0) {
            onOffsetChange(Math.max(0, offset - limit));
        }
    };

    const handleNext = () => {
        if (offset + limit < total) {
            onOffsetChange(offset + limit);
        }
    };

    return (
        <div className="bg-card border-t p-3">
            <div className="flex items-center justify-between text-sm">
                {/* Page info */}
                <div className="text-muted-foreground">
                    {startItem}-{endItem} of {total}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={offset === 0}
                        className="h-8 px-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-muted-foreground px-2">
                        {currentPage} / {totalPages || 1}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNext}
                        disabled={offset + limit >= total}
                        className="h-8 px-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

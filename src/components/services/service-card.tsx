"use client";

import { Clock, MoreHorizontal, Pencil, Star, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  computeDiscountedPrice,
  formatDuration,
  isServiceDiscounted,
  type Service,
} from "@/lib/services";

export function ServiceCard({
  service,
  onEdit,
  onDelete,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const discounted = isServiceDiscounted(service.discount);
  const finalPrice = computeDiscountedPrice(service.price, service.discount);

  return (
    <Card className={!service.isActive ? "opacity-60" : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="grid size-9 place-items-center rounded-md text-lg"
              style={{
                backgroundColor: `${service.color}1a`,
                color: service.color,
              }}
            >
              {service.icon}
            </span>
            <div>
              <div className="font-medium leading-tight">{service.name}</div>
              <div className="text-xs text-muted-foreground">
                {service.category}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Service actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {service.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {formatDuration(service.duration)}
          </span>
          {service.isPopular && (
            <Badge variant="warning" className="gap-1">
              <Star className="size-3" />
              Popular
            </Badge>
          )}
          {!service.isActive && <Badge variant="secondary">Inactive</Badge>}
          {discounted && (
            <Badge variant="success" className="gap-1">
              <Tag className="size-3" />
              {service.discount?.type === "percentage"
                ? `${service.discount.value}% off`
                : `Rs ${service.discount?.value} off`}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-semibold">
            Rs {Math.round(finalPrice).toLocaleString()}
          </span>
          {discounted && (
            <span className="text-sm text-muted-foreground line-through">
              Rs {service.price.toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Carisma } from "neocatecumenal";
import { Pencil } from "lucide-react";

interface CarismaSectionProps {
  carismas: Carisma[];
  descricao: string;
  onEdit?: (carisma: Carisma) => void;
}

export default function ListagemDeCarismas({
  carismas,
  descricao,
  onEdit,
}: CarismaSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">{descricao}</h2>
      <ul className="list-disc pl-5">
        {carismas.map((c) => (
          <li
            key={c.id}
            className="mb-2 flex items-center justify-between gap-2"
          >
            <span className="font-normal">
              {c.descricao}
              {c.casalAndaJunto && (
                <span className="ml-2 text-sm text-muted-foreground">
                  (Casal anda junto)
                </span>
              )}
            </span>
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(c)}
                aria-label={`Editar ${c.descricao}`}
              >
                <Pencil />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

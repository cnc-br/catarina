"use client";

import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { type CountryCode } from "libphonenumber-js";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ddiDoPais, listarPaisesComDdi, nomeDoPais } from "@/lib/telefone";

type DdiComboboxProps = {
  value: CountryCode;
  onChange: (iso: CountryCode) => void;
  disabled?: boolean;
};

export default function DdiCombobox({
  value,
  onChange,
  disabled,
}: DdiComboboxProps) {
  const [open, setOpen] = useState(false);
  const paises = useMemo(() => listarPaisesComDdi(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {nomeDoPais(value)}{" "}
            <span className="text-muted-foreground">+{ddiDoPais(value)}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar país ou DDI..." />
          <CommandList>
            <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
            <CommandGroup>
              {paises.map((pais) => (
                <CommandItem
                  key={pais.iso}
                  value={`${pais.nome} ${pais.ddi} ${pais.iso}`}
                  onSelect={() => {
                    onChange(pais.iso);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === pais.iso ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{pais.nome}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    +{pais.ddi}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

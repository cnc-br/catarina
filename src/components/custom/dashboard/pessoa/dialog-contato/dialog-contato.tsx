"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ContatoForm from "@/components/custom/dashboard/pessoa/form-contato";
import { useState } from "react";

type DialogContatoProps = {
  pessoaId: number;
  urlBase: string;
  onContatoSalvo?: () => void;
};

export default function DialogContato({
  pessoaId,
  urlBase,
  onContatoSalvo,
}: DialogContatoProps) {
  const [open, setOpen] = useState(false);

  const handleContatoSalvo = () => {
    setOpen(false);
    onContatoSalvo?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          Cadastrar contato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar contato</DialogTitle>
          <DialogDescription>
            Informe os dados de contato dessa pessoa.
          </DialogDescription>
        </DialogHeader>
        <ContatoForm
          pessoaId={pessoaId}
          urlBase={urlBase}
          onContatoSalvo={handleContatoSalvo}
        />
      </DialogContent>
    </Dialog>
  );
}

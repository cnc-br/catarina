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
import { PessoaContato } from "neocatecumenal";
import { ReactNode, useState } from "react";

type DialogContatoProps = {
  pessoaId: number;
  urlBase: string;
  contato?: PessoaContato;
  trigger?: ReactNode;
  onContatoSalvo?: () => void;
};

export default function DialogContato({
  pessoaId,
  urlBase,
  contato,
  trigger,
  onContatoSalvo,
}: DialogContatoProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!contato;

  const handleContatoSalvo = () => {
    setOpen(false);
    onContatoSalvo?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="w-full" variant="outline">
            Cadastrar contato
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar contato" : "Cadastrar contato"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados de contato dessa pessoa."
              : "Informe os dados de contato dessa pessoa."}
          </DialogDescription>
        </DialogHeader>
        <ContatoForm
          pessoaId={pessoaId}
          urlBase={urlBase}
          contato={contato}
          onContatoSalvo={handleContatoSalvo}
        />
      </DialogContent>
    </Dialog>
  );
}

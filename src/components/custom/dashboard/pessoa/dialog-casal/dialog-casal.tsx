import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ComboboxCasal } from "./dialog-casal-combobox";
import { useState } from "react";
import { BASE_URL } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

type DialogProps = {
  sexo: string;
  pessoaId: number;
  onConjugueVinculado?: () => void;
};

export function DialogPessoaCasada({
  sexo,
  pessoaId,
  onConjugueVinculado,
}: DialogProps) {
  const { toast } = useToast();
  const conjugue = sexo === "MASCULINO" ? "esposa" : "marido";

  const [selectedConjugue, setSelectedConjugue] = useState<number>(0);
  const [vinculado, setVinculado] = useState<boolean>(false);

  const handleSelectConjugue = (conjugue: number) => {
    setSelectedConjugue(conjugue);
  };

  const vincularConjugue = async (conjugueId: number) => {
    setVinculado(true);

    const response = await fetch(`${BASE_URL}/api/ambrosio/pessoa/conjugue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pessoaId,
        conjugueId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      toast({
        title: `Casal foi vinculado!`,
        variant: "default",
        description: `${conjugue} vinculado com sucesso.`,
      });
      onConjugueVinculado?.();
    } else {
      setVinculado(false);
      toast({
        title: `Casal não foi vinculado!`,
        variant: "destructive",
        description: `Erro: ${result.message}`,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => setVinculado(false)} variant="outline">
          Vincular {conjugue}
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Vincular {conjugue}</DialogTitle>
          <DialogDescription className="">
            <span className="font-semibold text-amber-600">Atenção:</span> a
            listagem é baseada no sexo e estado civil. Caso o nome não aparecer,
            verifique se o conjugue foi cadastrado corretamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {conjugue.toUpperCase()}
            </Label>
            <ComboboxCasal
              conjugue={conjugue}
              onSelect={handleSelectConjugue}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant={vinculado ? "default" : "secondary"}
            onClick={() => vincularConjugue(selectedConjugue)}
          >
            {vinculado ? "Casal vinculado!" : `Vicular ${conjugue}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

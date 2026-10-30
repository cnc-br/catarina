"use client";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface DialogEstadoCivilProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(2, { message: "Descricao deve ter no minimo 2 caracteres." })
    .max(20, {
      message: "O estado civil nao pode ter mais de 20 caracteres.",
    }),
});

export function DialogEstadoCivil({ onSuccess }: DialogEstadoCivilProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch("/api/ambrosio/configuracoes/estadoCivil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descricao: values.descricao }),
      });

      const data = await res.json();

      if (res.status === 201) {
        toast({
          title: "Estado civil cadastrado!",
          variant: "default",
          description: `Cadastrado com sucesso o estado civil "${values.descricao}"!`,
        });
        form.reset();
        closeDialog();
      } else if (res.status === 401 || res.status === 403) {
        toast({
          title: "Estado civil nao foi cadastrado!",
          variant: "destructive",
          description: `Voce nao tem permissao para cadastrar estados civis`,
        });
      } else {
        toast({
          title: "Estado civil nao foi cadastrado!",
          variant: "destructive",
          description: `Erro: ${data.message ?? res.status}`,
        });
      }
    } catch {
      toast({
        title: "Estado civil nao foi cadastrado!",
        variant: "destructive",
        description: "Erro de conexao. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          Criar <Plus className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cadastrar estado civil</DialogTitle>
          <DialogDescription>
            Preencha a descricao do novo estado civil.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Exemplo: Casado ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  function closeDialog() {
    setOpen(false);
    onSuccess?.();
  }
}

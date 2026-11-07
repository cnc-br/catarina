"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { IAviso } from "@/interfaces/IAviso";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface AvisoFormDialogProps {
  aviso: IAviso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(1, { message: "O texto do aviso é obrigatório." }),
  dataFim: z
    .string()
    .min(1, { message: "A data de término é obrigatória." })
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      { message: "A data de término deve ser uma data válida." },
    ),
});

type AvisoFormValues = z.infer<typeof formSchema>;

function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AvisoFormDialog({
  aviso,
  open,
  onOpenChange,
  onSuccess,
}: AvisoFormDialogProps) {
  const isEditing = !!aviso;

  const form = useForm<AvisoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      texto: "",
      dataFim: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        texto: aviso?.texto ?? "",
        dataFim: aviso?.dataFim ? toDatetimeLocal(aviso.dataFim) : "",
      });
    }
  }, [open, aviso, form]);

  const handleSubmit = async (values: AvisoFormValues) => {
    const payload = {
      texto: values.texto.trim(),
      dataFim: new Date(values.dataFim).toISOString(),
    };

    try {
      const url = isEditing
        ? `/api/ambrosio/avisos/${aviso.id}`
        : "/api/ambrosio/avisos";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 201 || res.status === 200) {
        toast({
          title: isEditing ? "Aviso atualizado!" : "Aviso cadastrado!",
          description: isEditing
            ? "O aviso foi atualizado com sucesso."
            : "O aviso foi cadastrado com sucesso.",
        });
        onOpenChange(false);
        onSuccess?.();
      } else if (res.status === 401 || res.status === 403) {
        toast({
          title: "Sem permissão",
          variant: "destructive",
          description: "Você não tem permissão para gerenciar avisos.",
        });
      } else {
        toast({
          title: isEditing ? "Aviso não atualizado!" : "Aviso não cadastrado!",
          variant: "destructive",
          description: data?.message ?? `Erro: ${res.status}`,
        });
      }
    } catch {
      toast({
        title: isEditing ? "Aviso não atualizado!" : "Aviso não cadastrado!",
        variant: "destructive",
        description: "Erro de conexão. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar aviso" : "Cadastrar aviso"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do aviso selecionado."
              : "Preencha a mensagem e a data de término do novo aviso."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="texto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto do aviso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Exemplo: Novo horário de missas"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataFim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de término</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar alterações"
                    : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

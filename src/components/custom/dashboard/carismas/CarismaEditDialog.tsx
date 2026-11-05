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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Carisma, TipoCarismaEnum } from "neocatecumenal";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  CarismaFormValues,
  carismaFormSchema,
  tiposCarismaOptions,
} from "./carisma-form-schema";

interface CarismaEditDialogProps {
  carisma: Carisma | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CarismaEditDialog({
  carisma,
  open,
  onOpenChange,
  onSuccess,
}: CarismaEditDialogProps) {
  const form = useForm<CarismaFormValues>({
    resolver: zodResolver(carismaFormSchema),
    defaultValues: {
      descricao: "",
      tipo: TipoCarismaEnum.PRIMITIVO,
      casalAndaJunto: false,
    },
  });

  useEffect(() => {
    if (carisma) {
      form.reset({
        descricao: carisma.descricao,
        tipo: carisma.tipo,
        casalAndaJunto: carisma.casalAndaJunto,
      });
    }
  }, [carisma, form]);

  const handleSubmit = async (values: CarismaFormValues) => {
    if (!carisma) {
      return;
    }

    try {
      const res = await fetch(
        `/api/ambrosio/configuracoes/carismas/${carisma.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );

      if (res.ok) {
        toast({
          title: "Carisma atualizado!",
          description: `O carisma "${values.descricao}" foi atualizado com sucesso.`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        const data = await res.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        toast({
          title: "Carisma não foi atualizado!",
          variant: "destructive",
          description: message ?? `Erro: ${res.status}`,
        });
      }
    } catch {
      toast({
        title: "Carisma não foi atualizado!",
        variant: "destructive",
        description: "Erro de conexão. Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar carisma</DialogTitle>
          <DialogDescription>
            Atualize os dados do carisma selecionado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Exemplo: Catequista" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposCarismaOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="casalAndaJunto"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Casal anda junto</FormLabel>
                    <FormDescription>
                      Marque quando o casal é automaticamente vinculado a este
                      carisma.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { formatDateInputValue } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowsUpFromLine } from "lucide-react";
import { ComunidadeEtapa, Etapa } from "neocatecumenal";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

interface PassarComunidadeDeEtapaProps {
  comunidadeId: string;
  buttonDescription: string;
  etapaAtual: Etapa;
  onSuccess?: () => void;
  comunidadeEtapaId?: number;
  etapa?: ComunidadeEtapa;
}

export function PassarComunidadeDeEtapa({
  comunidadeId,
  buttonDescription,
  etapaAtual,
  onSuccess,
  comunidadeEtapaId,
  etapa,
}: PassarComunidadeDeEtapaProps) {
  const [open, setOpen] = useState(false);
  const [etapas, setEtapas] = useState<Etapa[]>([]);

  const formSchema = z.object({
    etapa: z.string().min(1, { message: "Selecione a etapa" }),
    local: z
      .string()
      .min(2, { message: "Descrição deve ter no minimo 2 caracteres." })
      .max(80, { message: "Descrição deve ter no máximo 80 caracteres." })
      .optional(),
    dataInicio: z.date().optional(),
    observacao: z.string().max(250).optional(),
  });

  const getDefaultValues = () => ({
    etapa: etapaAtual ? etapaAtual.id.toString() : "",
    dataInicio: etapa?.dataInicio ? new Date(etapa.dataInicio) : undefined,
    local: etapa?.localConvivencia || "",
    observacao: etapa?.observacao || "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const carregarEtapas = async () => {
      try {
        const res = await fetch("/api/ambrosio/configuracoes/etapas", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Erro ao carregar etapas");
        }

        const payload = await res.json();
        const lista = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        const normalizadas = lista
          .map((item: Etapa) => ({
            id: Number(item.id),
            descricao: String(item.descricao ?? ""),
          }))
          .filter((item: Etapa) => Number.isFinite(item.id) && item.descricao);

        setEtapas(normalizadas);
      } catch {
        toast({
          title: "Nao foi possivel carregar etapas",
          variant: "destructive",
          description: "Tente novamente em instantes.",
        });
      }
    };

    carregarEtapas();
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      form.reset(getDefaultValues());
    }
    setOpen(nextOpen);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    let url = `/api/ambrosio/comunidade/${comunidadeId}/etapa`;
    let method = "POST";

    if (comunidadeEtapaId) {
      method = "PATCH";
      url += `/${comunidadeEtapaId}`;
    }

    const etapaSelecionada = etapas.find(
      (etapaOption) => etapaOption.id.toString() === values.etapa,
    );
    const etapaDescricaoToast = etapaSelecionada?.descricao ?? values.etapa;

    const payload = {
      ...values,
      etapa: Number(values.etapa),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.status === 201 && method === "POST") {
        toast({
          title: `${etapaDescricaoToast} cadastrada!`,
          variant: "default",
          description: `Cadastrado(a) com sucesso a etapa!`,
        });
        closeDialog();
      } else if (res.status === 200 && method === "PATCH") {
        toast({
          title: `${etapaDescricaoToast} atualizada!`,
          variant: "default",
          description: `Atualizado(a) com sucesso a etapa!`,
        });
        closeDialog();
      } else {
        if (res.status === 403 || res.status === 401) {
          toast({
            title: `Etapa não foi cadastrada!`,
            variant: "destructive",
            description: `Você não tem permissão para cadastrar etapas`,
          });
        } else if (res.status === 400) {
          toast({
            title: `Etapa não foi cadastrada!`,
            variant: "destructive",
            description: `Erro: ${data.message}`,
          });
        } else {
          toast({
            title: `Etapa não foi cadastrada!`,
            variant: "destructive",
            description: `Erro: ${res.text}`,
          });
        }
      }
    } catch {
      toast({
        title: `Etapa não foi cadastrado!`,
        variant: "destructive",
        description: `Erro de conexão. Tente novamente.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            {buttonDescription} <ArrowsUpFromLine className="ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Passar Comunidade de Etapa</DialogTitle>
            <DialogDescription className="text-red-600 font-semibold">
              Etapa atual: {etapaAtual ? etapaAtual.descricao : "Não informada"}
            </DialogDescription>
            <DialogDescription>
              Preencha as informações abaixo para confirmar a passagem de etapa
              da comunidade.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="etapa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione a nova etapa</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {etapas.map((option) => (
                          <SelectItem
                            key={option.id}
                            value={option.id.toString()}
                          >
                            {option.descricao}
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
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local da convivência</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Local que foi feito a convivência ..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data convivência</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        placeholder="Data da convivência"
                        value={formatDateInputValue(field.value)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        disabled={field.disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alguma observação ?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguma observação sobre a etapa da comunidade ..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">{comunidadeEtapaId ? "Editar" : "Salvar"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  );

  function closeDialog() {
    setOpen(false);
    onSuccess?.();
  }
}

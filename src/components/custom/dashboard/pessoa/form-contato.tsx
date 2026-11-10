import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { PessoaContato } from "neocatecumenal";
import { type CountryCode } from "libphonenumber-js";
import DdiCombobox from "@/components/custom/dashboard/pessoa/ddi-combobox";
import {
  PAIS_PADRAO,
  formatarTelefoneNacional,
  limitarTelefoneNacional,
  montarTelefone,
  separarTelefone,
} from "@/lib/telefone";

const TIPOS_TELEFONE = ["CELULAR", "RESIDENCIAL", "COMERCIAL"] as const;

type ContatoFormProps = {
  pessoaId: number;
  urlBase: string;
  contato?: PessoaContato;
  onContatoSalvo?: () => void;
};

const formSchema = z.object({
  tipoTelefone: z.string().min(1, { message: "O tipo de telefone é obrigatório" }),
  pais: z.string().min(1, { message: "O país/DDI é obrigatório" }),
  telefone: z.string().min(1, { message: "O telefone é obrigatório" }),
  email: z
    .string()
    .email({ message: "Informe um e-mail válido" })
    .or(z.literal("")),
  observacao: z.string().max(255).optional(),
  contatoPrincipal: z.boolean(),
});

export default function ContatoForm({
  pessoaId,
  urlBase,
  contato,
  onContatoSalvo,
}: ContatoFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!contato;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoTelefone: "",
      pais: PAIS_PADRAO,
      telefone: "",
      email: "",
      observacao: "",
      contatoPrincipal: false,
    },
  });

  useEffect(() => {
    const { pais, nacional } = separarTelefone(contato?.telefone);
    form.reset({
      tipoTelefone: contato?.tipoTelefone ?? "",
      pais,
      telefone: nacional,
      email: contato?.email ?? "",
      observacao: contato?.observacao ?? "",
      contatoPrincipal: contato?.contatoPrincipal ?? false,
    });
  }, [contato, form]);

  const paisSelecionado = useWatch({
    control: form.control,
    name: "pais",
  }) as CountryCode;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const payload = {
        tipoTelefone: values.tipoTelefone,
        telefone: montarTelefone(values.pais as CountryCode, values.telefone),
        email: values.email || undefined,
        observacao: values.observacao || undefined,
        contatoPrincipal: values.contatoPrincipal,
      };

      const url =
        isEditing && contato
          ? `${urlBase}/api/ambrosio/pessoa/${pessoaId}/contato/${contato.id}`
          : `${urlBase}/api/ambrosio/pessoa/${pessoaId}/contato`;

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: isEditing ? "Contato atualizado" : "Contato cadastrado",
          variant: "default",
          description: isEditing
            ? "Atualizado(a) com sucesso!"
            : "Cadastrado(a) com sucesso!",
        });
        if (!isEditing) {
          form.reset();
        }
        onContatoSalvo?.();
      } else {
        const resData = await res.json().catch(() => null);
        toast({
          title: isEditing
            ? "Contato não foi atualizado!"
            : "Contato não foi cadastrado!",
          variant: "destructive",
          description: resData?.message || `Erro: ${res.status}`,
        });
      }
    } catch {
      toast({
        title: isEditing
          ? "Contato não foi atualizado!"
          : "Contato não foi cadastrado!",
        variant: "destructive",
        description: isEditing
          ? "Erro inesperado ao tentar atualizar o contato."
          : "Erro inesperado ao tentar cadastrar o contato.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="tipoTelefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de telefone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPOS_TELEFONE.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-2 sm:grid-cols-[190px_1fr]">
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DDI</FormLabel>
                <DdiCombobox
                  value={field.value as CountryCode}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    inputMode="tel"
                    name={field.name}
                    value={formatarTelefoneNacional(
                      paisSelecionado,
                      field.value,
                    )}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(
                        limitarTelefoneNacional(
                          paisSelecionado,
                          event.target.value,
                        ),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="E-mail ..." {...field} />
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
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea placeholder="Observação ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contatoPrincipal"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <input
                  id="contatoPrincipal"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
              </FormControl>
              <FormLabel htmlFor="contatoPrincipal" className="mb-0 cursor-pointer">
                Contato principal
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          Salvar contato
        </Button>
      </form>
    </Form>
  );
}

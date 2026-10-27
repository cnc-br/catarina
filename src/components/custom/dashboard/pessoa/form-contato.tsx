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
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const TIPOS_TELEFONE = ["CELULAR", "RESIDENCIAL", "COMERCIAL"] as const;

type ContatoFormProps = {
  pessoaId: number;
  urlBase: string;
  onContatoSalvo?: () => void;
};

const formSchema = z.object({
  tipoTelefone: z.string().min(1, { message: "O tipo de telefone é obrigatório" }),
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
  onContatoSalvo,
}: ContatoFormProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoTelefone: "",
      telefone: "",
      email: "",
      observacao: "",
      contatoPrincipal: false,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const contato = {
        tipoTelefone: values.tipoTelefone,
        telefone: values.telefone,
        email: values.email || undefined,
        observacao: values.observacao || undefined,
        contatoPrincipal: values.contatoPrincipal,
      };

      const res = await fetch(
        `${urlBase}/api/ambrosio/pessoa/${pessoaId}/contato`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contato),
        },
      );

      if (res.ok) {
        toast({
          title: "Contato cadastrado",
          variant: "default",
          description: "Cadastrado(a) com sucesso!",
        });
        form.reset();
        onContatoSalvo?.();
      } else {
        const payload = await res.json().catch(() => null);
        toast({
          title: "Contato não foi cadastrado!",
          variant: "destructive",
          description: payload?.message || `Erro: ${res.status}`,
        });
      }
    } catch {
      toast({
        title: "Contato não foi cadastrado!",
        variant: "destructive",
        description: "Erro inesperado ao tentar cadastrar o contato.",
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

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="Telefone ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

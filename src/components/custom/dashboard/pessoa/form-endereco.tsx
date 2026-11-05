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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { IEndereco } from "@/interfaces/IEndereco";
import { useRouter } from "next/navigation";
import { Pessoa } from "neocatecumenal";
import { CepField } from "../../form-fields/CepField";
import { useCepHandler } from "@/hooks/useCepHandler";

type EnderecoFormProps = {
  pessoa: Pessoa;
  urlBase: string;
};

export default function EnderecoForm({ pessoa, urlBase }: EnderecoFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [bairroDisabled, setBairroDisabled] = useState(false);
  const [cidadeDisabled, setCidadeDisabled] = useState(false);
  const [logradouroDisabled, setLogradouroDisabled] = useState(false);

  function limpaCampos() {
    form.setValue("bairro", "");
    form.setValue("cidade", "");
    form.setValue("logradouro", "");
    form.setValue("numero", "");
    form.setValue("uf", "");
    form.setValue("cep", "");
    form.setFocus("cep");
  }

  const formSchema = z.object({
    logradouro: z.string().max(50),
    numero: z.string().max(5),
    bairro: z.string().max(50),
    cep: z
      .string({ message: "O CEP é obrigatório" })
      .min(8, { message: "O CEP precisa ter 8 digitos" })
      .max(8, { message: "O CEP precisa ter 8 digitos" }),
    cidade: z.string().max(50),
    uf: z.string().max(2).min(2),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
      cidade: "",
      uf: "",
      logradouro: "",
      numero: "",
      bairro: "",
    },
  });

  const handleCep = useCepHandler({
    form,
    setBairroDisabled,
    setLogradouroDisabled,
    setCidadeDisabled,
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const url = `${urlBase}/api/ambrosio/endereco`;
    const method = "POST";

    const endereco: Partial<IEndereco> = {
      cep: values.cep,
      logradouro: values.logradouro,
      cidade: values.cidade,
      UF: values.uf,
      bairro: values.bairro,
      pessoaId: pessoa.id,
      numero: values.numero,
    };

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(endereco),
    });

    if (res.status === 201 && method === "POST") {
      toast({
        title: `Endereço de ${pessoa.nome}`,
        variant: "default",
        description: `Cadastrado(a) com sucesso!`,
      });
      limpaCampos();
      router.push(`/dashboard/pessoas/${pessoa.id}`);
    } else {
      toast({
        title: `Endereço de ${pessoa.nome} não foi cadastrado!`,
        variant: "destructive",
        description: `Erro: ${res.text}`,
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-2"
        >
          <CepField
            control={form.control}
            name="cep"
            label="CEP"
            placeholder="CEP da pessoa ..."
            onCepChange={handleCep}
          />

          <FormField
            control={form.control}
            name="logradouro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logradouro</FormLabel>
                <FormControl>
                  <Input
                    disabled={logradouroDisabled}
                    placeholder="Logradouro ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero</FormLabel>
                <FormControl>
                  <Input placeholder="Numero ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input
                    disabled={bairroDisabled}
                    placeholder="Bairro ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input
                    disabled={cidadeDisabled}
                    placeholder="Cidade ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input
                    disabled={cidadeDisabled}
                    placeholder="Estado ..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Salvar</Button>
        </form>
      </Form>
    </div>
  );
}

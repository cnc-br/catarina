import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Diocese, Paroquia, Setor } from "neocatecumenal";
import { addressSchema } from "@/schemas/addressSchema";
import { useCepHandler } from "@/hooks/useCepHandler";
import { IMaskInput } from "react-imask";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FormParoquiaProps = {
  urlBase: string;
  dioceseId: number;
  dioceseNome: string;
  paroquia?: Paroquia;
};

export default function ParoquiaForm({
  urlBase,
  paroquia,
  dioceseId,
  dioceseNome,
}: FormParoquiaProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [bairroDisabled, setBairroDisabled] = useState(true);
  const [cidadeDisabled, setCidadeDisabled] = useState(true);
  const [logradouroDisabled, setLogradouroDisabled] = useState(true);
  const [openDiocese, setOpenDiocese] = useState(false);
  const [openSetor, setOpenSetor] = useState(false);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [dioceses, setDioceses] = useState<Diocese[]>([]);

  const sanitizeCep = (cep?: string) => cep?.replace(/\D/g, "") || "";

  const getDioceseLabel = (diocese: Diocese) => {
    const cidadeNome = diocese?.endereco?.cidade?.nome;
    const estadoSigla = diocese?.endereco?.cidade?.estado?.sigla;
    const cidadeDescricao = cidadeNome
      ? `${cidadeNome}${estadoSigla ? `/${estadoSigla}` : ""}`
      : "";
    return cidadeDescricao
      ? `${diocese.descricao} - ${cidadeDescricao}`
      : diocese.descricao;
  };

  useEffect(() => {
    const fetchData = async () => {
      async function getDioceses() {
        const res = await fetch(`${urlBase}/api/ambrosio/diocese`);
        return res.json();
      }

      async function getSetores() {
        const res = await fetch(`${urlBase}/api/ambrosio/setor`);
        return res.json();
      }
      try {
        const [dataSetores, dataDioceses] = await Promise.all([
          getSetores(),
          getDioceses(),
        ]);

        setSetores(dataSetores.data);
        setDioceses(dataDioceses.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [urlBase, dioceseId]);

  const formSchema = z
    .object({
      descricao: z
        .string({ message: "Nome da diocese é obrigatório" })
        .min(2, { message: "Nome da diocese deve ter no minimo 2 caracteres." })
        .max(50, { message: "Tamanho máximo é 50 caracteres." }),
      enderecoId: z.string().optional(),
      setorId: z.string().optional(),
      dioceseId: z.number(),
      diocese: z.string(),
    })
    .merge(addressSchema);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: paroquia?.descricao || "",
      enderecoId: paroquia?.endereco.id.toString() || "",
      setorId: paroquia?.setor.id.toString() || "",
      diocese: dioceseNome,
      dioceseId,
      cep: paroquia?.endereco.cep || "",
      bairro: paroquia?.endereco.bairro || "",
      cidade: paroquia?.endereco.cidade.nome || "",
      numero: paroquia?.endereco.numero || "",
      logradouro: paroquia?.endereco.logradouro || "",
      uf: paroquia?.endereco.cidade.estado.sigla || "",
    },
  });

  const cepHandledRef = useRef(sanitizeCep(form.getValues("cep"))); // Keeps CEP lookups user-driven

  const handleCep = useCepHandler({
    form,
    setBairroDisabled,
    setLogradouroDisabled,
    setCidadeDisabled,
  });

  useEffect(() => {
    if (paroquia?.endereco?.cep) {
      cepHandledRef.current = sanitizeCep(paroquia.endereco.cep);
    } else {
      cepHandledRef.current = "";
    }
  }, [paroquia]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    let url = `${urlBase}/api/ambrosio/paroquia`;
    let method = "POST";

    if (paroquia) {
      url = `${url}/${paroquia.id}`;
      method = "PATCH";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.status === 201 && method === "POST") {
        toast({
          title: `Paróquia ${values.descricao}`,
          variant: "default",
          description: `Cadastrado(a) com sucesso!`,
        });
        router.push(`/dashboard/paroquias/`);
        return; // Não reabilita o botão pois vai redirecionar
      } else if (res.status === 200 && method === "PATCH") {
        toast({
          title: `${values.descricao}`,
          variant: "default",
          description: `Editada com sucesso!`,
        });
      } else {
        let acao = "cadastrado";
        if (method === "PATCH") {
          acao = "editado";
        }

        if (res.status === 400 || res.status === 404) {
          toast({
            title: `${values.descricao} não foi ${acao}!`,
            variant: "destructive",
            description: `Erro: ${data.message}`,
          });
        } else if (res.status === 401 || res.status === 403) {
          toast({
            title: `Sem permissão - ${res.status}`,
            variant: "default",
            description: `Você não tem permissão para ${
              method === "POST" ? "cadastrar" : "editar"
            } paróquia`,
          });
        } else {
          toast({
            title: `${values.descricao} não foi ${acao}!`,
            variant: "destructive",
            description: `Erro: ${res.text}`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        variant: "destructive",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto sm:mt-8">
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
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da paróquia ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diocese"
            render={({ field }) => {
              const selectedDioceseId = form.watch("dioceseId");
              const selectedDiocese = dioceses.find(
                (item) => item.id === selectedDioceseId,
              );

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Diocese</FormLabel>
                  <Popover open={openDiocese} onOpenChange={setOpenDiocese}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDiocese}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {selectedDiocese
                            ? getDioceseLabel(selectedDiocese)
                            : field.value || "Selecione uma diocese..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar diocese..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhuma diocese encontrada.
                          </CommandEmpty>
                          <CommandGroup>
                            {dioceses.map((diocese) => (
                              <CommandItem
                                key={diocese.id}
                                value={getDioceseLabel(diocese)}
                                onSelect={() => {
                                  form.setValue("diocese", diocese.descricao, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  form.setValue("dioceseId", diocese.id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  setOpenDiocese(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    diocese.id === selectedDioceseId
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {getDioceseLabel(diocese)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="setorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Setor</FormLabel>
                <Popover open={openSetor} onOpenChange={setOpenSetor}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSetor}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? setores.find(
                              (setor) => setor.id.toString() === field.value,
                            )?.descricao +
                            " - " +
                            setores.find(
                              (setor) => setor.id.toString() === field.value,
                            )?.regiao.descricao
                          : "Selecione um setor..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar setor..." />
                      <CommandList>
                        <CommandEmpty>Nenhum setor encontrado.</CommandEmpty>
                        <CommandGroup>
                          {setores.map((setor) => (
                            <CommandItem
                              value={`${setor.descricao} ${setor.regiao.descricao}`}
                              key={setor.id}
                              onSelect={() => {
                                form.setValue("setorId", setor.id.toString());
                                setOpenSetor(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  setor.id.toString() === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              Região {setor.regiao.descricao} -{" "}
                              {setor.descricao}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />
          <h2>Endereço</h2>

          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <IMaskInput
                    mask="00000-000"
                    placeholder="CEP da paroquia ..."
                    value={field.value}
                    onAccept={(value) => {
                      const numericCep = value.replace(/\D/g, ""); // remove hífen e tudo que não for número
                      field.onChange(numericCep); // salva o valor limpo no react-hook-form
                      if (numericCep.length === 8) {
                        if (numericCep !== cepHandledRef.current) {
                          handleCep(numericCep);
                          cepHandledRef.current = numericCep;
                        }
                      } else {
                        cepHandledRef.current = numericCep;
                      }
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

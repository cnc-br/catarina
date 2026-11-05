import { TipoCarismaEnum } from "neocatecumenal";
import { z } from "zod";

export const carismaFormSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(1, { message: "Descrição é obrigatória." })
    .max(100, { message: "Descrição não pode ter mais de 100 caracteres." }),
  tipo: z.enum(TipoCarismaEnum),
  casalAndaJunto: z.boolean(),
});

export type CarismaFormValues = z.infer<typeof carismaFormSchema>;

export const tiposCarismaOptions = [
  { value: TipoCarismaEnum.PRIMITIVO, label: "Primitivo" },
  { value: TipoCarismaEnum.SERVICO, label: "Serviço" },
  { value: TipoCarismaEnum.VINCULADO, label: "Vinculado" },
] as const;

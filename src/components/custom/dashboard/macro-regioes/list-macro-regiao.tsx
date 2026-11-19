import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { removerAcento } from "@/lib/utils";
import { FolderSearch } from "lucide-react";
import { MacroRegiao } from "neocatecumenal";
import Link from "next/link";
import { useState } from "react";

type ListMacroRegiaoProps = {
  macroRegioes: MacroRegiao[];
};

export default function ListMacroRegiao({
  macroRegioes,
}: ListMacroRegiaoProps) {
  const [search, setSearch] = useState("");

  const macroRegioesFiltrados =
    search.length > 0
      ? macroRegioes.filter((macroRegiao) => {
          const nome = removerAcento(
            macroRegiao.descricao as string
          ).toLowerCase();
          const nomePesquisa = removerAcento(search).toLowerCase();
          return nome.includes(nomePesquisa);
        })
      : macroRegioes;

  return (
    <div>
      <div className="flex items-center gap-2 max-w-lg mb-3">
        <Label className="flex items-center gap-2">
          <FolderSearch /> Pesquisa
        </Label>
        <Input
          placeholder="Digite o nome da macro região ..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableCaption>
          Ultimos cadastros - Macro Regiões: {macroRegioes.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Macro Região</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {macroRegioesFiltrados.slice(0, 10).map((macroRegiao) => (
            <TableRow key={macroRegiao.id}>
              <TableCell>#{macroRegiao.id}</TableCell>
              <TableCell className="text-slate-600 uppercase font-light">
                {macroRegiao.descricao}
              </TableCell>
              <TableCell>
                <Badge variant={macroRegiao.ativo ? "default" : "destructive"}>
                  {macroRegiao.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href={`/dashboard/macro-regiao/${macroRegiao.id}`}>
                    Editar
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

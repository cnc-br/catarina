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
import { Setor } from "neocatecumenal";
import Link from "next/link";
import { useState } from "react";

type ListSetorProps = {
  setores: Setor[];
};

export default function ListSetor({ setores }: ListSetorProps) {
  const [search, setSearch] = useState("");

  const setoresFiltrados =
    search.length > 0
      ? setores.filter((setor) => {
          const nome = removerAcento(setor.descricao as string).toLowerCase();
          const nomePesquisa = removerAcento(search).toLowerCase();
          return nome.includes(nomePesquisa);
        })
      : setores;

  return (
    <div>
      <div className="flex items-center gap-2 max-w-lg mb-3">
        <Label className="flex items-center gap-2">
          <FolderSearch /> Pesquisa
        </Label>
        <Input
          placeholder="Digite o nome do setor ..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableCaption>
          Ultimos cadastros - Setores: {setores.length}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Região</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {setoresFiltrados.slice(0, 10).map((setor) => (
            <TableRow key={setor.id}>
              <TableCell>#{setor.id}</TableCell>
              <TableCell>
                <div className="font-semibold">{setor.descricao}</div>
              </TableCell>
              <TableCell className="text-slate-600 uppercase font-light">
                {setor.regiao.descricao}
              </TableCell>
              <TableCell>
                <Badge variant={setor.ativo ? "default" : "destructive"}>
                  {setor.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href={`/dashboard/setores/${setor.id}`}>Editar</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

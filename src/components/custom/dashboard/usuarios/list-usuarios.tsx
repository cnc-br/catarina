"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Loader2, XCircle } from "lucide-react";
import { User } from "neocatecumenal";

type DashboardUser = User & {
  nome?: string;
  pessoa?: {
    nome?: string;
  };
};

export default function ListUsuarios() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/ambrosio/user");

        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }

        const data = await response.json();
        if (ativo) {
          setUsers(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        if (ativo) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const formatPhone = (whatsapp: string) => {
    // Formata o número: 16999999999 -> (16) 99999-9999
    if (whatsapp.length === 11) {
      return `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(
        2,
        7,
      )}-${whatsapp.substring(7)}`;
    } else if (whatsapp.length === 10) {
      return `(${whatsapp.substring(0, 2)}) ${whatsapp.substring(
        2,
        6,
      )}-${whatsapp.substring(6)}`;
    }
    return whatsapp;
  };

  const getDisplayName = (user: DashboardUser) => {
    return user.pessoa?.nome || user.nome || user.email;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => {
                setLoading(true);
                setRefreshKey((key) => key + 1);
              }}
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lista de Usuários
          <Badge variant="secondary" className="ml-auto">
            {users.length} usuário{users.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/user.png" alt={user.email} />
                        </Avatar>
                        <div>
                          <p className="font-medium">{getDisplayName(user)}</p>
                          <Badge
                            variant={user.active ? "default" : "destructive"}
                          >
                            {user.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.whatsapp ? formatPhone(user.whatsapp) : "—"}
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() =>
                          router.push(`/dashboard/usuarios/${user.id}`)
                        }
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

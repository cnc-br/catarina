"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { User } from "neocatecumenal";

const DEFAULT_ROLE = "SECRETARIA_CNC";

interface FormUsuarioProps {
  user: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FormUsuario({ user, onSuccess, onCancel }: FormUsuarioProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: user.email || "",
    whatsapp: user.whatsapp || "",
    active: user.active ?? true,
    role: user.role || DEFAULT_ROLE,
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/ambrosio/auth/roles", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar as roles");
        }

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("data" in data) ||
          !Array.isArray(data.data) ||
          !data.data.every((role): role is string => typeof role === "string")
        ) {
          throw new Error("Resposta inválida ao carregar as roles");
        }

        setRoles(data.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setRolesError(
          err instanceof Error ? err.message : "Erro desconhecido ao carregar roles",
        );
      } finally {
        if (!controller.signal.aborted) {
          setRolesLoading(false);
        }
      }
    };

    fetchRoles();
    return () => controller.abort();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Enviando apenas os campos que foram alterados
      const updateData: Record<string, string | boolean> = {};
      if (formData.email) updateData.email = formData.email;
      if (formData.whatsapp) updateData.whatsapp = formData.whatsapp;
      // Sempre envie o campo 'active' como booleano
      updateData.active = Boolean(formData.active);
      if (formData.role !== user.role) updateData.role = formData.role;

      const response = await fetch(`/api/ambrosio/user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar usuário");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 flex flex-col items-center"
    >
      {error && (
        <Card className="p-3 bg-red-50 border-red-200 max-w-md w-full">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      <div className="max-w-md space-y-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite o email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="Digite o WhatsApp (10 ou 11 dígitos)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(role) =>
              setFormData((prev) => ({ ...prev, role }))
            }
            disabled={rolesLoading || Boolean(rolesError)}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue
                placeholder={rolesLoading ? "Carregando roles..." : "Selecione uma role"}
              />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {rolesError && <p className="text-sm text-red-600">{rolesError}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="active" className="mb-0 cursor-pointer">
            Ativo
          </Label>
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-center pt-2 w-full max-w-md">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>
    </form>
  );
}

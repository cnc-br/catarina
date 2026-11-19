"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import SetorForm from "@/components/custom/dashboard/setores/form-setor";
import { BASE_URL } from "@/lib/utils";

export default function NovoSetorPage() {
  return (
    <div>
      <PageSubtitle
        title="Cadastro de novo setor"
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/setores",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <SetorForm urlBase={BASE_URL} />
    </div>
  );
}

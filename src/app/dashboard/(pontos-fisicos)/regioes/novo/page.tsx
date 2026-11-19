"use client";

import PageSubtitle from "@/components/custom/dashboard/page-subtitle";
import RegiaoForm from "@/components/custom/dashboard/regiao/form-regiao";
import { BASE_URL } from "@/lib/utils";

export default function NovaRegiaoPage() {
  return (
    <div>
      <PageSubtitle
        title="Cadastro de nova região"
        buttons={[
          {
            buttonText: "Voltar",
            buttonUrl: "/dashboard/regioes",
            buttonShow: true,
            buttonVariant: "outline",
          },
        ]}
      />

      <RegiaoForm urlBase={BASE_URL} />
    </div>
  );
}

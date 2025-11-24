"use client";

import {
  CardDownloadPGR,
  CardLatestPGRStatus,
  CardPGRsHistory
} from "./cards";

export const ClientView = () => (
  <div className="h-full lg:px-6">
    <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
      <div className="flex  flex-wrap justify-between">
        <h3 className="text-center text-xl font-semibold">
          Gerenciamento de Riscos Ocupacionais
        </h3>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5 w-max justify-center">
        <CardLatestPGRStatus />
        <CardDownloadPGR />
      </div>
      <CardPGRsHistory />
    </div>
  </div>
);

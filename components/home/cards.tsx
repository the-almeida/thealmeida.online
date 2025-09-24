import { Button, Card, CardBody, Tooltip } from "@nextui-org/react";
import { PdfDownloadIcon } from "../icons/table/download-pdf-icon";
import { StatusCheckIcon } from "../icons/table/status-check-icon";


export const CardDownloadPGR = () => {
  const handleClick = () => {
    const a = document.createElement("a");
    a.href = "/files/cvGustavoAlmeida.pdf";
    a.download = "CV - Gustavo Almeida.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <Card
      className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-3 w-full"
    >
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <PdfDownloadIcon />
          <div className="flex flex-col">
            <span className="text-default-900">Exportar relatório</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center">
          <span className="text-default-900 text-xl font-semibold">
            Referente ao PGR Outubro
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Button onPress={handleClick} color="primary">Baixar PDF</Button>
        </div>
      </CardBody>
    </Card>
  );
};

export const CardLatestPGRStatus = () => {
  return (
    <Card className="xl:max-w-sm bg-success rounded-xl shadow-md px-3 w-full">
      <CardBody className="py-5">
        <div className="flex gap-2.5">
          <StatusCheckIcon />
          <div className="flex flex-col">
            <span className="text-white text-bold">Status do PGR</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center">
          <span className="text-white text-xl font-semibold">Ativo</span>
          <span className="text-white text-xs">até 24/10/2025</span>
        </div>
      </CardBody>
    </Card>
  );
};

const pgrs = [
  {
    name: "PGR Outubro",
    picture: "https://placehold.co/200x200?text=GS",
    status: "Ativo",
    date: "24/10/2025",
  },
  {
    name: "PGR Setembro",
    picture: "https://placehold.co/200x200?text=GS",
    status: "Concluído",
    date: "24/09/2025",
  },
  {
    name: "PGR Agosto",
    picture: "https://placehold.co/200x200?text=GS",
    status: "Concluído",
    date: "24/08/2025",
  },
  {
    name: "PGR Julho",
    picture: "https://placehold.co/200x200?text=GS",
    status: "Concluído",
    date: "24/07/2025",
  },
  {
    name: "PGR Junho",
    picture: "https://placehold.co/200x200?text=GS",
    status: "Concluído",
    date: "24/06/2025",
  },
];

export const CardPGRsHistory = () => {
  const handleClick = () => {
    const a = document.createElement("a");
    a.href = "/files/cvGustavoAlmeida.pdf";
    a.download = "CV - Gustavo Almeida.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  return (
    <Card className=" bg-default-50 rounded-xl shadow-md px-3">
      <CardBody className="py-5 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border-dashed border-2 border-divider py-2 px-6 rounded-xl">
            <span className="text-default-900 text-xl font-semibold">
              Históricos de PGRs
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 ">
          {pgrs.map((pgr) => (
            <div key={pgr.name} className="grid grid-cols-4 w-full">
              <span className="text-default-900  font-semibold">
                {pgr.name}
              </span>
              <div>
                <span className="text-success text-xs">{pgr.status}</span>
              </div>
              <div>
                <span className="text-default-500 text-xs">{pgr.date}</span>
              </div>
              <div className="">
                <Tooltip content="Baixar PDF" color="secondary">
                  <button onClick={handleClick}>
                    <PdfDownloadIcon size={30} fill="#979797" />
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

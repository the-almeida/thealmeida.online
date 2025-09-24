import { Chip, Tooltip, User } from "@nextui-org/react";
import React from "react";
import { PdfDownloadIcon } from "../icons/table/download-pdf-icon";
import { pgrs } from "./data";

interface Props {
  pgr: (typeof pgrs)[number];
  columnKey: string | React.Key;
}

export const RenderCell = ({ pgr, columnKey }: Props) => {
  const handleClick = () => {
    const a = document.createElement("a");
    a.href = "/files/cvGustavoAlmeida.pdf";
    a.download = "CV - Gustavo Almeida.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  // @ts-ignore
  const cellValue = pgr[columnKey];
  switch (columnKey) {
    case "name":
      return (
        <User
          avatarProps={{
            src: "https://placehold.co/200x200?text=GS",
          }}
          name={cellValue}
        />
      );
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "Ativo"
              ? "success"
              : cellValue === "Pendente"
              ? "danger"
              : "warning"
          }
        >
          <span className="capitalize text-xs whitespace-nowrap">
            {cellValue}
          </span>
        </Chip>
      );

    case "actions":
      return (
        <div className="flex items-center gap-4 ">
          <Tooltip content="Baixar PDF" color="secondary">
            <button onClick={handleClick}>
              <PdfDownloadIcon size={30} fill="#979797" />
            </button>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};

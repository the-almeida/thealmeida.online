interface Props {
  size?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export const StatusCheckIcon = ({
  fill = "#000000", // cor padrão (preto)
  size,
  height,
  width,
  ...props
}: Props) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Fundo transparente */}
      <rect width="24" height="24" fill="none" opacity="0" />

      {/* Ícone principal */}
      <path
        fill={fill} // cor controlada via prop
        fillRule="nonzero"
        d="M12 2c-.218 0-.432.002-.642.005l-.616.017-.299.013-.579.035-.553.046C4.526 2.579 2.579 4.526 2.115 9.311l-.046.553-.034.579a26.57 26.57 0 00-.017.616L2 12c0 .218.002.432.005.642l.017.616.013.299.035.579.046.553c.464 4.785 2.411 6.733 7.196 7.197l.553.046.579.034.299.013.616.017.642.005.642-.005.616-.017.299-.013.579-.034.553-.046c4.785-.464 6.733-2.412 7.197-7.197l.046-.553.034-.579.013-.299.017-.616.005-.642-.005-.642-.017-.616-.013-.299-.034-.579-.046-.553c-.464-4.785-2.412-6.733-7.197-7.197l-.553-.046-.579-.035a26.57 26.57 0 00-.616-.017L12 2zm2.293 7.293a1 1 0 011.367 1.367l-.083.094-4 4a1 1 0 01-1.32.083l-.094-.083-2-2a1 1 0 011.367-1.367l.094.083L11 12.585l3.293-3.292z"
      />
    </svg>
  );
};

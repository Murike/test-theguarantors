type Dimensao = {
  altura: number;
  largura: number;
  comprimento: number;
};

export type Caixa = {
  caixa_id: string;
  dimensoes: Dimensao;
};

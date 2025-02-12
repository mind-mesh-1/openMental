type FullCitationType = {
  citationId: string;
  score: number;
  text: string;
  sourceId: string;
  sourceName: string;
};

type ShortCitationType = Omit<FullCitationType, 'text'>;
export { type FullCitationType, type ShortCitationType };

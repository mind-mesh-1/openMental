type FullCitationType = {
  citationId: string;
  score: number;
  text: string;
  sourceId: string;
  sourceName: string;
};

type ShortCitationType = Omit<
  FullCitationType,
  'text' | 'sourceId' | 'sourceName'
>;
export { type FullCitationType, type ShortCitationType };

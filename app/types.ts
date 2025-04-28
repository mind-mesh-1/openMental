type WithMessage<T> = T & {
  message: string;
};

type SourceItem = {
  id: string;
  filename: string;
};

type SourceDetail = SourceItem & {
  content_type: 'text/plain';
  size: number;
  uploaded_at: string;
  metadata: Record<string, unknown>;
  text: string;
};

type SourceListResponse = WithMessage<{
  items: SourceItem[];
}>;

type SourceDetailResponse = WithMessage<SourceDetail>;

export type {
  SourceItem,
  SourceDetail,
  SourceListResponse,
  SourceDetailResponse,
};

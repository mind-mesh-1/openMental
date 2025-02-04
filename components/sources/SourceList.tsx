import { AddSourceButton } from '@/components/sources/AddSource';
import { useSources } from '@/lib/hooks/use-sources';
import Uploady from '@rpldy/uploady';

const SourceList = () => {
  const { sources, toggleSource } = useSources();

  return (
    <div className="flex flex-col gap-2">
      <div className="text-lg font-semibold">Sources</div>

      <Uploady destination={{ url: '/api/upload' }}>
        <AddSourceButton />
      </Uploady>

      {sources.map((source) => (
        <div key={source.id} className="flex items-center gap-2">
          <span>{source.fileType}</span>
          <span>{source.name}</span>
          <input
            type="checkbox"
            checked={source.isActive}
            onChange={() => toggleSource(source.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default SourceList;

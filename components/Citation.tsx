import React from 'react';
import { ShortCitationType } from '@/app/api/type';

interface IProp {
  idx: number;
  citation: ShortCitationType;
}
const Citation = ({ citation, idx }: IProp) => {
  const { citationId, score } = citation;
  const [visible, setIsVisible] = React.useState(false);
  const [text, setText] = React.useState('');

  const handleClickCitation = async () => {
    setIsVisible((prev) => !prev);
    const resp = await fetch(`/api/citation/${citationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setText((await resp.json()).citationText);
  };

  return (
    <div onClick={handleClickCitation} className="relative">
      {visible ? (
        <div className="border p-2 bg-gray-100">
          <p>{text}</p>
        </div>
      ) : (
        <button
          className="border-none p-2 cursor-pointer relative"
          style={{
            backgroundColor: `rgba(${Math.floor((1 - score) * 255)}, ${Math.floor(score * 255)}, 0, 0.5)`,
          }}
        >
          {idx}
          <span className="absolute left-0 top-full mt-1 w-full text-center text-xs text-gray-700 opacity-0 hover:opacity-100">
            Score: {score}
          </span>
        </button>
      )}
    </div>
  );
};

const renderCitations = (citations: ShortCitationType[]) => {
  return (
    <div className="flex flex-row">
      {citations.map((citation, idx) => (
        <Citation key={idx} citation={citation} idx={idx} />
      ))}
    </div>
  );
};

export { renderCitations };

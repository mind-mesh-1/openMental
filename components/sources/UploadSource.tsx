import UploadButton from '@rpldy/upload-button';
import { useRequestPreSend } from '@rpldy/uploady';

const UploadSource = () => {
  useRequestPreSend(({ items, options }) => {
    return {
      options: {
        ...options,
        params: {
          fileName: items[0].file.name,
          clientTime: Date.now(),
        },
      },
    };
  });

  return <UploadButton>Upload your source</UploadButton>;
};

export default UploadSource;

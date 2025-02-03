import '@radix-ui/themes/styles.css';
import { Button } from '@/components/ui/button';

const AddSourceButton = () => {
  return (
    <Button
      type="submit"
      onClick={(e) => alert('Upload Resource to server & Embed')}
    >
      Upload Source
    </Button>
  );
};

export { AddSourceButton };

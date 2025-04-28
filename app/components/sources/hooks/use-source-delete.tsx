// app/lib/hooks/use-source-delete.ts
const SOURCE_URL = process.env.NEXT_PUBLIC_SOURCE_URL as string;

export const useSourceDelete = () => {
  const deleteSource = async (sourceId: string) => {
    try {
      const response = await fetch(`${SOURCE_URL}/${sourceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete source');
      }
      alert(`${sourceId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Failed to delete source');
      return false;
    }
  };

  return { deleteSource };
};

import { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'path';
import fs from 'fs/promises';

class FileManagementController {
  // upload file from client
  async uploadFile(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // upload into storage
    // embed into vector storage
    // Implementation for downloading a file
    res.status(501).json({ error: 'Upload file Method not implemented.' });
  }

  // download previously uploaded file and stream into client
  async downloadFile(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    res.status(501).json({ error: 'Download file Method not implemented.' });
  }

  // Method to handle retrieval of file nodes
  async retrieveFileNodes(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ error: 'Source ID is required' });
        return;
      }

      const filePath = join(process.cwd(), 'public/uploads', `${id}.txt`);
      const content = await fs.readFile(filePath, 'utf-8');
      res.status(200).json({ content });
    } catch (error) {
      console.error('Error retrieving file:', error);
      res.status(500).json({ error: 'Failed to retrieve file content' });
    }
  }
}

const fileManagementController = new FileManagementController();

export default async function fileManagementHandler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await fileManagementController.retrieveFile(req, res);
      break;
    case 'POST':
      await fileManagementController.embedFile(req, res);
      break;
    case 'PUT':
      await fileManagementController.uploadFile(req, res);
      break;
    case 'DELETE':
      await fileManagementController.retrieveFileNodes(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

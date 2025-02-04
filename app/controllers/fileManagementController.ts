import { NextApiRequest, NextApiResponse } from 'next';

class FileManagementController {
  // upload file from client
  async uploadFile(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    // upload into storage
    // embed into vector storage
    // Implementation for downloading a file
    throw new Error(' download file Method not implemented.');
  }

  // download previously uploaded file and stream into client
  async downloadFile(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {}

  // Method to handle retrieval of file nodes
  async retrieveFileNodes(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    throw new Error(' retrieve file nodes Method not implemented.');
  }
}

const fileManagementController = new FileManagementController();

export default async (req: NextApiRequest, res: NextApiResponse) => {
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

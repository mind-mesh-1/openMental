import { indexController } from '@/lib/dao/indexController';

const controller = new indexController('sources');

controller
  .loadDirectories('/home/jingyi/WebstormProjects/copilot-v2/public/uploads')
  .then(() => {
    console.log('done');
  });

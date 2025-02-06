import { indexController } from '@/lib/dao/indexController';

const controller = new indexController('sources');

controller
  .query('haha', 'what did paul graham and sam altman do together')
  .then(({ sourceNodes, message }) => {
    console.log(sourceNodes, message);
  });

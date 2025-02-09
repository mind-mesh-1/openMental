import { VectorIndex } from '@/lib/dao/vectorIndex';

const controller = new VectorIndex('sources');

// controller
//   .loadFromDirectories(
//     '/home/jingyi/WebstormProjects/copilot-v2/public/uploads'
//   )
//   .then(() => {
//     console.log('done');
//   });

const documentIds = [
  'fe1836a2-786c-4096-9e30-422a15d2677d',
  // '4bc1ed90-92d2-4734-99de-4452ef1e946c',
];
controller
  .queryDocuments(
    documentIds,
    'what is the relationship between paul graham and sam altman'
  )
  .then(({ message }) => {
    console.log(message);
  });

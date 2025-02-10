// Update node parser
// Settings.nodeParser = new SentenceSplitter({
//   chunkSize: 512,
//   chunkOverlap: 20,
// });
import { loadDocuments } from '@/app/dao/utils.server';
import { SentenceSplitter } from '@llamaindex/core/node-parser';

loadDocuments(['paul_graham_essay']).then((documents) => {
  const parser = new SentenceSplitter();
  const nodes = parser.getNodesFromDocuments(documents);
  console.log(nodes);
});

// const transformBuffer = async (
//   buffer: Buffer<ArrayBufferLike>
// ): Promise<BaseNode<Metadata>[]> => {
//   console.log('bufferSize', buffer.byteLength);
//
//   const document = new Document({
//     text: buffer.toString('utf-8'),
//     id_: 'buffer',
//   });
//
//   const pipeline = new IngestionPipeline({
//     transformations: [
//       new SentenceSplitter({ chunkSize: 1024, chunkOverlap: 20 }),
//       new OpenAIEmbedding(),
//     ],
//   });
//
//   return await pipeline.run({ documents: [document] });
// };

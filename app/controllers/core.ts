import fs from 'node:fs/promises';

import {
  Document,
  MetadataMode,
  NodeWithScore,
  VectorStoreIndex,
} from 'llamaindex';

async function askArticle(question: string) {
  try {
    console.log('llamaIndex fn invoked', question);
    // Load essay from abramov.txt in Node
    const path =
      '/home/jingyi/WebstormProjects/copilot/app/controllers/paul_graham.txt';

    const essay = await fs.readFile(path, 'utf-8');

    // Create Document object with essay
    const document = new Document({ text: essay, id_: path });

    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await VectorStoreIndex.fromDocuments([document]);

    // Query the index
    const queryEngine = index.asQueryEngine();
    const { response, sourceNodes } = await queryEngine.query({
      query: question,
    });

    // Output response with sources
    console.log(response);

    return response;

    // if (sourceNodes) {
    //     sourceNodes.forEach((source: NodeWithScore, index: number) => {
    //         console.log(
    //             `\n${index}: Score: ${source.score} - ${source.node.getContent(MetadataMode.NONE).substring(0, 50)}...\n`,
    //         );
    //     });
    // }
  } catch (error) {
    console.log(error);
  }
}

export { askArticle };

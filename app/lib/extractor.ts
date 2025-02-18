import { BaseExtractor, BaseNode } from 'llamaindex';

class OffsetExtractor extends BaseExtractor {
  extract(nodes: BaseNode[]): Promise<Record<string, any>[]> {
    let cnter = 0;
    return nodes.map((node: any) => {
      const { startCharIdx, endCharIdx } = node;

      const start = startCharIdx ?? cnter;
      const end = endCharIdx ?? cnter + node.text.length;

      cnter = end + 1;

      return {
        start,
        end,
      };
    });
  }
}

export { OffsetExtractor };

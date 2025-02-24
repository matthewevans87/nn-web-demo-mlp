export class IDXParser {
  static async parseIDXImages(buffer: ArrayBuffer): Promise<number[][]> {
    const view = new DataView(buffer);
    const magic = view.getInt32(0, false);
    const numImages = view.getInt32(4, false);
    const numRows = view.getInt32(8, false);
    const numCols = view.getInt32(12, false);

    const images: number[][] = [];
    const headerOffset = 16;

    for (let i = 0; i < numImages; i++) {
      const pixels: number[] = [];
      for (let j = 0; j < numRows * numCols; j++) {
        pixels.push(view.getUint8(headerOffset + i * numRows * numCols + j));
      }
      images.push(pixels);
    }

    return images;
  }

  static async parseIDXLabels(buffer: ArrayBuffer): Promise<number[]> {
    const view = new DataView(buffer);
    const magic = view.getInt32(0, false);
    const numItems = view.getInt32(4, false);

    const labels: number[] = [];
    const headerOffset = 8;

    for (let i = 0; i < numItems; i++) {
      labels.push(view.getUint8(headerOffset + i));
    }

    return labels;
  }
}

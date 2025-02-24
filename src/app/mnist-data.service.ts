import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IDXParser } from './idx-parser';

interface MnistImage {
  pixels: number[];
  label: number;
}

@Injectable({
  providedIn: 'root',
})
export class MnistDataService {
  private readonly imagesUrl = 'assets/test_images/t10k-images.idx3-ubyte';
  private readonly labelsUrl = 'assets/test_images/t10k-labels.idx1-ubyte';
  private mnistData: MnistImage[] = [];

  constructor(private http: HttpClient) {
    this.loadMnistData();
  }

  private async loadMnistData(): Promise<void> {
    try {
      const imagesResponse = await firstValueFrom(
        this.http.get(this.imagesUrl, { responseType: 'arraybuffer' })
      );
      const labelsResponse = await firstValueFrom(
        this.http.get(this.labelsUrl, { responseType: 'arraybuffer' })
      );

      const images = await IDXParser.parseIDXImages(imagesResponse);
      const labels = await IDXParser.parseIDXLabels(labelsResponse);

      this.mnistData = images.map((pixels, index) => ({
        pixels,
        label: labels[index],
      }));
    } catch (error) {
      console.error('Error loading MNIST data:', error);
    }
  }

  getRandomImage(): MnistImage | null {
    if (this.mnistData.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.mnistData.length);
    return this.mnistData[randomIndex];
  }

  getPixelsAs2DArray(pixels: number[]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < 28; i++) {
      result.push(pixels.slice(i * 28, (i + 1) * 28));
    }
    return result;
  }
}

import { Component } from '@angular/core';
import { MLPService } from './mlp.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  styles: [
    `
      .container {
        text-align: center;
        margin: 20px;
      }
      .prediction {
        font-size: 24px;
        margin-top: 20px;
      }
    `,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  prediction = 0;
  matrixText = '';

  constructor(private mlpService: MLPService) {}

  onImageData(imageData: number[]) {
    this.prediction = this.mlpService.predict(imageData);
    this.matrixText = this.get01MatrixText(this.get01Matrix(28, 28, imageData));
  }

  get01Matrix(width: number, height: number, input: number[]): number[][] {
    const matrix = new Array(height)
      .fill(0)
      .map(() => new Array(width).fill(0));

    for (let i = 0; i < input.length; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      matrix[y][x] = input[i];
    }

    return matrix;
  }

  get01MatrixText(matrix: number[][]): string {
    return matrix
      .map((row) => row.map((val) => (val === 0 ? ' ' : '█')).join(''))
      .join('\n');
  }
}

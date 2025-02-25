import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface NetworkParams {
  W_hidden: number[][];
  W_output: number[][];
  b_hidden: number[][];
  b_output: number[][];
}

@Injectable({
  providedIn: 'root',
})
export class MLPService {
  private W_hidden: number[][] = []; // 784 x 20
  private W_output: number[][] = []; // 20 x 10
  private b_hidden: number[][] = []; // 20
  private b_output: number[][] = []; // 10
  private initialized = false;

  constructor(private http: HttpClient) {
    this.loadWeights();
  }

  private async loadWeights() {
    const params = await firstValueFrom(
      this.http.get<NetworkParams>('assets/weights/weights_mlp3.json')
    );
    this.W_hidden = params.W_hidden;
    this.W_output = params.W_output;
    this.b_hidden = params.b_hidden;
    this.b_output = params.b_output;
    console.log(
      `Weights Loaded. Hidden: ${this.W_hidden.length}x${this.W_hidden[0].length}, Output: ${this.W_output.length}x${this.W_output[0].length}`
    );
    console.log(
      `Biases Loaded. Hidden: ${this.b_hidden.length}, Output: ${this.b_output.length}`
    );
    this.initialized = true;
  }

  sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  softmax(x: number[]): number[] {
    const maxVal = Math.max(...x);
    const expX = x.map((val) => Math.exp(val - maxVal));
    const sumExpX = expX.reduce((sum, val) => sum + val, 0);
    return expX.map((val) => val / sumExpX);
  }

  forward(input: number[]): [number[], number[]] {
    if (!this.initialized) {
      throw new Error('MLPService is not initialized. Weights are not loaded.');
    }

    // Hidden layer: (784x20 @ 784x1) + 20x1 = 20x1
    const hidden = new Array(20)
      .fill(0)
      .map((_, i) =>
        this.sigmoid(
          input.reduce((sum, x, j) => sum + x * this.W_hidden[j][i], 0) +
            this.b_hidden[0][i]
        )
      );

    // Output layer: (10x20 @ 20x1) + 10x1 = 10x1
    const output = new Array(10)
      .fill(0)
      .map(
        (_, i) =>
          hidden.reduce((sum, h, j) => sum + h * this.W_output[j][i], 0) +
          this.b_output[0][i]
      );

    return [hidden, this.softmax(output)];
  }

  predict(input: number[]): number {
    const [hidden, output] = this.forward(input);
    const prediction = output.indexOf(Math.max(...output));
    return prediction;
  }
}
